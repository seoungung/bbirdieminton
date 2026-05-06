-- ============================================================
-- Phase 3a (2026-05-04): 등록(open) → 시작(in_progress) 분리 + 정기모임 연동
-- ============================================================
-- 변경 의도:
--   - 게임보드 플로우를 "리스트 → 신규 등록 → 게임 시작" 3 단계로 분리.
--   - 등록만 하면 status='open' 으로 저장 (예약중). 매치는 만들지 않음.
--   - "게임 시작" 이 별도 RPC 로 'open' → 'in_progress' 전환 + 매치/플레이어 생성.
--   - 정기 모임 (club_events) 과 세션을 event_id 로 연결.
-- 영향:
--   - sessions 테이블에 event_id, court_count 컬럼 신설.
--   - create_pending_session / start_pending_session / cancel_pending_session 신규 RPC.
--   - 기존 start_game_session RPC 는 호환을 위해 유지 (점진 마이그레이션).
-- 멱등성:
--   - ADD COLUMN IF NOT EXISTS, CREATE OR REPLACE FUNCTION, CREATE INDEX IF NOT EXISTS 사용.
-- ============================================================

-- ── 1. sessions 테이블 확장 ──────────────────────────────
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.club_events(id) ON DELETE SET NULL;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS court_count INT NOT NULL DEFAULT 2 CHECK (court_count >= 1);

CREATE INDEX IF NOT EXISTS idx_sessions_club_status_created
  ON public.sessions(club_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_event
  ON public.sessions(event_id) WHERE event_id IS NOT NULL;

-- ── 2. RPC: create_pending_session ──────────────────────
-- 등록만. status='open'. 매치 X. attendances 일괄 insert.
CREATE OR REPLACE FUNCTION public.create_pending_session(
  p_club_id        UUID,
  p_event_id       UUID,
  p_session_date   DATE,
  p_match_mode     TEXT,
  p_court_count    INT,
  p_notes          TEXT,
  p_created_by     UUID,
  p_attendees_json JSONB
) RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_member_id  TEXT;
BEGIN
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

  IF p_attendees_json IS NOT NULL THEN
    FOR v_member_id IN SELECT jsonb_array_elements_text(p_attendees_json)
    LOOP
      INSERT INTO public.attendances (session_id, member_id, status)
      VALUES (v_session_id, v_member_id::UUID, 'present')
      ON CONFLICT (session_id, member_id) DO NOTHING;
    END LOOP;
  END IF;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ── 3. RPC: start_pending_session ──────────────────────
-- 'open' 세션 → 'in_progress' + 매치/플레이어 생성.
-- p_courts_json: [{ court_number, team_a:[uuid,...], team_b:[uuid,...], excluded_from_ranking? }]
CREATE OR REPLACE FUNCTION public.start_pending_session(
  p_session_id  UUID,
  p_courts_json JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  v_court     JSONB;
  v_match_id  UUID;
  v_member_id TEXT;
  v_status    TEXT;
BEGIN
  SELECT status INTO v_status FROM public.sessions WHERE id = p_session_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Session % not found', p_session_id;
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

-- ── 4. RPC: cancel_pending_session ─────────────────────
-- 'open' 세션 삭제. 'in_progress'/'closed' 는 보호.
CREATE OR REPLACE FUNCTION public.cancel_pending_session(
  p_session_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status FROM public.sessions WHERE id = p_session_id;
  IF v_status IS NULL THEN
    RETURN false;
  END IF;
  IF v_status <> 'open' THEN
    RAISE EXCEPTION 'Cannot cancel session in % state (only open allowed)', v_status;
  END IF;

  DELETE FROM public.sessions WHERE id = p_session_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
