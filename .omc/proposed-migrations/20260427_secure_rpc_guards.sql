-- ============================================================
-- [PROPOSAL — review before applying]
--
-- security-reviewer가 발견한 P1 보안 결함 (S-P1-1, S-P1-2)을 차단하기 위한
-- RPC 권한 가드 추가. 적용 방법:
--
-- 1) 이 파일을 검토하고 기존 RPC 본문(원본은
--    supabase/migrations/20260410000002_rpc_functions.sql,
--    supabase/migrations/20260418000000_fix_p0_bugs.sql)에서 가져와
--    아래 "<<<원본 본문 그대로>>>" 표시한 곳에 채워 넣으세요.
-- 2) 검토 후 supabase/migrations/ 폴더로 옮기고 (날짜 시퀀스 유지)
--    npx supabase db push 또는 Supabase 대시보드에서 적용.
-- 3) 적용 후 SettingsClient에서 모임 삭제, GameBoardClient에서 게임 시작 등
--    표준 흐름이 정상 동작하는지 smoke test.
--
-- 적용 전 주의:
-- - 기존 RPC가 작동 중인 라이브 환경이면 다운타임 없이 적용 가능 (CREATE OR REPLACE)
-- - 적용 후 기존 클라이언트가 새 가드를 통과하지 못하면 임시 503 가능 — 배포 직후 모니터링
--
-- 보호되는 RPC:
-- - delete_club_cascade   : owner 검증
-- - update_dues_amount    : manager 검증
-- - start_game_session    : club_member 검증
-- - update_player_stats_for_match : club_member 검증
-- ============================================================

-- delete_club_cascade — owner 가드
CREATE OR REPLACE FUNCTION delete_club_cascade(p_club_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_user_id UUID;
BEGIN
  SELECT auth_club_user_id() INTO v_user_id;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '인증이 필요합니다.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM clubs
    WHERE id = p_club_id AND owner_id = v_user_id
  ) THEN
    RAISE EXCEPTION '모임 삭제는 클럽장만 가능합니다.';
  END IF;

  -- <<<기존 DELETE 시퀀스 본문 — 20260410000002_rpc_functions.sql 9-41 참고>>>
  -- DELETE FROM match_players ...
  -- DELETE FROM matches ...
  -- DELETE FROM attendances ...
  -- DELETE FROM sessions ...
  -- DELETE FROM club_event_attendances ...
  -- DELETE FROM club_events ...
  -- DELETE FROM player_stats ...
  -- DELETE FROM dues ...
  -- DELETE FROM session_settlements ... (settlement_members CASCADE)
  -- DELETE FROM notices ...
  -- DELETE FROM notifications ...
  -- DELETE FROM join_requests ...
  -- DELETE FROM club_members WHERE club_id = p_club_id;
  -- DELETE FROM clubs WHERE id = p_club_id;
END;
$$;

-- update_dues_amount — manager 가드
CREATE OR REPLACE FUNCTION update_dues_amount(
  p_club_id UUID,
  p_year INT,
  p_month INT,
  p_amount INT
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_club_manager(p_club_id, auth_club_user_id()) THEN
    RAISE EXCEPTION '회비 금액 변경은 운영진(owner/manager)만 가능합니다.';
  END IF;

  -- <<<기존 본문 — 20260410000002_rpc_functions.sql 46-71>>>
END;
$$;

-- start_game_session — 클럽 멤버 가드
CREATE OR REPLACE FUNCTION start_game_session(
  p_club_id UUID,
  p_session_date DATE,
  p_match_mode TEXT,
  p_notes TEXT,
  p_created_by UUID,
  p_attendees_json JSONB,
  p_courts_json JSONB
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_club_member(p_club_id, auth_club_user_id()) THEN
    RAISE EXCEPTION '클럽 멤버만 게임 세션을 시작할 수 있습니다.';
  END IF;

  -- <<<기존 본문 — 20260418000000_fix_p0_bugs.sql 18-156>>>
END;
$$;

-- update_player_stats_for_match — 클럽 멤버 가드
CREATE OR REPLACE FUNCTION update_player_stats_for_match(
  p_match_id UUID,
  p_club_id UUID,
  p_prev_score_a INT,
  p_prev_score_b INT,
  p_new_score_a INT,
  p_new_score_b INT
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_club_member(p_club_id, auth_club_user_id()) THEN
    RAISE EXCEPTION '클럽 멤버만 경기 결과를 수정할 수 있습니다.';
  END IF;

  -- <<<기존 본문 — 20260418000000_fix_p0_bugs.sql 158-end>>>
END;
$$;

-- 익명/비인증 사용자 RPC EXECUTE 차단
REVOKE EXECUTE ON FUNCTION delete_club_cascade(UUID) FROM anon, public;
REVOKE EXECUTE ON FUNCTION update_dues_amount(UUID, INT, INT, INT) FROM anon, public;
REVOKE EXECUTE ON FUNCTION start_game_session(UUID, DATE, TEXT, TEXT, UUID, JSONB, JSONB) FROM anon, public;
REVOKE EXECUTE ON FUNCTION update_player_stats_for_match(UUID, UUID, INT, INT, INT, INT) FROM anon, public;

GRANT EXECUTE ON FUNCTION delete_club_cascade(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_dues_amount(UUID, INT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION start_game_session(UUID, DATE, TEXT, TEXT, UUID, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_player_stats_for_match(UUID, UUID, INT, INT, INT, INT) TO authenticated;
