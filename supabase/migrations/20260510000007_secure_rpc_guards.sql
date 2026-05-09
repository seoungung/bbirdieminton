-- ============================================================
-- Security P1 Migration: Secure RPC Guards (Stage A)
-- 2026-05-10
--
-- 포함 항목:
--   P1-1. create_pending_session / start_pending_session / cancel_pending_session 멤버십 가드
--   P1-2. start_game_session / update_player_stats_for_match 멤버십·매니저+ 가드
--   P1-3. glicko2_prepare_match 멤버십 가드
--   P1-6. notices / notifications / import_logs 테이블 생성 + RLS
--   P1-7. delete_club_cascade 통합 (자식 테이블 명시 + owner 가드)
--
-- 멱등성:
--   CREATE OR REPLACE FUNCTION, CREATE TABLE IF NOT EXISTS,
--   DROP POLICY IF EXISTS, ALTER TABLE ... ENABLE ROW LEVEL SECURITY 사용.
--
-- 실행 방법:
--   Supabase Dashboard → SQL Editor → 이 파일 전체 붙여넣기 후 RUN.
-- ============================================================

-- ============================================================
-- P1-1. create_pending_session — 멤버십 가드 + created_by 검증
-- ============================================================
DROP FUNCTION IF EXISTS public.create_pending_session(UUID, UUID, DATE, TEXT, INT, TEXT, UUID, JSONB);

