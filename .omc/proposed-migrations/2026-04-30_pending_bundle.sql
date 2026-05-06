-- ============================================================
-- 미적용 마이그레이션 번들 (작성 2026-04-30)
--
-- 사용법:
--   1. Supabase Dashboard → SQL Editor 열기
--   2. 이 파일 전체 복사해서 붙여넣기
--   3. RUN
--
-- 포함된 8개 마이그레이션 (순서대로):
--   1) 20260427000004_events_rls.sql           — 정기모임 RLS
--   2) 20260427000005_add_event_check.sql      — max_attend CHECK
--   3) 20260428000000_set_rsvp_rpc.sql         — 정원 race-free RPC
--   4) 20260428000001_users_last_visited_club  — 컬럼 추가
--   5) 20260428000002_join_requests_preview    — 가입 신청 + preview RPC
--   6) 20260428000003_list_public_clubs_rpc    — 디스커버리 RPC
--   7) 20260428000004_extend_club_preview      — preview 확장
--   8) 20260510000002_glicko2_ratings          — Glicko-2 레이팅 시스템 (NEW)
--
-- 의존성 안전망 (전부 CREATE OR REPLACE / IF NOT EXISTS / DROP IF EXISTS):
--   · is_club_member / is_club_manager / auth_club_user_id 의 2-arg 버전이
--     이미 적용되어 있어야 합니다 (20260510000000_rls_helpers.sql).
--     없으면 8번 Glicko-2 마이그레이션이 실패합니다.
--     필요시 그 파일 먼저 적용 후 이 번들 RUN 해주세요.
-- ============================================================

-- ╔══════════════════════════════════════════════════════════╗
-- ║ PRE-FLIGHT: 재실행 안전망 (DROP IF EXISTS)                ║
-- ║ 일부분 이미 적용되어 있어도 충돌 없이 재실행 가능하게.    ║
-- ╚══════════════════════════════════════════════════════════╝

-- 원본 마이그레이션 7번은 정책을 그냥 CREATE POLICY로 만들어
-- 재실행하면 "policy already exists" 에러가 난다. 미리 떨어내고 진행.
DROP POLICY IF EXISTS "club_events: 멤버 조회" ON club_events;
DROP POLICY IF EXISTS "club_events: 매니저 생성" ON club_events;
DROP POLICY IF EXISTS "club_events: 매니저 수정" ON club_events;
DROP POLICY IF EXISTS "club_events: 매니저 삭제" ON club_events;
DROP POLICY IF EXISTS "club_event_attendances: 같은 클럽 멤버 조회" ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 본인 RSVP 등록" ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 본인 RSVP 수정" ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 본인 또는 매니저 삭제" ON club_event_attendances;

-- max_attend CHECK constraint 재진입
ALTER TABLE club_events DROP CONSTRAINT IF EXISTS max_attend_check;

-- join_requests / member_ratings / member_rating_history는 첫 적용 시점엔
-- 테이블 자체가 없을 수도 있어, 테이블 부재 예외를 무시한다.
DO $bdy1$ BEGIN
  DROP POLICY IF EXISTS "join_requests: 본인 신청" ON join_requests;
  DROP POLICY IF EXISTS "join_requests: 본인 또는 매니저 조회" ON join_requests;
  DROP POLICY IF EXISTS "join_requests: 본인 취소" ON join_requests;
  DROP POLICY IF EXISTS "join_requests: 매니저 처리" ON join_requests;
EXCEPTION WHEN undefined_table THEN NULL; END $bdy1$;

DO $bdy2$ BEGIN
  DROP POLICY IF EXISTS "member_ratings_select" ON member_ratings;
  DROP POLICY IF EXISTS "member_ratings_insert" ON member_ratings;
  DROP POLICY IF EXISTS "member_ratings_update" ON member_ratings;
EXCEPTION WHEN undefined_table THEN NULL; END $bdy2$;

