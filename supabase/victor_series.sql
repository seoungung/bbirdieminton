-- VICTOR 시리즈 데이터 추가
-- 기존 데이터는 유지, VICTOR 시리즈만 추가

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'victor-auraspeed-9',
  '빅터 VICTOR ― 아우라스피드 9(AURASPEED 9) 라켓',
  'VICTOR',
  '5~7만원',
  '4U',
  'head-light',
  'flexible',
  '{"왕초보","초심자"}',
  '{"수비형","올라운드"}',
  40, 65, 85, 65, 60, 80,
  false, true,
  '빅터 입문용 스피드 라켓의 가성비 대표 모델입니다. 헤드라이트 밸런스와 유연한 샤프트 덕분에 손목 부담이 적고 스윙이 매우 빠릅니다. 배드민턴을 처음 시작하는 왕초보에게 가장 저렴하게 빅터를 경험할 수 있는 라켓입니다.',
  '배드민턴 첫 라켓을 저렴하게 원하는 왕초보, 가성비 최우선인 분',
  '{"매우 저렴한 가격","빠른 스윙감","헤드라이트 경량 조작"}',
  '{"파워 부족","스매시에 약함","내구성 보통"}',
  '5만원대에 빅터 브랜드를 경험할 수 있는 최고의 선택입니다.',
  '"이 가격에 이 품질이면 만족해요", "첫 라켓으로 딱이에요", "빠르고 가벼워요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'victor-jetspeed-s-800ht',
  '빅터 VICTOR ― 제트스피드 S 800HT(JETSPEED S 800HT) 라켓',
  'VICTOR',
  '5~8만원',
  '4U',
  'even',
  'flexible',
  '{"왕초보","초심자"}',
  '{"올라운드"}',
  45, 70, 80, 65, 62, 75,
  true, true,
  'AERO-SWORD 기술이 적용된 입문자 전용 스피드 라켓입니다. 이븐 밸런스와 유연한 샤프트로 컨트롤이 직관적이고 스윙이 가볍습니다. 정가 13만원 대비 5~8만원에 구매 가능해 배린이들에게 가성비 최고 모델로 꼽힙니다.',
  '가성비를 최우선으로 찾는 왕초보~초심자, 첫 라켓 고민 중인 분',
  '{"정가 대비 파격 할인","AERO-SWORD 기술","이븐밸런스 다목적"}',
  '{"파워 부족","디자인 구형"}',
  '가성비로 따지면 이 가격대 최고의 빅터 라켓입니다. 에디터 강추!',
  '"이 가격에 이 퀄리티 말이 안 돼요", "첫 라켓으로 추천합니다", "가볍고 좋아요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'victor-brave-sword-1900',
  '빅터 VICTOR ― 브레이브소드 1900(BRAVE SWORD 1900) 라켓',
  'VICTOR',
  '6~8만원',
  '4U',
  'even',
  'medium',
  '{"초심자","D조"}',
  '{"올라운드"}',
  55, 72, 68, 70, 65, 65,
  true, true,
  '한국 배드민턴 입문자 시장에서 꾸준히 팔리는 스테디셀러입니다. 이븐 밸런스와 미디엄 샤프트로 공격과 수비 모두 균형 잡힌 성능을 제공합니다. 초심자부터 D조까지 오래 쓸 수 있어 첫 라켓으로 추천 1순위입니다.',
  '오래 쓸 첫 라켓을 원하는 초심자~D조, 공수 균형을 원하는 분',
  '{"스테디셀러 검증된 성능","공수 균형","D조까지 사용 가능"}',
  '{"스피드 특화 모델 대비 느림","특출난 강점 없음"}',
  '배린이부터 D조까지 가장 무난하게 추천할 수 있는 빅터 라켓입니다.',
  '"정말 오래 쓸 수 있겠어요", "공수 다 잘 돼요", "D조 형이 추천해줬어요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'victor-drive-x-0',
  '빅터 VICTOR ― 드라이브X 0(DRIVE X 0) 라켓',
  'VICTOR',
  '10~11만원',
  '4U',
  'even',
  'medium',
  '{"왕초보","초심자","D조"}',
  '{"올라운드"}',
  55, 75, 70, 72, 65, 68,
  true, true,
  '빅터 드라이브X 시리즈의 입문 대표 모델로 공격과 수비의 밸런스가 탁월합니다. 이븐 밸런스와 미디엄 샤프트로 어떤 스윙도 편안하게 소화할 수 있습니다. 헤드커버와 스포츠타월이 포함되어 있어 배린이 첫 세팅으로 손색없습니다.',
  '10만원대 입문 라켓을 원하는 왕초보~D조, 구성품이 풍부한 제품 원하는 분',
  '{"헤드커버+타월 포함","공수 균형 탁월","왕초보~D조 롱런 사용"}',
  '{"10만원대 가격","특화 성능 없음"}',
  '드라이브X 시리즈는 빅터의 올라운더. 입문자가 믿고 선택할 수 있는 모델입니다.',
  '"구성품이 풍성해요", "10만원대에 이 정도면 충분해요", "D조까지 계속 쓸게요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'victor-drive-x-1l',
  '빅터 VICTOR ― 드라이브X 1L(DRIVE X 1L) 라켓',
  'VICTOR',
  '10~11만원',
  '5U',
  'even',
  'flexible',
  '{"왕초보","초심자"}',
  '{"수비형","올라운드"}',
  40, 72, 82, 65, 58, 85,
  false, false,
  '드라이브X 시리즈에서 가장 가벼운 5U 모델입니다. 유연한 샤프트와 초경량 바디가 결합되어 스윙 속도가 매우 빠르고 손목 부담이 최소화됩니다. 체력이 부족한 여성 배린이나 소체형 왕초보에게 특히 추천합니다.',
  '여성 배린이, 팔 힘이 부족한 왕초보~초심자, 경량 라켓 선호하는 분',
  '{"초경량 5U","빠른 스윙","손목 부담 최소"}',
  '{"파워 부족","남성 파워형엔 부적합"}',
  '여성이나 체력이 약한 분들에게 드라이브X 1L은 최선의 선택입니다.',
  '"너무 가벼워서 처음에 당황했어요", "스윙이 빠르게 됐어요", "여성에게 추천해요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'victor-auraspeed-6000',
  '빅터 VICTOR ― 아우라스피드 6000(AURASPEED 6000) 라켓',
  'VICTOR',
  '8~12만원',
  '4U',
  'even',
  'medium',
  '{"초심자","D조"}',
  '{"수비형","올라운드"}',
  50, 73, 75, 68, 62, 72,
  false, false,
  '아우라스피드 시리즈의 가성비 중급 모델입니다. 이븐 밸런스와 미디엄 플렉스로 컨트롤과 스피드를 균형 있게 제공합니다. 스피드형 라켓을 원하지만 아직 파워가 부족한 초심자~D조 플레이어에게 적합합니다.',
  '스피드형 플레이를 시작하는 초심자~D조, 가성비 중급 라켓 원하는 분',
  '{"스피드와 컨트롤 균형","합리적인 가격","아우라스피드 시리즈 입문"}',
  '{"파워 약함","재고 제한적"}',
  '아우라스피드 시리즈를 경험하고 싶은 분의 첫 선택입니다.',
  '"스피드가 확실히 달라요", "컨트롤도 잘 돼요", "가성비 좋아요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'victor-auraspeed-9000c',
  '빅터 VICTOR ― 아우라스피드 9000C(AURASPEED 9000C) 라켓',
  'VICTOR',
  '12~15만원',
  '4U',
  'head-light',
  'medium',
  '{"초심자","D조","C조"}',
  '{"수비형","올라운드"}',
  52, 78, 78, 70, 65, 80,
  true, false,
  '헤드라이트 밸런스와 미디엄 플렉스의 조합으로 올라운드 플레이에 최적화된 모델입니다. 스윙이 가볍고 라켓 컨트롤이 직관적이어서 초보자도 빠르게 적응할 수 있습니다. 15만원 이내 빅터 라켓 중 스펙 대비 성능이 가장 뛰어난 에디터 추천 모델입니다.',
  '15만원 이내 최고 성능을 원하는 초심자~C조, 스피드+컨트롤 모두 원하는 분',
  '{"15만원 이내 최고 스펙","헤드라이트 빠른 조작","C조까지 사용 가능"}',
  '{"파워 약함","15만원대 가격"}',
  '15만원 이내 빅터 라켓 중 에디터가 가장 추천하는 모델. 롱런 가능합니다.',
  '"이게 이 가격이라고요?", "D조 넘어서도 쓸 수 있어요", "스피드와 컨트롤 모두 만족"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'victor-thruster-k-t500',
  '빅터 VICTOR ― 트러스터K T500(THRUSTER K T500) 라켓',
  'VICTOR',
  '13~14만원',
  '4U',
  'head-heavy',
  'stiff',
  '{"D조","C조"}',
  '{"공격형"}',
  82, 60, 58, 78, 78, 52,
  false, false,
  '트러스터 시리즈 입문 모델로 강한 스매시를 원하는 공격형 플레이어를 위한 라켓입니다. 헤드헤비 밸런스와 스티프 샤프트가 결합되어 강력한 타구와 깊은 클리어가 가능합니다. 동호회 D조~C조 중 공격형 스타일로 전향하고 싶은 분께 추천합니다.',
  '공격형으로 전향하고 싶은 D조~C조, 강한 스매시를 원하는 동호인',
  '{"강력한 스매시","헤드헤비 파워감","트러스터 시리즈 입문"}',
  '{"수비 느림","왕초보에게 다루기 어려움","무거운 헤드"}',
  '공격형으로 스타일을 바꾸고 싶다면 트러스터 T500부터 시작하세요.',
  '"스매시가 확실히 강해요", "D조 이상 추천해요", "파워가 남달라요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'victor-drive-x-9x',
  '빅터 VICTOR ― 드라이브X 9X(DRIVE X 9X) 라켓',
  'VICTOR',
  '13~15만원',
  '4U',
  'even',
  'medium',
  '{"D조","C조"}',
  '{"올라운드"}',
  60, 76, 72, 75, 68, 70,
  false, false,
  '드라이브X 시리즈의 중급 올라운드 모델로 복식 경기에서 균형 잡힌 성능을 발휘합니다. 이븐 밸런스와 미디엄 플렉스로 스매시, 드라이브, 드롭 등 모든 샷을 무리 없이 소화할 수 있습니다. 동호회 D조에서 게임 폭을 넓히고 싶은 플레이어에게 적합한 업그레이드 라켓입니다.',
  'D조에서 게임 폭을 넓히고 싶은 동호인, 올라운드 업그레이드를 원하는 분',
  '{"모든 샷 소화 가능","D조~C조 롱런","안정적인 성능"}',
  '{"특화된 강점 없음","가격 약간 있음"}',
  'D조 이상이라면 드라이브X 9X로 업그레이드할 시점입니다.',
  '"D조에서 쓰기 딱 좋아요", "모든 샷이 잘 나와요", "업그레이드 만족해요"'
);
