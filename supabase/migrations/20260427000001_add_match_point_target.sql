-- match_point_target: 게임 점수 기준 (21점 / 25점)
-- 코드는 이미 사용 중이었으나 마이그레이션 누락 (schema drift) — 정정.

ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS match_point_target INT NOT NULL DEFAULT 25
  CHECK (match_point_target IN (21, 25));
