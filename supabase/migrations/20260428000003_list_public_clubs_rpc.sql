-- ============================================================
-- 디스커버리 리스트용 SECURITY DEFINER RPC
-- 비멤버도 공개 정보 조회 가능. invite_code / max_members / plan 제외.
-- ============================================================

CREATE OR REPLACE FUNCTION list_public_clubs(p_limit INT DEFAULT 50)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(club_data ORDER BY created_at DESC), '[]'::jsonb)
  FROM (
    SELECT
      jsonb_build_object(
        'id',              c.id,
        'name',            c.name,
        'description',     c.description,
        'location',        c.location,
        'activity_place',  c.activity_place,
        'category',        c.category,
        'court_count',     c.court_count,
        'thumbnail_color', c.thumbnail_color,
        'thumbnail_url',   c.thumbnail_url,
        'created_at',      c.created_at,
        'owner_id',        c.owner_id,
        'owner_name',
          (SELECT u.name FROM users u WHERE u.id = c.owner_id),
        'member_count',
          (SELECT COUNT(*)::INT FROM club_members cm
           WHERE cm.club_id = c.id AND cm.removed_at IS NULL)
      ) AS club_data,
      c.created_at
    FROM clubs c
    ORDER BY c.created_at DESC
    LIMIT p_limit
  ) sub
$$;

GRANT EXECUTE ON FUNCTION list_public_clubs(INT) TO authenticated, anon;
