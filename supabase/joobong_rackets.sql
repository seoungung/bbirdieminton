-- JOOBONG 라켓 데이터 INSERT
-- 실행 전 중복 확인: SELECT slug FROM rackets WHERE slug LIKE 'joobong-%';

INSERT INTO rackets (slug, name, brand, price_range, weight, balance, flex, level, type, stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver, description, editor_pick, is_popular) VALUES

('joobong-active-4000',
 '주봉 액티브 4000(JOOBONG ACTIVE 4000) 라켓',
 'JOOBONG', '~5만원', '4U', 'even', 'medium',
 ARRAY['왕초보','초심자'], ARRAY['올라운드'],
 38, 65, 68, 62, 55, 72,
 '주봉 라인업 중 가장 접근하기 쉬운 가격대의 레저용 입문 라켓이다. 그라파이트 카본 재질에 이븐밸런스 설계로 공수 구분 없이 편안하게 즐길 수 있다. 동호회 등록 전 체험용이나 가족 여가 활동용으로 추천된다.',
 false, false),

('joobong-tjb-1300',
 '주봉 TJB 1300(JOOBONG TJB 1300) 라켓',
 'JOOBONG', '5~10만원', '3U', 'head-light', 'flexible',
 ARRAY['왕초보','초심자'], ARRAY['올라운드'],
 40, 72, 70, 68, 60, 78,
 '주봉의 오리지널 스테디셀러로 2009년 출시 이후 15년 이상 꾸준히 판매되는 국민 입문 라켓이다. 헤드라이트 밸런스와 부드러운 샤프트로 손목 부담이 적어 처음 배드민턴을 시작하는 분께 안성맞춤이다. 그라파이트 카본 소재로 내구성과 가성비를 모두 갖춘 모델이다.',
 false, true),

('joobong-tjb-1900',
 '주봉 TJB 1900(JOOBONG TJB 1900) 라켓',
 'JOOBONG', '5~10만원', '4U', 'even', 'flexible',
 ARRAY['왕초보','초심자'], ARRAY['올라운드'],
 45, 75, 72, 70, 65, 80,
 '주봉 최고의 베스트셀러로 입문자 배드민턴 라켓 시장에서 독보적인 인지도를 자랑한다. 티타늄메쉬 프레임과 나노그라파이트 샤프트로 반발력과 스피드가 균형 잡혀 있으며, 675mm 롱바디 설계로 스윙 파워를 보완한다. 2012년 출시 이후 수천 건의 긍정 리뷰를 보유한 입문자 1순위 라켓이다.',
 true, true),

('joobong-tjb-tp3000',
 '주봉 TP 3000(JOOBONG TJB TP 3000) 라켓',
 'JOOBONG', '10~15만원', '4U', 'even', 'medium',
 ARRAY['초심자','D조'], ARRAY['올라운드'],
 65, 72, 70, 74, 70, 68,
 '테이퍼샤프트 기술을 이븐밸런스 설계에 접목한 올라운드형 중급 라켓이다. 공격성을 다소 완화하고 컨트롤과 수비력을 높여 복식과 단식 모두 편안하게 활용할 수 있다. 동호회에서 막 실력을 쌓기 시작한 초심자~D조 플레이어에게 권장되는 균형 잡힌 선택지다.',
 false, false),

('joobong-tjb-9000',
 '주봉 TJB 9000(JOOBONG TJB 9000) 라켓',
 'JOOBONG', '5~10만원', '3U', 'head-heavy', 'stiff',
 ARRAY['D조','C조'], ARRAY['공격형'],
 82, 58, 65, 72, 78, 55,
 '동호인 D조·C조 스매셔를 위한 공격 특화 라켓으로, 헤드헤비 밸런스와 스티프 샤프트가 강력한 스매시 파워를 만들어낸다. 3U 중량으로 무게감이 있어 스윙 시 헤드의 관성을 살릴 수 있다. 가성비 좋은 국내 공격형 라켓을 찾는 동호인에게 인기 있는 모델이다.',
 false, true),

('joobong-tp-505',
 '주봉 TP 505(JOOBONG TJB TP 505) 라켓',
 'JOOBONG', '10~15만원', '4U', 'head-heavy', 'stiff',
 ARRAY['D조','C조'], ARRAY['공격형'],
 80, 65, 68, 75, 80, 60,
 '주봉의 독자 테이퍼샤프트 기술이 적용된 중급자용 공격형 라켓으로, 해외 재구매율이 가장 높은 모델 중 하나다. 테이퍼샤프트는 샤프트 굵기가 위아래로 달라 스윙 시 예리한 각도와 파워를 동시에 구현한다. 헤드헤비 설계로 강한 스매시를 원하는 D조·C조 동호인에게 적합하다.',
 true, true);
