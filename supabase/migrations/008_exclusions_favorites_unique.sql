-- Dedupe then enforce uniqueness so we can upsert a single rolling 90-day
-- exclusion per (profile, idea) and prevent duplicate favorites (the app's
-- read-then-write favorite toggle could otherwise double-insert).  APPLIED 2026-06.

DELETE FROM exclusions a USING exclusions b
  WHERE a.ctid < b.ctid AND a.profile_id = b.profile_id AND a.idea_template_id = b.idea_template_id;
CREATE UNIQUE INDEX IF NOT EXISTS exclusions_profile_idea_uniq
  ON exclusions (profile_id, idea_template_id);

DELETE FROM favorites a USING favorites b
  WHERE a.ctid < b.ctid AND a.profile_id = b.profile_id AND a.idea_template_id = b.idea_template_id;
CREATE UNIQUE INDEX IF NOT EXISTS favorites_profile_idea_uniq
  ON favorites (profile_id, idea_template_id);
</content>
