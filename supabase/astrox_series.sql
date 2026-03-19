-- ASTROX 시리즈 데이터 전체 교체
-- 기존 비-ASTROX 라켓 삭제 후 ASTROX 시리즈로 교체

-- 1. 기존 데이터 전체 삭제
DELETE FROM rackets;

-- 2. ASTROX 시리즈 전체 삽입

INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'yonex-astrox-100zz',
  '요넥스 YONEX ― 아스트록 100ZZ VA(ASTROX 100ZZ VA) 라켓',
  'YONEX',
  '30~35만원',
  '3U / 4U',
  'head-heavy',
  'stiff',
  '{"C조"}',
  '{"공격형"}',
  95, 75, 60,
  85, 92, 60,
  true, true,
  '아스트록 시리즈의 정점, 100ZZ VA입니다. VA는 세계 랭킹 1위 빅터 악셀센(Viktor Axelsen)의 이니셜로, 그가 직접 사용하는 라켓을 일반 동호인도 경험할 수 있도록 출시한 모델이에요.

2G-Namd Flex Force 기술이 적용된 초고탄성 탄소섬유 프레임과 Hyper Slim Shaft가 결합되어, 스윙 순간 샤프트가 휘었다 복원되는 에너지를 셔틀에 온전히 전달해 줍니다. 파워와 반발력은 아스트록 시리즈 중 최고 수준이에요.

일본 요넥스 공장(Made in Japan)에서 생산되며, 장력은 최대 29lbs까지 권장합니다. 단식과 복식 모두 후위 공격형으로 활용 가능한 플래그십 모델입니다.',
  '동호회 C조 이상, 강력한 스매싱을 추구하는 공격형 플레이어에게 적합합니다. 샤프트가 Extra Stiff로 매우 뻣뻣하기 때문에, 스윙 스피드가 충분한 실력자가 써야 라켓의 성능을 끌어낼 수 있어요. 단식에서 풀 스매싱 위주 플레이를 즐기신다면 최고의 선택입니다.',
  '{"아스트록 시리즈 최강의 파워와 반발력","빅터 악셀센 친필 사인 에디션 감성","Made in Japan 장인 정신의 품질","프레임 내구성 뛰어남","단·복식 모두 활용 가능"}',
  '{"35만원대 고가 모델","Extra Stiff라 입문자에게 부적합","무거운 헤드헤비로 팔 피로감 있음"}',
  '배드민턴 라켓 한 자루로 최고의 경험을 원한다면, 100ZZ VA를 권해요. 스매싱 한 방 한 방이 달라지는 걸 느낄 수 있어요.',
  '"스매싱 임팩트가 진짜 다름", "악셀센이 왜 이 라켓 쓰는지 알겠다", "그립감과 밸런스가 완벽해요". C조 이상 동호인들 사이에서 꿈의 라켓으로 불립니다.'
);
INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'yonex-astrox-99-pro',
  '요넥스 YONEX ― 아스트록 99 PRO(ASTROX 99 PRO) 라켓',
  'YONEX',
  '30~34만원',
  '3U / 4U',
  'head-heavy',
  'stiff',
  '{"D조","C조"}',
  '{"공격형"}',
  95, 65, 65,
  85, 88, 58,
  true, true,
  '아스트록 99 PRO는 단식 게임을 위해 설계된 파워 특화 라켓입니다. "Power & Repulsion(파워와 반발력)"을 핵심 콘셉트로, 후위에서 전력 스매싱을 구사하는 싱글 플레이어에게 최적화되어 있어요.

2G-Namd Flex Force 프레임과 Extra Slim Shaft의 조합이 임팩트 순간 최대의 에너지를 만들어냅니다. 무겁고 헤드헤비한 밸런스 덕분에 스윙 관성이 커서, 한 방 한 방에 묵직한 파워가 실려요.

