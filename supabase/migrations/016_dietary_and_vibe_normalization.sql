-- Coverage + hygiene pass (APPLIED 2026-06).
-- (1) Dietary accommodation was missing kosher/halal entirely (0) and thin on
--     nut-free/dairy-free. Enrich by accommodation semantics so couples with any
--     of the 7 restrictions get matchable options + the scorer's dietary bonus.
-- (2) Normalize ~13 non-canonical vibe_tags (from the original seed) to the
--     12-value taxonomy so they actually match the vibe filter / vibe_score.

-- vegetarian/vegan ideas are inherently kosher- & halal-accommodating.
UPDATE idea_templates
SET dietary_friendly = ARRAY(SELECT DISTINCT unnest(dietary_friendly || ARRAY['kosher','halal']))
WHERE is_active AND (dietary_friendly && ARRAY['vegetarian','vegan']);

-- vegan is dairy-free by definition.
UPDATE idea_templates
SET dietary_friendly = ARRAY(SELECT DISTINCT unnest(dietary_friendly || ARRAY['dairy-free']))
WHERE is_active AND 'vegan' = ANY(dietary_friendly);

-- allergen-aware ideas (gluten-free or vegan) can readily accommodate nut-free.
UPDATE idea_templates
SET dietary_friendly = ARRAY(SELECT DISTINCT unnest(dietary_friendly || ARRAY['nut-free']))
WHERE is_active AND (dietary_friendly && ARRAY['gluten-free','vegan']);

-- Map off-taxonomy vibe tags to canonical values; drop 'unique'; dedupe.
UPDATE idea_templates t SET vibe_tags = sub.tags
FROM (
  SELECT id, ARRAY(
    SELECT DISTINCT m.canon FROM unnest(vibe_tags) v
    CROSS JOIN LATERAL (SELECT CASE v
      WHEN 'casual' THEN 'chill' WHEN 'playful' THEN 'fun' WHEN 'sophisticated' THEN 'fancy'
      WHEN 'energetic' THEN 'active' WHEN 'peaceful' THEN 'relaxing' WHEN 'low-key' THEN 'chill'
      WHEN 'intellectual' THEN 'cultural' WHEN 'nature' THEN 'relaxing' WHEN 'wellness' THEN 'relaxing'
      WHEN 'nostalgic' THEN 'cozy' WHEN 'indulgent' THEN 'fancy' WHEN 'competitive' THEN 'fun'
      WHEN 'unique' THEN NULL
      ELSE v END AS canon) m
    WHERE m.canon IS NOT NULL
  ) AS tags
  FROM idea_templates WHERE is_active
) sub
WHERE t.id = sub.id AND t.vibe_tags IS DISTINCT FROM sub.tags;
