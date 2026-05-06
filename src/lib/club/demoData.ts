import type { GameboardEvent } from '@/components/club/gameboard/types'

/* ── 타입 ─────────────────────────────────────────────── */

export interface DemoClub {
  id: string
  name: string
  description: string
  court_count: number
  created_at: string
  memberCount: number
  isDemo: boolean
  location: string
  activityPlace: string
  category: '동호회' | '클럽'
  leaderName: string
  thumbnailColor: string
}

export interface DemoMember {
  id: string
  name: string
  role: string
  skill: number
  level: string
  /** 성별 — 게임보드 카드 색상 (남=파랑 / 여=빨강 / null=파랑 디폴트) */
  gender: 'M' | 'F' | null
}

export interface DemoRegularSession {
  id: string
  title: string
  dayOfWeek: string
  time: string
  place: string
  fee: string
  nextDate: string
  maxAttend: number
  currentAttend: number
  thumbnailColor: string
  imageUrls?: string[]
}

export interface DemoSession {
  id: string
  sessionDate: string
  attendCount: number
  status: 'open' | 'in_progress' | 'closed'
  notes: string | null
}

export interface DemoMatch {
  id: string
  sessionId: string
  date: string
  teamA: [string, string]
  teamB: [string, string]
  winner: 'A' | 'B'
  scoreA: number
  scoreB: number
}

export interface DemoFinanceRecord {
  memberId: string
  year: number
  month: number
  amount: number
  paid: boolean
  paidAt?: string
}

/* ── 데이터 ──────────────────────────────────────────── */

export const DEMO_CLUBS: DemoClub[] = [
  {
    id: 'demo-1',
    name: '버디민턴',
    description:
      '관악구 20&30대 배드민턴 동호회입니다.\n저희와 꾸준히 함께 즐기며 운동하실 분 환영합니다! 🔥\n\n매주 토/일 정기모임을 운영 중이에요. 실력보다 성실한 출석을 중요하게 생각합니다.',
    court_count: 3,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 2개월 전 생성
    memberCount: 30,
    isDemo: true,
    location: '관악구',
    activityPlace: '국사봉체육관',
    category: '동호회',
    leaderName: '김민준',
    thumbnailColor: '#DBE64C',
  },
]

/* ─ 30명 회원 (실력 분포 자연스럽게) ──────────────────── */
/* gender 는 한국 이름 컨벤션 따라 자연스럽게 배분 (14남 / 16여).
 * 운영자가 실제 회원 입력 시 NULL(미지정) 케이스 테스트 용도라면
 * 임의로 한두 명 null 로 수정해서 확인하면 됨. */
export const DEMO_MEMBERS: DemoMember[] = [
  // 상위 (C조 / B조 수준)
  { id: 'm1',  name: '김민준',   role: 'owner',   skill: 88, level: 'B조',   gender: 'M' },
  { id: 'm2',  name: '이서연',   role: 'manager', skill: 82, level: 'B조',   gender: 'F' },
  { id: 'm3',  name: '박지호',   role: 'member',  skill: 78, level: 'C조',   gender: 'M' },
  { id: 'm4',  name: '최유나',   role: 'member',  skill: 74, level: 'C조',   gender: 'F' },
  { id: 'm5',  name: '정태양',   role: 'member',  skill: 72, level: 'C조',   gender: 'M' },
  { id: 'm6',  name: '한소희',   role: 'member',  skill: 70, level: 'C조',   gender: 'F' },
  // 중상위 (D조 상위)
  { id: 'm7',  name: '오준서',   role: 'member',  skill: 66, level: 'D조',   gender: 'M' },
  { id: 'm8',  name: '윤채원',   role: 'member',  skill: 64, level: 'D조',   gender: 'F' },
  { id: 'm9',  name: '장도윤',   role: 'member',  skill: 62, level: 'D조',   gender: 'M' },
  { id: 'm10', name: '강예린',   role: 'member',  skill: 60, level: 'D조',   gender: 'F' },
  { id: 'm11', name: '임시우',   role: 'member',  skill: 58, level: 'D조',   gender: 'M' },
  // 중위 (D조 중위)
  { id: 'm12', name: '송하은',   role: 'member',  skill: 56, level: 'D조',   gender: 'F' },
  { id: 'm13', name: '권지민',   role: 'member',  skill: 54, level: 'D조',   gender: 'F' },
  { id: 'm14', name: '배다인',   role: 'member',  skill: 52, level: 'D조',   gender: 'M' },
  { id: 'm15', name: '조현우',   role: 'member',  skill: 50, level: 'D조',   gender: 'M' },
  { id: 'm16', name: '신유진',   role: 'member',  skill: 48, level: 'D조',   gender: 'F' },
  // 중하위 (초심자)
  { id: 'm17', name: '황지안',   role: 'member',  skill: 46, level: '초심자', gender: 'F' },
  { id: 'm18', name: '안재현',   role: 'member',  skill: 44, level: '초심자', gender: 'M' },
  { id: 'm19', name: '유서윤',   role: 'member',  skill: 42, level: '초심자', gender: 'F' },
  { id: 'm20', name: '홍승민',   role: 'member',  skill: 40, level: '초심자', gender: 'M' },
  { id: 'm21', name: '남지율',   role: 'member',  skill: 38, level: '초심자', gender: 'F' },
  // 하위 (초심자 / 왕초보)
  { id: 'm22', name: '문예나',   role: 'member',  skill: 36, level: '초심자', gender: 'F' },
  { id: 'm23', name: '전수아',   role: 'member',  skill: 34, level: '왕초보', gender: 'F' },
  { id: 'm24', name: '백건우',   role: 'member',  skill: 32, level: '왕초보', gender: 'M' },
  { id: 'm25', name: '노하린',   role: 'member',  skill: 30, level: '왕초보', gender: 'F' },
  { id: 'm26', name: '구도현',   role: 'member',  skill: 28, level: '왕초보', gender: 'M' },
  { id: 'm27', name: '서아인',   role: 'member',  skill: 26, level: '왕초보', gender: 'F' },
  { id: 'm28', name: '양시현',   role: 'member',  skill: 24, level: '왕초보', gender: 'M' },
  { id: 'm29', name: '류민서',   role: 'member',  skill: 22, level: '왕초보', gender: 'F' },
  { id: 'm30', name: '김한결',   role: 'member',  skill: 20, level: '왕초보', gender: 'M' },
]