DO $bdy3$ BEGIN
  DROP POLICY IF EXISTS "member_rating_history_select" ON member_rating_history;
  DROP POLICY IF EXISTS "member_rating_history_insert" ON member_rating_history;
EXCEPTION WHEN undefined_table THEN NULL; END $bdy3$;



-- ╔══════════════════════════════════════════════════════════╗
-- ║ FILE: 20260427000004_events_rls.sql                        ║
-- ╚══════════════════════════════════════════════════════════╝

-- ============================================================
-- 정기모임 (club_events / club_event_attendances) RLS 정책
--
-- 두 테이블은 RLS enabled but 정책 미구축 상태.
-- 향후 20260510000001_rls_policies.sql 가 합쳐진 정책으로 덮어쓸 수 있어,
-- 이 파일은 명시적으로 DROP POLICY IF EXISTS 를 선행해 멱등 보장.
-- ============================================================

-- ── club_events ────────────────────────────────────────────
DROP POLICY IF EXISTS "club_events: 멤버 조회"           ON club_events;
DROP POLICY IF EXISTS "club_events: 매니저 생성"          ON club_events;
DROP POLICY IF EXISTS "club_events: 매니저 수정"          ON club_events;
DROP POLICY IF EXISTS "club_events: 매니저 삭제"          ON club_events;
DROP POLICY IF EXISTS "club_events: 운영진 생성·수정·삭제" ON club_events;

CREATE POLICY "club_events: 멤버 조회" ON club_events
  FOR SELECT USING (is_club_member(club_events.club_id, auth_club_user_id()));

CREATE POLICY "club_events: 매니저 생성" ON club_events
  FOR INSERT WITH CHECK (is_club_manager(club_events.club_id, auth_club_user_id()));

CREATE POLICY "club_events: 매니저 수정" ON club_events
  FOR UPDATE USING (is_club_manager(club_events.club_id, auth_club_user_id()));

CREATE POLICY "club_events: 매니저 삭제" ON club_events
  FOR DELETE USING (is_club_manager(club_events.club_id, auth_club_user_id()));

-- ── club_event_attendances ─────────────────────────────────
DROP POLICY IF EXISTS "club_event_attendances: 같은 클럽 멤버 조회" ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 본인 RSVP 등록"     ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 본인 RSVP 수정"     ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 본인 또는 매니저 삭제" ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 멤버 조회"          ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 본인 UPSERT"        ON club_event_attendances;

-- 같은 클럽 멤버 조회
CREATE POLICY "club_event_attendances: 같은 클럽 멤버 조회" ON club_event_attendances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_events e
      WHERE e.id = club_event_attendances.event_id
        AND is_club_member(e.club_id, auth_club_user_id())
    )
  );

-- 본인 RSVP 등록 (member_id 가 본인 club_members row)
CREATE POLICY "club_event_attendances: 본인 RSVP 등록" ON club_event_attendances
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = club_event_attendances.member_id
        AND cm.user_id = auth_club_user_id()
        AND cm.removed_at IS NULL
    )
  );

-- 본인 RSVP 수정
CREATE POLICY "club_event_attendances: 본인 RSVP 수정" ON club_event_attendances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = club_event_attendances.member_id
        AND cm.user_id = auth_club_user_id()
        AND cm.removed_at IS NULL
    )
  );

-- 본인 또는 같은 클럽 매니저 삭제
CREATE POLICY "club_event_attendances: 본인 또는 매니저 삭제" ON club_event_attendances
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = club_event_attendances.member_id
        AND cm.user_id = auth_club_user_id()
        AND cm.removed_at IS NULL
    )
    OR EXISTS (
      SELECT 1 FROM club_events e
      WHERE e.id = club_event_attendances.event_id
        AND is_club_manager(e.club_id, auth_club_user_id())
    )
  );


-- ╔══════════════════════════════════════════════════════════╗
-- ║ FILE: 20260427000005_add_event_check_constraints.sql       ║
-- ╚══════════════════════════════════════════════════════════╝

