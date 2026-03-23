import type { QuizQuestion } from '@/types/quiz'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '배드민턴을 시작한 지 얼마나 되셨나요?',
    choices: [
      { text: '이제 막 시작했어요', score: 1 },
      { text: '3개월 미만이에요', score: 2 },
      { text: '3개월~1년 정도 됐어요', score: 3 },
      { text: '1년 이상 쳐왔어요', score: 4 },
    ],
  },
  {
    id: 2,
    question: '현재 어디서 배드민턴을 치고 계세요?',
    choices: [
      { text: '공원이나 놀이터에서 즐겨요', score: 1 },
      { text: '체육관에 가끔 가요', score: 2 },
      { text: '동호회에 등록했어요', score: 3 },
      { text: '정기적으로 동호회 활동 중이에요', score: 4 },
    ],
  },
  {
    id: 3,
    question: '클리어(높고 멀리 보내는 샷)는 얼마나 잘 되나요?',
    choices: [
      { text: '클리어가 뭔지 몰라요', score: 1 },
      { text: '알지만 코트 끝까지 잘 안 가요', score: 2 },
      { text: '가끔 성공하는 편이에요', score: 3 },
      { text: '안정적으로 코트 깊숙이 들어가요', score: 4 },
    ],
  },
  {
    id: 4,
    question: '스매시를 넣을 수 있나요?',
    choices: [
      { text: '스매시가 뭔가요?', score: 1 },
      { text: '알지만 제대로 못 쳐요', score: 2 },
      { text: '가끔 성공하는 편이에요', score: 3 },
      { text: '주요 공격 기술로 활용해요', score: 4 },
    ],
  },
  {
    id: 5,
    question: '서브는 자신 있으신가요?',
    choices: [
      { text: '서브도 자주 실수해요', score: 1 },
      { text: '롱서브는 웬만큼 들어가요', score: 2 },
      { text: '숏·롱서브 둘 다 됩니다', score: 3 },
      { text: '서브로 전술을 구사해요', score: 4 },
    ],
  },
  {
    id: 6,
    question: '네트 플레이(헤어핀, 푸시)는 어떤가요?',
    choices: [
      { text: '네트 앞으로 거의 못 가요', score: 1 },
      { text: '가면 실수가 많아요', score: 2 },
      { text: '기본적인 건 됩니다', score: 3 },
      { text: '전위가 제 특기예요', score: 4 },
    ],
  },
  {
    id: 7,
    question: '복식 경기에서 포지션 이동은 어떤가요?',
    choices: [
      { text: '아직 복식 게임 안 해봤어요', score: 1 },
      { text: '그냥 왔다갔다 해요', score: 2 },
      { text: '전·후위 구분은 알아요', score: 3 },
      { text: '상황에 맞게 포지션을 바꿔요', score: 4 },
    ],
  },
  {
    id: 8,
    question: '얼마나 자주 게임(랠리)을 하시나요?',
    choices: [
      { text: '아직 게임을 안 해봤어요', score: 1 },
      { text: '가끔 해요', score: 2 },
      { text: '주 1~2회 정도 해요', score: 3 },
      { text: '주 3회 이상 게임합니다', score: 4 },
    ],
  },
  {
    id: 9,
    question: '상대의 강한 공격을 수비로 받아낼 수 있나요?',
    choices: [
      { text: '받아내기가 아직 어려워요', score: 1 },
      { text: '가끔 받아내는 편이에요', score: 2 },
      { text: '웬만한 건 받아냅니다', score: 3 },
      { text: '수비가 제 강점이에요', score: 4 },
    ],
  },
  {
    id: 10,
    question: '풋워크(발 움직임)는 어떤가요?',
    choices: [
      { text: '풋워크가 뭔지 잘 몰라요', score: 1 },
      { text: '알지만 발이 느린 편이에요', score: 2 },
      { text: '기본 스텝은 됩니다', score: 3 },
      { text: '빠른 스텝이 강점이에요', score: 4 },
    ],
  },
  {
    id: 11,
    question: '라켓 그립(잡는 방법)은 어떻게 하세요?',
    choices: [
      { text: '그냥 편하게 잡아요', score: 1 },
      { text: '포핸드 그립만 알아요', score: 2 },
      { text: '포·백핸드 그립을 구분해요', score: 3 },
      { text: '상황에 맞게 그립을 바꿔요', score: 4 },
    ],
  },
  {
    id: 12,
    question: '상대 코트의 약점을 노리는 전술을 쓰나요?',
    choices: [
      { text: '그냥 받아치는 수준이에요', score: 1 },
      { text: '코너를 노리려고 하는 편이에요', score: 2 },
      { text: '기본 전술 패턴이 있어요', score: 3 },
      { text: '상대 패턴을 읽고 전술을 씁니다', score: 4 },
    ],
  },
  {
    id: 13,
    question: '드라이브(낮고 빠른 직선 샷)가 되나요?',
    choices: [
      { text: '드라이브가 뭔지 잘 몰라요', score: 1 },
      { text: '알지만 잘 안 돼요', score: 2 },
      { text: '가끔 성공하는 편이에요', score: 3 },
      { text: '드라이브 랠리가 됩니다', score: 4 },
    ],
  },
  {
    id: 14,
    question: '배드민턴 용어를 얼마나 알고 계세요?',
    choices: [
      { text: '거의 몰라요', score: 1 },
      { text: '기본 용어 몇 가지 알아요', score: 2 },
      { text: '대부분의 용어는 알아요', score: 3 },
      { text: '모르는 용어가 거의 없어요', score: 4 },
    ],
  },
  {
    id: 15,
    question: '경기 중 체력이 어느 정도 유지되나요?',
    choices: [
      { text: '금방 지쳐서 힘들어요', score: 1 },
      { text: '1세트 정도는 버텨요', score: 2 },
      { text: '2~3세트도 충분히 됩니다', score: 3 },
      { text: '체력은 걱정 없어요', score: 4 },
    ],
  },
  {
    id: 16,
    question: '백핸드 샷은 어느 정도 되나요?',
    choices: [
      { text: '백핸드가 아직 많이 어려워요', score: 1 },
      { text: '간신히 받아치는 편이에요', score: 2 },
      { text: '기본적인 백핸드는 됩니다', score: 3 },
      { text: '백핸드로도 공격이 가능해요', score: 4 },
    ],
  },
  {
    id: 17,
    question: '솔직히 본인 실력이 어느 정도인 것 같아요?',
    choices: [
      { text: '배드민턴이 뭔지 알아가는 중이에요', score: 1 },
      { text: '기초는 됐는데 아직 많이 부족해요', score: 2 },
      { text: '동호회에서 게임은 됩니다', score: 3 },
      { text: '동호회에서 제법 한다는 소리 들어요', score: 4 },
    ],
  },
]

