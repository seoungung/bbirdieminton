-- ============================================================
-- Master Admin (시스템 마스터) 마이그레이션
-- 2026-05-10
--
-- 목적:
--   dogfooding / 베타 운영을 위한 슈퍼어드민 권한 컬럼 추가.
--   /admin 트리에서만 사용. 기존 RLS 정책은 손대지 않음 —
--   service-role admin client 가 RLS 를 자연스럽게 우회하고,
--   TS 레이어 assertMaster() 가 게이트로 동작.
--
-- 구성:
--   1. users.is_master 컬럼 추가
--   2. is_master(uid) 헬퍼 함수 (선택, SQL 호출용)
--   3. 부분 인덱스 (마스터 수가 매우 적으므로 부분 인덱스로 충분)
--
-- 멱등성:
--   ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS,
--   CREATE OR REPLACE FUNCTION 사용.
--
-- 실행 방법:
--   Supabase Dashboard → SQL Editor → 이 파일 전체 붙여넣기 후 RUN.
--   (또는 supabase db push)
-- ============================================================

-- ============================================================
-- 1. users.is_master 컬럼 추가
-- ============================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_master BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.users.is_master IS
  '시스템 마스터 권한. /admin 접근 게이트. 수동 SQL 부여.';


-- ============================================================
-- 2. is_master 헬퍼 (SQL 호출 가능)
--    SECURITY DEFINER — RLS 우회하고 안전하게 boolean 만 반환.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_master(uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_master FROM public.users WHERE id = uid), false);
$$;

REVOKE EXECUTE ON FUNCTION public.is_master(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_master(UUID) TO authenticated;


-- ============================================================
-- 3. 부분 인덱스 (마스터 row 만 인덱싱 → 매우 작음)
-- ============================================================
CREATE INDEX IF NOT EXISTS users_is_master_idx
  ON public.users(is_master)
  WHERE is_master = true;


-- ============================================================
-- 완료 안내
-- ============================================================
-- 마이그레이션 적용 후, 마스터 계정 부여는 별도 SQL 로 진행:
--   scripts/grant-master.sql 참조.
-- ============================================================