-- club_events.max_attend 음수/비현실 차단
-- 0 = 무제한, 1~1000 = 정원
ALTER TABLE club_events
  ADD CONSTRAINT max_attend_check
  CHECK (max_attend >= 0 AND max_attend <= 1000)
  NOT VALID;

-- 기존 행 검증
ALTER TABLE club_events VALIDATE CONSTRAINT max_attend_check;


-- ╔══════════════════════════════════════════════════════════╗
-- ║ FILE: 20260428000000_set_rsvp_rpc.sql                      ║
-- ╚══════════════════════════════════════════════════════════╝

-- RSVP 정원 race-free 처리 RPC
-- SECURITY DEFINER + 행 잠금으로 정원 초과 방지.

CREATE OR REPLACE FUNCTION set_rsvp(
  p_event_id UUID,
  p_status   TEXT
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $bdy4$
DECLARE
  v_user_id     UUID;
  v_member_id   UUID;
  v_club_id     UUID;
  v_event_date  DATE;
  v_max_attend  INT;
  v_today_kst   DATE := (NOW() AT TIME ZONE 'Asia/Seoul')::DATE;
  v_going_count INT;
BEGIN
  -- status 화이트리스트
  IF p_status NOT IN ('going', 'not_going') THEN
    RETURN jsonb_build_object('error', '잘못된 RSVP 상태입니다.');
  END IF;

  -- 인증
  SELECT auth_club_user_id() INTO v_user_id;
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', '로그인이 필요합니다.');
  END IF;

  -- 이벤트 행 잠금 (concurrent RSVP 직렬화)
  SELECT club_id, event_date, max_attend
    INTO v_club_id, v_event_date, v_max_attend
  FROM club_events
  WHERE id = p_event_id
  FOR UPDATE;

  IF v_club_id IS NULL THEN
    RETURN jsonb_build_object('error', '존재하지 않는 정기모임입니다.');
  END IF;

  -- 과거 이벤트 차단
  IF v_event_date < v_today_kst THEN
    RETURN jsonb_build_object('error', '지난 정기모임은 응답을 변경할 수 없어요.');
  END IF;

  -- 본인 club_members row (active) 조회
  SELECT cm.id INTO v_member_id
  FROM club_members cm
  WHERE cm.club_id = v_club_id
    AND cm.user_id = v_user_id
    AND cm.removed_at IS NULL;

  IF v_member_id IS NULL THEN
    RETURN jsonb_build_object('error', '클럽 멤버만 응답할 수 있어요.');
  END IF;

  -- 정원 검사 (going으로 변경 시): 현재 going 수가 정원 이상 + 본인이 이미 going이 아니면 차단
  IF p_status = 'going' AND v_max_attend > 0 THEN
    SELECT COUNT(*)::INT INTO v_going_count
    FROM club_event_attendances
    WHERE event_id = p_event_id AND status = 'going';

    -- 본인이 이미 going이면 self-double-count 방지
    IF v_going_count >= v_max_attend
       AND NOT EXISTS (
         SELECT 1 FROM club_event_attendances
         WHERE event_id = p_event_id
           AND member_id = v_member_id
           AND status = 'going'
       ) THEN
      RETURN jsonb_build_object('error', '정원이 가득 찼어요.');
    END IF;
  END IF;

  -- UPSERT (UNIQUE event_id, member_id)
  INSERT INTO club_event_attendances (event_id, member_id, status, updated_at)
  VALUES (p_event_id, v_member_id, p_status, NOW())
  ON CONFLICT (event_id, member_id)
  DO UPDATE SET status = EXCLUDED.status, updated_at = NOW();

  RETURN jsonb_build_object('ok', true, 'status', p_status);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', 'RSVP 처리 중 오류가 발생했어요.');
END;
$bdy4$;

GRANT EXECUTE ON FUNCTION set_rsvp(UUID, TEXT) TO authenticated;


-- ╔══════════════════════════════════════════════════════════╗
-- ║ FILE: 20260428000001_users_last_visited_club.sql           ║
-- ╚══════════════════════════════════════════════════════════╝

-- 사용자의 마지막 방문 클럽. 로그인 후 자동 redirect용.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_visited_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL;


-- ╔══════════════════════════════════════════════════════════╗
-- ║ FILE: 20260428000002_join_requests_and_preview.sql         ║
-- ╚══════════════════════════════════════════════════════════╝

-- ============================================================
-- 가입 신청(join_requests) + 비멤버 클럽 미리보기(get_club_preview)
-- ============================================================
-- 목적
--   1. 비멤버 → 클럽 가입 신청 → 매니저 승인 플로우의 백엔드.
--      (서버 액션 src/app/club/[clubId]/join-requests/actions.ts 가
--       이 테이블을 이미 사용하고 있으나 DDL 이 어디에도 없어 dead end.)
--   2. 비멤버가 클럽 정보를 볼 수 있도록 공개 정보만 노출하는
--      SECURITY DEFINER RPC. (clubs SELECT RLS 가 is_club_member 한정이라
--      비멤버는 원본 테이블을 직접 읽지 못함.)
-- ============================================================

-- ── 1. join_requests 테이블 ──────────────────────────────────
CREATE TABLE IF NOT EXISTS join_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, user_id)
);

