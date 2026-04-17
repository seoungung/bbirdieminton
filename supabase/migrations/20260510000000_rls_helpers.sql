-- ============================================================
-- RLS Helper Functions + RPCs for club domain
-- ============================================================

-- ── 1. auth_club_user_id() ─────────────────────────────────
-- 현재 auth.uid() → users.id 변환 (SECURITY DEFINER: users RLS 우회)
CREATE OR REPLACE FUNCTION auth_club_user_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE birdieminton_user_id = auth.uid()
$$;

-- ── 2. 멤버십 헬퍼 (SECURITY DEFINER: club_members RLS 우회) ──
CREATE OR REPLACE FUNCTION is_club_member(p_club_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM club_members
    WHERE club_id = p_club_id
      AND user_id = p_user_id
      AND removed_at IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION is_club_manager(p_club_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM club_members
    WHERE club_id = p_club_id
      AND user_id = p_user_id
      AND role IN ('owner', 'manager')
      AND removed_at IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION is_session_member(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM sessions s
    JOIN club_members cm ON cm.club_id = s.club_id
    WHERE s.id = p_session_id
      AND cm.user_id = auth_club_user_id()
      AND cm.removed_at IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION is_event_member(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM club_events ce
    JOIN club_members cm ON cm.club_id = ce.club_id
    WHERE ce.id = p_event_id
      AND cm.user_id = auth_club_user_id()
      AND cm.removed_at IS NULL
  )
$$;

-- 같은 클럽 멤버인지 확인 (users 테이블 SELECT 정책용)
CREATE OR REPLACE FUNCTION share_club_with(p_target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM club_members cm1
    JOIN club_members cm2 ON cm1.club_id = cm2.club_id
    WHERE cm1.user_id = p_target_user_id
      AND cm2.user_id = auth_club_user_id()
      AND cm2.removed_at IS NULL
  )
$$;

-- ── 3. join_club_by_invite_code RPC ───────────────────────
-- 초대코드 → 모임 참여 (단일 트랜잭션, RLS 우회 가능)
CREATE OR REPLACE FUNCTION join_club_by_invite_code(p_invite_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_club_id UUID;
  v_user_id UUID;
BEGIN
  -- 초대코드로 모임 조회
  SELECT id INTO v_club_id
  FROM clubs
  WHERE LOWER(invite_code) = LOWER(p_invite_code);

  IF NOT FOUND THEN
    RETURN '{"error": "올바르지 않은 초대코드예요. 다시 확인해주세요."}'::JSONB;
  END IF;

  -- 현재 유저의 users.id 조회
  SELECT auth_club_user_id() INTO v_user_id;
  IF v_user_id IS NULL THEN
    RETURN '{"error": "사용자 정보를 찾을 수 없습니다."}'::JSONB;
  END IF;

  -- 이미 멤버인 경우 (강퇴 포함) → club_id 반환
  IF EXISTS (
    SELECT 1 FROM club_members
    WHERE club_id = v_club_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('club_id', v_club_id);
  END IF;

  -- 멤버로 추가
  INSERT INTO club_members (club_id, user_id, role)
  VALUES (v_club_id, v_user_id, 'member');

  RETURN jsonb_build_object('club_id', v_club_id);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', '모임 참여에 실패했습니다. 다시 시도해주세요.');
END;
$$;

-- ── 4. create_club RPC ─────────────────────────────────────
-- 모임 생성 + owner 등록 (단일 트랜잭션)
CREATE OR REPLACE FUNCTION create_club(
  p_name            TEXT,
  p_description     TEXT    DEFAULT NULL,
  p_location        TEXT    DEFAULT NULL,
  p_activity_place  TEXT    DEFAULT NULL,
  p_category        TEXT    DEFAULT '동호회',
  p_thumbnail_color TEXT    DEFAULT '#f0f0f0',
  p_thumbnail_url   TEXT    DEFAULT NULL,
  p_court_count     INT     DEFAULT 2
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_club_id UUID;
BEGIN
  SELECT auth_club_user_id() INTO v_user_id;
  IF v_user_id IS NULL THEN
    RETURN '{"error": "사용자 정보를 찾을 수 없습니다."}'::JSONB;
  END IF;

  INSERT INTO clubs (
    owner_id, name, description, location, activity_place,
    category, thumbnail_color, thumbnail_url, court_count
  )
  VALUES (
    v_user_id, p_name, p_description, p_location, p_activity_place,
    p_category, p_thumbnail_color, p_thumbnail_url, p_court_count
  )
  RETURNING id INTO v_club_id;

  INSERT INTO club_members (club_id, user_id, role)
  VALUES (v_club_id, v_user_id, 'owner');

  RETURN jsonb_build_object('club_id', v_club_id);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', '모임 생성에 실패했습니다. 다시 시도해주세요.');
END;
$$;
