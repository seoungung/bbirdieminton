import type { QuizQuestion } from '@/types/quiz'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ── 축 1: 경험 (4문항) ──────────────────────
  {
    id: 1, axis: 'experience',
    question: '배드민턴을 친 지 얼마나 됐나요?',
    options: [
      { label: 'A', text: '아직 안 쳐봤거나 1~2번 쳐본 게 전부예요', score: 1 },
      { label: 'B', text: '시작한 지 6개월이 안 됐어요', score: 2 },
      { label: 'C', text: '6개월~2년 정도 됐어요', score: 3 },
      { label: 'D', text: '2년 이상 됐어요', score: 4 },
    ],
  },
  {
    id: 2, axis: 'experience',
    question: '요즘 얼마나 자주 치고 있나요?',
    options: [
      { label: 'A', text: '아직 시작 전이에요 / 거의 안 쳐요', score: 1 },
      { label: 'B', text: '한 달에 1~2번 정도', score: 2 },
      { label: 'C', text: '일주일에 1~2번', score: 3 },
      { label: 'D', text: '일주일에 3번 이상', score: 4 },
    ],
  },
  {
    id: 3, axis: 'experience',
    question: '지금까지 배드민턴 레슨을 받아본 적 있나요?',
    options: [
      { label: 'A', text: '받아본 적 없어요', score: 1 },
      { label: 'B', text: '몇 번 받아봤는데 오래 안 됐어요', score: 2 },
      { label: 'C', text: '3개월 이상 받았어요', score: 3 },
      { label: 'D', text: '6개월 이상 꾸준히 받았어요', score: 4 },
    ],
  },
  {
    id: 4, axis: 'experience',
    question: '배드민턴 말고 다른 라켓 스포츠 경험이 있나요?',
    options: [
      { label: 'A', text: '없어요', score: 1 },
      { label: 'B', text: '탁구나 배드민턴을 가볍게 쳐본 정도예요', score: 2 },
      { label: 'C', text: '테니스나 스쿼시를 취미로 쳤어요', score: 3 },
      { label: 'D', text: '라켓 스포츠를 꽤 오래 했어요', score: 4 },
    ],
  },

  // ── 축 2: 기술 (7문항) ──────────────────────
  {
    id: 5, axis: 'skill',
    question: '셔틀콕을 라켓 정중앙(스윗스팟)에 맞출 수 있나요?',
    options: [
      { label: 'A', text: '맞추는 것 자체가 아직 어려워요', score: 1 },
      { label: 'B', text: '가끔 맞추는데 일정하지 않아요', score: 2 },
      { label: 'C', text: '대부분 맞출 수 있어요', score: 3 },
      { label: 'D', text: '거의 항상 정확하게 맞춰요', score: 4 },
    ],
  },
  {
    id: 6, axis: 'skill',
    question: '클리어(높이 올려 뒤쪽으로 보내는 타구)를 상대 코트 끝까지 보낼 수 있나요?',
    options: [
      { label: 'A', text: '클리어가 뭔지 잘 모르겠어요', score: 1 },
      { label: 'B', text: '치긴 하는데 짧게 떨어져요', score: 2 },
      { label: 'C', text: '대부분 끝까지 보낼 수 있어요', score: 3 },
      { label: 'D', text: '코스까지 조절할 수 있어요', score: 4 },
    ],
  },
  {
    id: 7, axis: 'skill',
    question: '스매시를 칠 수 있나요?',
    options: [
      { label: 'A', text: '아직 못 쳐요', score: 1 },
      { label: 'B', text: "치긴 하는데 '뻥' 소리가 안 나요", score: 2 },
      { label: 'C', text: '소리는 나는데 코스가 들쭉날쭉해요', score: 3 },
      { label: 'D', text: '원하는 코스로 꽂을 수 있어요', score: 4 },
    ],
  },
  {
    id: 8, axis: 'skill',
    question: '네트 앞 짧은 공(헤어핀/드롭)을 칠 수 있나요?',
    options: [
      { label: 'A', text: '헤어핀이 뭔지 잘 모르겠어요', score: 1 },
      { label: 'B', text: '알긴 아는데 잘 안 돼요', score: 2 },
      { label: 'C', text: '가끔 되는데 불안정해요', score: 3 },
      { label: 'D', text: '안정적으로 구사할 수 있어요', score: 4 },
    ],
  },
  {
    id: 9, axis: 'skill',
    question: '백핸드 타구를 칠 수 있나요?',
    options: [
      { label: 'A', text: '백핸드가 뭔지 모르겠어요', score: 1 },
      { label: 'B', text: '알긴 하는데 거의 못 쳐요', score: 2 },
      { label: 'C', text: '연습 중이에요, 가끔 돼요', score: 3 },
      { label: 'D', text: '포핸드랑 비슷하게 칠 수 있어요', score: 4 },
    ],
  },
  {
    id: 10, axis: 'skill',
    question: '랠리(주고받기)를 몇 번 정도 이어갈 수 있나요?',
    options: [
      { label: 'A', text: '5번 이하로 끊겨요', score: 1 },
      { label: 'B', text: '10번 정도 이어가요', score: 2 },
      { label: 'C', text: '20번 이상 안정적으로 이어가요', score: 3 },
      { label: 'D', text: '상대가 실수할 때까지 계속 이어갈 수 있어요', score: 4 },
    ],
  },
  {
    id: 11, axis: 'skill',
    question: '게임(21점제)을 해본 적 있나요?',
    options: [
      { label: 'A', text: '아직 해본 적 없어요', score: 1 },
      { label: 'B', text: '몇 번 해봤는데 규칙도 헷갈려요', score: 2 },
      { label: 'C', text: '규칙은 알고 게임도 해요', score: 3 },
      { label: 'D', text: '게임에서 전략을 쓸 수 있어요', score: 4 },
    ],
  },

  // ── 축 3: 환경 (3문항) ──────────────────────
  {
    id: 12, axis: 'environment',
    question: '동호회나 클럽에 소속되어 있나요?',
    options: [
      { label: 'A', text: '아니요, 지인과 가끔 쳐요', score: 1 },
      { label: 'B', text: '가입했는데 아직 어색해요', score: 2 },
      { label: 'C', text: '정기적으로 나가고 있어요', score: 3 },
      { label: 'D', text: '동호회 게임에서 주전으로 뛰어요', score: 4 },
    ],
  },
  {
    id: 13, axis: 'environment',
    question: '처음 체육관(실내 배드민턴장)에 갔을 때 어땠나요?',
    options: [
      { label: 'A', text: '아직 안 가봤어요', score: 1 },
      { label: 'B', text: '갔는데 눈치 보여서 제대로 못 쳤어요', score: 2 },
      { label: 'C', text: '어색했지만 어느 정도 어울렸어요', score: 3 },
      { label: 'D', text: '자연스럽게 게임에 끼었어요', score: 4 },
    ],
  },
  {
    id: 14, axis: 'environment',
    question: '배드민턴 대회에 나가본 적 있나요?',
    options: [
      { label: 'A', text: '없어요, 생각도 안 해봤어요', score: 1 },
      { label: 'B', text: '없어요, 언젠가 나가고 싶어요', score: 2 },
      { label: 'C', text: '동호회 내부 대회 정도 나가봤어요', score: 3 },
      { label: 'D', text: '공식 동호인 대회에 나가봤어요', score: 4 },
    ],
  },

  // ── 축 4: 인식 (3문항) ──────────────────────
  {
    id: 15, axis: 'awareness',
    question: '지금 내 실력을 한 마디로 표현하면?',
    options: [
      { label: 'A', text: '셔틀콕 맞추는 것도 아직 어려워요', score: 1 },
      { label: 'B', text: '랠리는 되는데 게임은 아직 무서워요', score: 2 },
      { label: 'C', text: '게임은 하는데 지는 게 더 많아요', score: 3 },
      { label: 'D', text: '동호회에서 나름 게임이 돼요', score: 4 },
    ],
  },
  {
    id: 16, axis: 'awareness',
    question: '배드민턴 용어 중 아는 게 얼마나 되나요?',
    options: [
      { label: 'A', text: '스매시, 서브 정도만 알아요', score: 1 },
      { label: 'B', text: '클리어, 드롭, 헤어핀 정도 알아요', score: 2 },
      { label: 'C', text: '대부분의 기본 용어를 알아요', score: 3 },
      { label: 'D', text: '전술 용어(푸시, 드라이브, 리프트 등)까지 알아요', score: 4 },
    ],
  },
  {
    id: 17, axis: 'awareness',
    question: '배드민턴을 배우면서 가장 답답한 게 뭔가요?',
    options: [
      { label: 'A', text: '뭘 연습해야 할지 모르겠어요', score: 1 },
      { label: 'B', text: '연습은 하는데 실력이 안 느는 것 같아요', score: 2 },
      { label: 'C', text: '게임에서 내 플레이가 잘 안 나와요', score: 3 },
      { label: 'D', text: '특정 기술이 안 돼요 (예: 백핸드, 헤어핀)', score: 4 },
    ],
  },
]
