-- ============================================================
-- get_club_preview RPC 확장
--   - 다가오는 정기모임 3개 (날짜순)
--   - 최근 가입 멤버 10명 (joined_at DESC)
-- 비멤버도 볼 수 있는 공개 정보만 반환. SECURITY DEFINER 로 RLS 우회.
-- 기존 함수와 시그니처 동일 → CREATE OR REPLACE 안전.
-- ============================================================

CREATE OR REPLACE FUNCTION get_club_preview(p_club_id UUID)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
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
    'owner_name',      (SELECT u.name FROM users u WHERE u.id = c.owner_id),
    'member_count',
      (SELECT COUNT(*)::INT FROM club_members
        WHERE club_id = c.id AND removed_at IS NULL),
    'upcoming_events',
      COALESCE(
        (SELECT jsonb_agg(ev.event ORDER BY ev.event_date, ev.start_time)
         FROM (
           SELECT
             jsonb_build_object(
               'id',          e.id,
               'title',       e.title,
               'event_date',  e.event_date,
               'start_time',  e.start_time,
               'end_time',    e.end_time,
               'place',       e.place,
               'fee',         e.fee,
               'max_attend',  e.max_attend,
               'going_count',
                 (SELECT COUNT(*)::INT FROM club_event_attendances cea
                   WHERE cea.event_id = e.id AND cea.status = 'going')
             ) AS event,
             e.event_date,
             e.start_time
           FROM club_events e
           WHERE e.club_id = c.id
             AND e.event_date >= (NOW() AT TIME ZONE 'Asia/Seoul')::DATE
           ORDER BY e.event_date ASC, e.start_time ASC NULLS LAST
           LIMIT 3
         ) ev),
        '[]'::jsonb
      ),
    'recent_members',
      COALESCE(
        (SELECT jsonb_agg(m.member ORDER BY m.joined_at DESC)
         FROM (
           SELECT
             jsonb_build_object(
               'id',          cm.id,
               'name',        u.name,
               'profile_img', u.profile_img,
               'role',        cm.role,
               'joined_at',   cm.joined_at
             ) AS member,
             cm.joined_at
           FROM club_members cm
           JOIN users u ON u.id = cm.user_id
           WHERE cm.club_id = c.id
             AND cm.removed_at IS NULL
           ORDER BY cm.joined_at DESC
           LIMIT 10
         ) m),
        '[]'::jsonb
      )
  )
  FROM clubs c
  WHERE c.id = p_club_id
$$;

GRANT EXECUTE ON FUNCTION get_club_preview(UUID) TO authenticated, anon;
