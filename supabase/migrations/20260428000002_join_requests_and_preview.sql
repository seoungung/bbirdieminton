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
AS $$
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
$$;

GRANT EXECUTE ON FUNCTION get_club_preview(UUID) TO authenticated, anon;
