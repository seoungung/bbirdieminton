-- ============================================================
-- 공지(notices) / 정기모임(club_events) 이미지 첨부 컬럼 추가
-- 첫 번째 이미지가 썸네일로 사용됨
-- ============================================================

ALTER TABLE notices ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE club_events ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';