CREATE INDEX IF NOT EXISTS join_requests_club_status_idx
  ON join_requests (club_id, status);

ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

-- 본인 신청 row INSERT
DROP POLICY IF EXISTS "join_requests: 본인 신청" ON join_requests;
CREATE POLICY "join_requests: 본인 신청" ON join_requests
  FOR INSERT WITH CHECK (user_id = auth_club_user_id());

-- 본인 신청 row 조회 (+ 매니저는 자기 클럽 신청 전부 조회)
DROP POLICY IF EXISTS "join_requests: 본인 또는 매니저 조회" ON join_requests;
CREATE POLICY "join_requests: 본인 또는 매니저 조회" ON join_requests
  FOR SELECT USING (
    user_id = auth_club_user_id()
    OR is_club_manager(join_requests.club_id, auth_club_user_id())
  );

-- 본인 pending 신청 취소 (DELETE)
DROP POLICY IF EXISTS "join_requests: 본인 취소" ON join_requests;
CREATE POLICY "join_requests: 본인 취소" ON join_requests
  FOR DELETE USING (
    user_id = auth_club_user_id()
    AND status = 'pending'
  );

-- 매니저 승인/거절 (UPDATE)
DROP POLICY IF EXISTS "join_requests: 매니저 처리" ON join_requests;
CREATE POLICY "join_requests: 매니저 처리" ON join_requests
  FOR UPDATE USING (is_club_manager(join_requests.club_id, auth_club_user_id()));


-- ── 2. get_club_preview RPC ─────────────────────────────────
-- 비멤버도 클럽 공개 정보(이름·소개·지역·운영자명·멤버수 등)를
-- 조회할 수 있도록 SECURITY DEFINER 로 RLS 를 우회해서 노출.
-- 이메일·초대코드 등 민감 정보는 절대 포함하지 않음.
CREATE OR REPLACE FUNCTION get_club_preview(p_club_id UUID)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $bdy5$
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
    'owner_name',
      (SELECT u.name FROM users u WHERE u.id = c.owner_id),
    'member_count',
      (SELECT COUNT(*)::INT FROM club_members cm
       WHERE cm.club_id = c.id AND cm.removed_at IS NULL)
  )
  FROM clubs c
  WHERE c.id = p_club_id
$bdy5$;

GRANT EXECUTE ON FUNCTION get_club_preview(UUID) TO authenticated, anon;


-- ╔══════════════════════════════════════════════════════════╗
-- ║ FILE: 20260428000003_list_public_clubs_rpc.sql             ║
-- ╚══════════════════════════════════════════════════════════╝

