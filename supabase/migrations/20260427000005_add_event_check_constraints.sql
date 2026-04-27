-- club_events.max_attend 음수/비현실 차단
-- 0 = 무제한, 1~1000 = 정원
ALTER TABLE club_events
  ADD CONSTRAINT max_attend_check
  CHECK (max_attend >= 0 AND max_attend <= 1000)
  NOT VALID;

-- 기존 행 검증
ALTER TABLE club_events VALIDATE CONSTRAINT max_attend_check;
