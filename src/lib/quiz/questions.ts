export interface QuizQuestion {
  id: number
  question: string
  image?: string
  options: { label: string; score: number }[]
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '셔틀콕을 원하는 방향으로 보낼 수 있나요?',
    image: '/quiz/q1.jpg',
    options: [
      { label: '맞히기도 아직 어려워요', score: 1 },
      { label: '맞히긴 하는데 방향이 들쭉날쭉해요', score: 2 },
      { label: '대체로 원하는 방향으로 가요', score: 3 },
      { label: '코너를 콕 집어서 보낼 수 있어요', score: 4 },
    ],
  },
  {
    id: 2,
    question: '코트에서 랠리를 몇 번 정도 이어갈 수 있나요?',
    image: '/quiz/q2.jpg',
    options: [
      { label: '3번 이하 (바로 네트에 걸려요)', score: 1 },
      { label: '5~10번 (짧게 이어가요)', score: 2 },
      { label: '10~20번 (어느 정도 유지해요)', score: 3 },
      { label: '20번 이상 (안정적으로 이어가요)', score: 4 },
    ],
  },
  {
    id: 3,
    question: '서브를 어떻게 넣고 있나요?',
    image: '/quiz/q3.jpg',
    options: [
      { label: '아직 서브가 잘 안 돼요', score: 1 },
      { label: '숏 서브는 되는데 불안해요', score: 2 },
      { label: '숏/롱 서브를 구분해서 넣어요', score: 3 },
      { label: '서브 전략을 생각하며 넣어요', score: 4 },
    ],
  },
  {
    id: 4,
    question: '스매시를 칠 수 있나요?',
    image: '/quiz/q4.jpg',
    options: [
      { label: '스매시가 뭔지 잘 몰라요', score: 1 },
      { label: '시도는 하는데 맞아도 힘이 없어요', score: 2 },
      { label: '어느 정도 방향은 조절돼요', score: 3 },
      { label: '각도와 코스를 생각하며 쳐요', score: 4 },
    ],
  },
  {
    id: 5,
    question: '풋워크(발 움직임)는 어떤 수준인가요?',
    image: '/quiz/q5.jpg',
    options: [
      { label: '거의 안 움직이고 셔틀이 오길 기다려요', score: 1 },
      { label: '조금 움직이는데 늦게 도착해요', score: 2 },
      { label: '기본 스텝은 알고 사용해요', score: 3 },
      { label: '6방향 스텝을 자연스럽게 써요', score: 4 },
    ],
  },
  {
    id: 6,
    question: '드롭샷 또는 헤어핀을 칠 수 있나요?',
    image: '/quiz/q6.jpg',
    options: [
      { label: '들어보긴 했는데 못 쳐요', score: 1 },
      { label: '시도하면 가끔 성공해요', score: 2 },
      { label: '의도하면 대부분 돼요', score: 3 },
      { label: '상황에 따라 전략적으로 써요', score: 4 },
    ],
  },
  {
    id: 7,
    question: '게임(대전)을 해본 경험이 있나요?',
    image: '/quiz/q7.jpg',
    options: [
      { label: '아직 게임을 해본 적 없어요', score: 1 },
      { label: '가끔 친구나 가족이랑 가볍게 해요', score: 2 },
      { label: '동호회에서 게임을 해요', score: 3 },
      { label: '대회나 리그에 참가한 적 있어요', score: 4 },
    ],
  },
  {
    id: 8,
    question: '백핸드 샷을 어떻게 다루나요?',
    image: '/quiz/q8.jpg',
    options: [
      { label: '백핸드가 무엇인지 잘 몰라요', score: 1 },
      { label: '알지만 거의 안 쓰고 피해요', score: 2 },
      { label: '기본적인 백핸드는 돼요', score: 3 },
      { label: '백핸드로 공격도 할 수 있어요', score: 4 },
    ],
  },
  {
    id: 9,
    question: '라켓 그립을 어떻게 잡고 있나요?',
    image: '/quiz/q9.jpg',
    options: [
      { label: '그냥 편하게 쥐어요', score: 1 },
      { label: '포핸드 그립만 알아요', score: 2 },
      { label: '상황에 따라 그립을 바꿔요', score: 3 },
      { label: '이스턴, 웨스턴 등 다양하게 활용해요', score: 4 },
    ],
  },
  {
    id: 10,
    question: '복식 경기를 해봤나요?',
    image: '/quiz/q10.jpg',
    options: [
      { label: '복식은 아직 해본 적 없어요', score: 1 },
      { label: '해봤지만 파트너와 겹쳐요', score: 2 },
      { label: '기본 앞뒤/좌우 포지션을 알아요', score: 3 },
      { label: '로테이션을 이해하고 게임해요', score: 4 },
    ],
  },
  {
    id: 11,
    question: '클리어 샷(높게 깊숙이 넘기는 샷)을 칠 수 있나요?',
    image: '/quiz/q11.jpg',
    options: [
      { label: '클리어가 자꾸 네트에 걸려요', score: 1 },
      { label: '넘기긴 하는데 짧게 떨어져요', score: 2 },
      { label: '코트 깊숙이 안정적으로 보내요', score: 3 },
      { label: '수비/공격 클리어를 구분해 써요', score: 4 },
    ],
  },
  {
    id: 12,
    question: '게임 중 본인의 약점은 무엇인가요?',
    image: '/quiz/q12.jpg',
    options: [
      { label: '아직 게임을 거의 안 해서 모르겠어요', score: 1 },
      { label: '체력이 금방 떨어져요', score: 2 },
      { label: '특정 샷(백핸드 등)이 약해요', score: 3 },
      { label: '전술이나 패턴을 더 다양하게 써야 해요', score: 4 },
    ],
  },
  {
    id: 13,
    question: '드라이브(낮고 빠른 직선 샷)를 주고받을 수 있나요?',
    image: '/quiz/q13.jpg',
    options: [
      { label: '드라이브가 뭔지 잘 몰라요', score: 1 },
      { label: '알지만 대부분 네트에 걸려요', score: 2 },
      { label: '짧은 드라이브 랠리는 가능해요', score: 3 },
      { label: '드라이브로 압박하며 포인트를 따요', score: 4 },
    ],
  },
  {
    id: 14,
    question: '라켓을 구매할 때 무엇을 기준으로 골랐나요?',
    image: '/quiz/q14.jpg',
    options: [
      { label: '아직 라켓이 없거나 빌려 써요', score: 1 },
      { label: '가격이나 디자인 위주로 골랐어요', score: 2 },
      { label: '무게나 강성을 참고했어요', score: 3 },
      { label: '내 플레이 스타일에 맞게 선택했어요', score: 4 },
    ],
  },
  {
    id: 15,
    question: '상대방의 움직임을 읽으려고 하나요?',
    image: '/quiz/q15.jpg',
    options: [
      { label: '셔틀만 쫓아가기 바빠요', score: 1 },
      { label: '가끔 의식하지만 잘 안 돼요', score: 2 },
      { label: '상대 위치는 파악하려고 해요', score: 3 },
      { label: '상대 빈 공간을 노리며 게임해요', score: 4 },
    ],
  },
  {
    id: 16,
    question: '네트 플레이(헤어핀, 푸시 등)는 어느 수준인가요?',
    image: '/quiz/q16.jpg',
    options: [
      { label: '네트 앞 공이 오면 그냥 때려요', score: 1 },
      { label: '헤어핀을 알지만 잘 안 돼요', score: 2 },
      { label: '헤어핀과 푸시를 상황에 맞게 써요', score: 3 },
      { label: '네트 전술이 게임의 핵심이에요', score: 4 },
    ],
  },
  {
    id: 17,
    question: '본인의 플레이 스타일을 어떻게 표현하겠어요?',
    image: '/quiz/q17.jpg',
    options: [
      { label: '아직 스타일이 없어요', score: 1 },
      { label: '일단 랠리를 이어가려고 해요', score: 2 },
      { label: '공격과 수비를 균형있게 해요', score: 3 },
      { label: '적극적으로 공격하며 포인트를 따요', score: 4 },
    ],
  },
]

