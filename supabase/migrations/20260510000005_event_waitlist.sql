-- ============================================================
-- 정모 대기 기능 (event_waitlist)
-- 만석 시 회원이 대기 신청 → 출석자가 취소하면 첫 대기자 자동 승격
-- ============================================================

-- ─── 1. event_waitlist 테이블 ────────────────────────────────
CREATE TABLE IF NOT EXISTS event_waitlist (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES club_events(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
  position      INT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'waiting'
                CHECK (status IN ('waiting', 'promoted', 'cancelled')),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  promoted_at   TIMESTAMPTZ
);

-- 활성 대기 (waiting) 만 unique — 같은 정모 대기는 1회만
CREATE UNIQUE INDEX IF NOT EXISTS event_waitlist_active_unique
  ON event_waitlist (event_id, member_id)
  WHERE status = 'waiting';

CREATE INDEX IF NOT EXISTS event_waitlist_event_status_pos
  ON event_waitlist (event_id, status, position);

ALTER TABLE event_waitlist ENABLE ROW LEVEL SECURITY;

-- ─── 2. RLS — 클럽 멤버만 조회. 쓰기는 RPC 만 (정책 없음 = 차단) ──
DROP POLICY IF EXISTS event_waitlist_select ON event_waitlist;
CREATE POLICY event_waitlist_select ON event_waitlist
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM club_events ce
      JOIN club_members cm ON cm.club_id = ce.club_id
      WHERE ce.id = event_waitlist.event_id
        AND cm.user_id::text = auth.uid()::text
        AND cm.removed_at IS NULL
    )
  );