-- ============================================================
-- 디스커버리 리스트용 SECURITY DEFINER RPC
-- 비멤버도 공개 정보 조회 가능. invite_code / max_members / plan 제외.
-- ============================================================

CREATE OR REPLACE FUNCTION list_public_clubs(p_limit INT DEFAULT 50)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $bdy6$
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
$bdy6$;

GRANT EXECUTE ON FUNCTION list_public_clubs(INT) TO authenticated, anon;


-- ╔══════════════════════════════════════════════════════════╗
-- ║ FILE: 20260428000004_extend_club_preview.sql               ║
-- ╚══════════════════════════════════════════════════════════╝

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
AS $bdy7$
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
$bdy7$;

GRANT EXECUTE ON FUNCTION get_club_preview(UUID) TO authenticated, anon;


-- ╔══════════════════════════════════════════════════════════╗
-- ║ FILE: 20260510000002_glicko2_ratings.sql                   ║
-- ╚══════════════════════════════════════════════════════════╝

-- ============================================================
-- Glicko-2 Rating System (작성 2026-04-30, 의존성 순서로 timestamp 5/10)
-- 의존: 20260510000000_rls_helpers.sql (is_club_member / is_club_manager / auth_club_user_id)
--
-- 도입 배경: skill_score(수동, 0~100, INT)는 운영자가 직접 입력하는 메모성
-- 값으로 유지하되, 매 경기마다 자동 조정되는 정밀 레이팅(Glicko-2)을
-- 별도 layer로 도입한다. 표면(멤버 리스트·랭킹)에는 D/C/B 등급 라벨만,
-- 본인 대시보드(/club/[id]/me)에는 정밀 mu/phi 노출.
--
-- 결정사항:
-- · 신규 테이블 분리(member_ratings + member_rating_history) — history 시계열 유지
-- · 계산은 TS 측(npm glicko2-lite)에서 수행, RPC는 저장만 담당
-- · skill_score는 신입 등록 시 초기 mu 시드값으로만 사용
-- · matches.excluded_from_ranking = true 경기는 Glicko-2도 제외 (TS 측 처리)
-- · 기존 경기 backfill 안 함 (마이그레이션 후부터만, RD 큰 상태로 빠르게 안정화)
--
-- 기본값:
-- · mu = 1500 (Glicko 표준 시작점)
-- · phi = 350 (RD, 불확실 큰 상태)
-- · sigma = 0.06 (volatility, Glicko-2 표준)
-- ============================================================

-- ── 1. 현재 레이팅 테이블 ─────────────────────────────────
CREATE TABLE IF NOT EXISTS member_ratings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_member_id  UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
  mu              FLOAT NOT NULL DEFAULT 1500,
  phi             FLOAT NOT NULL DEFAULT 350,
  sigma           FLOAT NOT NULL DEFAULT 0.06,
  games_played    INT NOT NULL DEFAULT 0,
  last_match_id   UUID REFERENCES matches(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (club_member_id)
);

CREATE INDEX IF NOT EXISTS idx_member_ratings_member
  ON member_ratings (club_member_id);

-- ── 2. 레이팅 변동 이력 테이블 ────────────────────────────
CREATE TABLE IF NOT EXISTS member_rating_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_member_id  UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
  match_id        UUID REFERENCES matches(id) ON DELETE CASCADE,
  mu              FLOAT NOT NULL,
  phi             FLOAT NOT NULL,
  sigma           FLOAT NOT NULL,
  delta_mu        FLOAT NOT NULL DEFAULT 0,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rating_history_member_time
  ON member_rating_history (club_member_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_rating_history_match
  ON member_rating_history (match_id);

-- ── 3. RLS 정책 ───────────────────────────────────────────
ALTER TABLE member_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_rating_history ENABLE ROW LEVEL SECURITY;

-- member_ratings: 같은 클럽 멤버면 read, 운영자만 write
DROP POLICY IF EXISTS "member_ratings_select" ON member_ratings;
CREATE POLICY "member_ratings_select" ON member_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = member_ratings.club_member_id
        AND is_club_member(cm.club_id, auth_club_user_id())
    )
  );

