-- Couple/partner model for the two-player "Blind Double-Pick" game.  APPLIED 2026-06.
-- A couple links exactly two profiles. Created 'pending' with an invite code;
-- becomes 'active' when the second partner accepts.
CREATE TABLE IF NOT EXISTS couples (
  id          UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  partner_a   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_b   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT distinct_partners CHECK (partner_b IS NULL OR partner_a <> partner_b)
);
CREATE UNIQUE INDEX IF NOT EXISTS couples_one_active_a ON couples (partner_a) WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS couples_one_active_b ON couples (partner_b) WHERE status = 'active' AND partner_b IS NOT NULL;

ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their couple" ON couples
  FOR SELECT USING (auth.uid() = partner_a OR auth.uid() = partner_b);
CREATE POLICY "Users can create a couple they own" ON couples
  FOR INSERT WITH CHECK (auth.uid() = partner_a);
CREATE POLICY "Members can delete their couple" ON couples
  FOR DELETE USING (auth.uid() = partner_a OR auth.uid() = partner_b);

CREATE OR REPLACE FUNCTION accept_couple_invite(p_code TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_couple couples%ROWTYPE;
  v_uid    UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO v_couple FROM couples
  WHERE invite_code = upper(p_code) AND status = 'pending'
  LIMIT 1;

  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid or already-used invite code'; END IF;
  IF v_couple.partner_a = v_uid THEN RAISE EXCEPTION 'You cannot accept your own invite'; END IF;
  IF EXISTS (SELECT 1 FROM couples WHERE status = 'active' AND (partner_a = v_uid OR partner_b = v_uid)) THEN
    RAISE EXCEPTION 'You are already linked with a partner';
  END IF;

  UPDATE couples SET partner_b = v_uid, status = 'active' WHERE id = v_couple.id;
  RETURN v_couple.id;
END;
$$;

COMMENT ON FUNCTION accept_couple_invite IS 'Date Nite: link the current user as partner_b of a pending couple by invite code.';
</content>