다만 샤프트가 Stiff에 가까워 스윙 스피드가 뒷받침되어야 제대로 된 성능을 낼 수 있습니다. Made in Japan 품질과 세밀한 마감이 특징이에요.',
  'D조~C조 단식 특화 플레이어, 스매싱을 게임의 중심으로 삼는 분들께 추천드려요. 후위 베이스라인에서 강하게 밀어 붙이는 스타일이라면 이 라켓이 최고의 파트너가 될 거예요.',
  '{"단식 최강의 파워 라켓","반발력과 스매싱 임팩트 최상","Made in Japan 품질","묵직한 헤드헤비로 관성 극대화","3U 옵션으로 더 강한 파워 가능"}',
  '{"복식보다 단식에 특화","샤프트 뻣뻣해 입문자 비추","무거운 헤드로 장시간 플레이 피로"}',
  '배드민턴의 꽃은 스매싱이라 생각한다면 99 PRO를 들어보세요. 한 방에 상대를 정리하는 쾌감을 제대로 느낄 수 있어요.',
  '"단식에서 이 라켓 쓰면 스매싱 진짜 꽂힌다", "99 PRO로 바꾼 뒤 게임이 달라졌어요", "무겁긴 한데 스매싱 파워는 압도적". 단식 선호 동호인의 베스트셀러.'
);
INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'yonex-astrox-88d-pro',
  '요넥스 YONEX ― 아스트록 88D PRO(ASTROX 88D PRO) 라켓',
  'YONEX',
  '27~30만원',
  '4U',
  'head-heavy',
  'stiff',
  '{"D조","C조"}',
  '{"공격형"}',
  90, 72, 70,
  83, 88, 65,
  true, true,
  '국내 배드민턴 동호인 판매 1위 라켓, 아스트록 88D PRO입니다. "D"는 Doubles(복식)의 약자로, 후위에서 강한 스매싱으로 상대 코트를 압박하는 복식 후위 플레이어를 위해 설계됐어요.

2G-Namd Flex Force 기술과 Ultra Slim Shaft의 조합이 스윙 속도와 파워를 동시에 끌어올려 줍니다. 5mm 롱 샤프트 설계로 스매싱 임팩트 순간 더 많은 에너지 전달이 가능해요.

3세대 모델(2024년)로 업그레이드되면서 컨트롤성도 이전 세대 대비 향상됐습니다. Made in Japan 품질로 내구성과 마감 모두 최상급입니다.',
  '복식 게임에서 후위를 맡는 D조~C조 플레이어에게 최적입니다. 특히 스매싱으로 게임을 주도하고 싶은 분, 복식 후위의 교과서 같은 라켓을 원하신다면 강력히 추천드려요.',
  '{"국내 판매 1위 검증된 성능","복식 후위 스매싱에 최적화","Made in Japan 최고 품질","3세대 업그레이드로 컨트롤 향상","임팩트 시 반발력 극대화"}',
  '{"27만원대 고가","전위보다 후위 전용 특성 강함","초보자에게 다루기 어려움"}',
  '복식 후위에서 한 방으로 점수를 딸 수 있는 라켓. 88D PRO 하나로 상대 코트를 폭격해 보세요.',
  '"복식 후위는 88D PRO가 정답", "스매싱 각도랑 파워가 달라짐", "비싸지만 그 값을 한다". 동호인 D조~C조의 필수 아이템.'
);
INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'yonex-astrox-88s-pro',
  '요넥스 YONEX ― 아스트록 88S PRO(ASTROX 88S PRO) 라켓',
  'YONEX',
  '27~30만원',
  '4U',
  'head-heavy',
  'stiff',
  '{"D조","C조"}',
  '{"공격형"}',
  72, 90, 78,
  83, 80, 80,
  false, true,
  '아스트록 88S PRO는 복식 전위 플레이어를 위한 정밀 컨트롤 라켓입니다. "S"는 Speed(스피드)의 약자로, 전위에서 빠른 반응과 정확한 셔틀 터치를 요구하는 포지션에 최적화되어 있어요.

Ultra Slim Shaft와 CFR(Counter Force Resin)+Ultra PE Fiber 소재가 네트 부근 터치 감각과 컨트롤을 극대화합니다. 88D PRO와 같은 프레임이지만 샤프트 특성이 달라 전위의 빠른 반사 동작에 더 잘 반응해요.

