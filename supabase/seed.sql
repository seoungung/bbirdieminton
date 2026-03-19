-- ============================================================
-- 테이블 생성
-- ============================================================
CREATE TABLE IF NOT EXISTS rackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  image_url TEXT,
  price_range TEXT,
  weight TEXT,
  balance TEXT,
  flex TEXT,
  level TEXT[],
  type TEXT[],
  stat_power INT DEFAULT 50,
  stat_control INT DEFAULT 50,
  stat_speed INT DEFAULT 50,
  stat_durability INT DEFAULT 50,
  stat_repulsion INT DEFAULT 50,
  stat_maneuver INT DEFAULT 50,
  description TEXT,
  editor_pick BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 설정
ALTER TABLE rackets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON rackets;
CREATE POLICY "Public read" ON rackets FOR SELECT USING (true);


-- ============================================================
-- 샘플 데이터 (라켓 10개)
-- ============================================================
INSERT INTO rackets (slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  description, editor_pick, is_popular)
VALUES

-- 1. 요넥스 아스트록스 88D (공격형 대표)
(
  'yonex-astrox-88d',
  'ASTROX 88D',
  'YONEX',
  '18~22만원',
  '3U / 4U',
  'head-heavy',
  'stiff',
  ARRAY['D조', 'C조'],
  ARRAY['공격형'],
  90, 65, 70, 82, 88, 60,
  '요넥스 아스트록스 시리즈 중 가장 인기 있는 공격형 모델입니다. 헤드헤비 밸런스와 높은 반발력으로 강력한 스매싱이 가능합니다. 후위 공격수에게 최적화되어 있으며, D조~C조 선수에게 추천합니다.',
  true, true
),

-- 2. 요넥스 나노플레어 700 (스피드형 대표)
(
  'yonex-nanoflare-700',
  'NANOFLARE 700',
  'YONEX',
  '18~22만원',
  '4U',
  'head-light',
  'stiff',
  ARRAY['초심자', 'D조', 'C조'],
  ARRAY['수비형', '올라운드'],
  65, 78, 95, 75, 72, 90,
  '초고속 스윙이 가능한 헤드라이트 라켓입니다. 빠른 수비와 전위 플레이에 특화되어 있으며, 복식 전위 선수에게 특히 추천합니다. 가벼운 무게감으로 장시간 경기에서도 피로감이 적습니다.',
  false, true
),

-- 3. 빅터 드라이버 스피드 S (초보 추천)
(
  'victor-thruster-k-f',
  'THRUSTER K F',
  'VICTOR',
  '5~9만원',
  '4U',
  'even',
  'medium',
  ARRAY['왕초보', '배린이', '초심자'],
  ARRAY['올라운드'],
  60, 65, 70, 78, 62, 72,
  '입문자와 초보자를 위한 가성비 올라운드 라켓입니다. 균형형 밸런스로 공수 모두 무난하게 사용할 수 있으며, 적당한 반발력으로 부드러운 타구감을 제공합니다. 라켓을 처음 잡는 분께 강력 추천합니다.',
  false, true
),

-- 4. 요넥스 아크세이버 11 (올라운드 명품)
(
  'yonex-arcsaber-11',
  'ARCSABER 11',
  'YONEX',
  '20~25만원',
  '3U / 4U',
  'even',
  'medium',
  ARRAY['D조', 'C조'],
  ARRAY['올라운드'],
  75, 88, 78, 85, 80, 82,
  '섬세한 컨트롤과 균형 잡힌 성능으로 수십 년간 사랑받는 명작입니다. 공격과 수비 모두 뛰어난 올라운드 라켓으로, 기술을 갈고 닦고 싶은 D조~C조 선수에게 이상적입니다.',
  true, true
),

-- 5. 빅터 브레이브소드 12 (배린이 추천)
(
  'victor-brave-sword-12',
  'BRAVE SWORD 12',
  'VICTOR',
  '8~12만원',
  '4U',
  'even',
  'medium',
  ARRAY['배린이', '초심자', 'D조'],
  ARRAY['올라운드'],
  68, 72, 75, 76, 68, 78,
  '배드민턴을 막 시작한 배린이부터 동호회 D조까지 폭넓게 사용하는 인기 라켓입니다. 가격 대비 성능이 우수하며 다루기 쉬운 균형형 밸런스로 초보자의 실력 향상에 도움을 줍니다.',
  false, true
),

-- 6. 리닝 엑스포스 90 (고급 공격형)
(
  'lining-axforce-90',
  'AXFORCE 90',
  'LI-NING',
  '22~28만원',
  '3U',
  'head-heavy',
  'stiff',
  ARRAY['D조', 'C조'],
  ARRAY['공격형'],
  92, 68, 65, 80, 90, 58,
  '리닝의 플래그십 공격형 라켓으로 강렬한 스매싱 파워가 특징입니다. 카본 나노튜브 기술이 적용되어 최상의 반발력을 자랑합니다. 후위 공격수를 위한 프리미엄 선택지입니다.',
  true, false
),

-- 7. 미즈노 알티우스 01 스피드
(
  'mizuno-altius-01-speed',
  'ALTIUS 01 SPEED',
  'MIZUNO',
  '12~16만원',
  '4U',
  'head-light',
  'stiff',
  ARRAY['초심자', 'D조'],
  ARRAY['수비형', '올라운드'],
  62, 80, 90, 77, 70, 88,
  '미즈노의 스피드 특화 라켓으로 빠른 라켓 워크와 수비에 최적화되어 있습니다. 전위 스타일의 플레이어 또는 빠른 랠리를 선호하는 선수에게 추천합니다.',
  false, false
),

-- 8. 빅터 아우라스피드 100X
(
  'victor-auraspeed-100x',
  'AURASPEED 100X',
  'VICTOR',
  '20~26만원',
  '4U',
  'head-light',
  'stiff',
  ARRAY['D조', 'C조'],
  ARRAY['수비형'],
  68, 82, 92, 78, 75, 92,
  '빅터의 최고급 스피드 라켓으로 압도적인 빠르기와 조작성을 자랑합니다. 수비와 전위 네트플레이에 특화되어 있으며, 빠른 복식 경기에서 빛을 발합니다.',
  false, true
),

-- 9. 카와사키 아너 X550 (가성비 입문)
(
  'kawasaki-honor-x550',
  'HONOR X550',
  'KAWASAKI',
  '3~5만원',
  '4U',
  'even',
  'flexible',
  ARRAY['왕초보', '배린이'],
  ARRAY['올라운드'],
  55, 58, 62, 72, 55, 65,
  '부담 없는 가격으로 배드민턴을 시작하기 좋은 입문용 라켓입니다. 유연한 샤프트로 타구감이 부드러우며 초보자도 쉽게 다룰 수 있습니다. 동네 배드민턴 첫 발걸음에 적합합니다.',
  false, false
),

-- 10. 요넥스 B-4000 (국민 입문라켓)
(
  'yonex-b-4000',
  'B-4000',
  'YONEX',
  '2~4만원',
  '4U',
  'even',
  'flexible',
  ARRAY['왕초보', '배린이'],
  ARRAY['올라운드'],
  50, 55, 60, 80, 52, 62,
  '요넥스의 대표 입문 라켓으로 오랫동안 국민 배드민턴 입문 라켓으로 자리잡아 왔습니다. 가볍고 튼튼하며 내구성이 뛰어나 처음 배드민턴을 접하는 왕초보에게 가장 무난한 선택입니다.',
  false, true
);
