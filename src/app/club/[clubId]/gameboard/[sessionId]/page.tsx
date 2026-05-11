import { redirect, notFound } from 'next/navigation'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers, getClubMemberRatings } from '@/lib/club/client'
import { GameBoardClient } from '@/components/club/GameBoardClient'
import { ClosedSessionClient } from '@/components/club/gameboard/closed/ClosedSessionClient'
import type { Metadata } from 'next'
import type { SessionGuest } from '@/components/club/gameboard/types'

interface PageProps { params: Promise<{ clubId: string; sessionId: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return { title: club ? `게임보드 | ${club.name}` : '게임보드 | 버디민턴', description: '실시간 경기 배정 및 결과 입력' }
}

export default async function GameBoardSessionPage({ params }: PageProps) {
  const { clubId, sessionId } = await params

  // ── 실서비스 ──────────────────────────────────────────
  const supabase = await createClient()
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase, user)
  if (!clubUserId) redirect('/login')

  // 세션 + 클럽 + 멤버십 (병렬)
  const [sessionResult, clubResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('club_id', clubId)
      .single(),
    supabase
      .from('clubs')
      .select('id, name, court_count, match_point_target, shuttle_default_price, settlement_account')
      .eq('id', clubId)
      .single(),
  ])

  const session = sessionResult.data
  const club = clubResult.data
  if (!session) notFound()
  if (!club) notFound()

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/clubs')

  // 출석자 (member_id 만) + 게스트 (session_guests) — 병렬
  const [attendanceResult, guestResult] = await Promise.all([
    supabase
      .from('attendances')
      .select('member_id')
      .eq('session_id', sessionId)
      .eq('status', 'present'),
    supabase
      .from('session_guests')
      .select('id, name, gender, grade')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true }),
  ])

  const attendeeMemberIds = (attendanceResult.data ?? []).map(a => a.member_id as string)
  const sessionGuests: SessionGuest[] = (guestResult.data ?? []).map(g => ({
    id: g.id as string,
    name: g.name as string,
    gender: (g.gender ?? null) as 'M' | 'F' | null,
    grade: (g.grade ?? null) as string | null,
  }))

  // 이벤트 (있는 경우)
  let event: { id: string; title: string; event_date: string; place: string | null } | null = null
  if (session.event_id) {
    const { data } = await supabase
      .from('club_events')
      .select('id, title, event_date, place')
      .eq('id', session.event_id)
      .maybeSingle()
    event = data
  }

  // 출석자 → club_members + users 조인 (이름 / skill_score)
  const { data: memberRows } = attendeeMemberIds.length > 0
    ? await supabase
        .from('club_members')
        .select('id, skill_score, user:users(id, name)')
        .in('id', attendeeMemberIds)
    : { data: [] as Array<{ id: string; skill_score: number; user: { id: string; name: string } | { id: string; name: string }[] | null }> }

  type AttendeeRow = { memberId: string; name: string; skillScore: number; isGuest?: boolean }
  const attendeeRows: AttendeeRow[] = (memberRows ?? []).map(r => {
    // user can be array (from join) or single
    const userObj = Array.isArray(r.user) ? r.user[0] : r.user
    return {
      memberId: r.id,
      name: userObj?.name ?? '?',
      skillScore: r.skill_score,
      isGuest: false,
    }
  })

  // ─── 분기 ──────────────────────────────────────────
  // 'open' 상태는 A안에서 존재하지 않음 — 목록으로 리다이렉트
  if (session.status === 'open') {
    console.warn(`[gameboard] session ${session.id} still has status='open' — redirecting to list`)
    redirect(`/club/${clubId}/gameboard`)
  }

  if (session.status === 'closed') {
    // 매치 + 매치 플레이어 조회
    const { data: matchesRaw } = await supabase
      .from('matches')
      .select('id, court_number, team_a_score, team_b_score')
      .eq('session_id', sessionId)
      .order('court_number', { ascending: true })

    const matchIds = (matchesRaw ?? []).map(m => m.id as string)
    const { data: playerRows } = matchIds.length > 0
      ? await supabase
          .from('match_players')
          .select('match_id, member_id, team')
          .in('match_id', matchIds)
      : { data: [] as Array<{ match_id: string; member_id: string; team: string }> }

    // member_id → name 매핑 (출석자에 없는 경우도 cover — 매치 플레이어 전원 조회)
    const matchPlayerIds = Array.from(new Set((playerRows ?? []).map(p => p.member_id)))
    const allMemberIds = Array.from(new Set([...attendeeMemberIds, ...matchPlayerIds]))
    const { data: nameRows } = allMemberIds.length > 0
      ? await supabase
          .from('club_members')
          .select('id, user:users(id, name)')
          .in('id', allMemberIds)
      : { data: [] as Array<{ id: string; user: { id: string; name: string } | { id: string; name: string }[] | null }> }
    const nameMap = new Map<string, string>()
    for (const r of nameRows ?? []) {
      const userObj = Array.isArray(r.user) ? r.user[0] : r.user
      nameMap.set(r.id, userObj?.name ?? '?')
    }

    const matches = (matchesRaw ?? []).map(m => {
      const players = (playerRows ?? []).filter(p => p.match_id === m.id)
      return {
        id: m.id,
        courtNumber: m.court_number,
        teamAScore: m.team_a_score,
        teamBScore: m.team_b_score,
        teamA: players
          .filter(p => p.team === 'A')
          .map(p => ({ memberId: p.member_id, name: nameMap.get(p.member_id) ?? '?' })),
        teamB: players
          .filter(p => p.team === 'B')
          .map(p => ({ memberId: p.member_id, name: nameMap.get(p.member_id) ?? '?' })),
      }
    })

    // 게스트를 attendeeRows 에 추가 (closed 뷰용 — skillScore 는 grade 기반 추정값)
    const { gradeToSkill } = await import('@/lib/club/grade')
    const guestAttendeeRows = sessionGuests.map(g => ({
      memberId: `guest-${g.id}`,
      name: g.name,
      skillScore: gradeToSkill(g.grade) ?? 50,
      isGuest: true as const,
    }))

    return (
      <ClosedSessionClient
        clubId={clubId}
        sessionDate={session.session_date}
        eventTitle={event?.title ?? null}
        eventPlace={event?.place ?? null}
        attendees={[...attendeeRows, ...guestAttendeeRows]}
        matches={matches}
      />
    )
  }

  // ─── in_progress 분기 ──────────────────────────────
  // GameBoardClient 가 요구하는 풀데이터: members(클럽 전체) + stats + ratings + inProgressData
  const [members, statsResult, ratingsMap, matchesResult] = await Promise.all([
    getClubMembers(supabase, clubId),
    supabase
      .from('player_stats')
      .select('id, club_id, member_id, wins, losses, draws, games_played, win_rate, updated_at')
      .eq('club_id', clubId),
    getClubMemberRatings(supabase, clubId),
    supabase
      .from('matches')
      .select('id, court_number, team_a_score, team_b_score')
      .eq('session_id', sessionId),
  ])

  const ipMatches = matchesResult.data ?? []
  const matchIds = ipMatches.map(m => m.id as string)
  const { data: matchPlayers } = matchIds.length > 0
    ? await supabase
        .from('match_players')
        .select('match_id, member_id, team')
        .in('match_id', matchIds)
    : { data: [] as Array<{ match_id: string; member_id: string; team: string }> }

  const inProgressData = {
    sessionId: session.id,
    sessionDate: session.session_date,
    matches: ipMatches.map(m => ({
      id: m.id,
      court_number: m.court_number,
      team_a_score: m.team_a_score,
      team_b_score: m.team_b_score,
      players: (matchPlayers ?? [])
        .filter(p => p.match_id === m.id)
        .map(p => ({ member_id: p.member_id, team: p.team })),
    })),
    attendeeMemberIds,
  }

  return (
    <GameBoardClient
      clubId={clubId}
      clubName={club.name}
      shuttleDefaultPrice={club.shuttle_default_price ?? 2500}
      settlementAccount={club.settlement_account ?? null}
      courtCount={session.court_count ?? club.court_count ?? 2}
      members={members}
      stats={statsResult.data ?? []}
      ratingsMap={ratingsMap}
      membership={{ id: membership.id, role: membership.role }}
      matchPointTarget={(club.match_point_target ?? 25) as 21 | 25}
      inProgressData={inProgressData}
      guests={sessionGuests}
      events={[]}
      autoResume
    />
  )
}