CREATE OR REPLACE FUNCTION public.create_pending_session(
  p_club_id        UUID,
  p_event_id       UUID,
  p_session_date   DATE,
  p_match_mode     TEXT,
  p_court_count    INT,
  p_notes          TEXT,
  p_created_by     UUID,
  p_attendees_json JSONB,
  p_guests_json    JSONB DEFAULT '[]'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_club_id    UUID;
  v_user_id    UUID := auth_club_user_id();
  v_session_id UUID;
  v_member_id  TEXT;
  v_guest      JSONB;
BEGIN
  -- 인증 가드
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  v_club_id := p_club_id;

  -- 멤버십 가드
  IF NOT EXISTS (
    SELECT 1 FROM club_members
    WHERE club_id = v_club_id
      AND user_id = v_user_id
      AND removed_at IS NULL
  ) THEN
    RAISE EXCEPTION 'forbidden: 클럽 멤버만 사용 가능';
  END IF;

  -- created_by 검증: 호출자 자신의 club_members.id 여야 함
  IF NOT EXISTS (
    SELECT 1 FROM club_members
    WHERE id = p_created_by
      AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'forbidden: created_by mismatch';
  END IF;

  IF p_court_count < 1 THEN
    RAISE EXCEPTION 'court_count must be >= 1';
  END IF;

  INSERT INTO public.sessions (
    club_id, event_id, session_date, status, match_mode, court_count, notes, created_by
  ) VALUES (
    p_club_id, p_event_id, p_session_date, 'open',
    COALESCE(p_match_mode, 'random'), p_court_count, p_notes, p_created_by
  )
  RETURNING id INTO v_session_id;

  -- 회원 attendances
  IF p_attendees_json IS NOT NULL THEN
    FOR v_member_id IN SELECT jsonb_array_elements_text(p_attendees_json)
    LOOP
      INSERT INTO public.attendances (session_id, member_id, status)
      VALUES (v_session_id, v_member_id::UUID, 'present')
      ON CONFLICT (session_id, member_id) DO NOTHING;
    END LOOP;
  END IF;

  -- 게스트 session_guests
  IF p_guests_json IS NOT NULL THEN
    FOR v_guest IN SELECT jsonb_array_elements(p_guests_json)
    LOOP
      INSERT INTO public.session_guests (session_id, name, gender, grade)
      VALUES (
        v_session_id,
        COALESCE(v_guest->>'name', '게스트'),
        v_guest->>'gender',
        v_guest->>'grade'
      );
    END LOOP;
  END IF;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.create_pending_session(UUID, UUID, DATE, TEXT, INT, TEXT, UUID, JSONB, JSONB) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.create_pending_session(UUID, UUID, DATE, TEXT, INT, TEXT, UUID, JSONB, JSONB) TO authenticated;


-- ============================================================
-- P1-1. start_pending_session — 멤버십 가드
-- ============================================================
CREATE OR REPLACE FUNCTION public.start_pending_session(
  p_session_id  UUID,
  p_courts_json JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  v_club_id   UUID;
  v_user_id   UUID := auth_club_user_id();
  v_court     JSONB;
  v_match_id  UUID;
  v_member_id TEXT;
  v_status    TEXT;
BEGIN
  -- 인증 가드
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- session → club_id 도출
  SELECT s.status, s.club_id
    INTO v_status, v_club_id
    FROM public.sessions s
   WHERE s.id = p_session_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Session % not found', p_session_id;
  END IF;

  -- 멤버십 가드
  IF NOT EXISTS (
    SELECT 1 FROM club_members
    WHERE club_id = v_club_id
      AND user_id = v_user_id
      AND removed_at IS NULL
  ) THEN
    RAISE EXCEPTION 'forbidden: 클럽 멤버만 사용 가능';
  END IF;

  IF v_status <> 'open' THEN
    RAISE EXCEPTION 'Session % is not in open state (current: %)', p_session_id, v_status;
  END IF;

  UPDATE public.sessions SET status = 'in_progress' WHERE id = p_session_id;

  IF p_courts_json IS NOT NULL THEN
    FOR v_court IN SELECT jsonb_array_elements(p_courts_json)
    LOOP
      INSERT INTO public.matches (session_id, court_number, excluded_from_ranking)
      VALUES (
        p_session_id,
        (v_court->>'court_number')::INT,
        COALESCE((v_court->>'excluded')::BOOLEAN, false)
      )
      RETURNING id INTO v_match_id;

      FOR v_member_id IN SELECT jsonb_array_elements_text(v_court->'team_a')
      LOOP
        INSERT INTO public.match_players (match_id, member_id, team)
        VALUES (v_match_id, v_member_id::UUID, 'A')
        ON CONFLICT (match_id, member_id) DO NOTHING;
      END LOOP;

      FOR v_member_id IN SELECT jsonb_array_elements_text(v_court->'team_b')
      LOOP
        INSERT INTO public.match_players (match_id, member_id, team)
        VALUES (v_match_id, v_member_id::UUID, 'B')
        ON CONFLICT (match_id, member_id) DO NOTHING;
      END LOOP;
    END LOOP;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.start_pending_session(UUID, JSONB) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.start_pending_session(UUID, JSONB) TO authenticated;


-- ============================================================
-- P1-1. cancel_pending_session — 멤버십 가드
-- ============================================================
CREATE OR REPLACE FUNCTION public.cancel_pending_session(
  p_session_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_club_id UUID;
  v_user_id UUID := auth_club_user_id();
  v_status  TEXT;
BEGIN
  -- 인증 가드
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- session → club_id 도출
  SELECT s.status, s.club_id
    INTO v_status, v_club_id
    FROM public.sessions s
   WHERE s.id = p_session_id;

  IF v_status IS NULL THEN
    RETURN false;
  END IF;

  -- 멤버십 가드
  IF NOT EXISTS (
    SELECT 1 FROM club_members
    WHERE club_id = v_club_id
      AND user_id = v_user_id
      AND removed_at IS NULL
  ) THEN
    RAISE EXCEPTION 'forbidden: 클럽 멤버만 사용 가능';
  END IF;

  IF v_status <> 'open' THEN
    RAISE EXCEPTION 'Cannot cancel session in % state (only open allowed)', v_status;
  END IF;

  DELETE FROM public.sessions WHERE id = p_session_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.cancel_pending_session(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cancel_pending_session(UUID) TO authenticated;


-- ============================================================
-- P1-2. start_game_session — 멤버십 가드
-- ============================================================
CREATE OR REPLACE FUNCTION public.start_game_session(
  p_club_id         UUID,
  p_session_date    DATE,
  p_match_mode      TEXT,
  p_notes           TEXT,
  p_created_by      UUID,
  p_attendees_json  JSONB,
  p_courts_json     JSONB
) RETURNS UUID AS $$
DECLARE
  v_club_id    UUID;
  v_user_id    UUID := auth_club_user_id();
  v_session_id UUID;
  v_match_id   UUID;
  v_court      JSONB;
  v_member_id  TEXT;
BEGIN
  -- 인증 가드
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  v_club_id := p_club_id;

  -- 멤버십 가드
  IF NOT EXISTS (
    SELECT 1 FROM club_members
    WHERE club_id = v_club_id
      AND user_id = v_user_id
      AND removed_at IS NULL
  ) THEN
    RAISE EXCEPTION 'forbidden: 클럽 멤버만 사용 가능';
  END IF;

  INSERT INTO sessions (club_id, session_date, status, match_mode, notes, created_by)
  VALUES (p_club_id, p_session_date, 'open', p_match_mode, p_notes, p_created_by)
  RETURNING id INTO v_session_id;

  FOR v_member_id IN SELECT jsonb_array_elements_text(p_attendees_json)
  LOOP
    INSERT INTO attendances (session_id, member_id, status)
    VALUES (v_session_id, v_member_id::UUID, 'present')
    ON CONFLICT (session_id, member_id) DO NOTHING;
  END LOOP;

  FOR v_court IN SELECT jsonb_array_elements(p_courts_json)
  LOOP
    INSERT INTO matches (session_id, court_number, match_mode, excluded_from_ranking, started_at)
    VALUES (
      v_session_id,
      (v_court->>'court_number')::INT,
      p_match_mode,
      COALESCE((v_court->>'excluded')::BOOLEAN, false),
      now()
    )
    RETURNING id INTO v_match_id;

    FOR v_member_id IN SELECT jsonb_array_elements_text(v_court->'team_a')
    LOOP
      INSERT INTO match_players (match_id, member_id, team)
      VALUES (v_match_id, v_member_id::UUID, 'A')
      ON CONFLICT (match_id, member_id) DO NOTHING;
    END LOOP;

    FOR v_member_id IN SELECT jsonb_array_elements_text(v_court->'team_b')
    LOOP
      INSERT INTO match_players (match_id, member_id, team)
      VALUES (v_match_id, v_member_id::UUID, 'B')
      ON CONFLICT (match_id, member_id) DO NOTHING;
    END LOOP;
  END LOOP;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.start_game_session(UUID, DATE, TEXT, TEXT, UUID, JSONB, JSONB) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.start_game_session(UUID, DATE, TEXT, TEXT, UUID, JSONB, JSONB) TO authenticated;


-- ============================================================
-- P1-2. update_player_stats_for_match — 매니저+ 가드
-- (match_id → matches.session_id → sessions.club_id 조회)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_player_stats_for_match(
  p_match_id     UUID,
  p_club_id      UUID,
  p_prev_score_a INT,
  p_prev_score_b INT,
  p_new_score_a  INT,
  p_new_score_b  INT
) RETURNS void AS $$
DECLARE
  v_club_id  UUID;
  v_user_id  UUID := auth_club_user_id();
  v_excluded BOOLEAN;
  v_player   RECORD;
  v_wins     INT;
  v_losses   INT;
  v_draws    INT;
BEGIN
  -- 인증 가드
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- match → session → club_id 도출
  SELECT s.club_id
    INTO v_club_id
    FROM matches m
    JOIN sessions s ON s.id = m.session_id
   WHERE m.id = p_match_id;

  IF v_club_id IS NULL THEN
    RAISE EXCEPTION 'match % not found', p_match_id;
  END IF;

  -- 매니저+ 가드
  IF NOT is_club_manager(v_club_id, v_user_id) THEN
    RAISE EXCEPTION 'forbidden: 운영진만 스탯을 수정할 수 있습니다';
  END IF;

  SELECT excluded_from_ranking INTO v_excluded
    FROM matches WHERE id = p_match_id;
  IF NOT FOUND OR v_excluded THEN RETURN; END IF;

  FOR v_player IN
    SELECT member_id, team FROM match_players WHERE match_id = p_match_id
  LOOP
    SELECT wins, losses, draws
      INTO v_wins, v_losses, v_draws
      FROM player_stats
     WHERE club_id = p_club_id AND member_id = v_player.member_id
    FOR UPDATE;

    IF NOT FOUND THEN
      v_wins := 0; v_losses := 0; v_draws := 0;
    END IF;

    IF p_prev_score_a IS NOT NULL AND p_prev_score_b IS NOT NULL THEN
      IF v_player.team = 'A' THEN
        IF p_prev_score_a > p_prev_score_b    THEN v_wins   := GREATEST(0, v_wins   - 1);
        ELSIF p_prev_score_b > p_prev_score_a THEN v_losses := GREATEST(0, v_losses - 1);
        ELSE v_draws := GREATEST(0, v_draws - 1); END IF;
      ELSE
        IF p_prev_score_b > p_prev_score_a    THEN v_wins   := GREATEST(0, v_wins   - 1);
        ELSIF p_prev_score_a > p_prev_score_b THEN v_losses := GREATEST(0, v_losses - 1);
        ELSE v_draws := GREATEST(0, v_draws - 1); END IF;
      END IF;
    END IF;

    IF v_player.team = 'A' THEN
      IF p_new_score_a > p_new_score_b    THEN v_wins   := v_wins   + 1;
      ELSIF p_new_score_b > p_new_score_a THEN v_losses := v_losses + 1;
      ELSE v_draws := v_draws + 1; END IF;
    ELSE
      IF p_new_score_b > p_new_score_a    THEN v_wins   := v_wins   + 1;
      ELSIF p_new_score_a > p_new_score_b THEN v_losses := v_losses + 1;
      ELSE v_draws := v_draws + 1; END IF;
    END IF;

    INSERT INTO player_stats (
      club_id, member_id, wins, losses, draws, games_played, win_rate, updated_at
    ) VALUES (
      p_club_id,
      v_player.member_id,
      v_wins,
      v_losses,
      v_draws,
      v_wins + v_losses + v_draws,
      CASE WHEN v_wins + v_losses + v_draws > 0
           THEN v_wins::FLOAT / (v_wins + v_losses + v_draws)
           ELSE 0 END,
      now()
    )
    ON CONFLICT (club_id, member_id) DO UPDATE SET
      wins         = EXCLUDED.wins,
      losses       = EXCLUDED.losses,
      draws        = EXCLUDED.draws,
      games_played = EXCLUDED.games_played,
      win_rate     = EXCLUDED.win_rate,
      updated_at   = EXCLUDED.updated_at;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.update_player_stats_for_match(UUID, UUID, INT, INT, INT, INT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.update_player_stats_for_match(UUID, UUID, INT, INT, INT, INT) TO authenticated;


-- ============================================================
-- P1-3. glicko2_prepare_match — 멤버십 가드
-- (match_id → matches.session_id → sessions.club_id)
-- ============================================================
CREATE OR REPLACE FUNCTION public.glicko2_prepare_match(p_match_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_club_id      UUID;
  v_user_id      UUID := auth_club_user_id();
  v_excluded     BOOLEAN;
  v_has_null     BOOLEAN;
  v_team_a       JSONB;
  v_team_b       JSONB;
  v_member_id    UUID;
  v_team         TEXT;
BEGIN
  -- 인증 가드
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- match → session → club_id 도출
  SELECT s.club_id
    INTO v_club_id
    FROM matches m
    JOIN sessions s ON s.id = m.session_id
   WHERE m.id = p_match_id;

  IF v_club_id IS NULL THEN
    RETURN jsonb_build_object('skip', true, 'reason', 'match_not_found');
  END IF;

  -- 멤버십 가드
  IF NOT EXISTS (
    SELECT 1 FROM club_members
    WHERE club_id = v_club_id
      AND user_id = v_user_id
      AND removed_at IS NULL
  ) THEN
    RAISE EXCEPTION 'forbidden: 클럽 멤버만 사용 가능';
  END IF;

  -- 경기 자체가 ranking 제외면 즉시 종료
  SELECT excluded_from_ranking INTO v_excluded
    FROM matches WHERE id = p_match_id;
  IF v_excluded IS NULL THEN
    RETURN jsonb_build_object('skip', true, 'reason', 'match_not_found');
  END IF;
  IF v_excluded THEN
    RETURN jsonb_build_object('skip', true, 'reason', 'excluded_from_ranking');
  END IF;

  -- 임시 참가자(member_id NULL) 한 명이라도 있으면 skip
  SELECT EXISTS (
    SELECT 1 FROM match_players
    WHERE match_id = p_match_id AND member_id IS NULL
  ) INTO v_has_null;
  IF v_has_null THEN
    RETURN jsonb_build_object('skip', true, 'reason', 'has_temp_player');
  END IF;

  -- 누락 레이팅 일괄 seed (loop)
  FOR v_member_id, v_team IN
    SELECT mp.member_id, mp.team
      FROM match_players mp
     WHERE mp.match_id = p_match_id
  LOOP
    PERFORM seed_member_rating(v_member_id);
  END LOOP;

  -- team별 레이팅 + member_id 묶어서 반환
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
$$;

REVOKE EXECUTE ON FUNCTION public.glicko2_prepare_match(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.glicko2_prepare_match(UUID) TO authenticated;


-- ============================================================
-- P1-6. notices 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notices (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id          UUID        NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  author_member_id UUID        REFERENCES public.club_members(id) ON DELETE SET NULL,
  title            TEXT        NOT NULL,
  body             TEXT        NOT NULL DEFAULT '',
  type             TEXT        NOT NULL DEFAULT 'general'
                               CHECK (type IN ('announcement', 'event', 'general')),
  is_pinned        BOOLEAN     NOT NULL DEFAULT false,
  image_urls       TEXT[]      NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notices_club_pinned_created
  ON public.notices(club_id, is_pinned DESC, created_at DESC);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 클럽 멤버: SELECT
DROP POLICY IF EXISTS notices_select ON public.notices;
CREATE POLICY notices_select ON public.notices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.club_members cm
      WHERE cm.club_id = notices.club_id
        AND cm.user_id = auth_club_user_id()
        AND cm.removed_at IS NULL
    )
  );

-- 운영진: INSERT
DROP POLICY IF EXISTS notices_insert ON public.notices;
CREATE POLICY notices_insert ON public.notices
  FOR INSERT WITH CHECK (
    is_club_manager(notices.club_id, auth_club_user_id())
  );

-- 운영진: UPDATE
DROP POLICY IF EXISTS notices_update ON public.notices;
CREATE POLICY notices_update ON public.notices
  FOR UPDATE USING (
    is_club_manager(notices.club_id, auth_club_user_id())
  );

-- 운영진: DELETE
DROP POLICY IF EXISTS notices_delete ON public.notices;
CREATE POLICY notices_delete ON public.notices
  FOR DELETE USING (
    is_club_manager(notices.club_id, auth_club_user_id())
  );


-- ============================================================
-- P1-6. notifications 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES public.users(id) ON DELETE CASCADE,
  club_id    UUID        REFERENCES public.clubs(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL,
  payload    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_club_read
  ON public.notifications(user_id, club_id, read_at);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 본인 row: SELECT
DROP POLICY IF EXISTS notifications_select ON public.notifications;
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (
    user_id = auth_club_user_id()
  );

-- 본인 row: UPDATE (read_at 갱신 등)
DROP POLICY IF EXISTS notifications_update ON public.notifications;
CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE USING (
    user_id = auth_club_user_id()
  );


-- ============================================================
-- P1-6. import_logs 테이블
-- (INSERT는 service_role 전용 admin client 가 수행하므로 RLS INSERT 정책 불필요)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.import_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      UUID        NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  import_type  TEXT        NOT NULL,
  rows_added   INT         NOT NULL DEFAULT 0,
  rows_skipped INT         NOT NULL DEFAULT 0,
  rows_failed  INT         NOT NULL DEFAULT 0,
  imported_by  UUID        REFERENCES public.club_members(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_logs_club_created
  ON public.import_logs(club_id, created_at DESC);

ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

-- 운영진: SELECT (감사 로그 조회)
DROP POLICY IF EXISTS import_logs_select ON public.import_logs;
CREATE POLICY import_logs_select ON public.import_logs
  FOR SELECT USING (
    is_club_manager(import_logs.club_id, auth_club_user_id())
  );

-- INSERT는 service_role(admin client)이 수행하므로 authenticated 정책 없음.
-- service_role은 RLS를 우회하므로 별도 정책 불필요.


-- ============================================================
-- P1-7. delete_club_cascade 통합
-- 자식 테이블 명시 DELETE + owner 가드
-- ============================================================
CREATE OR REPLACE FUNCTION public.delete_club_cascade(p_club_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID;
BEGIN
  -- 인증 + owner 가드
  v_caller := auth_club_user_id();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'unauthorized: 로그인이 필요합니다.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM clubs c
    WHERE c.id = p_club_id AND c.owner_id = v_caller
  ) THEN
    RAISE EXCEPTION 'forbidden: 모임 오너만 삭제할 수 있습니다.';
  END IF;

  -- 1. match_players (matches FK)
  DELETE FROM match_players
  WHERE match_id IN (
    SELECT m.id FROM matches m
    JOIN sessions s ON s.id = m.session_id
    WHERE s.club_id = p_club_id
  );

  -- 2. matches
  DELETE FROM matches
  WHERE session_id IN (
    SELECT id FROM sessions WHERE club_id = p_club_id
  );

  -- 3. attendances, session_guests
  DELETE FROM attendances
  WHERE session_id IN (
    SELECT id FROM sessions WHERE club_id = p_club_id
  );

  DELETE FROM session_guests
  WHERE session_id IN (
    SELECT id FROM sessions WHERE club_id = p_club_id
  );

  -- 4. event_waitlist (있으면)
  DELETE FROM event_waitlist
  WHERE event_id IN (
    SELECT id FROM club_events WHERE club_id = p_club_id
  );

  -- 5. sessions
  DELETE FROM sessions WHERE club_id = p_club_id;

  -- 6. club_event_attendances, club_events
  DELETE FROM club_event_attendances
  WHERE event_id IN (
    SELECT id FROM club_events WHERE club_id = p_club_id
  );
  DELETE FROM club_events WHERE club_id = p_club_id;

  -- 7. join_requests
  DELETE FROM join_requests WHERE club_id = p_club_id;

  -- 8. push_subscriptions (club_id 컬럼이 있는 경우)
  DELETE FROM push_subscriptions WHERE club_id = p_club_id;

  -- 9. player_stats, dues
  DELETE FROM player_stats WHERE club_id = p_club_id;
  DELETE FROM dues WHERE club_id = p_club_id;

  -- 10. club_members (member_ratings, member_rating_history ON DELETE CASCADE 의존)
  DELETE FROM club_members WHERE club_id = p_club_id;

  -- 11. notices, notifications, import_logs
  DELETE FROM notices WHERE club_id = p_club_id;
  DELETE FROM notifications WHERE club_id = p_club_id;
  DELETE FROM import_logs WHERE club_id = p_club_id;

  -- 12. clubs row 자체
  DELETE FROM clubs WHERE id = p_club_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_club_cascade(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.delete_club_cascade(UUID) TO authenticated;


-- ============================================================
-- 완료 안내
-- ============================================================
-- 이 마이그레이션은 Supabase Dashboard → SQL Editor 에서 직접 RUN 해야 합니다.
-- Local CLI 사용 시: supabase db push 또는 supabase migration up
-- ============================================================
