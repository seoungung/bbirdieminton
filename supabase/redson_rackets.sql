-- REDSON 라켓 데이터 INSERT
-- 실행 전 중복 확인: SELECT slug FROM rackets WHERE slug LIKE 'redson-%';

INSERT INTO rackets (slug, name, brand, price_range, weight, balance, flex, level, type, stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver, description, editor_pick, is_popular) VALUES

('redson-beta-2000-eco',
 '레드썬 베타 2000 에코(REDSON BETA 2000 ECO) 라켓',
 'REDSON', '5~10만원', '4U', 'head-light', 'flexible',
 ARRAY['왕초보','초심자'], ARRAY['올라운드'],
 40, 65, 75, 70, 55, 80,
 'REDSON 입문 라인의 대표 모델로, 하이플렉스 샤프트와 4U 경량 설계로 초보자도 손쉽게 다룰 수 있다. 그로밋리스 프레임 구조로 타구음이 선명하고 스윗스팟이 넓어 미스샷에 관대하다. 왕초보부터 초심자까지 기초 기술을 익히기에 최적화된 올라운드 입문 라켓이다.',
 false, true),

('redson-at-1000',
 '레드썬 AT 1000(REDSON AT-1000) 라켓',
 'REDSON', '5~10만원', '4U', 'even', 'flexible',
 ARRAY['왕초보','초심자'], ARRAY['올라운드'],
 42, 68, 72, 68, 52, 78,
 'AT 시리즈의 입문 모델로, 경량 4U 설계와 유연한 샤프트로 손목 부담을 최소화한다. 헥사고널 에어로다이나믹 프레임으로 스윙 저항이 적어 빠른 라켓 핸들링이 가능하다. 처음 배드민턴을 시작하는 배린이에게 적합한 가성비 입문 라켓이다.',
 false, true),

('redson-rg-20-eq',
 '레드썬 RG 20 EQ(REDSON RG-20 EQ) 라켓',
 'REDSON', '10~15만원', '5U', 'even', 'medium',
 ARRAY['초심자','D조'], ARRAY['올라운드'],
 58, 72, 70, 75, 65, 73,
 'RG 시리즈의 경량 올라운드 모델로, 5U의 가벼운 무게와 이븐밸런스 설계로 전·후위 모두에서 안정적인 플레이가 가능하다. 고강성 프레임 구조가 타구 시 변형을 최소화해 정확한 컨트롤을 지원한다. 동호회 초심자부터 D조 진입 단계의 플레이어에게 추천하는 균형 잡힌 라켓이다.',
 true, true),

('redson-at-06gm',
 '레드썬 에어로블라스트 AT 06GM(REDSON AEROBLAST AT-06GM) 라켓',
 'REDSON', '15만원+', '4U', 'even', 'medium',
 ARRAY['초심자','D조'], ARRAY['올라운드'],
 62, 70, 74, 76, 68, 75,
 'AT 시리즈의 미디엄 플렉스 올라운드 모델로, 에어로 헥사고널 프레임이 스윙 속도를 높이면서도 안정적인 컨트롤을 제공한다. 직조 탄소섬유 기술로 프레임과 샤프트 강도를 향상시켜 파워와 내구성을 동시에 갖췄다. 초심자에서 D조로 성장하는 단계에서 드라이브와 스매시 균형을 잡아주는 모델이다.',
 false, false),

('redson-at-06g-stiff',
 '레드썬 에어로블라스트 AT 06G 스티프(REDSON AEROBLAST AT-06G STIFF) 라켓',
 'REDSON', '15만원+', '4U', 'head-heavy', 'stiff',
 ARRAY['D조','C조'], ARRAY['공격형'],
 78, 62, 65, 80, 78, 60,
 'AT 시리즈의 공격 특화 스티프 모델로, 두꺼운 프레임 구조가 스윙 임팩트를 극대화하고 스매시 파워를 높인다. 헤드헤비 밸런스로 클리어와 스매시에서 강한 타구감을 제공하며, 고강성 샤프트가 반발력을 극대화한다. 기본기를 갖춘 D조~C조 공격형 플레이어에게 적합하다.',
 true, false),

('redson-shape-01-mg',
 '레드썬 쉐이프 01 MG(REDSON SHAPE 01 MG) 라켓',
 'REDSON', '15만원+', '4U', 'even', 'medium',
 ARRAY['D조','C조'], ARRAY['올라운드'],
 68, 78, 72, 65, 72, 74,
 'REDSON 독자 특허인 딤플 프레임 기술이 적용된 이븐밸런스 올라운드 라켓으로, 전위 위닝샷과 드라이브에서 날카로운 스피드를 발휘한다. 이븐밸런스 289mm로 전후위 모두 자유롭게 커버할 수 있어 복식 동호인에게 특히 인기가 높다. 중급 이상 플레이어에게 최고의 가성비를 제공하는 REDSON의 대표 모델이다.',
 true, true);
