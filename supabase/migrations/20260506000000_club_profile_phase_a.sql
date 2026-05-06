-- ============================================================
-- Phase A — 클럽 프로필 페이지 강화
--
-- 추가 컬럼:
--   tags             — 사전 정의 태그 배열 (#아침, #초심환영 등)
--   fee_monthly      — 월회비 (원)
--   fee_per_session  — 회당 회비 (원)
--   fee_note         — 회비 추가 안내 문구
--   owner_bio        — 운영자 한 줄 소개
--   photo_urls       — 활동 사진 URL 배열
--   schedule_summary — 정기 일정 자유 텍스트 ("매주 화/목 19시")
--   faqs             — 자주 묻는 질문 jsonb [{question, answer}]
--
-- 기존 RLS 정책 그대로 적용. 추가 컬럼은 SELECT/UPDATE 정책에 자동 포함.
--
-- get_club_preview RPC 도 함께 갱신 (신규 컬럼 노출).
-- ============================================================

-- ── 1. clubs 테이블 컬럼 확장 ──────────────────────────────
ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS tags             TEXT[]  NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS fee_monthly      INTEGER,
  ADD COLUMN IF NOT EXISTS fee_per_session  INTEGER,
  ADD COLUMN IF NOT EXISTS fee_note         TEXT,
  ADD COLUMN IF NOT EXISTS owner_bio        TEXT,
  ADD COLUMN IF NOT EXISTS photo_urls       TEXT[]  NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS schedule_summary TEXT,
  ADD COLUMN IF NOT EXISTS faqs             JSONB   NOT NULL DEFAULT '[]'::JSONB;

-- 회비는 음수가 될 수 없음 (NULL 허용)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clubs_fee_monthly_nonneg'
  ) THEN
    ALTER TABLE clubs
      ADD CONSTRAINT clubs_fee_monthly_nonneg
      CHECK (fee_monthly IS NULL OR fee_monthly >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clubs_fee_per_session_nonneg'
  ) THEN
    ALTER TABLE clubs
      ADD CONSTRAINT clubs_fee_per_session_nonneg
      CHECK (fee_per_session IS NULL OR fee_per_session >= 0);
  END IF;
END $$;

-- ── 2. get_club_preview RPC — 추가 컬럼 포함 ────────────────
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

-- ── 3. get_club_preview_vibe RPC — 통계 (성비/등급분포/평균출석/최근가입) ──
-- 비멤버 미리보기에서 노출할 사회적 증거. 개인정보 노출 없음, 집계만.
CREATE OR REPLACE FUNCTION get_club_preview_vibe(p_club_id UUID)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_members      INT;
  v_male               INT;
  v_female             INT;
  v_recent_join_30d    INT;
  v_grade_dist         JSONB;
  v_avg_attendance_30d NUMERIC;
BEGIN
  /* 활성 멤버 총원 */
  SELECT COUNT(*)::INT INTO v_total_members
    FROM club_members
    WHERE club_id = p_club_id AND removed_at IS NULL;

  /* 성비 — gender 컬럼 (M/F) */
  SELECT
    COUNT(*) FILTER (WHERE gender = 'M')::INT,
    COUNT(*) FILTER (WHERE gender = 'F')::INT
    INTO v_male, v_female
    FROM club_members
    WHERE club_id = p_club_id AND removed_at IS NULL;

  /* 등급 분포 — skill_score 기준 7단계 (F/E/D/C/B/A/S) */
  SELECT jsonb_build_object(
    'F', COUNT(*) FILTER (WHERE skill_score < 20),
    'E', COUNT(*) FILTER (WHERE skill_score >= 20 AND skill_score < 35),
    'D', COUNT(*) FILTER (WHERE skill_score >= 35 AND skill_score < 50),
    'C', COUNT(*) FILTER (WHERE skill_score >= 50 AND skill_score < 65),
    'B', COUNT(*) FILTER (WHERE skill_score >= 65 AND skill_score < 80),
    'A', COUNT(*) FILTER (WHERE skill_score >= 80 AND skill_score < 90),
    'S', COUNT(*) FILTER (WHERE skill_score >= 90)
  )
  INTO v_grade_dist
  FROM club_members
  WHERE club_id = p_club_id AND removed_at IS NULL;

  /* 최근 30일 신규 가입 */
  SELECT COUNT(*)::INT INTO v_recent_join_30d
    FROM club_members
    WHERE club_id = p_club_id
      AND removed_at IS NULL
      AND joined_at >= NOW() - INTERVAL '30 days';

  /* 평균 출석 (최근 30일 세션 평균 attendees 수)
     attendances.status = 'present' 인 row 만 출석으로 카운트.
     세션이 0 개면 0. */
  SELECT COALESCE(
    (SELECT AVG(att_count) FROM (
       SELECT s.id, COUNT(a.id) FILTER (WHERE a.status = 'present') AS att_count
         FROM sessions s
         LEFT JOIN attendances a ON a.session_id = s.id
         WHERE s.club_id = p_club_id
           AND s.session_date >= (NOW() AT TIME ZONE 'Asia/Seoul')::DATE - 30
         GROUP BY s.id
     ) sc),
    0
  )
  INTO v_avg_attendance_30d;

  RETURN jsonb_build_object(
    'total_members',        v_total_members,
    'male_count',           v_male,
    'female_count',         v_female,
    'recent_join_30d',      v_recent_join_30d,
    'grade_distribution',   v_grade_dist,
    'avg_attendance_30d',   ROUND(COALESCE(v_avg_attendance_30d, 0)::NUMERIC, 1)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_club_preview_vibe(UUID) TO authenticated, anon;

-- ── 4. Storage 버킷 정책 (참고용 — Supabase dashboard 에서 적용) ────────
-- 'clubs' 버킷 (public read, owner/manager write). 직접 적용은 dashboard 필요.
-- 아래 정책은 dashboard SQL editor 에서 실행하거나 storage policy UI 로 동등 설정.
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('clubs', 'clubs', true)
-- ON CONFLICT DO NOTHING;
--
-- CREATE POLICY "Public read clubs bucket"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'clubs');
--
-- CREATE POLICY "Owners/managers upload to clubs bucket"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'clubs'
--     AND auth.role() = 'authenticated'
--   );
--
-- CREATE POLICY "Owners/managers update/delete clubs bucket"
--   ON storage.objects FOR UPDATE USING (bucket_id = 'clubs');
--
-- CREATE POLICY "Owners/managers delete clubs bucket"
--   ON storage.objects FOR DELETE USING (bucket_id = 'clubs');