export const DEMO_REGULAR_SESSIONS: DemoRegularSession[] = [
  {
    id: 'rs1',
    title: '토요일 오전민턴',
    dayOfWeek: '토',
    time: '11:00 ~ 15:00',
    place: '국사봉체육관',
    fee: '국사봉 입장비용',
    nextDate: '2026-04-25',
    maxAttend: 24,
    currentAttend: 18,
    thumbnailColor: '#DBE64C',
    imageUrls: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=70'],
  },
  {
    id: 'rs2',
    title: '일요일 오전민턴',
    dayOfWeek: '일',
    time: '11:00 ~ 15:00',
    place: '국사봉체육관',
    fee: '국사봉 입장비용',
    nextDate: '2026-04-26',
    maxAttend: 24,
    currentAttend: 15,
    thumbnailColor: '#c8f5ff',
    imageUrls: ['https://images.unsplash.com/photo-1620155108048-9bb58cbf35fe?w=800&auto=format&fit=crop&q=70'],
  },
  {
    id: 'rs3',
    title: '목요일 저녁민턴',
    dayOfWeek: '목',
    time: '19:00 ~ 22:00',
    place: '국사봉체육관',
    fee: '국사봉 입장비용',
    nextDate: '2026-04-30',
    maxAttend: 16,
    currentAttend: 10,
    thumbnailColor: '#E5F5EE',
  },
]

/* ─ 지난 3개월 세션 기록 (약 25개) ──────────────────────
 * 날짜: 2026-01-27 ~ 2026-04-21
 * 주 2~3회 (토·일 + 목 일부) 패턴
 * ─ */
export const DEMO_SESSIONS: DemoSession[] = [
  // 4월
  { id: 's25', sessionDate: '2026-04-20', attendCount: 16, status: 'closed', notes: '일요일 오전민턴' },
  { id: 's24', sessionDate: '2026-04-19', attendCount: 18, status: 'closed', notes: '토요일 오전민턴' },
  { id: 's23', sessionDate: '2026-04-17', attendCount: 10, status: 'closed', notes: '목요일 저녁민턴' },
  { id: 's22', sessionDate: '2026-04-13', attendCount: 14, status: 'closed', notes: '일요일 오전민턴' },
  { id: 's21', sessionDate: '2026-04-12', attendCount: 20, status: 'closed', notes: '토요일 오전민턴' },
  { id: 's20', sessionDate: '2026-04-10', attendCount: 12, status: 'closed', notes: '목요일 저녁민턴' },
  { id: 's19', sessionDate: '2026-04-06', attendCount: 16, status: 'closed', notes: '일요일 오전민턴' },
  { id: 's18', sessionDate: '2026-04-05', attendCount: 22, status: 'closed', notes: '토요일 오전민턴 — 신입 환영 모임' },
  // 3월
  { id: 's17', sessionDate: '2026-03-30', attendCount: 15, status: 'closed', notes: '일요일 오전민턴' },
  { id: 's16', sessionDate: '2026-03-29', attendCount: 18, status: 'closed', notes: '토요일 오전민턴' },
  { id: 's15', sessionDate: '2026-03-27', attendCount: 10, status: 'closed', notes: '목요일 저녁민턴' },
  { id: 's14', sessionDate: '2026-03-23', attendCount: 14, status: 'closed', notes: '일요일 오전민턴' },
  { id: 's13', sessionDate: '2026-03-22', attendCount: 16, status: 'closed', notes: '토요일 오전민턴' },
  { id: 's12', sessionDate: '2026-03-16', attendCount: 12, status: 'closed', notes: '일요일 오전민턴' },
  { id: 's11', sessionDate: '2026-03-15', attendCount: 19, status: 'closed', notes: '토요일 오전민턴' },
  { id: 's10', sessionDate: '2026-03-13', attendCount: 11, status: 'closed', notes: '목요일 저녁민턴' },
  { id: 's9',  sessionDate: '2026-03-09', attendCount: 15, status: 'closed', notes: '일요일 오전민턴' },
  { id: 's8',  sessionDate: '2026-03-08', attendCount: 17, status: 'closed', notes: '토요일 오전민턴' },
  { id: 's7',  sessionDate: '2026-03-02', attendCount: 14, status: 'closed', notes: '일요일 오전민턴' },
  { id: 's6',  sessionDate: '2026-03-01', attendCount: 20, status: 'closed', notes: '토요일 오전민턴 — 3월 정기' },
  // 2월
  { id: 's5',  sessionDate: '2026-02-23', attendCount: 13, status: 'closed', notes: '일요일 오전민턴' },
  { id: 's4',  sessionDate: '2026-02-22', attendCount: 16, status: 'closed', notes: '토요일 오전민턴' },
  { id: 's3',  sessionDate: '2026-02-16', attendCount: 11, status: 'closed', notes: '일요일 오전민턴 — 명절 후 첫 모임' },
  { id: 's2',  sessionDate: '2026-02-15', attendCount: 9,  status: 'closed', notes: '토요일 오전민턴' },
  { id: 's1',  sessionDate: '2026-02-08', attendCount: 14, status: 'closed', notes: '2월 첫 모임' },
]

