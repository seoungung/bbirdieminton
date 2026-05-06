-- ============================================================
-- Phase C — 클럽 공개 연락처 (mailto / 카카오 오픈챗 / tel / https)
--
-- 운영자가 settings 에서 명시적으로 입력한 공개 연락처만 노출.
-- 형식 자유: mailto:..., https://open.kakao.com/..., tel:..., http(s)://...
-- 입력 없으면 미리보기의 "메시지 보내기" 버튼 자체가 숨겨짐.
--
-- 프라이버시 — 운영자 개인 이메일을 임의로 노출하지 않기 위해
--             설정에서 입력한 값만 사용.
-- ============================================================

-- ── 1. 컬럼 추가 ────────────────────────────────────────────
ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS contact_url TEXT;

-- 길이 제한 (스팸/오남용 방지) — 200자
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clubs_contact_url_len'
  ) THEN
    ALTER TABLE clubs
      ADD CONSTRAINT clubs_contact_url_len
      CHECK (contact_url IS NULL OR char_length(contact_url) <= 200);
  END IF;
END $$;

-- ── 2. get_club_preview RPC — contact_url 노출 ──────────────
-- 기존 함수에 단일 필드만 추가 — Phase A 페이로드 그대로 유지하며 확장.
CREATE OR REPLACE FUNCTION get_club_preview(p_club_id UUID)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id',                c.id,
    'name',              c.name,
    'description',       c.description,
    'location',          c.location,
    'activity_place',    c.activity_place,
    'category',          c.category,
    'court_count',       c.court_count,
    'thumbnail_color',   c.thumbnail_color,
    'thumbnail_url',     c.thumbnail_url,
    'created_at',        c.created_at,
    'tags',              COALESCE(c.tags, '{}'::TEXT[]),
    'fee_monthly',       c.fee_monthly,
    'fee_per_session',   c.fee_per_session,
    'fee_note',          c.fee_note,
    'owner_bio',         c.owner_bio,
    'photo_urls',        COALESCE(c.photo_urls, '{}'::TEXT[]),
    'schedule_summary',  c.schedule_summary,
    'faqs',              COALESCE(c.faqs, '[]'::JSONB),
    'contact_url',       c.contact_url,
    'owner_name',        (SELECT u.name FROM users u WHERE u.id = c.owner_id),
    'owner_profile_img', (SELECT u.profile_img FROM users u WHERE u.id = c.owner_id),
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
