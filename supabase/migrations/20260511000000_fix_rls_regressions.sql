-- ============================================================
-- RLS 회귀 복구 + schema drift 보정
-- 2026-05-11
--
-- 목적:
--   1. users 정책 ::text 캐스팅 복구 (A2 — 20260510000001 회귀)
--   2. session_guests_modify 정책의 role 값 수정 (A3 — 'admin' → 'manager')
--   3. users.profile_img 컬럼 DDL 명시 (A7 — RPC 들이 SELECT 중인데 DDL 누락 — schema drift)
--
-- 멱등성:
--   DROP POLICY IF EXISTS / CREATE POLICY 패턴, ADD COLUMN IF NOT EXISTS.
--
-- 실행 방법:
--   Supabase Dashboard → SQL Editor → 이 파일 전체 붙여넣기 후 RUN.
--   (또는 supabase db push)
-- ============================================================


-- ============================================================
-- A2. users 정책 ::text 캐스팅 복구
-- ============================================================
-- 회귀 경위:
--   20260427000003_fix_auth_uid_text_cast.sql 가 schema drift
--   (birdieminton_user_id 가 환경에 따라 TEXT/UUID 혼재)
--   대응을 위해 ::text 캐스팅을 추가했음.
--   그러나 20260510000001_rls_policies.sql (행 9~21) 이 캐스팅 없는
--   정책으로 덮어쓰면서 일부 환경에서
--   `operator does not exist: text = uuid` 에러로 회귀.
-- 복구 사유:
--   캐스팅 패턴을 다시 적용해 양 환경 모두 호환되게 정정.
--   (20260427000003 와 동일 패턴)
-- ============================================================

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


-- ============================================================
-- A3. session_guests_modify 정책 role 값 수정
-- ============================================================
-- 회귀 경위:
--   20260504000002_session_guests.sql (행 49~53) 의 정책이
--   `cm.role IN ('owner', 'admin')` 로 작성되어 있으나
--   club_members.role CHECK 제약은 (owner / manager / member) 만 허용.
--   → 'admin' 비교가 항상 false 가 되어 매니저가 게스트 수정 불가.
-- 복구 사유:
--   본래 의도는 "운영진(매니저까지)" 수정 허용. role 값을
--   'manager' 로 교정해 정책이 실제 동작하도록 정정.
--   다른 조건(EXISTS / removed_at IS NULL 등) 은 기존과 동일.
-- ============================================================

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
        AND cm.role IN ('owner', 'manager')
        AND cm.removed_at IS NULL
    )
  );


-- ============================================================
-- A7. users.profile_img 컬럼 DDL 명시 (schema drift 보정)
-- ============================================================
-- 사유:
--   기존 RPC 들이 users.profile_img 컬럼을 SELECT 하지만 마이그레이션에
--   ADD COLUMN 이 명시된 곳이 없음 (운영 DB 에는 수동 추가된 상태일 가능성).
--   IF NOT EXISTS 로 멱등 보장 — 이미 컬럼이 있는 환경에서는 no-op.
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_img TEXT;

COMMENT ON COLUMN public.users.profile_img IS
  '프로필 이미지 URL — 카카오 프사 또는 사용자 업로드.';
