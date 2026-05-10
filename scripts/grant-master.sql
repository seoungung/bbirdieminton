-- ============================================================
-- 시스템 마스터(슈퍼어드민) 권한 부여 SQL
-- ============================================================
--
-- 사용 방법:
--   1) supabase db push 또는 SQL Editor 에서 마이그레이션
--      20260510000008_master_admin.sql 적용 (users.is_master 컬럼 추가)
--   2) Supabase Dashboard → SQL Editor 에 이 파일 내용 붙여넣고 RUN
--   3) 해당 사용자가 로그아웃 후 재로그인 → /admin 접근 가능
--
-- 권한 회수:
--   같은 UPDATE 문에서 true → false 로만 변경하면 됩니다.
-- ============================================================

-- ─────────────────────────────────────────────
-- 옵션 A: 이메일로 부여 (소셜/이메일 로그인 사용자)
-- ─────────────────────────────────────────────
-- 주의: 실제 DB에서 public.users.birdieminton_user_id 가 text 로 저장돼 있어
--       auth.users.id (uuid) 와 직접 비교 시 타입 에러 발생.
--       양쪽을 text 로 캐스팅해서 비교한다.
UPDATE public.users
SET    is_master = true
WHERE  birdieminton_user_id::text = (
  SELECT id::text FROM auth.users WHERE email = 'skyyolle7@gmail.com'
);

-- 검증
SELECT u.id,
       u.name,
       u.is_master,
       au.email
FROM   public.users u
JOIN   auth.users   au ON au.id::text = u.birdieminton_user_id::text
WHERE  u.is_master = true;


-- ─────────────────────────────────────────────
-- 옵션 B: users.id (UUID) 를 직접 알 때
-- ─────────────────────────────────────────────
-- UPDATE public.users
-- SET    is_master = true
-- WHERE  id = '00000000-0000-0000-0000-000000000000';


-- ─────────────────────────────────────────────
-- 권한 회수 (예시)
-- ─────────────────────────────────────────────
-- UPDATE public.users
-- SET    is_master = false
-- WHERE  birdieminton_user_id = (
--   SELECT id FROM auth.users WHERE email = 'someone@example.com'
-- );
