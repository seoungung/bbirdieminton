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
}

export interface DemoSession {
  id: string
  sessionDate: string
  attendCount: number
  status: 'open' | 'in_progress' | 'closed'
  notes: string | null
}

/* ── 데이터 ──────────────────────────────────────────── */

export const DEMO_CLUBS: DemoClub[] = [
  {
    id: 'demo-1',
    name: '버디민턴',
    description:
      '관악구 20&30대 배드민턴 동호회입니다.\n저희와 꾸준히 함께 즐기며 운동하실 분 환영합니다! 🔥\n\n매주 토/일 정기모임을 운영 중이에요. 실력보다 성실한 출석을 중요하게 생각합니다.',
    court_count: 3,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    memberCount: 24,
    isDemo: true,
    location: '관악구',
    activityPlace: '국사봉체육관',
    category: '동호회',
    leaderName: '김민준',
    thumbnailColor: '#beff00',
  },
]

export const DEMO_MEMBERS: DemoMember[] = [
  { id: 'm1', name: '김민준', role: 'owner',   skill: 72, level: 'C조'   },
  { id: 'm2', name: '이서연', role: 'manager', skill: 68, level: 'C조'   },
  { id: 'm3', name: '박지호', role: 'member',  skill: 61, level: 'D조'   },
  { id: 'm4', name: '최유나', role: 'member',  skill: 55, level: 'D조'   },
  { id: 'm5', name: '정태양', role: 'member',  skill: 48, level: 'D조'   },
  { id: 'm6', name: '한소희', role: 'member',  skill: 44, level: 'D조'   },
  { id: 'm7', name: '오준서', role: 'member',  skill: 38, level: '초심자' },
]

export const DEMO_REGULAR_SESSIONS: DemoRegularSession[] = [
  {
    id: 'rs1',
    title: '토요일 오전민턴',
    dayOfWeek: '토',
    time: '11:00 ~ 15:00',
    place: '국사봉체육관',
    fee: '국사봉 입장비용',
    nextDate: '2026-04-18',
    maxAttend: 24,
    currentAttend: 4,
    thumbnailColor: '#beff00',
  },
  {
    id: 'rs2',
    title: '일요일 오전민턴',
    dayOfWeek: '일',
    time: '11:00 ~ 15:00',
    place: '국사봉체육관',
    fee: '국사봉 입장비용',
    nextDate: '2026-04-19',
    maxAttend: 24,
    currentAttend: 8,
    thumbnailColor: '#c8f5ff',
  },
]

export const DEMO_SESSIONS: DemoSession[] = [
  { id: 's1', sessionDate: '2026-04-13', attendCount: 10, status: 'closed', notes: '토요일 오전민턴' },
  { id: 's2', sessionDate: '2026-04-10', attendCount: 8,  status: 'closed', notes: '목요일 저녁민턴' },
  { id: 's3', sessionDate: '2026-04-06', attendCount: 12, status: 'closed', notes: '일요일 오전민턴' },
]
