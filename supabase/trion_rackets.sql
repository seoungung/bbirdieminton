-- TRION 라켓 데이터 INSERT
-- 실행 전 중복 확인: SELECT slug FROM rackets WHERE slug LIKE 'trion-%';

INSERT INTO rackets (slug, name, brand, price_range, weight, balance, flex, level, type, stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver, description, editor_pick, is_popular) VALUES

('trion-code10',
 '트라이온 코드10(TRION CODE10) 라켓',
 'TRION', '10~15만원', '5U', 'even', 'flexible',
 ARRAY['왕초보','초심자'], ARRAY['올라운드'],
 45, 72, 78, 70, 60, 80,
 '트라이온의 대표 입문용 라켓으로, 가벼운 풀카본 소재와 이븐밸런스 설계로 처음 배드민턴을 시작하는 분들도 부담 없이 다룰 수 있다. 넓은 스윗스팟과 부드러운 샤프트 탄성 덕분에 클리어 비거리 확보와 컨트롤을 동시에 잡을 수 있는 올라운드 모델이다. 헤드커버와 오버그립이 기본 포함되어 있으며 트라이온의 50% 파손 보상정책이 적용된다.',
 true, true),

('trion-new9000-light',
 '트라이온 뉴 9000 라이트(TRION NEW 9000 LIGHT) 라켓',
 'TRION', '10~15만원', '5U', 'even', 'flexible',
 ARRAY['왕초보','초심자'], ARRAY['올라운드'],
 42, 68, 82, 68, 58, 85,
 '5U 초경량 설계로 손목과 팔에 부담이 적어 배드민턴을 막 시작한 왕초보에게 가장 적합한 모델이다. 이븐밸런스 타입으로 라켓 컨트롤이 쉽고 랠리 유지와 빠른 리턴에 강점을 보인다. 트라이온의 50% 파손 보상정책이 적용되어 초보자도 파손 걱정 없이 사용할 수 있다.',
 false, true),

('trion-x3',
 '트라이온 X-3(TRION X-3) 라켓',
 'TRION', '10~15만원', '4U', 'even', 'medium',
 ARRAY['초심자','D조'], ARRAY['올라운드'],
 62, 68, 68, 78, 68, 70,
 '트라이온의 스테디셀러로, M.Graphite 소재를 고온 재처리하는 독자 공법으로 기존 카본 대비 강도와 타구감을 향상시킨 모델이다. 4U 이븐밸런스로 파워와 스피드의 균형이 좋아 초심자에서 D조로 넘어가는 시기에 오래 쓸 수 있는 가성비 라켓이다. 동호회 입문 단계에서 베스트셀러로 꾸준히 재입고될 만큼 인기가 높다.',
 true, true),

('trion-dark-knight',
 '트라이온 다크나이트(TRION DARK KNIGHT) 라켓',
 'TRION', '15만원+', '4U', 'even', 'medium',
 ARRAY['D조','C조'], ARRAY['올라운드','공격형'],
 72, 65, 70, 80, 72, 68,
 '트윈 프레임과 와이드바디를 채택하여 스윗스팟이 넓고 중심을 벗어난 타구에서도 파워 손실이 적은 것이 특징이다. UHM Graphite와 Nano Fire Melt 소재를 적용해 내구성과 탄성을 모두 잡았으며, 경쾌하고 파워풀한 타구음으로 동호인들 사이에서 손맛 좋은 라켓으로 평가받는다. D조~C조 수준에서 파손 보상까지 활용해 메인 라켓으로 사용하기 적합하다.',
 false, true),

('trion-x1-red-swan',
 '트라이온 X-1 레드스완(TRION X-1 RED SWAN) 라켓',
 'TRION', '15만원+', '4U', 'head-light', 'medium',
 ARRAY['D조','C조'], ARRAY['올라운드','수비형'],
 60, 75, 78, 72, 68, 80,
 'X-1 시리즈 중 헤드라이트 밸런스를 채택한 스피드·컨트롤 특화 모델로, 빠른 네트플레이와 수비 전환이 많은 플레이어에게 추천된다. 4U의 가벼운 무게와 유연성 덕분에 손목 스냅을 활용한 드라이브와 푸시가 강점이다. 트라이온의 독자 카본 기술이 적용된 중급자용 모델로 레드 컬러 디자인이 눈에 띈다.',
 false, false),

('trion-x1-extreme-power',
 '트라이온 X-1 익스트림 파워(TRION X-1 EXTREME POWER) 라켓',
 'TRION', '15만원+', '3U', 'head-heavy', 'stiff',
 ARRAY['D조','C조'], ARRAY['공격형'],
 85, 55, 58, 82, 80, 55,
 'X-1 시리즈의 파워 특화 모델로, 3U 헤드헤비 설계와 스티프 샤프트로 강력한 스매시를 원하는 D조~C조 공격형 플레이어를 위해 설계되었다. Woven Graphite와 Memory Carbon 소재를 사용해 임팩트 시 반발력이 뛰어나며, 고탄성 프레임이 셔틀을 강하게 밀어내는 힘을 극대화한다. 어느 정도 스윙 근력이 형성된 중급자 이상에게 적합하다.',
 true, false);
