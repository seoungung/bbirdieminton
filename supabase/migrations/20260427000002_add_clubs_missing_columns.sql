-- clubs: 셔틀콕 관리 + 정산 컬럼 (코드는 이미 사용 중이었으나 마이그레이션 누락 — schema drift 정정)
-- 일부 환경에는 Dashboard에서 직접 추가됐을 수 있어 IF NOT EXISTS 사용.

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS shuttle_pool_count        INT  NOT NULL DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS shuttle_weekday_required  INT  NOT NULL DEFAULT 2;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS shuttle_weekend_required  INT  NOT NULL DEFAULT 3;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS shuttle_default_price     INT  NOT NULL DEFAULT 2500;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS settlement_account        TEXT;
