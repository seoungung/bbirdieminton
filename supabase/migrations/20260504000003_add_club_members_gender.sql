-- ============================================================
-- club_members.gender 컬럼 추가 (2026-05-04)
-- ============================================================
-- 사용처:
--   - PlayingPhase 플레이어 카드 색상 (남=파랑 / 여=빨강)
--   - 게임보드 풀 패널 "남자/여자" 필터
-- 설계:
--   - NULL 허용 (기존 회원은 미입력 — 운영자가 차차 채움)
--   - 'M' / 'F' 만 유효 (CHECK 제약)
--   - 클럽별 성별 필터 가속 위해 부분 인덱스 (NULL 제외)
-- ============================================================

ALTER TABLE public.club_members
  ADD COLUMN IF NOT EXISTS gender TEXT
  CHECK (gender IS NULL OR gender IN ('M', 'F'));

CREATE INDEX IF NOT EXISTS idx_club_members_club_gender
  ON public.club_members(club_id, gender)
  WHERE gender IS NOT NULL;
