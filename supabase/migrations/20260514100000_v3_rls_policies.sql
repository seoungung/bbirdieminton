-- ============================================================
-- v3 RLS Policies — Step 7 (클럽 생성 + 기본 권한)
-- ============================================================
-- 작성일: 2026-05-14
-- 적용 방식: Supabase Dashboard SQL Editor 에 본 파일 내용 전체 붙여넣고 RUN
-- 선행: 20260514000000_v3_initial_schema.sql 적용 완료된 상태
--
-- 정책 원칙
--  - service_role 은 RLS 우회 (server action 의 createAdminClient)
--  - anon/authenticated 는 본 정책으로만 접근
--  - users      : 본인 행만 SELECT / UPDATE
--  - clubs      : 멤버만 SELECT, 운영자만 UPDATE (INSERT 는 service_role)
--  - club_members: 본인 멤버십 + 본인이 운영하는 클럽의 모든 멤버 SELECT
--  - sessions/guests/matches/match_players : 추후 게임보드 step
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. users
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS users_self_select ON users;
CREATE POLICY users_self_select
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS users_self_update ON users;
CREATE POLICY users_self_update
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT 는 handle_new_auth_user trigger 가 SECURITY DEFINER 로 처리 → 정책 불필요

-- ────────────────────────────────────────────────────────────
-- 2. clubs
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS clubs_member_select ON clubs;
CREATE POLICY clubs_member_select
  ON clubs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.club_id = clubs.id
        AND club_members.user_id = auth.uid()
        AND club_members.removed_at IS NULL
    )
  );

DROP POLICY IF EXISTS clubs_admin_update ON clubs;
CREATE POLICY clubs_admin_update
  ON clubs FOR UPDATE
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- INSERT 는 server action 에서 service_role 사용 → 정책 불필요

-- ────────────────────────────────────────────────────────────
-- 3. club_members
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS club_members_self_select ON club_members;
CREATE POLICY club_members_self_select
  ON club_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = club_members.club_id
        AND clubs.admin_id = auth.uid()
    )
  );

-- INSERT/UPDATE/DELETE 는 server action (service_role) 로만 처리

-- ────────────────────────────────────────────────────────────
-- 4. GRANT 재확인 (idempotent — DROP SCHEMA 잔재 보호)
-- ────────────────────────────────────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 검증 쿼리 (참고)
-- SELECT schemaname, tablename, policyname, cmd FROM pg_policies
-- WHERE schemaname = 'public' ORDER BY tablename, policyname;
