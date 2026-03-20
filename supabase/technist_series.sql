-- TECHNIST 시리즈 데이터 추가
-- 기존 데이터는 유지, TECHNIST 시리즈만 추가

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'technist-fire-t100',
  '테크니스트 TECHNIST ― FIRE T-100 라켓',
  'TECHNIST',
  '12~14만원',
  '4U',
  'even',
  'stiff',
  '{"왕초보","초심자"}',
  '{"올라운드"}',
  55, 70, 68, 72, 60, 72,
  true, true,
  '테크니스트 입문 라켓 중 판매량 1위 모델입니다. 이븐밸런스와 스티프 샤프트로 정확한 타구감을 제공해 왕초보도 쉽게 컨트롤할 수 있어요. 일본산 카본 소재로 가격 대비 내구성이 뛰어납니다.',
  '처음 배드민턴을 시작하는 왕초보, 동호회 등록 전 기초를 다지고 싶은 초심자',
  '{"가성비 최고","정확한 컨트롤","일본산 카본 소재"}',
  '{"스매시 파워 약함","디자인 평범"}',
  '테크니스트 입문 라켓 중 에디터가 가장 먼저 추천하는 모델. 왕초보도 바로 코트에 서는 느낌을 받을 수 있습니다.',
  '"처음 라켓인데 너무 잘 맞아요", "가격 대비 품질이 좋아요", "초보한테 딱 좋은 라켓"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'technist-jh-standard',
  '테크니스트 TECHNIST ― JH-STANDARD 라켓',
  'TECHNIST',
  '11~12만원',
  '4U',
  'even',
  'flexible',
  '{"왕초보"}',
  '{"올라운드"}',
  40, 75, 72, 65, 50, 80,
  false, true,
  '테크니스트 라인업에서 가장 저렴한 입문 전용 모델입니다. 유연한 샤프트가 손목 부담을 줄여주며 스트링이 기본 포함되어 있어 바로 사용 가능합니다. 왕초보가 처음 코트에 서는 순간을 위해 설계되었습니다.',
  '생애 처음 배드민턴을 시작하는 왕초보, 선물용으로 찾는 분',
  '{"스트링 포함","부드러운 샤프트","가장 저렴한 테크니스트 입문가"}',
  '{"파워 부족","중급 이후 업그레이드 필요"}',
  '배드민턴 선물로 고민 중이라면 이 모델이 정답입니다. 스트링 포함에 가격도 합리적입니다.',
  '"선물로 줬는데 좋아해요", "처음 라켓으로 딱이에요", "부드럽고 다루기 편해요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'technist-fire-t10',
  '테크니스트 TECHNIST ― FIRE T-10 라켓',
  'TECHNIST',
  '14~15만원',
  '4U',
  'even',
  'stiff',
  '{"초심자","D조"}',
  '{"올라운드"}',
  62, 68, 65, 75, 65, 68,
  true, true,
  'FIRE T-100의 업그레이드 버전으로 동호인 중급 입문자에게 추천하는 모델입니다. 일본산 카본 소재와 견고한 샤프트로 스매시 파워를 키우기 시작하는 시점에 최적입니다. 레벨업 후에도 오래 사용할 수 있는 내구성이 강점입니다.',
  '초심자에서 D조로 올라가는 시점의 동호인, 오래 쓸 라켓 찾는 분',
  '{"높은 내구성","스매시 파워 향상","레벨업 후에도 사용 가능"}',
  '{"무거운 느낌","왕초보에겐 다루기 어려울 수 있음"}',
  'FIRE T-100이 물리면 다음 선택지. 가격 대비 성능이 훌륭합니다.',
  '"D조 들어가면서 샀는데 만족해요", "파워가 확실히 달라요", "오래 쓸 수 있을 것 같아요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'technist-jh-air',
  '테크니스트 TECHNIST ― JH-AIR 라켓',
  'TECHNIST',
  '13~14만원',
  '4U',
  'even',
  'medium',
  '{"왕초보","초심자"}',
  '{"올라운드"}',
  60, 72, 70, 70, 62, 75,
  true, true,
  '미들 밸런스 샤프트로 입문자 공격형 연습에 최적화된 모델입니다. 이븐밸런스와 미디엄 탄성 조합으로 초보자가 공격과 수비를 고르게 연습할 수 있습니다. BG80 스트링 기본 서비스로 별도 스트링 비용이 없습니다.',
  '공격 감각을 키우고 싶은 왕초보~초심자, 스트링 포함 제품 원하는 분',
  '{"BG80 스트링 포함","공수 균형 잡힌 성능","대형 유통채널 구매 가능"}',
  '{"개성 없는 디자인","특화된 강점 없음"}',
  '가장 무난하게 추천할 수 있는 테크니스트 입문 공격형. 스트링 포함이라 총비용이 합리적입니다.',
  '"스트링 포함이라 바로 쳤어요", "균형 잡힌 느낌", "공수 다 되네요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'technist-spear-94-game',
  '테크니스트 TECHNIST ― SPEAR 94 GAME 라켓',
  'TECHNIST',
  '13~14만원',
  '4U',
  'even',
  'medium',
  '{"초심자","D조"}',
  '{"올라운드"}',
  65, 65, 68, 70, 65, 68,
  false, true,
  '테크니스트 플래그십 SPEAR 94 라인의 보급형 버전입니다. 정가 32만원 SPEAR 94의 프레임 DNA를 입문 가격대에서 경험할 수 있도록 설계되었습니다. 처음 동호회에 입문하는 초심자~D조에게 테크니스트 브랜드를 경험하기 좋은 가성비 선택지입니다.',
  '프리미엄 라인을 저렴하게 체험하고 싶은 초심자, D조 입문자',
  '{"플래그십 라인 DNA","가성비 좋은 프리미엄 경험","이름값"}',
  '{"플래그십 대비 성능 차이 있음","스트링 미포함"}',
  '테크니스트 주력 시리즈를 경험하고 싶다면 GAME 버전부터 시작하세요.',
  '"SPEAR 시리즈 이름값 하네요", "D조 친구가 추천해서 샀어요", "가성비 좋습니다"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'technist-jh-4',
  '테크니스트 TECHNIST ― JH-4(김사랑) 라켓',
  'TECHNIST',
  '13~15만원',
  '3U / 4U',
  'head-light',
  'flexible',
  '{"초심자","D조"}',
  '{"공격형"}',
  68, 62, 75, 68, 70, 72,
  true, true,
  '국가대표 출신 김사랑 선수의 시그니처 라켓입니다. 유연한 샤프트로 스매시 시 손목 스냅을 쉽게 활용할 수 있어 공격 감각을 빠르게 키우고 싶은 초심자에게 인기 있습니다. 정가 대비 할인 판매 빈도가 높아 15만원 이내 구입이 가능합니다.',
  '공격 감각을 빠르게 키우고 싶은 초심자~D조, 선수 모델 원하는 분',
  '{"선수 시그니처 모델","유연한 스냅감","할인 시 가성비 최고"}',
  '{"정가 높음","스트링 미포함","수비형엔 부적합"}',
  '김사랑 선수처럼 빠른 공격을 원한다면 JH-4입니다. 할인 시 구매 적극 추천.',
  '"스냅이 잘 나와요", "공격이 좋아졌어요", "할인 받아서 가성비 대박"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'technist-jh-3',
  '테크니스트 TECHNIST ― JH-3(김사랑) 라켓',
  'TECHNIST',
  '14~15만원',
  '3U',
  'even',
  'medium',
  '{"D조","C조"}',
  '{"올라운드"}',
  70, 65, 68, 72, 68, 65,
  false, true,
  'JH-4보다 무거운 3U 단일 무게에 중간 탄성 샤프트로 안정적인 파워형 올라운드 플레이를 지향합니다. D조에서 C조로 올라가는 시점의 동호인에게 추천하는 업그레이드 모델입니다. 할인 이벤트 시 15만원 이하 구입이 가능합니다.',
  'D조에서 C조로 레벨업을 원하는 동호인, 파워형 올라운드를 선호하는 분',
  '{"안정적인 파워","중간 탄성으로 다목적","선수 모델 프리미엄"}',
  '{"무거운 3U 단일 무게","초보자에겐 다루기 어려움"}',
  'D조 이상의 플레이어가 파워를 끌어올리고 싶을 때 선택하는 모델입니다.',
  '"D조에서 쓰기 딱 좋아요", "파워가 좋아요", "레벨업 느낌이 나요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'technist-jh-6',
  '테크니스트 TECHNIST ― JH-6 라켓',
  'TECHNIST',
  '14~15만원',
  '5U',
  'head-light',
  'flexible',
  '{"왕초보","초심자"}',
  '{"수비형"}',
  35, 80, 80, 65, 55, 88,
  true, true,
  '일본산 카본 5U 초경량 라켓으로 팔 힘이 약한 분들에게 최적화된 모델입니다. 헤드라이트 밸런스로 빠른 라켓 조작과 셔틀 컨트롤이 강점입니다. 여성 왕초보~초심자에게 특히 추천하는 에디터 픽 모델입니다.',
  '여성 배린이, 팔 힘이 약한 왕초보~초심자, 컨트롤 위주 플레이 원하는 분',
  '{"초경량 5U","헤드라이트 빠른 조작","일본산 카본"}',
  '{"파워 매우 약함","남성 파워형엔 부적합"}',
  '여성 배린이에게 가장 먼저 추천하는 테크니스트 라켓입니다.',
  '"너무 가벼워서 좋아요", "여성에게 딱이에요", "손목이 안 아파요"'
);