export function calcLevel(score: number): '왕초보' | '초심자' | 'D조' | 'C조' {
  if (score <= 27) return '왕초보'
  if (score <= 38) return '초심자'
  if (score <= 52) return 'D조'
  return 'C조'
}

export const LEVEL_RESULTS = {
  '왕초보': {
    label: '배드민턴 첫 걸음을 내딛는 배린이',
    description: '라켓을 잡은 지 얼마 안 됐거나, 처음 배드민턴에 관심을 가진 단계예요. 아직 기본기가 부족한 게 당연하고, 지금이 제대로 배우기 가장 좋은 타이밍이에요. 좋은 입문 라켓 하나가 배드민턴의 재미를 훨씬 빠르게 알려줍니다.',
    radarStats: { power: 20, control: 25, speed: 20, stamina: 30, technique: 15, tactics: 10 },
    racketCondition: { weight: '5U~6U (초경량)', balance: '헤드라이트 또는 균형형', flex: '플렉시블 (소프트)' },
    nextLevel: '초심자',
    tip: '손목 부담 없는 가벼운 라켓으로 기본기를 익히는 게 핵심이에요.',
  },
  '초심자': {
    label: '기초를 다지는 중인 성장형 플레이어',
    description: '셔틀콕을 그럭저럭 맞출 수 있고, 클리어나 서브 같은 기본 기술을 익히는 단계예요. 동호회 등록을 고민 중이거나 막 시작한 분들이 많죠. 이 시기에 올바른 라켓을 선택하면 실력이 훨씬 빠르게 늡니다.',
    radarStats: { power: 35, control: 40, speed: 35, stamina: 45, technique: 30, tactics: 25 },
    racketCondition: { weight: '4U~5U', balance: '균형형 (이븐)', flex: '플렉시블~미디엄' },
    nextLevel: 'D조',
    tip: '이븐밸런스 라켓으로 공수 모두 고르게 연습하세요.',
  },
  'D조': {
    label: '동호회에서 실전을 즐기는 중급 플레이어',
    description: '동호회에 등록해서 정기적으로 게임을 즐기는 단계예요. 기본기는 갖췄고 이제 자신만의 플레이 스타일이 생기기 시작했죠. 스매시, 드라이브, 전술 배치가 점점 자연스러워지는 재밌는 구간이에요.',
    radarStats: { power: 60, control: 58, speed: 60, stamina: 65, technique: 55, tactics: 52 },
    racketCondition: { weight: '4U', balance: '균형형 또는 헤드헤비', flex: '미디엄~스티프' },
    nextLevel: 'C조',
    tip: '플레이 스타일(공격형/수비형)에 맞는 라켓으로 장점을 극대화하세요.',
  },
  'C조': {
    label: '동호회 상위권을 노리는 숙련 플레이어',
    description: '동호회에서 "잘 한다"는 소리를 듣는 수준이에요. 전술, 풋워크, 파워 모두 어느 정도 갖춰진 상태로 이제 장비 세팅이 실력에 큰 영향을 줍니다. 자신의 플레이 스타일에 최적화된 고성능 라켓을 찾을 때예요.',
    radarStats: { power: 75, control: 72, speed: 78, stamina: 80, technique: 74, tactics: 70 },
    racketCondition: { weight: '3U~4U', balance: '스타일에 따라 선택', flex: '미디엄~스티프' },
    nextLevel: 'B조',
    tip: '이제 장비로 실력 차이를 만들 수 있는 단계예요. 스펙 비교를 꼼꼼히 하세요.',
  },
} as const