복식에서 전위와 후위가 각각 88S PRO와 88D PRO를 들면 최고의 파트너 조합이 완성됩니다.',
  '복식 전위를 맡는 D조~C조 플레이어에게 이상적입니다. 네트 앞에서 빠른 터치와 정확한 드롭·헤어핀·푸시를 구사하는 분, 컨트롤로 게임을 풀어가는 스타일이라면 88S PRO를 선택하세요.',
  '{"복식 전위 컨트롤 최적화","빠른 반응 속도","Made in Japan 최고 품질","88D PRO와 완벽한 파트너 조합","정밀한 네트 플레이 가능"}',
  '{"컨트롤 특화로 후위 파워는 88D에 밀림","고가 모델","전위 포지션 확정된 분에게 추천"}',
  '전위에서 상대의 허를 찌르는 정확한 터치샷을 원한다면 88S PRO가 답이에요. 88D PRO와 짝을 이루면 최강의 복식 조합입니다.',
  '"전위에서 헤어핀 터치가 살아났다", "88D랑 둘이 맞추니 상대가 힘들어해요", "컨트롤은 이게 최고". 복식 전위 동호인의 인기 모델.'
);
INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'yonex-astrox-77-pro',
  '요넥스 YONEX ― 아스트록 77 PRO(ASTROX 77 PRO) 라켓',
  'YONEX',
  '25~29만원',
  '4U',
  'head-heavy',
  'medium',
  '{"D조","C조"}',
  '{"올라운드"}',
  80, 82, 75,
  83, 82, 78,
  false, false,
  '아스트록 77 PRO는 파워와 컨트롤 두 마리 토끼를 모두 잡은 올라운드 라켓입니다. 88D PRO의 파워, 88S PRO의 컨트롤 사이 어딘가에 위치해 있는 균형 잡힌 모델이에요.

Super Slim Shaft + Namd + Flex Fuse + Tungsten + Ultra PE Fiber의 복합 소재 구성이 특징입니다. 샤프트가 Medium Flex라 88D/88S PRO보다 조금 더 부드럽게 휘어 에너지를 저장했다가 복원하는 특성이 있어요. 이 덕분에 스윙 스피드가 상대적으로 느려도 어느 정도 파워를 낼 수 있습니다.

복식 혼합복식에서 다양한 상황에 대응해야 하는 올라운드 플레이어에게 특히 잘 맞는 라켓이에요.',
  '포지션이 고정되지 않고 전·후위를 오가는 D조~C조 올라운더에게 추천합니다. 혼합복식이나 남자복식에서 다양한 공격 패턴을 구사하고 싶은 분께 이상적이에요.',
  '{"파워·컨트롤 균형 잡힌 올라운드","Medium Flex로 다루기 비교적 쉬움","Made in Japan 품질","혼복·복식 전반에 활용 가능","전·후위 포지션 모두 커버"}',
  '{"파워는 88D, 컨트롤은 88S에 각각 밀림","올라운드 특성상 특화 포지션 없음","고가 모델"}',
  '"나는 전위도 후위도 다 하는 올라운더야"라는 분께 77 PRO를 추천해요. 어떤 상황에서도 믿음직스럽게 반응해 줍니다.',
  '"혼복에서 전·후위 다 활용하기 좋음", "파워도 있고 컨트롤도 나쁘지 않아요", "올라운드 라켓 중 최고의 퀄리티". 올라운더의 베스트 픽.'
);
INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'yonex-astrox-100-game',
  '요넥스 YONEX ― 아스트록 100 GAME VA(ASTROX 100 GAME VA) 라켓',
  'YONEX',
  '15~19만원',
  '4U',
  'head-heavy',
  'medium',
  '{"초심자","D조"}',
  '{"공격형"}',
  82, 62, 70,
  78, 80, 65,
  false, true,
  '아스트록 100ZZ VA의 보급형 모델, 아스트록 100 GAME VA입니다. 100ZZ VA의 헤드 디자인을 계승하면서도 Medium Flex 샤프트로 접근성을 높였어요. VA 라인의 공격적인 감성을 비교적 합리적인 가격에 경험할 수 있는 모델입니다.

HM Graphite + NanomeshNeo + Volume Cut Resin + Tungsten 프레임 구성으로 GAME 등급 중에서도 파워와 반발력이 우수한 편이에요. 100ZZ VA에 비해 샤프트가 부드러워 초중급 동호인도 무리 없이 다룰 수 있습니다.