export type QuizLevel = '왕초보' | '초심자' | 'D조' | 'C조'

// Q14(index 13): 라켓 구매 기준 — 레벨 진단 점수에서 제외 (장비 인식은 실력과 무관)
// 제외 후 범위: 16~64점
export function calcLevel(answers: number[]): QuizLevel {
  const totalScore = answers.reduce((sum, score, idx) =>
    idx === 13 ? sum : sum + score, 0)
  if (totalScore <= 25) return '왕초보'
  if (totalScore <= 36) return '초심자'
  if (totalScore <= 49) return 'D조'
  return 'C조'
}

// 문항별 답변 점수(1~4)를 레이더 6축으로 변환 (0~100)
// 파워: Q4(3), Q11(10) — 스매시·클리어 파워
// 컨트롤: Q1(0), Q3(2), Q8(7), Q9(8) — 방향·서브·백핸드·그립
// 스피드: Q2(1), Q5(4), Q13(12) — 랠리·풋워크·드라이브
// 체력: Q7(6), Q12(11) — 게임 경험·약점 인식
// 전술: Q10(9), Q15(14), Q17(16) — 복식·상대읽기·스타일
// 네트: Q6(5), Q16(15) — 드롭/헤어핀·네트플레이
export function calcRadar(scores: number[]): number[] {
  const s = (i: number) => scores[i] ?? 2
  const axisScore = (...idxs: number[]): number => {
    const vals = idxs.map(i => s(i))
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length
    return Math.round(((avg - 1) / 3) * 100)
  }
  return [
    axisScore(3, 10),       // 파워
    axisScore(0, 2, 7, 8),  // 컨트롤
    axisScore(1, 4, 12),    // 스피드
    axisScore(6, 11),       // 체력
    axisScore(9, 14, 16),   // 전술
    axisScore(5, 15),       // 네트
  ]
}
