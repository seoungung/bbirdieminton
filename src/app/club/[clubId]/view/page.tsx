import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getClubMembers } from '@/lib/club/client'
import { getClubUserId } from '@/lib/club/auth'
import {
  DEMO_CLUBS,
  DEMO_MEMBERS,
  DEMO_REGULAR_SESSIONS,
  DEMO_SESSIONS,
} from '@/lib/club/demoData'
import { ClubViewClient } from '@/components/club/ClubViewClient'
import type { ClubViewData, MemberViewItem, RegularSessionItem, UserStatus, GameSessionItem } from '@/components/club/ClubViewClient'
import Link from 'next/link'
import type { Metadata } from 'next'

interface ViewPageProps {
  params: Promise<{ clubId: string }>
}

/* ── Metadata ─────────────────────────────────────── */

export async function generateMetadata({ params }: ViewPageProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find(c => c.id === clubId)
  if (demo) {
    return {
      title: `${demo.name} | 버디민턴`,
      description: demo.description.replace(/\n/g, ' ').slice(0, 160),
    }
  }
  const supabase = await createClient()
  const { data: club } = await supabase
    .from('clubs')
    .select('name, description')
    .eq('id', clubId)
    .single()
  return {
    title: club ? `${club.name} | 버디민턴` : '모임 | 버디민턴',
    description: club?.description ?? '배드민턴 동호회 모임 정보',
  }
}

/* ── 데이터 로더 ──────────────────────────────────── */

type LoadResult = {
  club: ClubViewData
  members: MemberViewItem[]
  regularSessions: RegularSessionItem[]
  userStatus: UserStatus
  isAuthenticated: boolean
  isOwner: boolean
  isManager: boolean
  gameSessions: GameSessionItem[]
  myMemberId: string | null
} | null

async function loadDemo(clubId: string): Promise<LoadResult> {
  const demo = DEMO_CLUBS.find(c => c.id === clubId)
  if (!demo) return null

  const user = await getAuthUser()

  return {
    club: demo,
    members: DEMO_MEMBERS.map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      skill: m.skill,
      level: m.level,
    })),
    regularSessions: DEMO_REGULAR_SESSIONS.map(s => ({ ...s })),
    userStatus: 'demo',
    isAuthenticated: !!user,
    // 체험 유저도 운영진 권한 부여 — 첫 방문자가 실제 기능을 모두 경험할 수 있도록
    isOwner: true,
    isManager: true,
    gameSessions: DEMO_SESSIONS.map(s => ({
      id: s.id,
      sessionDate: s.sessionDate,
      status: s.status,
      notes: s.notes,
    })),
    myMemberId: null,
  }
}

