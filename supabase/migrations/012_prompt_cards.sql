-- Conversation starters & playful dares to bring to a date.  APPLIED 2026-06.
-- Matched to an idea by vibe overlap (cards with no vibe tags are universal).
CREATE TABLE IF NOT EXISTS prompt_cards (
  id            UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  kind          TEXT NOT NULL CHECK (kind IN ('conversation','dare')),
  text          TEXT NOT NULL,
  vibe_tags     TEXT[] NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE prompt_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active prompt cards" ON prompt_cards
  FOR SELECT USING (is_active = TRUE);

CREATE OR REPLACE FUNCTION get_prompt_cards(p_idea_id UUID, p_limit INT DEFAULT 3)
RETURNS TABLE (id UUID, kind TEXT, text TEXT)
LANGUAGE sql STABLE SECURITY INVOKER AS $$
  WITH idea AS (SELECT vibe_tags FROM idea_templates WHERE id = p_idea_id)
  SELECT pc.id, pc.kind, pc.text
  FROM prompt_cards pc, idea
  WHERE pc.is_active
    AND (
      cardinality(pc.vibe_tags) = 0
      OR pc.vibe_tags && COALESCE(idea.vibe_tags, '{}')
    )
  ORDER BY
    (cardinality(pc.vibe_tags) > 0 AND pc.vibe_tags && COALESCE(idea.vibe_tags, '{}')) DESC,
    random()
  LIMIT GREATEST(1, p_limit);
$$;

-- Seed content lives in the applied migration (24 cards across conversation/dare).
-- See Supabase migration history for the full INSERT.
COMMENT ON FUNCTION get_prompt_cards IS 'Date Nite: returns N conversation/dare cards matched to an idea''s vibes.';
</content>