공격적인 스타일을 지향하는 초심자~D조 플레이어가 100ZZ VA를 경험하기 전 단계로 최적입니다.',
  '초심자~D조 입문 동호인 중 공격적인 플레이를 즐기는 분께 적합합니다. 아직 PRO 라켓을 다루기에 이른 단계에서 ASTROX 시리즈의 헤드헤비 특성을 익히기에 좋아요.',
  '{"100ZZ VA 감성을 합리적인 가격에","Medium Flex로 초중급도 다루기 쉬움","공격형 특성 유지","4U 무게로 빠른 스윙 가능","VA 라인 디자인 감성"}',
  '{"PRO 대비 반발력·마감 차이","Taiwan 생산","고급 동호인에겐 성에 안 차"}',
  '"아직 30만원짜리 라켓은 부담스럽지만 공격형 라켓은 원해"라는 분께 딱 맞는 선택이에요.',
  '"가성비 좋은 공격형", "100ZZ VA 쓰다가 이걸로 내려왔는데 생각보다 좋음", "입문 동호인한테 추천할 만해요". 가성비 공격형의 인기 모델.'
);
INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'yonex-astrox-99-game',
  '요넥스 YONEX ― 아스트록 99 GAME(ASTROX 99 GAME) 라켓',
  'YONEX',
  '13~17만원',
  '4U',
  'head-heavy',
  'medium',
  '{"초심자","D조"}',
  '{"공격형"}',
  82, 60, 68,
  78, 78, 62,
  false, true,
  '아스트록 99 GAME은 아스트록 99 PRO의 파워 콘셉트를 가성비 있게 즐길 수 있는 모델입니다. 단식에서 강한 스매싱을 원하지만 PRO 모델의 가격이 부담스러운 분들을 위한 최적의 선택이에요.

HM Graphite + NanomeshNeo + Tungsten 프레임과 Medium Flex 샤프트가 결합되어, 99 PRO만큼 극단적이진 않지만 충분한 파워와 반발력을 제공합니다. 2025년 신형으로 업그레이드되면서 그래픽과 프레임 성능 모두 향상됐어요.

D조 초·중반 단계에서 파워 기반 게임을 구축하려는 분께 적극 추천합니다.',
  '초심자~D조 단식 또는 복식 후위 지향 플레이어에게 맞습니다. 스매싱 파워를 키우고 싶은 초중급 동호인의 첫 번째 공격형 라켓으로 손색없어요.',
  '{"99 PRO의 파워 콘셉트 계승","중급자 접근 가능한 Medium Flex","13~17만원 합리적 가격","단식 스매싱 위주 플레이에 적합","2025 신형 업그레이드"}',
  '{"PRO 대비 반발력 차이","컨트롤성은 평범한 수준","Taiwan 생산"}',
  '"단식 스매싱 라켓 원하는데 예산이 15만원 이하"라면 99 GAME이 가장 현명한 선택이에요.',
  '"스매싱 파워가 기대 이상", "입문 동호인한테 딱 좋은 공격형", "PRO 사기 전에 이걸로 먼저 맞춰봤는데 만족". 가성비 단식 라켓의 대표.'
);
INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'yonex-astrox-88d-game',
  '요넥스 YONEX ― 아스트록 88D GAME(ASTROX 88D GAME) 라켓',
  'YONEX',
  '9~12만원',
  '4U',
  'head-heavy',
  'medium',
  '{"초심자","D조"}',
  '{"공격형"}',
  80, 65, 70,
  78, 78, 68,
  false, false,
  '국내 1위 복식 후위 라켓 88D PRO의 보급형 모델입니다. 88D PRO의 복식 후위 공격 콘셉트를 Medium Flex 샤프트와 합리적인 가격으로 경험할 수 있어요.

HM Graphite + NanomeshNeo + Volume Cut Resin + Tungsten 프레임으로 GAME 등급 중에서도 안정적인 파워를 냅니다. 88D PRO와 동일한 헤드 형태를 가지고 있어 스매싱 임팩트 존이 넓고, 미스 샷 시에도 어느 정도 파워를 유지해 줘요.

10만원 내외 예산에서 복식 후위 공격형을 찾는 초중급자에게 강력히 추천합니다.',
  '복식 후위를 시작하는 초심자~D조 초반 플레이어에게 좋습니다. 예산이 넉넉하지 않지만 88D 시리즈의 후위 공격 특성을 경험해보고 싶은 분께 완벽한 입문 옵션이에요.',
  '{"88D PRO 복식 후위 콘셉트 계승","10만원 이하 가성비","Medium Flex로 쉬운 핸들링","넓은 스위트스팟","입문 후위 라켓으로 최적"}',
  '{"PRO 대비 반발력·마감 큰 차이","고급 동호인에겐 부족한 성능","Taiwan 생산"}',
  '복식 후위의 재미를 처음 느끼고 싶다면 88D GAME부터 시작해보세요. 나중에 PRO로 업그레이드할 때 확실히 차이를 체감할 수 있어요.',
  '"입문 복식에 좋은 라켓", "10만원 이하인데 후위 스매싱 충분히 됨", "PRO 가기 전 징검다리로 좋아요". 가성비 복식 후위의 기준점.'
);
INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'yonex-astrox-88s-game',
  '요넥스 YONEX ― 아스트록 88S GAME(ASTROX 88S GAME) 라켓',
  'YONEX',
  '9~12만원',
  '4U',
  'head-heavy',
  'medium',
  '{"초심자","D조"}',
  '{"공격형"}',
  65, 80, 75,
  78, 72, 78,
  false, false,
  '복식 전위 컨트롤 라켓 88S PRO의 보급형 모델입니다. 전위에서 빠른 반응과 정확한 터치를 추구하지만 예산이 제한적인 분들을 위한 입문형 옵션이에요.

