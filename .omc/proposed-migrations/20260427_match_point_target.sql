-- ============================================================
-- 점수 규칙 (21/25점) 옵션화
--
-- 정식 대회는 21점 / 일반 클럽·동호회는 25점 듀스가 표준.
-- 클럽이 운영 방식에 맞춰 선택 가능하도록 컬럼 추가.
-- 디폴트 25 (한국 클럽 표준).
-- ============================================================

ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS match_point_target INT NOT NULL DEFAULT 25
    CHECK (match_point_target IN (21, 25));

COMMENT ON COLUMN clubs.match_point_target IS
  '게임 종료 점수 (21 또는 25). 디폴트 25 — 한국 클럽·동호회 표준.';
