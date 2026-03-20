-- KAWASAKI 시리즈 데이터 추가
-- 기존 데이터는 유지, KAWASAKI 시리즈만 추가

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'kawasaki-passion-p21',
  '카와사키 KAWASAKI ― 패션 P21(PASSION P21) 라켓',
  'KAWASAKI',
  '4~5만원',
  '4U',
  'head-light',
  'flexible',
  '{"왕초보","초심자"}',
  '{"올라운드"}',
  45, 72, 78, 70, 60, 80,
  false, true,
  '카와사키 패션 시리즈의 가장 저렴한 입문 모델입니다. 4만원대의 파격적인 가격에 헤드라이트 밸런스로 가볍게 다룰 수 있습니다. 처음 배드민턴을 접해보는 왕초보에게 부담 없이 추천하는 가성비 라켓입니다.',
  '부담 없는 첫 라켓을 원하는 왕초보, 배드민턴 체험용으로 찾는 분',
  '{"매우 저렴한 가격","가벼운 헤드라이트","입문용 최적"}',
  '{"내구성 보통","파워 약함","오래 쓰기엔 한계"}',
  '배드민턴이 맞는지 먼저 체험해보고 싶다면 P21이 정답입니다.',
  '"이 가격에 이 품질?", "체험용으로 딱이에요", "처음 치기 좋아요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'kawasaki-passion-p23',
  '카와사키 KAWASAKI ― 패션 P23(PASSION P23) 라켓',
  'KAWASAKI',
  '4~6만원',
  '4U',
  'even',
  'flexible',
  '{"왕초보","초심자","D조"}',
  '{"올라운드"}',
  50, 70, 72, 70, 62, 75,
  false, true,
  '패션 시리즈에서 가장 많이 팔리는 스테디셀러 입문 모델입니다. 이븐 밸런스와 유연한 샤프트로 공격과 수비 모두 무난하게 소화할 수 있습니다. 왕초보부터 D조까지 폭넓게 사용할 수 있어 오래 쓰는 가성비 라켓으로 인기 있습니다.',
  '오래 쓸 가성비 라켓을 원하는 왕초보~D조, 카와사키 입문자',
  '{"스테디셀러 검증","공수 균형","D조까지 사용 가능"}',
  '{"특화 성능 없음","디자인 평범"}',
  '카와사키 패션 시리즈 중 가장 무난하고 오래 쓸 수 있는 모델입니다.',
  '"오래 쓸 수 있어서 좋아요", "공수 다 잘 돼요", "가격 대비 만족해요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'kawasaki-passion-p25',
  '카와사키 KAWASAKI ― 패션 P25(PASSION P25) 라켓',
  'KAWASAKI',
  '4~6만원',
  '4U',
  'even',
  'medium',
  '{"초심자","D조"}',
  '{"올라운드"}',
  58, 68, 70, 72, 65, 72,
  true, true,
  '패션 시리즈에서 미디엄 탄성으로 파워와 컨트롤을 균형 있게 갖춘 모델입니다. P23보다 약간 더 단단한 샤프트로 스매시 감각을 익히기 시작하는 초심자에게 추천합니다. 5만원대의 가격으로 D조까지 충분히 사용할 수 있어 에디터가 추천하는 가성비 모델입니다.',
  '스매시를 배우기 시작하는 초심자~D조, 5만원대 가성비 라켓 원하는 분',
  '{"미디엄 탄성 스매시 입문","가성비 최고","에디터 추천"}',
  '{"P23보다 약간 딱딱함","왕초보에겐 다소 어려울 수 있음"}',
  '카와사키 패션 시리즈 중 에디터가 가장 추천하는 가성비 모델입니다.',
  '"스매시가 잘 나와요", "5만원에 이 성능이면 대박", "D조 친구가 추천해줬어요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'kawasaki-passion-p36',
  '카와사키 KAWASAKI ― 패션 P36(PASSION P36) 라켓',
  'KAWASAKI',
  '5~7만원',
  '4U',
  'even',
  'flexible',
  '{"왕초보","초심자","D조"}',
  '{"올라운드"}',
  52, 72, 74, 72, 63, 76,
  true, true,
  '패션 시리즈의 업그레이드 입문 모델로 내구성과 성능이 한 단계 향상되었습니다. 이븐 밸런스와 유연한 샤프트로 왕초보도 쉽게 다룰 수 있으면서 D조까지 충분히 사용 가능합니다. 카와사키 입문자에게 에디터가 가장 먼저 추천하는 모델입니다.',
  '카와사키 첫 라켓으로 조금 더 좋은 것을 원하는 왕초보~D조',
  '{"P25 대비 향상된 내구성","에디터 추천","롱런 가능"}',
  '{"P21~P25보다 비쌈","특화 성능 없음"}',
  '카와사키를 처음 선택한다면 P36을 추천합니다. 롱런 가능한 입문 모델입니다.',
  '"카와사키 입문으로 P36 선택 잘했어요", "오래 쓸 수 있을 것 같아요", "에디터 추천 믿었어요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'kawasaki-passion-p38',
  '카와사키 KAWASAKI ― 패션 P38(PASSION P38) 라켓',
  'KAWASAKI',
  '6~8만원',
  '4U',
  'head-heavy',
  'medium',
  '{"초심자","D조"}',
  '{"공격형"}',
  68, 60, 72, 72, 70, 65,
  false, false,
  '패션 시리즈 중 유일한 헤드헤비 공격형 모델입니다. 미디엄 탄성에 헤드헤비 밸런스로 강한 스매시와 파워풀한 클리어를 연습하기에 적합합니다. 공격형 플레이 스타일을 가성비 있게 경험하고 싶은 초심자~D조에게 추천합니다.',
  '공격형 플레이를 저렴하게 체험하고 싶은 초심자~D조',
  '{"헤드헤비 공격형","가성비 공격 라켓","스매시 파워감"}',
  '{"수비 느림","왕초보에게 어려울 수 있음"}',
  '카와사키에서 공격형을 원한다면 P38입니다.',
  '"스매시가 잘 나와요", "공격형치고 가격이 착해요", "D조 공격에 딱이에요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'kawasaki-ice-cream',
  '카와사키 KAWASAKI ― 아이스크림(ICE CREAM) 라켓',
  'KAWASAKI',
  '5~7만원',
  '5U',
  'even',
  'flexible',
  '{"왕초보","초심자"}',
  '{"수비형","올라운드"}',
  40, 78, 82, 65, 60, 85,
  true, true,
  '여성 배린이와 청소년을 위해 설계된 초경량 5U 라켓입니다. 파스텔 계열의 감각적인 컬러와 아이스크림이라는 이름처럼 달콤한 사용감이 특징입니다. 손목 부담이 거의 없고 컨트롤이 뛰어나 생애 첫 라켓으로 손색없습니다.',
  '여성 왕초보~초심자, 귀여운 디자인을 원하는 분, 청소년 배드민턴 입문자',
  '{"초경량 5U","예쁜 컬러 디자인","뛰어난 컨트롤"}',
  '{"파워 부족","성인 남성엔 부적합"}',
  '여성 배린이에게 가장 먼저 보여주고 싶은 라켓입니다. 디자인도 성능도 합격!',
  '"너무 예쁘고 가벼워요", "여성에게 강추", "아이스크림처럼 달콤한 사용감이에요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'kawasaki-super-light-l6',
  '카와사키 KAWASAKI ― 슈퍼라이트 L6(SUPER LIGHT L6) 라켓',
  'KAWASAKI',
  '9~13만원',
  '6U',
  'head-heavy',
  'medium',
  '{"D조","C조"}',
  '{"공격형"}',
  72, 62, 85, 68, 72, 88,
  true, true,
  '초경량 6U 바디에 헤드헤비 밸런스를 결합한 독특한 구성의 라켓입니다. 라켓 자체는 매우 가볍지만 헤드에 무게가 집중되어 빠른 스윙과 강한 타구를 동시에 구현합니다. 복식 경기에서 빠른 네트 플레이와 파워 스매시를 모두 원하는 D조~C조에게 추천합니다.',
  '빠른 스윙과 파워를 동시에 원하는 D조~C조, 복식 중심 플레이어',
  '{"초경량 6U","헤드헤비 파워","빠른 스윙+강한 타구"}',
  '{"왕초보엔 다루기 어려움","가격 있음"}',
  '6U 초경량이지만 파워까지 원한다면 슈퍼라이트 L6가 정답입니다.',
  '"이렇게 가벼운데 스매시가 이렇게 강해요?", "복식에서 날아다니는 느낌", "D조 이상 추천해요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'kawasaki-honor-i-speed',
  '카와사키 KAWASAKI ― 아너 I 스피드(HONOR I SPEED) 라켓',
  'KAWASAKI',
  '6~9만원',
  '4U',
  'head-light',
  'flexible',
  '{"왕초보","초심자"}',
  '{"수비형","올라운드"}',
  42, 75, 85, 68, 60, 82,
  false, true,
  '스피드에 특화된 카와사키 아너 시리즈의 입문 모델입니다. 헤드라이트 밸런스와 유연한 샤프트가 조합되어 라켓 조작 속도가 매우 빠릅니다. 빠른 드라이브와 리시브를 중심으로 배우고 싶은 왕초보~초심자에게 추천합니다.',
  '빠른 스피드형 플레이를 배우고 싶은 왕초보~초심자',
  '{"빠른 스윙 스피드","헤드라이트 경량","스피드형 입문에 최적"}',
  '{"파워 부족","스매시엔 약함"}',
  '스피드형 배드민턴을 처음 접하는 배린이에게 추천하는 카와사키 입문 모델입니다.',
  '"스윙이 엄청 빨라요", "드라이브가 잘 나와요", "가벼워서 피로감이 없어요"'
);

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'kawasaki-honor-d55',
  '카와사키 KAWASAKI ― 아너 D55(HONOR D55) 라켓',
  'KAWASAKI',
  '10~14만원',
  '4U',
  'even',
  'medium',
  '{"초심자","D조","C조"}',
  '{"올라운드"}',
  65, 72, 70, 75, 68, 68,
  true, true,
  '카와사키 아너 시리즈의 대표 올라운드 모델로 동호인들 사이에서 검증된 인기 라켓입니다. 이븐밸런스와 미디엄 탄성으로 스매시, 드라이브, 드롭 모든 기술을 고르게 소화합니다. 초심자부터 C조까지 오래 사용할 수 있어 에디터 추천 장기 사용 모델입니다.',
  '오래 쓸 올라운드 라켓을 원하는 초심자~C조, 카와사키 메인 모델 찾는 분',
  '{"C조까지 롱런 가능","검증된 인기 모델","모든 기술 소화"}',
  '{"10만원대 가격","특화 강점 없음"}',
  '카와사키에서 오래 쓸 라켓을 고른다면 아너 D55입니다. 에디터 강력 추천!',
  '"진짜 오래 쓸 것 같아요", "모든 샷이 잘 나와요", "D조 넘어서도 쓸 수 있어요"'
);
