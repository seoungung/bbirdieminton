import type { LevelData } from '@/types/quiz'

export const QUIZ_LEVELS: Record<string, LevelData> = {
  beginner: {
    id: 'beginner',
    label: '왕초보',
    scoreRange: [17, 27],
    emoji: '🐣',
    tagline: '셔틀콕보다 공기를 더 많이 때리는 단계',
    description: '배드민턴을 시작했다는 것 자체가 대단한 거예요.\n처음엔 누구나 헛스윙하고, 셔틀콕 주우러 다니고, 체육관에서 눈치 봐요.\n근데 이 단계를 버티면 배드민턴이 진짜 재밌어지거든요.\n지금 가장 중요한 건 딱 하나예요. 라켓만 잘 골라도 시작이 달라져요.',
    radar: { power: 20, control: 15, endurance: 40, skill: 10, experience: 10, mental: 35 },
    radarComment: '지금은 모든 게 낮아 보여도 괜찮아요. 이 차트가 올라가는 속도가 가장 빠른 레벨이에요.',
    racketCondition: {
      weight: '5U ~ 6U', weightDesc: '손목/팔꿈치 부담 최소화',
      balance: '헤드라이트', balanceDesc: '셔틀콕 맞추기 쉬워짐',
      flex: 'Flexible', flexDesc: '느린 스윙도 반발력 보완',
      price: '1만~5만원', priceDesc: '이 구간이면 충분해요',
      comment: '비싼 라켓이 실력을 만드는 게 아니에요. 지금 단계에 맞는 라켓이 실력을 만들어요.',
    },
    recommendedRackets: [
      { name: '나노플레어 001 FEEL', brand: 'YONEX', price: '5~8만원', reason: '가장 가벼운 입문라켓, 실패 없음', slug: 'yonex-nanoflare-001-feel' },
      { name: '나노플레어 270 SPEED', brand: 'YONEX', price: '7~10만원', reason: '5U 경량, 손목 부담 최소', slug: 'yonex-nanoflare-270-speed' },
      { name: '나노플레어 700 GAME', brand: 'YONEX', price: '12~15만원', reason: '헤드라이트 입문 가성비 1위', slug: 'yonex-nanoflare-700-game' },
    ],
    racketComment: '이 3종 중 어떤 걸 골라야 할지 모르겠다면? 예산 5만원 이하면 001 FEEL, 그 이상이면 270 SPEED.',
    nextLevel: {
      label: '초심자',
      checklist: ['일주일에 최소 2번 이상 치기', '클리어를 상대 코트 끝까지 보내기', '동호회 or 지인과 게임 10판 이상 경험', '라켓을 내 레벨에 맞게 바꾸기'],
      comment: '초심자까지 보통 3~6개월이에요. 근데 라켓 하나 잘 고르면 그 시간이 절반으로 줄어요.',
    },
    ogColor: '#beff00',
    stibeeTag: 'beginner',
  },

  novice: {
    id: 'novice',
    label: '초심자',
    scoreRange: [28, 38],
    emoji: '🐥',
    tagline: '랠리는 되는데 게임이 아직 무서운 단계',
    description: '기본기를 쌓아가고 있는 단계예요.\n랠리는 되는데 게임에 끼면 왠지 민폐가 될 것 같아서 망설여지죠.\n사실 그 감각이 맞아요. 아직 게임보다 기술 연습이 더 중요한 시기예요.\n라켓 하나만 잘 골라도 실력이 확 달라지는 게 느껴지기 시작해요.',
    radar: { power: 35, control: 40, endurance: 50, skill: 35, experience: 30, mental: 45 },
    radarComment: '컨트롤이 올라오고 있어요. 이 시기에 기본기를 탄탄히 잡으면 D조가 빠르게 보여요.',
    racketCondition: {
      weight: '4U', weightDesc: '손목 부담 줄이면서 컨트롤 확보',
      balance: '이븐밸런스', balanceDesc: '공격/수비 균형 잡기 시작',
      flex: 'Medium', flexDesc: '스윙 속도 붙기 시작하는 단계',
      price: '5만~10만원', priceDesc: '이 구간이 초심자 최적',
      comment: '랠리가 되기 시작했다면 이제 컨트롤이 핵심이에요. 헤드라이트보다 이븐밸런스가 맞아요.',
    },
    recommendedRackets: [
      { name: '나노플레어 800 GAME', brand: 'YONEX', price: '13~17만원', reason: '이븐밸런스, 컨트롤 쉬움', slug: 'yonex-nanoflare-800-game' },
      { name: '나노플레어 1000 GAME', brand: 'YONEX', price: '16~20만원', reason: '올라운드 입문 최적', slug: 'yonex-nanoflare-1000-game' },
      { name: '아스트록스 NEXTAGE', brand: 'YONEX', price: '17~20만원', reason: '손목 피로 최소, 초심자 강추', slug: 'yonex-astrox-nextage' },
    ],
    racketComment: '랠리는 되는데 게임이 불안하다면 컨트롤 우선 라켓부터 시작하세요.',
    nextLevel: {
      label: 'D조',
      checklist: ['동호회 정기 게임 20판 이상 경험', "스매시 '뻥' 소리 안정적으로 내기", '백핸드 클리어 연습 시작', '라켓을 Medium~Stiff로 업그레이드'],
      comment: 'D조까지 보통 6개월~1년. 게임 횟수가 전부예요.',
    },
    ogColor: '#beff00',
    stibeeTag: 'novice',
  },

  d_class: {
    id: 'd_class',
    label: 'D조',
    scoreRange: [39, 52],
    emoji: '🏸',
    tagline: '동호회에서 게임이 되기 시작한 단계',
    description: '이제 게임에서 점수를 낼 수 있어요.\n스매시 소리도 나고, 랠리도 20번 이상 이어가죠.\n근데 뭔가 한 단계 막힌 느낌이 들죠?\n이 단계에서 라켓을 업그레이드하면 플레이가 눈에 띄게 달라져요.',
    radar: { power: 55, control: 58, endurance: 65, skill: 55, experience: 55, mental: 60 },
    radarComment: '전반적으로 균형이 잡혀가고 있어요. 이제 본인 스타일(공격/수비)이 보이기 시작할 거예요.',
    racketCondition: {
      weight: '3U~4U', weightDesc: '파워와 조작성 균형',
      balance: '헤드라이트~이븐', balanceDesc: '플레이 스타일따라 선택',
      flex: 'Medium~Stiff', flexDesc: '스윙 스냅 활용 시작',
      price: '7만~15만원', priceDesc: '이제 장비 투자할 타이밍',
      comment: 'D조부터는 라켓이 실력에 영향을 줘요. 본인 스타일(공격/수비)에 맞게 골라야 해요.',
    },
    recommendedRackets: [
      { name: '나노플레어 700 TOUR', brand: 'YONEX', price: '17~20만원', reason: '스피드형, D조 가장 인기', slug: 'yonex-nanoflare-700-tour' },
      { name: '나노플레어 380 SHARP', brand: 'YONEX', price: '10~13만원', reason: '올라운드, 실패 없는 선택', slug: 'yonex-nanoflare-380-sharp' },
      { name: '아스트록스 88D GAME', brand: 'YONEX', price: '9~12만원', reason: '공격형 후위 가성비 최고', slug: 'yonex-astrox-88d-game' },
    ],
    racketComment: 'D조는 스타일이 갈리기 시작해요. 공격형이면 헤드헤비, 수비형이면 헤드라이트로 가세요.',
    nextLevel: {
      label: 'C조',
      checklist: ['스매시 코스 조절 가능해야 함', '네트 플레이 (헤어핀/푸시) 안정화', '복식 포지셔닝 이해', '주 3회 이상 꾸준한 운동'],
      comment: "C조는 단순히 치는 게 아니라 '생각하면서 치는' 단계예요.",
    },
    ogColor: '#beff00',
    stibeeTag: 'd-class',
  },

  c_class: {
    id: 'c_class',
    label: 'C조',
    scoreRange: [53, 68],
    emoji: '⚡',
    tagline: '어디 가서 꿀리지 않는 단계',
    description: '동호회에서 인정받기 시작한 레벨이에요.\n스매시도 되고, 네트 플레이도 되고, 게임 흐름도 읽혀요.\n이제 장비가 실력을 따라가야 할 때예요.\n포지션에 맞는 라켓으로 바꾸면 한 단계 더 올라갈 수 있어요.',
    radar: { power: 72, control: 70, endurance: 75, skill: 70, experience: 72, mental: 73 },
    radarComment: '전체적으로 높은 수준이에요. 이제 특정 약점 하나를 집중 보완할 타이밍이에요.',
    racketCondition: {
      weight: '3U', weightDesc: '파워와 내구성 확보',
      balance: '스타일별 선택', balanceDesc: '공격=헤드헤비 / 수비=헤드라이트',
      flex: 'Stiff', flexDesc: '스윙 스냅 완전 활용',
      price: '10만~15만원', priceDesc: '성능 차이 체감 구간',
      comment: 'C조는 라켓 스펙이 플레이에 직접 영향을 줘요. 본인 포지션(전위/후위)에 맞게 골라야 해요.',
    },
    recommendedRackets: [
      { name: '아스트록스 88D GAME', brand: 'YONEX', price: '9~12만원', reason: '후위 스매시 최적화', slug: 'yonex-astrox-88d-game' },
      { name: '아스트록스 88S GAME', brand: 'YONEX', price: '9~12만원', reason: '전위 컨트롤 최적화', slug: 'yonex-astrox-88s-game' },
      { name: '나노플레어 800 TOUR', brand: 'YONEX', price: '14~18만원', reason: '파워+컨트롤 균형 최상', slug: 'yonex-nanoflare-800-tour' },
    ],
    racketComment: '88S는 전위(네트플레이), 88D는 후위(스매시)예요. 포지션 먼저 정하고 고르세요.',
    nextLevel: {
      label: 'B조',
      checklist: ['대회 경험 필수 (동호인 대회)', '전술 플레이 (상대 약점 공략)', '체력 훈련 병행', '전문 코치 레슨 권장'],
      comment: 'B조부터는 재능보다 훈련량이에요. 대회 나가는 게 가장 빠른 길이에요.',
    },
    ogColor: '#beff00',
    stibeeTag: 'c-class',
  },
}

export function getLevel(score: number): string {
  if (score <= 27) return 'beginner'
  if (score <= 38) return 'novice'
  if (score <= 52) return 'd_class'
  return 'c_class'
}