/* ─ 최근 세션 경기 기록 (샘플) ──────────────────────
 * 실제 매치는 ranking 페이지가 DEMO_MEMBERS 기반으로 자동 계산
 * 여기서는 "최근 경기" 표시용 샘플
 * ─ */
export const DEMO_MATCHES: DemoMatch[] = [
  { id: 'mt1', sessionId: 's25', date: '2026-04-20', teamA: ['m1', 'm3'],  teamB: ['m2', 'm4'],  winner: 'A', scoreA: 21, scoreB: 18 },
  { id: 'mt2', sessionId: 's25', date: '2026-04-20', teamA: ['m5', 'm10'], teamB: ['m6', 'm11'], winner: 'B', scoreA: 17, scoreB: 21 },
  { id: 'mt3', sessionId: 's25', date: '2026-04-20', teamA: ['m1', 'm9'],  teamB: ['m2', 'm8'],  winner: 'A', scoreA: 21, scoreB: 14 },
  { id: 'mt4', sessionId: 's24', date: '2026-04-19', teamA: ['m3', 'm15'], teamB: ['m7', 'm13'], winner: 'A', scoreA: 21, scoreB: 19 },
  { id: 'mt5', sessionId: 's24', date: '2026-04-19', teamA: ['m2', 'm6'],  teamB: ['m4', 'm8'],  winner: 'B', scoreA: 16, scoreB: 21 },
]

/* ─ 게임보드용 데모 이벤트 ──────────────────────────
 * event_date 는 런타임에 계산 (today / yesterday).
 * GameBoardPage 서버 컴포넌트에서 오늘 날짜 기반으로 주입하거나,
 * 직접 new Date() 를 사용해 모듈 로드 시 결정.
 * ─ */
function isoDate(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

export const DEMO_EVENTS: GameboardEvent[] = [
  {
    id: 'demo-event-today',
    title: '저녁 게임',
    event_date: isoDate(0),
    place: '체험 체육관',
    start_time: '19:00:00',
    end_time: '22:00:00',
    // 첫 10명 (m1~m10)
    goingMemberIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10'],
  },
  {
    id: 'demo-event-yesterday',
    title: '저녁 게임',
    event_date: isoDate(-1),
    place: '체험 체육관',
    start_time: '19:00:00',
    end_time: '22:00:00',
    // 6명 서브셋 (m3~m8)
    goingMemberIds: ['m3', 'm4', 'm5', 'm6', 'm7', 'm8'],
  },
]

/* ─ 회비 납부 현황 (최근 3개월) ──────────────────────
 * 회원 30명 × 3개월 = 90건
 * 납부율: 4월 85% · 3월 95% · 2월 100%
 * ─ */
export const DEMO_FINANCE: DemoFinanceRecord[] = generateDemoFinance()

function generateDemoFinance(): DemoFinanceRecord[] {
  const records: DemoFinanceRecord[] = []
  const months: Array<{ year: number; month: number; paidRate: number }> = [
    { year: 2026, month: 4, paidRate: 0.85 },
    { year: 2026, month: 3, paidRate: 0.95 },
    { year: 2026, month: 2, paidRate: 1.0 },
  ]

  for (const { year, month, paidRate } of months) {
    DEMO_MEMBERS.forEach((member, idx) => {
      const paid = idx / DEMO_MEMBERS.length < paidRate
      records.push({
        memberId: member.id,
        year,
        month,
        amount: 30000,
        paid,
        paidAt: paid ? `${year}-${String(month).padStart(2, '0')}-05` : undefined,
      })
    })
  }

  return records
}
