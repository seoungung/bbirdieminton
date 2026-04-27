import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers } from '@/lib/club/client'
import { DEMO_CLUBS, DEMO_MEMBERS, DEMO_REGULAR_SESSIONS, DEMO_SESSIONS } from '@/lib/club/demoData'
import { ClubDashboardClient } from '@/components/club/ClubDashboardClient'
import { todayKST, parseEventDate } from '@/lib/date'
import type { Metadata } from 'next'
import type { MemberViewItem, RegularSessionItem, GameSessionItem } from '@/components/club/clubview/types'

interface PageProps { params: Promise<{ clubId: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find(c => c.id === clubId)
  if (demo) return { title: `${demo.name} | 버디민턴`, description: `${demo.name} 대시보드` }
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return {
    title: club ? `${club.name} | 버디민턴` : '모임 | 버디민턴',
    description: '모임 대시보드',
  }
}

export default async function ClubHomePage({ params }: PageProps) {
  const { clubId } = await params

  /* ── 데모 모임 ── */
  if (clubId.startsWith('demo-')) {
    const demo = DEMO_CLUBS.find(c => c.id === clubId)
    if (!demo) notFound()

    const members: MemberViewItem[] = DEMO_MEMBERS.map(m => ({
      id: m.id,
      name: m.name,
      role: m.role as 'owner' | 'manager' | 'member',
      skill: m.skill,
      level: m.level,
    }))

    const regularSessions: RegularSessionItem[] = DEMO_REGULAR_SESSIONS.map(r => ({
      id: r.id,
      title: r.title,
      dayOfWeek: r.dayOfWeek,
      time: r.time,
      place: r.place,
      fee: r.fee,
      nextDate: r.nextDate,
      maxAttend: r.maxAttend,
      currentAttend: r.currentAttend,
      thumbnailColor: r.thumbnailColor,
      imageUrls: r.imageUrls,
    }))

    const gameSessions: GameSessionItem[] = DEMO_SESSIONS.map(s => ({
      id: s.id,
      sessionDate: s.sessionDate,
      status: s.status,
      notes: s.notes,
    }))

    return (
      <ClubDashboardClient
        clubId={clubId}
        clubName={demo.name}
        clubDescription={demo.description}
        clubLocation={demo.location}
        activityPlace={demo.activityPlace}
        category={demo.category}
        leaderName={demo.leaderName}
        memberCount={demo.memberCount}
        courtCount={demo.court_count}
        members={members}
        regularSessions={regularSessions}
        gameSessions={gameSessions}
        isDemo
      />
    )
  }

  /* ── 실제 모임 ── */
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  const [
    clubResult,
    membersResult,
    eventsResult,
    sessionsResult,
  ] = await Promise.all([
    supabase
      .from('clubs')
      .select('id, name, description, location, activity_place, category, thumbnail_color, court_count, owner_id')
      .eq('id', clubId)
      .single(),
    getClubMembers(supabase, clubId),
    supabase
      .from('club_events')
      .select(
        'id, title, event_date, start_time, end_time, place, fee, max_attend, attendances:club_event_attendances(status)'
      )
      .eq('club_id', clubId)
      .gte('event_date', todayKST())
      .order('event_date', { ascending: true })
      .limit(3),
    supabase
      .from('sessions')
      .select('id, session_date, status, notes')
      .eq('club_id', clubId)
      .order('session_date', { ascending: false })
      .limit(5),
  ])

  const club = clubResult.data
  if (!club) notFound()

  /* 운영자 이름 조회 */
  let leaderName = '-'
  if (club.owner_id) {
    const { data: owner } = await supabase.from('users').select('name').eq('id', club.owner_id).single()
    leaderName = owner?.name ?? '-'
  }

  const members: MemberViewItem[] = (membersResult ?? []).map(m => ({
    id: m.id,
    name: m.user?.name ?? '이름없음',
    role: m.role,
    skill: m.skill_score,
    level: '',
  }))

  const DAY_KO = ['일', '월', '화', '수', '목', '금', '토']
  type EventRowWithAtt = {
    id: string
    title: string
    event_date: string
    start_time: string | null
    end_time: string | null
    place: string | null
    fee: string | null
    max_attend: number | null
    attendances: { status: string }[] | null
  }
  const regularSessions: RegularSessionItem[] = ((eventsResult.data as EventRowWithAtt[] | null) ?? []).map(e => {
    // KST 날짜의 요일 — parseEventDate는 KST midnight 절대시각을 가짐.
    // 서버 TZ(UTC)에서도 일관되게 KST 요일을 얻으려면 UTC 기준 +9h 시점으로 읽기.
    const d = parseEventDate(e.event_date)
    const kstWallTime = new Date(d.getTime() + 9 * 60 * 60 * 1000)
    const fmtTime = (t: string | null) => (t ? t.slice(0, 5) : '')
    const start = fmtTime(e.start_time)
    const end = fmtTime(e.end_time)
    const time = start ? (end ? `${start} ~ ${end}` : start) : ''
    const goingCount = (e.attendances ?? []).filter(a => a.status === 'going').length
    return {
      id: e.id,
      title: e.title,
      dayOfWeek: DAY_KO[kstWallTime.getUTCDay()],
      time,
      place: e.place ?? '',
      fee: e.fee ?? undefined,
      nextDate: e.event_date,
      maxAttend: e.max_attend ?? 0,
      currentAttend: goingCount,
      thumbnailColor: club.thumbnail_color ?? '#f0f0f0',
    }
  })

  const gameSessions: GameSessionItem[] = (sessionsResult.data ?? []).map(s => ({
    id: s.id,
    sessionDate: s.session_date,
    status: s.status as 'open' | 'in_progress' | 'closed',
    notes: s.notes ?? null,
  }))

  return (
    <ClubDashboardClient
      clubId={clubId}
      clubName={club.name}
      clubDescription={club.description ?? ''}
      clubLocation={club.location ?? ''}
      activityPlace={club.activity_place ?? ''}
      category={club.category ?? '동호회'}
      leaderName={leaderName}
      memberCount={members.length}
      courtCount={club.court_count ?? 2}
      members={members}
      regularSessions={regularSessions}
      gameSessions={gameSessions}
    />
  )
}