-- ─── 3. RPC: join_event_waitlist ────────────────────────────
-- 만석인 정모에 대기 신청. 정원 남으면 거절 (그냥 참석 누르라고 안내).
CREATE OR REPLACE FUNCTION join_event_waitlist(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id     UUID;
  v_member_id   UUID;
  v_club_id     UUID;
  v_event_date  DATE;
  v_max_attend  INT;
  v_today_kst   DATE := (NOW() AT TIME ZONE 'Asia/Seoul')::DATE;
  v_going_count INT;
  v_existing    UUID;
  v_next_pos    INT;
BEGIN
  SELECT auth_club_user_id() INTO v_user_id;
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', '로그인이 필요합니다.');
  END IF;

  -- 이벤트 잠금 (대기 인원 race-free)
  SELECT club_id, event_date, max_attend
    INTO v_club_id, v_event_date, v_max_attend
  FROM club_events
  WHERE id = p_event_id
  FOR UPDATE;

  IF v_club_id IS NULL THEN
    RETURN jsonb_build_object('error', '존재하지 않는 정기모임입니다.');
  END IF;
  IF v_event_date < v_today_kst THEN
    RETURN jsonb_build_object('error', '지난 정기모임은 대기할 수 없어요.');
  END IF;
  IF v_max_attend = 0 THEN
    RETURN jsonb_build_object('error', '정원 제한이 없는 모임은 대기가 필요 없어요.');
  END IF;

  -- 클럽 멤버십 검증
  SELECT cm.id INTO v_member_id
  FROM club_members cm
  WHERE cm.club_id = v_club_id
    AND cm.user_id = v_user_id
    AND cm.removed_at IS NULL;
  IF v_member_id IS NULL THEN
    RETURN jsonb_build_object('error', '클럽 멤버만 신청할 수 있어요.');
  END IF;

  -- 이미 going 인 경우 거절
  IF EXISTS (
    SELECT 1 FROM club_event_attendances
    WHERE event_id = p_event_id
      AND member_id = v_member_id
      AND status = 'going'
  ) THEN
    RETURN jsonb_build_object('error', '이미 참석 중이에요.');
  END IF;

  -- 정원 검사: 만석이어야만 대기 신청 가능
  SELECT COUNT(*)::INT INTO v_going_count
  FROM club_event_attendances
  WHERE event_id = p_event_id AND status = 'going';

  IF v_going_count < v_max_attend THEN
    RETURN jsonb_build_object('error', '아직 정원에 여유가 있어요. 바로 참석하세요.');
  END IF;

  -- 이미 waiting 인 경우
  SELECT id INTO v_existing
  FROM event_waitlist
  WHERE event_id = p_event_id
    AND member_id = v_member_id
    AND status = 'waiting';
  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('error', '이미 대기 중이에요.');
  END IF;

  -- 다음 position 산출
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_next_pos
  FROM event_waitlist
  WHERE event_id = p_event_id AND status = 'waiting';

  INSERT INTO event_waitlist (event_id, member_id, position, status)
  VALUES (p_event_id, v_member_id, v_next_pos, 'waiting');

  RETURN jsonb_build_object('ok', true, 'position', v_next_pos);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', '대기 신청 중 오류가 발생했어요.');
END;
$$;

GRANT EXECUTE ON FUNCTION join_event_waitlist(UUID) TO authenticated;

-- ─── 4. RPC: cancel_waitlist_entry ──────────────────────────
-- 본인 대기 row 를 cancelled 로, 뒤 사람들 position 앞당김.
CREATE OR REPLACE FUNCTION cancel_waitlist_entry(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    UUID;
  v_member_id  UUID;
  v_club_id    UUID;
  v_position   INT;
BEGIN
  SELECT auth_club_user_id() INTO v_user_id;
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', '로그인이 필요합니다.');
  END IF;

  SELECT club_id INTO v_club_id FROM club_events WHERE id = p_event_id;
  IF v_club_id IS NULL THEN
    RETURN jsonb_build_object('error', '존재하지 않는 정기모임입니다.');
  END IF;

  SELECT cm.id INTO v_member_id
  FROM club_members cm
  WHERE cm.club_id = v_club_id
    AND cm.user_id = v_user_id;
  IF v_member_id IS NULL THEN
    RETURN jsonb_build_object('error', '권한이 없어요.');
  END IF;

  SELECT position INTO v_position
  FROM event_waitlist
  WHERE event_id = p_event_id
    AND member_id = v_member_id
    AND status = 'waiting';
  IF v_position IS NULL THEN
    RETURN jsonb_build_object('error', '대기 중이 아니에요.');
  END IF;

  -- 본인 row → cancelled
  UPDATE event_waitlist
  SET status = 'cancelled'
  WHERE event_id = p_event_id
    AND member_id = v_member_id
    AND status = 'waiting';

  -- 뒤 대기자 position 앞당김 (UNIQUE 활성 충돌 없음 — 이미 cancelled 처리)
  UPDATE event_waitlist
  SET position = position - 1
  WHERE event_id = p_event_id
    AND status = 'waiting'
    AND position > v_position;

  RETURN jsonb_build_object('ok', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', '대기 취소 중 오류가 발생했어요.');
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_waitlist_entry(UUID) TO authenticated;

-- ─── 5. 자동 승격 trigger 함수 ─────────────────────────────
-- club_event_attendances 의 going 이 줄어들면 첫 대기자를 going 으로 승격.
CREATE OR REPLACE FUNCTION promote_first_waiter()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id        UUID;
  v_max_attend      INT;
  v_going_count     INT;
  v_first_id        UUID;
  v_first_member_id UUID;
  v_first_position  INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_event_id := OLD.event_id;
    IF OLD.status <> 'going' THEN
      RETURN OLD;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    v_event_id := NEW.event_id;
    IF NOT (OLD.status = 'going' AND NEW.status <> 'going') THEN
      RETURN NEW;
    END IF;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- 정원·여유 검사
  SELECT max_attend INTO v_max_attend FROM club_events WHERE id = v_event_id;
  IF v_max_attend IS NULL OR v_max_attend = 0 THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT COUNT(*)::INT INTO v_going_count
  FROM club_event_attendances
  WHERE event_id = v_event_id AND status = 'going';

  IF v_going_count >= v_max_attend THEN
    -- 아직 만석 (예: 다른 사람이 동시에 going)
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- 첫 대기자 (position 가장 작은 waiting) 찾기
  SELECT id, member_id, position
    INTO v_first_id, v_first_member_id, v_first_position
  FROM event_waitlist
  WHERE event_id = v_event_id AND status = 'waiting'
  ORDER BY position ASC
  LIMIT 1
  FOR UPDATE;

  IF v_first_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- 대기자 출석 처리
  INSERT INTO club_event_attendances (event_id, member_id, status, updated_at)
  VALUES (v_event_id, v_first_member_id, 'going', NOW())
  ON CONFLICT (event_id, member_id)
  DO UPDATE SET status = 'going', updated_at = NOW();

  -- 대기 row → promoted
  UPDATE event_waitlist
  SET status = 'promoted', promoted_at = NOW()
  WHERE id = v_first_id;

  -- 뒤 대기자 position 앞당김
  UPDATE event_waitlist
  SET position = position - 1
  WHERE event_id = v_event_id
    AND status = 'waiting'
    AND position > v_first_position;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_promote_first_waiter ON club_event_attendances;
CREATE TRIGGER trg_promote_first_waiter
AFTER UPDATE OR DELETE ON club_event_attendances
FOR EACH ROW
EXECUTE FUNCTION promote_first_waiter();

-- ─── 6. 헬퍼 view (선택) — 정모 대기 수 집계, RLS 자동 적용 ───
-- COUNT(*) FILTER 절은 캐스팅 (::INT) 보다 먼저 파싱되어야 해서 괄호로 감쌈.
CREATE OR REPLACE VIEW event_waitlist_summary AS
SELECT
  event_id,
  (COUNT(*) FILTER (WHERE status = 'waiting'))::INT AS waiting_count
FROM event_waitlist
GROUP BY event_id;
