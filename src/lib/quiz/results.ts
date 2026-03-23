import type { QuizLevel } from './questions'

export interface LevelResult {
  level: QuizLevel
  emoji: string
  tagline: string
  description: string
  radarLabels: string[]
  radarData: number[]   // 0~100, 순서: 파워, 컨트롤, 스피드, 체력, 전술, 네트
  racketCondition: {
    weight: string
    balance: string
    flex: string
    reason: string
  }
  nextLevel: string
  nextLevelTip: string
}

export const LEVEL_RESULTS: Record<QuizLevel, LevelResult> = {
  왕초보: {
    level: '왕초보',
    emoji: '\uD83D\uDC23',
    tagline: '배드민턴의 세계에 첫 발을 내딛었어요',
    description: '라켓을 처음 잡거나 이제 막 시작한 단계예요. 셔틀이 어디로 튈지 몰라 당황스럽고, 서브 하나도 어색하게 느껴지는 게 정상이에요. 지금은 틀려도 괜찮아요. 이 시기가 가장 빠르게 늘어나는 시기니까요.',
    radarLabels: ['파워', '컨트롤', '스피드', '체력', '전술', '네트'],
    radarData: [20, 15, 20, 30, 10, 15],
    racketCondition: {
      weight: '6U ~ 5U (가벼울수록 좋아요)',
      balance: '헤드라이트 (조작이 쉬워요)',
      flex: 'Flexible (미스샷을 줄여줘요)',
      reason: '처음에는 가볍고 유연한 라켓으로 기본기를 익히는 게 최우선이에요.',
    },
    nextLevel: '초심자',
    nextLevelTip: '주 2회 이상 꾸준히 치면서 기본 클리어와 서브에 집중하면 3개월 내 초심자로 성장할 수 있어요.',
  },
  초심자: {
    level: '초심자',
    emoji: '\uD83C\uDF31',
    tagline: '기본기가 조금씩 자리를 잡고 있어요',
    description: '서브도 되고 랠리도 어느 정도 이어갈 수 있어요. 하지만 아직 백핸드가 어색하고 발이 늦게 따라오는 느낌이 들죠? 지금 이 시기가 바로 자기만의 폼을 만드는 황금 타이밍이에요.',
    radarLabels: ['파워', '컨트롤', '스피드', '체력', '전술', '네트'],
    radarData: [35, 35, 35, 45, 25, 30],
    racketCondition: {
      weight: '5U ~ 4U',
      balance: '이븐밸런스',
      flex: 'Medium',
      reason: '공격과 수비를 균형 있게 연습할 수 있는 올라운드 라켓이 이 시기에 딱 맞아요.',
    },
    nextLevel: 'D조',
    nextLevelTip: '풋워크와 백핸드를 집중 연습하고 동호회 게임을 시작해보세요. 6개월이면 D조 진입 가능해요.',
  },
  D조: {
    level: 'D조',
    emoji: '\u26A1',
    tagline: '동호회에서 이제 제 몫을 하고 있어요',
    description: '기본 기술은 갖춰졌고 동호회 게임도 즐길 수 있어요. 스매시와 드롭을 섞어서 쓰기 시작했고, 파트너와 호흡도 어느 정도 맞아요. 이제 전술이 승부를 가르기 시작하는 레벨이에요.',
    radarLabels: ['파워', '컨트롤', '스피드', '체력', '전술', '네트'],
    radarData: [60, 55, 60, 65, 50, 55],
    racketCondition: {
      weight: '4U ~ 3U',
      balance: '이븐 ~ 헤드헤비',
      flex: 'Medium ~ Stiff',
      reason: '이 시기에는 본인 스타일(공격형/올라운드)에 따라 라켓을 선택하기 시작해야 해요.',
    },
    nextLevel: 'C조',
    nextLevelTip: '상대방 빈 공간을 의식하며 게임하고, 복식 로테이션을 체계적으로 익히면 C조까지 올라갈 수 있어요.',
  },
  C조: {
    level: 'C조',
    emoji: '\uD83C\uDFC6',
    tagline: '배드민턴을 제법 즐길 줄 아는 레벨이에요',
    description: '스매시 각도, 네트 전술, 복식 로테이션까지 의식하며 게임하고 있어요. 상대방을 읽고 빈 공간을 노리는 플레이가 자연스러워졌죠. 이제 라켓 장비도 본인 스타일에 맞게 고를 줄 알아야 해요.',
    radarLabels: ['파워', '컨트롤', '스피드', '체력', '전술', '네트'],
    radarData: [80, 75, 75, 80, 75, 80],
    racketCondition: {
      weight: '3U ~ 2U',
      balance: '플레이 스타일에 따라',
      flex: 'Stiff',
      reason: '이 레벨에서는 본인의 공격 루트와 스타일에 맞는 라켓 세팅이 실력 향상의 핵심이에요.',
    },
    nextLevel: 'B조',
    nextLevelTip: '약점 기술(주로 네트 전술 또는 체력)을 집중 보완하고 대회 경험을 쌓으면 B조도 가능해요.',
  },
}
