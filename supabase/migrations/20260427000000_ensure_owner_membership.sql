-- Owner self-heal: legacy 클럽에서 owner가 club_members에 등록 안 된 경우 보강.
-- create_club RPC 이전에 만들어진 클럽 또는 마이그레이션 누락 케이스 대응.

CREATE OR REPLACE FUNCTION ensure_owner_membership(p_club_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_owner_id UUID;
BEGIN
  SELECT auth_club_user_id() INTO v_user_id;
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', '사용자 정보를 찾을 수 없습니다.');
  END IF;

  SELECT owner_id INTO v_owner_id FROM clubs WHERE id = p_club_id;
  IF v_owner_id IS NULL THEN
    RETURN jsonb_build_object('error', '존재하지 않는 모임입니다.');
  END IF;

  -- owner 본인만 self-heal 가능
  IF v_owner_id <> v_user_id THEN
    RETURN jsonb_build_object('error', '권한이 없습니다.');
  END IF;

  -- 이미 멤버면 no-op (UNIQUE (club_id, user_id) 제약은 core_schema에 이미 존재)
  INSERT INTO club_members (club_id, user_id, role)
  VALUES (p_club_id, v_user_id, 'owner')
  ON CONFLICT (club_id, user_id) DO NOTHING;

  RETURN jsonb_build_object('ok', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', '멤버십 복구에 실패했습니다.');
END;
$$;

-- authenticated 사용자만 호출 가능 (내부에서 owner 검증)
GRANT EXECUTE ON FUNCTION ensure_owner_membership(UUID) TO authenticated;