async function loadReal(clubId: string): Promise<LoadResult> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // ── Phase 1: 완전 독립 쿼리 병렬 실행 ────────────────────
  // getAuthUser() 는 React.cache — 같은 요청에서 layout이 이미 호출했으면 캐시 반환
  const [
    clubResult,
    user,
    membersResult,
    sessionsResult,
    eventsResult,
  ] = await Promise.all([
    supabase
      .from('clubs')
      .select('id, name, description, court_count, created_at, location, activity_place, category, thumbnail_color')
      .eq('id', clubId)
      .single(),
    getAuthUser(),
    getClubMembers(supabase, clubId),
    supabase
      .from('sessions')
      .select('id, session_date, status, notes')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('club_events')
      .select('id, title, event_date, start_time, end_time, place, fee, max_attend')
      .eq('club_id', clubId)
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(5),
  ])

  const club = clubResult.data
  if (!club) return null

  const allMembers = membersResult
  const events = eventsResult.data ?? []
  const eventIds = events.map(e => e.id)

  // ── Phase 2: Phase 1 결과에 의존하는 쿼리 병렬 실행 ───────
  const [clubUserIdResult, attendanceCountsResult] = await Promise.all([
    // user가 있을 때만 users 테이블 조회 (auth.getUser 재호출 없음)
    user ? getClubUserId(supabase, user) : Promise.resolve(null),
    // eventIds가 있을 때만 참석자 수 조회
    eventIds.length > 0
      ? supabase
          .from('club_event_attendances')
          .select('event_id')
          .in('event_id', eventIds)
          .eq('status', 'going')
      : Promise.resolve({ data: [] as { event_id: string }[] }),
  ])

  const clubUserId = clubUserIdResult

  // ── Phase 3: clubUserId에 의존하는 멤버십 조회 ────────────
  const membershipResult = clubUserId
    ? await supabase
        .from('club_members')
        .select('id, role')
        .eq('club_id', clubId)
        .eq('user_id', clubUserId)
        .maybeSingle()
    : { data: null }

  let userStatus: UserStatus = 'guest'
  let isOwner = false
  let isManager = false
  let myMemberId: string | null = null

  if (user) {
    if (membershipResult.data) {
      userStatus = 'member'
      isOwner = membershipResult.data.role === 'owner'
      isManager = membershipResult.data.role === 'owner' || membershipResult.data.role === 'manager'
      myMemberId = membershipResult.data.id
    } else {
      userStatus = 'non-member'
    }
  }

  // ── Phase 4: myMemberId에 의존하는 내 참석 여부 조회 ──────
  const myAttendingSet = new Set<string>()
  if (myMemberId && eventIds.length > 0) {
    const { data: myAttendances } = await supabase
      .from('club_event_attendances')
      .select('event_id')
      .in('event_id', eventIds)
      .eq('member_id', myMemberId)
      .eq('status', 'going')
    for (const row of myAttendances ?? []) {
      myAttendingSet.add(row.event_id)
    }
  }

  // 이벤트별 참석자 수 집계
  const countMap = new Map<string, number>()
  for (const row of attendanceCountsResult.data ?? []) {
    countMap.set(row.event_id, (countMap.get(row.event_id) ?? 0) + 1)
  }

  const leaderName = allMembers.find(m => m.role === 'owner')?.user?.name ?? '모임장'

  const members: MemberViewItem[] = allMembers.slice(0, 7).map(m => ({
    id: m.id,
    name: m.user?.name ?? '멤버',
    role: m.role,
  }))

  const DAY_KO = ['일', '월', '화', '수', '목', '금', '토']
  const regularSessionsMapped: RegularSessionItem[] = events.map(e => {
    const d = new Date(e.event_date)
    return {
      id: e.id,
      title: e.title,
      dayOfWeek: DAY_KO[d.getDay()],
      time: e.start_time + (e.end_time ? `~${e.end_time}` : ''),
      place: e.place ?? '',
      fee: e.fee ?? undefined,
      nextDate: e.event_date,
      maxAttend: e.max_attend ?? 20,
      currentAttend: countMap.get(e.id) ?? 0,
      thumbnailColor: club.thumbnail_color ?? '#f0f0f0',
      isAttending: myAttendingSet.has(e.id),
    }
  })

  return {
    club: {
      id: club.id,
      name: club.name,
      description: club.description ?? null,
      court_count: club.court_count ?? 2,
      created_at: club.created_at,
      memberCount: allMembers.length,
      location: club.location ?? '',
      activityPlace: club.activity_place ?? '',
      category: club.category ?? '동호회',
      leaderName,
      thumbnailColor: club.thumbnail_color ?? '#f0f0f0',
    },
    members,
    regularSessions: regularSessionsMapped,
    userStatus,
    isAuthenticated: !!user,
    isOwner,
    isManager,
    gameSessions: (sessionsResult.data ?? []).map(s => ({
      id: s.id,
      sessionDate: s.session_date,
      status: s.status as 'open' | 'in_progress' | 'closed',
      notes: s.notes ?? null,
    })),
    myMemberId,
  }
}

/* ── 페이지 ───────────────────────────────────────── */

export default async function ClubViewPage({ params }: ViewPageProps) {
  const { clubId } = await params
  const isDemo = clubId.startsWith('demo-')

  const result = isDemo ? await loadDemo(clubId) : await loadReal(clubId)

  if (!result) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const backHref = user ? '/club/home' : '/login?next=%2Fclub%2Fhome'
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center px-5">
          <p className="text-6xl mb-4">🏸</p>
          <p className="text-xl font-extrabold text-[#111] mb-2">모임을 찾을 수 없어요</p>
          <p className="text-base text-[#999] mb-6">존재하지 않거나 삭제된 모임이에요</p>
          <Link
            href={backHref}
            className="inline-flex items-center justify-center bg-[#beff00] text-[#111] font-bold text-base py-3 px-6 rounded-xl hover:brightness-95 transition-all"
          >
            모임 리스트로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ClubViewClient
      club={result.club}
      members={result.members}
      regularSessions={result.regularSessions}
      userStatus={result.userStatus}
      clubId={clubId}
      isAuthenticated={result.isAuthenticated}
      isOwner={result.isOwner}
      isManager={result.isManager}
      gameSessions={result.gameSessions}
      myMemberId={result.myMemberId}
    />
  )
}