DROP POLICY IF EXISTS "member_ratings_insert" ON member_ratings;
CREATE POLICY "member_ratings_insert" ON member_ratings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = member_ratings.club_member_id
        AND is_club_manager(cm.club_id, auth_club_user_id())
    )
  );

DROP POLICY IF EXISTS "member_ratings_update" ON member_ratings;
CREATE POLICY "member_ratings_update" ON member_ratings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = member_ratings.club_member_id
        AND is_club_manager(cm.club_id, auth_club_user_id())
    )
  );

-- member_rating_history: 같은 클럽 멤버면 read, 운영자만 insert (수정 X)
DROP POLICY IF EXISTS "member_rating_history_select" ON member_rating_history;
CREATE POLICY "member_rating_history_select" ON member_rating_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = member_rating_history.club_member_id
        AND is_club_member(cm.club_id, auth_club_user_id())
    )
  );

DROP POLICY IF EXISTS "member_rating_history_insert" ON member_rating_history;
CREATE POLICY "member_rating_history_insert" ON member_rating_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = member_rating_history.club_member_id
        AND is_club_manager(cm.club_id, auth_club_user_id())
    )
  );

-- ── 4. 시드 RPC: skill_score → 초기 mu ────────────────────
-- 신입 등록 직후 호출. 이미 존재하면 그대로 반환(idempotent).
-- skill_score 매핑: 0~100 → mu 1100~1900 (선형, 1500 중앙)
CREATE OR REPLACE FUNCTION seed_member_rating(
  p_club_member_id UUID
)
RETURNS member_ratings
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $bdy8$
DECLARE
  v_skill_score INT;
  v_mu          FLOAT;
  v_existing    member_ratings;
  v_result      member_ratings;
BEGIN
  -- 이미 존재 → 그대로 반환
  SELECT * INTO v_existing FROM member_ratings
   WHERE club_member_id = p_club_member_id;
  IF FOUND THEN
    RETURN v_existing;
  END IF;

  -- club_members.skill_score 조회 (없으면 50 = 중간)
  SELECT COALESCE(skill_score, 50) INTO v_skill_score
    FROM club_members WHERE id = p_club_member_id;

  v_mu := 1500 + (v_skill_score - 50) * 8;

  INSERT INTO member_ratings (club_member_id, mu, phi, sigma)
  VALUES (p_club_member_id, v_mu, 350, 0.06)
  RETURNING * INTO v_result;

  -- 초기 시드도 history에 한 줄 박아서 그래프 시작점 확보
  INSERT INTO member_rating_history (
    club_member_id, match_id, mu, phi, sigma, delta_mu
  ) VALUES (
    p_club_member_id, NULL, v_result.mu, v_result.phi, v_result.sigma, 0
  );

  RETURN v_result;
END;
$bdy8$;

