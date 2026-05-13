-- ============================================================
-- POC DRAFT DOWN — DO NOT APPLY DIRECTLY
-- poc_winning_team.sql 의 대응 down.
-- 실제 적용은 plan v2 §10 백업/롤백 전략에 따라 staging clone 후에만.
-- ============================================================

-- 1) 인덱스 제거 (먼저 — 컬럼 drop 이 인덱스 자동 정리하지만 명시적으로).
DROP INDEX IF EXISTS idx_matches_winning_team;

-- 2) 컬럼 제거.
--    주의: 이미 winning_team 만으로 결과를 기록한 매치 (점수 NULL) 가 있으면
--    이 시점에 무승부/승패 정보가 비가역적으로 손실된다.
--    plan v2 §887 의 비가역성 경고 참조.
ALTER TABLE matches DROP COLUMN IF EXISTS winning_team;