88S PRO의 전위 특화 샤프트 특성을 Medium Flex로 재현해, 빠른 반사 동작과 네트 플레이에 도움을 줍니다. HM Graphite + NanomeshNeo 소재가 가격 대비 우수한 터치감을 제공해요.

88D GAME과 짝을 이뤄 복식 파트너십을 구성하면 합리적인 가격으로 88 시리즈의 시너지를 경험할 수 있습니다.',
  '복식 전위 포지션을 맡는 초심자~D조 플레이어에게 적합해요. 88D GAME을 쓰는 파트너가 있다면 같은 88 시리즈로 맞추는 것도 좋은 선택이에요.',
  '{"88S PRO 전위 컨트롤 콘셉트 계승","10만원 이하 가성비","빠른 반응에 적합한 특성","88D GAME과 파트너 조합 가능","전위 입문용으로 완벽"}',
  '{"PRO 대비 터치감 차이","컨트롤 정밀도는 PRO에 밀림","Taiwan 생산"}',
  '10만원 이하 복식 전위 라켓을 찾고 있다면 88S GAME이 좋은 시작점이에요. 88D GAME과 세트로 파트너랑 맞춰보는 걸 추천해요.',
  '"입문 복식 전위에 딱 맞는 라켓", "88D GAME이랑 파트너가 맞추니 밸런스 좋음", "가성비 최고". 합리적인 복식 전위 입문 라켓.'
);
INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'yonex-astrox-nextage',
  '요넥스 YONEX ― 아스트록 NEXTAGE(ASTROX NEXTAGE) 라켓',
  'YONEX',
  '17~20만원',
  '4U',
  'head-heavy',
  'medium',
  '{"배린이","초심자"}',
  '{"올라운드"}',
  72, 72, 78,
  80, 72, 80,
  true, true,
  '아스트록 시리즈 최초로 VDM(Vibration Dampening Mesh) 기술이 적용된 2025년 신모델입니다. 진동을 줄이고 손목 피로를 최소화해, 오래 쳐도 편안한 새로운 개념의 라켓이에요.

10mm 롱 샤프트 설계로 레버리지를 높여 스윙 파워를 끌어올리면서도, Medium Flex 샤프트 덕분에 입문자도 무리 없이 다룰 수 있습니다. Graphite + VDM + Tungsten 프레임이 진동을 흡수하면서도 임팩트 에너지는 셔틀에 고스란히 전달해 줘요.

배린이·초심자 시절부터 써도 되고, 실력이 늘어도 계속 사용할 수 있는 오래 쓸 수 있는 라켓입니다.',
  '배드민턴을 시작한 지 6개월에서 1년 사이 배린이~초심자에게 최적의 선택입니다. 손목 피로를 줄여주는 VDM 기술 덕분에 오랜 시간 연습해도 부담이 덜해요. "처음부터 좋은 라켓을 사고 싶다"는 분들의 첫 번째 선택으로 강력히 추천합니다.',
  '{"VDM 기술로 진동·피로감 최소화","2025 최신 모델","배린이~초심자 최적화","롱 샤프트로 파워 효율 향상","오래 써도 손목 편안함"}',
  '{"17~20만원 중급 가격대","이미 실력자엔 다소 부족한 상급 성능","GAME 등급 대비 고가"}',
  '배드민턴 처음 시작하시는 분이 "좋은 라켓 한 자루 사고 싶다"고 물어보면 저는 NEXTAGE를 추천해요. 손목도 편하고 성능도 충분해요.',
  '"처음 라켓으로 이거 산 게 신의 한 수", "VDM 기술인지 뭔지 모르겠지만 손목이 진짜 안 아파요", "배린이한테 강추". 2025년 입문 베스트셀러 예약.'
);
INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'yonex-astrox-22lt',
  '요넥스 YONEX ― 아스트록 22 LT(ASTROX 22LT) 라켓',
  'YONEX',
  '11~14만원',
  '5U',
  'head-heavy',
  'medium',
  '{"배린이","초심자"}',
  '{"공격형"}',
  62, 68, 85,
  75, 68, 88,
  false, false,
  '아스트록 22LT는 5U(78g) 초경량 아스트록 라켓입니다. LT는 Light(가벼움)의 약자로, 헤드헤비 밸런스이면서도 무게가 78g에 불과해 다루기 매우 쉬운 것이 특징이에요.