-- ── 5. 결과 저장 RPC: TS Glicko-2 계산 후 호출 ────────────
-- 한 경기당 4명(복식) 각각 1번씩 호출. 현재값 UPSERT + history insert.
CREATE OR REPLACE FUNCTION upsert_member_rating(
  p_club_member_id UUID,
  p_match_id       UUID,
  p_mu             FLOAT,
  p_phi            FLOAT,
  p_sigma          FLOAT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $bdy9$
DECLARE
  v_prev_mu FLOAT;
  v_delta   FLOAT;
BEGIN
  SELECT mu INTO v_prev_mu FROM member_ratings
   WHERE club_member_id = p_club_member_id;
  v_delta := COALESCE(p_mu - v_prev_mu, 0);

  INSERT INTO member_ratings (
    club_member_id, mu, phi, sigma, games_played, last_match_id, updated_at
  ) VALUES (
    p_club_member_id, p_mu, p_phi, p_sigma, 1, p_match_id, NOW()
  )
  ON CONFLICT (club_member_id) DO UPDATE SET
    mu            = EXCLUDED.mu,
    phi           = EXCLUDED.phi,
    sigma         = EXCLUDED.sigma,
    games_played  = member_ratings.games_played + 1,
    last_match_id = EXCLUDED.last_match_id,
    updated_at    = NOW();

  INSERT INTO member_rating_history (
    club_member_id, match_id, mu, phi, sigma, delta_mu
  ) VALUES (
    p_club_member_id, p_match_id, p_mu, p_phi, p_sigma, v_delta
  );
END;
$bdy9$;

-- ── 6. 매치 prepare RPC: 4명(혹은 N명) 레이팅 한 번에 fetch + 누락은 seed ──
-- TS 측 Glicko-2 계산을 위해 한 경기의 모든 멤버 레이팅을 한 호출로 가져온다.
-- 레이팅 row가 없는 멤버는 즉시 seed(skill_score 기반).
-- 임시 참가자(member_id IS NULL)나 excluded_from_ranking 경기는 skip=true 반환.
CREATE OR REPLACE FUNCTION glicko2_prepare_match(p_match_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $bdy10$
DECLARE
  v_excluded     BOOLEAN;
  v_has_null     BOOLEAN;
  v_team_a       JSONB;
  v_team_b       JSONB;
  v_member_id    UUID;
  v_team         TEXT;
BEGIN
  -- 1. 경기 자체가 ranking 제외면 즉시 종료
  SELECT excluded_from_ranking INTO v_excluded
    FROM matches WHERE id = p_match_id;
  IF v_excluded IS NULL THEN
    RETURN jsonb_build_object('skip', true, 'reason', 'match_not_found');
  END IF;
  IF v_excluded THEN
    RETURN jsonb_build_object('skip', true, 'reason', 'excluded_from_ranking');
  END IF;

  -- 2. 임시 참가자(member_id NULL) 한 명이라도 있으면 skip
  SELECT EXISTS (
    SELECT 1 FROM match_players
    WHERE match_id = p_match_id AND member_id IS NULL
  ) INTO v_has_null;
  IF v_has_null THEN
    RETURN jsonb_build_object('skip', true, 'reason', 'has_temp_player');
  END IF;

  -- 3. 누락 레이팅 일괄 seed (loop)
  FOR v_member_id, v_team IN
    SELECT mp.member_id, mp.team
      FROM match_players mp
      WHERE mp.match_id = p_match_id
  LOOP
    PERFORM seed_member_rating(v_member_id);
  END LOOP;

  -- 4. team별 레이팅 + member_id 묶어서 반환
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'member_id', mp.member_id,
      'mu',        mr.mu,
      'phi',       mr.phi,
      'sigma',     mr.sigma
    )
  ), '[]'::jsonb) INTO v_team_a
    FROM match_players mp
    JOIN member_ratings mr ON mr.club_member_id = mp.member_id
    WHERE mp.match_id = p_match_id AND mp.team = 'A';

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'member_id', mp.member_id,
      'mu',        mr.mu,
      'phi',       mr.phi,
      'sigma',     mr.sigma
    )
  ), '[]'::jsonb) INTO v_team_b
    FROM match_players mp
    JOIN member_ratings mr ON mr.club_member_id = mp.member_id
    WHERE mp.match_id = p_match_id AND mp.team = 'B';

  IF jsonb_array_length(v_team_a) = 0 OR jsonb_array_length(v_team_b) = 0 THEN
    RETURN jsonb_build_object('skip', true, 'reason', 'empty_team');
  END IF;

  RETURN jsonb_build_object(
    'skip',   false,
    'team_a', v_team_a,
    'team_b', v_team_b
  );
END;
$bdy10$;

GRANT EXECUTE ON FUNCTION seed_member_rating(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_member_rating(UUID, UUID, FLOAT, FLOAT, FLOAT) TO authenticated;
GRANT EXECUTE ON FUNCTION glicko2_prepare_match(UUID) TO authenticated;
