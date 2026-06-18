-- Rate limiting table for authentication attempts
-- Prevents email spam abuse by limiting magic link requests

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX idx_auth_rate_limits_email ON auth_rate_limits(email, window_start);

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION check_auth_rate_limit(
  p_email TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_attempts INTEGER;
  v_window_start TIMESTAMPTZ;
  v_is_allowed BOOLEAN;
BEGIN
  -- Clean up old entries (older than 24 hours)
  DELETE FROM auth_rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';

  -- Get current attempts within window
  SELECT attempts, window_start INTO v_current_attempts, v_window_start
  FROM auth_rate_limits
  WHERE email = p_email
    AND window_start > NOW() - (p_window_minutes || ' minutes')::INTERVAL
  ORDER BY window_start DESC
  LIMIT 1;

  -- If no record or window expired, allow and create new record
  IF v_current_attempts IS NULL OR v_window_start < NOW() - (p_window_minutes || ' minutes')::INTERVAL THEN
    INSERT INTO auth_rate_limits (email, attempts, window_start)
    VALUES (p_email, 1, NOW())
    ON CONFLICT DO NOTHING;

    RETURN jsonb_build_object(
      'allowed', true,
      'attempts', 1,
      'max_attempts', p_max_attempts,
      'window_minutes', p_window_minutes
    );
  END IF;

  -- Check if limit exceeded
  v_is_allowed := v_current_attempts < p_max_attempts;

  -- Increment attempts if allowed
  IF v_is_allowed THEN
    UPDATE auth_rate_limits
    SET attempts = attempts + 1,
        updated_at = NOW()
    WHERE email = p_email
      AND window_start = v_window_start;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_is_allowed,
    'attempts', v_current_attempts + (CASE WHEN v_is_allowed THEN 1 ELSE 0 END),
    'max_attempts', p_max_attempts,
    'window_minutes', p_window_minutes,
    'retry_after_seconds',
      CASE
        WHEN v_is_allowed THEN 0
        ELSE EXTRACT(EPOCH FROM (v_window_start + (p_window_minutes || ' minutes')::INTERVAL - NOW()))::INTEGER
      END
  );
END;
$$;

-- Enable RLS
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- No direct user access - only via function
CREATE POLICY "No direct access" ON auth_rate_limits
  FOR ALL USING (false);

COMMENT ON TABLE auth_rate_limits IS 'Rate limiting for authentication attempts to prevent abuse';
COMMENT ON FUNCTION check_auth_rate_limit IS 'Checks and updates rate limit for email authentication. Returns JSON with allowed status.';
