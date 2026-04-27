-- Schema drift 정정: users.birdieminton_user_id가 일부 환경에 TEXT 타입으로 저장돼 있어
-- auth.uid() (UUID)와 직접 비교 시 operator does not exist: text = uuid 에러.
-- 모든 비교에 ::text 캐스팅 적용해 양쪽 환경(UUID/TEXT) 모두 호환되게 정정.

-- ── 1. auth_club_user_id() 함수 재정의 ─────────────────────
CREATE OR REPLACE FUNCTION auth_club_user_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE birdieminton_user_id = auth.uid()::text
$$;

-- ── 2. users 정책 3개 — DROP 후 재생성 ────────────────────
DROP POLICY IF EXISTS "users: 본인 또는 공동 클럽 멤버 조회" ON users;
CREATE POLICY "users: 본인 또는 공동 클럽 멤버 조회" ON users
  FOR SELECT USING (
    birdieminton_user_id = auth.uid()::text
    OR share_club_with(users.id)
  );

DROP POLICY IF EXISTS "users: 본인 생성" ON users;
CREATE POLICY "users: 본인 생성" ON users
  FOR INSERT WITH CHECK (birdieminton_user_id = auth.uid()::text);

DROP POLICY IF EXISTS "users: 본인 수정" ON users;
CREATE POLICY "users: 본인 수정" ON users
  FOR UPDATE USING (birdieminton_user_id = auth.uid()::text);

-- ── 3. dues 정책 2개 — DROP 후 재생성 ─────────────────────
DROP POLICY IF EXISTS "Club members can view dues" ON dues;
CREATE POLICY "Club members can view dues"
  ON dues FOR SELECT
  USING (
    club_id IN (
      SELECT club_id FROM club_members WHERE user_id = (
        SELECT id FROM users WHERE birdieminton_user_id = auth.uid()::text
      )
    )
  );

DROP POLICY IF EXISTS "Club managers can manage dues" ON dues;
CREATE POLICY "Club managers can manage dues"
  ON dues FOR ALL
  USING (
    club_id IN (
      SELECT cm.club_id FROM club_members cm
      WHERE cm.user_id = (
        SELECT id FROM users WHERE birdieminton_user_id = auth.uid()::text
      )
      AND cm.role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    club_id IN (
      SELECT cm.club_id FROM club_members cm
      WHERE cm.user_id = (
        SELECT id FROM users WHERE birdieminton_user_id = auth.uid()::text
      )
      AND cm.role IN ('owner', 'manager')
    )
  );
