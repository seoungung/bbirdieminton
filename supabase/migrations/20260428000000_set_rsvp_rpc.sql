-- RSVP 정원 race-free 처리 RPC
-- SECURITY DEFINER + 행 잠금으로 정원 초과 방지.

CREATE OR REPLACE FUNCTION set_rsvp(
  p_event_id UUID,
  p_status   TEXT
)
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
$$;

GRANT EXECUTE ON FUNCTION set_rsvp(UUID, TEXT) TO authenticated;
