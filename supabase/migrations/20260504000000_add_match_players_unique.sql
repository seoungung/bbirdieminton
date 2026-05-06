-- ============================================================
-- Restore missing UNIQUE (match_id, member_id) on match_players
-- ============================================================
-- 원인: core_schema.sql 에서 정의된 UNIQUE 제약이 어느 시점에 드롭되어
--       start_game_session RPC 의 ON CONFLICT (match_id, member_id) 가
--       "there is no unique or exclusion constraint matching the
--        ON CONFLICT specification" 에러로 실패.
-- 영향: 게임 시작 (SetupPhase → handleStartGame → RPC) 전체 차단.
-- 안전성: NULL member_id (임시 참가자) 는 PG 기본 동작상 NULL != NULL 이라
--        다중 NULL 이 허용됨. RPC 는 realAttendees (NULL 아닌) 만 전달하므로
--        ON CONFLICT 도 정상 동작.
-- 멱등성: 이미 제약이 있으면 NO-OP.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'match_players_match_id_member_id_key'
      AND conrelid = 'public.match_players'::regclass
  ) THEN
    ALTER TABLE public.match_players
      ADD CONSTRAINT match_players_match_id_member_id_key UNIQUE (match_id, member_id);
  END IF;
END $$;
