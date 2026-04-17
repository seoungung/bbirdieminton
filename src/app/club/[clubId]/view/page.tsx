import { createClient } from '@/lib/supabase/server'
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

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
    isOwner: false,
    isManager: false,
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

  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single()
  if (!club) return null

  const allMembers = await getClubMembers(supabase, clubId)

  const members: MemberViewItem[] = allMembers.slice(0, 7).map(m => ({
    id: m.id,
    name: m.user?.name ?? '멤버',
    role: m.role,
  }))

  const leaderName =
    allMembers.find(m => m.role === 'owner')?.user?.name ?? '모임장'

  // 현재 유저 상태
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userStatus: UserStatus = 'guest'
  let isOwner = false
  let isManager = false
  let myMemberId: string | null = null

  if (user) {
    // auth.uid → users.id(club user id) 변환 필수 (직접 비교 금지)
    const clubUserId = await getClubUserId(supabase)
    if (clubUserId) {
      const { data: myMembership } = await supabase
        .from('club_members')
        .select('id, role')
        .eq('club_id', clubId)
        .eq('user_id', clubUserId)
        .maybeSingle()
      if (myMembership) {
        userStatus = 'member'
        isOwner = myMembership.role === 'owner'
        isManager = myMembership.role === 'owner' || myMembership.role === 'manager'
        myMemberId = myMembership.id
      } else {
        userStatus = 'non-member'
      }
    } else {
      userStatus = 'non-member'
    }
  }

  // 최근 게임 세션 (최대 5개)
  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('id, session_date, status, notes')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(5)

  // club_events 조회 (최근 5개, 오늘 이후)
  const today = new Date().toISOString().split('T')[0]
  const { data: events } = await supabase
    .from('club_events')
    .select('*')
    .eq('club_id', clubId)
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(5)

  // 각 이벤트의 참석자 수 조회
  const eventIds = (events ?? []).map(e => e.id)
  const { data: attendanceCounts } = eventIds.length > 0
    ? await supabase
        .from('club_event_attendances')
        .select('event_id')
        .in('event_id', eventIds)
        .eq('status', 'going')
    : { data: [] }

  const countMap = new Map<string, number>()
  for (const row of attendanceCounts ?? []) {
    countMap.set(row.event_id, (countMap.get(row.event_id) ?? 0) + 1)
  }

  // 내 참석 여부 조회
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

  const DAY_KO = ['일', '월', '화', '수', '목', '금', '토']
  const regularSessionsMapped: RegularSessionItem[] = (events ?? []).map(e => {
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
    gameSessions: (recentSessions ?? []).map(s => ({
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