HM Graphite 프레임에 Medium Flex 샤프트 조합으로, 힘이 약한 여성 플레이어나 배드민턴을 처음 시작하는 분들도 부담 없이 풀스윙할 수 있도록 설계됐습니다. 가벼운 무게 덕에 빠른 스윙 스피드를 낼 수 있고, 코트를 빠르게 커버하는 데도 유리해요.

아스트록 시리즈 특유의 헤드헤비 공격성은 살리면서 무게 부담은 최소화한 입문 여성 플레이어의 인기 라켓입니다.',
  '여성 배드민턴 입문자 또는 손목·팔 힘이 약한 배린이~초심자에게 최적화되어 있어요. 무거운 라켓을 다루기 힘들지만 아스트록 시리즈의 공격성을 경험하고 싶은 분께 추천합니다.',
  '{"5U 초경량 78g으로 다루기 쉬움","헤드헤비 유지로 공격성 보존","여성 입문자 최적","빠른 스윙 스피드 구현","합리적인 가격"}',
  '{"파워는 3U/4U 모델에 비해 약함","고강도 스매싱엔 한계","상급자에겐 너무 가벼움"}',
  '배드민턴 처음 시작하는 여성분들께 22LT를 자주 추천해요. 가볍고 다루기 쉬워서 스윙 연습이 훨씬 편해요.',
  '"가벼운데 스매싱도 의외로 잘 들어가요", "여자 초보한테 이 라켓 추천해줬더니 너무 좋아함", "5U인데 헤드헤비라 신기함". 여성 입문자의 베스트 픽.'
);
INSERT INTO rackets (
  slug, name, brand, price_range, weight, balance, flex, level, type,
  stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver,
  editor_pick, is_popular, description, recommended_for,
  pros, cons, editor_comment, review_summary
) VALUES (
  'yonex-astrox-66',
  '요넥스 YONEX ― 아스트록 66(ASTROX 66) 라켓',
  'YONEX',
  '7~10만원',
  '4U',
  'head-heavy',
  'flexible',
  '{"배린이","초심자"}',
  '{"수비형","올라운드"}',
  60, 70, 82,
  78, 65, 85,
  false, false,
  '아스트록 66은 입문자를 위한 히-플렉스(Hi-Flex) 라켓으로, 샤프트가 유연해 작은 힘으로도 셔틀을 멀리 보낼 수 있어요. 배드민턴 시작 초기에 올바른 스윙 폼을 익히기 좋은 특성을 가지고 있습니다.

Tough G-Fiber(탄소나노튜브 + 글라스파이버) 소재 프레임이 가격 대비 뛰어난 내구성과 탄성을 제공해요. 7~10만원 가격대에 아스트록 시리즈의 헤드헤비 밸런스를 경험할 수 있는 가장 저렴한 모델 중 하나입니다.

장력 19~27lbs로 입문자에게 적절한 장력 범위를 가지고 있어요.',
  '막 배드민턴을 시작한 왕초보~배린이, 특히 예산이 10만원 이하인 분들께 추천합니다. 클럽에서 빌려서 치다가 처음으로 자기 라켓을 사는 분들의 첫 구매 모델로 자주 선택받고 있어요.',
  '{"7~10만원 합리적 입문 가격","Hi-Flex로 작은 힘에도 반응","아스트록 시리즈 가장 저렴한 입문 모델","내구성 좋은 G-Fiber 소재","빠른 스윙 스피드"}',
  '{"파워는 상위 모델에 비해 약함","Hi-Flex라 상급자에겐 불안정","프레임 소재 한계로 타구감 무거움"}',
  '배드민턴 입문 선물로 고민 중이라면 66이 딱 맞아요. 부담 없는 가격에 아스트록 시리즈의 느낌을 경험할 수 있거든요.',
  '"첫 라켓으로 산 건데 너무 좋아요", "입문자한테 선물했더니 기뻐함", "가성비 최고의 입문 라켓". 배린이의 첫 라켓으로 인기.'
);