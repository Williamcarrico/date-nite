-- Magic-link rate limiting (the app called check_auth_rate_limit, which never
-- existed in the live DB -> the limiter previously failed open on every call).
-- APPLIED 2026-06.
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id          UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  email       TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_rate_limits_email_time ON auth_rate_limits (email, attempted_at DESC);
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies: only reachable via the SECURITY DEFINER function below.

CREATE OR REPLACE FUNCTION check_auth_rate_limit(
  p_email          TEXT,
  p_max_attempts   INT DEFAULT 5,
  p_window_minutes INT DEFAULT 15
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count    INT;
  v_oldest   TIMESTAMPTZ;
  v_retry    INT := 0;
BEGIN
  DELETE FROM auth_rate_limits WHERE attempted_at < now() - INTERVAL '24 hours';

  SELECT count(*), min(attempted_at) INTO v_count, v_oldest
  FROM auth_rate_limits
  WHERE email = p_email
    AND attempted_at > now() - (p_window_minutes || ' minutes')::INTERVAL;

  IF v_count >= p_max_attempts THEN
    v_retry := GREATEST(0, CEIL(EXTRACT(EPOCH FROM (
      v_oldest + (p_window_minutes || ' minutes')::INTERVAL - now()
    )))::INT);
    RETURN jsonb_build_object(
      'allowed', false, 'attempts', v_count, 'max_attempts', p_max_attempts,
      'window_minutes', p_window_minutes, 'retry_after_seconds', v_retry
    );
  END IF;

  INSERT INTO auth_rate_limits (email) VALUES (p_email);

  RETURN jsonb_build_object(
    'allowed', true, 'attempts', v_count + 1, 'max_attempts', p_max_attempts,
    'window_minutes', p_window_minutes
  );
END;
$$;

COMMENT ON FUNCTION check_auth_rate_limit IS 'Date Nite: per-email magic-link rate limit. Records the attempt and returns allowance + retry timing.';
</content>
