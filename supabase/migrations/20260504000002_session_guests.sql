-- ============================================================
-- Phase 3 hotfix (2026-05-04): 게스트 영속화
-- ============================================================
-- 원인: 게스트는 client-side 상태로만 존재 → register 단계에서 DB 저장 안 됨
--       → 페이지 이동 후 게스트 사라짐 (PreStartClient 에 회원만 노출).
-- 해결: session_guests 테이블 신설. create_pending_session RPC 가
--       p_guests_json 을 받아 함께 저장하도록 확장.
-- 게스트 ID 사용 정책:
--   - DB 식별자: session_guests.id (UUID)
--   - 클라이언트 메모리 식별자: `guest-${session_guests.id}` (match_players 인서트 시 제외)
--   - match_players.member_id 는 club_members FK 라 게스트 행 못 들어감 → 클라이언트가 필터.
-- ============================================================

-- 1. session_guests 테이블
CREATE TABLE IF NOT EXISTS public.session_guests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  gender      TEXT CHECK (gender IN ('M', 'F')),
  grade       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_guests_session ON public.session_guests(session_id);

ALTER TABLE public.session_guests ENABLE ROW LEVEL SECURITY;

-- RLS: 클럽 멤버 누구나 조회, owner/admin 만 수정
DROP POLICY IF EXISTS session_guests_select ON public.session_guests;
CREATE POLICY session_guests_select ON public.session_guests
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.sessions s
      JOIN public.club_members cm ON cm.club_id = s.club_id
      JOIN public.users u ON u.id = cm.user_id
      WHERE s.id = session_guests.session_id
        AND u.birdieminton_user_id::text = (auth.uid())::text
        AND cm.removed_at IS NULL
    )
  );

DROP POLICY IF EXISTS session_guests_modify ON public.session_guests;
CREATE POLICY session_guests_modify ON public.session_guests
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.sessions s
      JOIN public.club_members cm ON cm.club_id = s.club_id
      JOIN public.users u ON u.id = cm.user_id
      WHERE s.id = session_guests.session_id
        AND u.birdieminton_user_id::text = (auth.uid())::text
        AND cm.role IN ('owner', 'admin')
        AND cm.removed_at IS NULL
    )
  );

-- 2. create_pending_session RPC 확장 (8→9 인자)
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
  v_session_id UUID;
  v_member_id  TEXT;
  v_guest      JSONB;
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
