-- 라켓 테이블에 새 필드 추가
ALTER TABLE rackets
  ADD COLUMN IF NOT EXISTS max_tension INT,
  ADD COLUMN IF NOT EXISTS frame_body TEXT CHECK (frame_body IN ('wide', 'slim', 'medium')),
  ADD COLUMN IF NOT EXISTS head_shape TEXT CHECK (head_shape IN ('isometric', 'oval'));

-- 기존 미즈노 라켓 스펙 업데이트 (YouTube 스크립트 기반)
UPDATE rackets SET
  max_tension = 30,
  frame_body = 'slim',
  head_shape = 'isometric'
WHERE slug = 'mizuno-carbopro-823' OR name ILIKE '%CARBO PRO 823%';

UPDATE rackets SET
  max_tension = 30,
  frame_body = 'slim',
  head_shape = 'isometric'
WHERE slug = 'mizuno-carbopro-9' OR name ILIKE '%CARBO PRO 9%' OR name ILIKE '%CARBOPRO 9%';

UPDATE rackets SET
  max_tension = 30,
  frame_body = 'slim',
  head_shape = 'isometric'
WHERE slug ILIKE '%mizuno%' AND max_tension IS NULL;
