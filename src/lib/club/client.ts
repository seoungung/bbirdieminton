import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Club,
  ClubMember,
  ClubMemberWithUser,
  ClubWithRole,
  Session,
  PlayerStats,
  RankingRow,
} from '@/types/club'

// ── 모임 ────────────────────────────────────────

/** 내가 속한 모임 목록 (역할 포함) */
export async function getMyClubs(
  supabase: SupabaseClient,
  clubUserId: string
): Promise<ClubWithRole[]> {
  const { data, error } = await supabase
    .from('club_members')
    .select('role, clubs(id, name, description, court_count, created_at, owner_id, invite_code, max_members, plan, location, activity_place, thumbnail_color, thumbnail_url, category)')
    .eq('user_id', clubUserId)

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    ...(row.clubs as Club),
    myRole: row.role as ClubWithRole['myRole'],
    memberCount: 0,
  }))
}

/** 초대 코드로 모임 찾기 */
export async function getClubByInviteCode(
  supabase: SupabaseClient,
  inviteCode: string
): Promise<Club | null> {
  const { data } = await supabase
    .from('clubs')
    .select('*')
    .eq('invite_code', inviteCode)
    .single()
  return data
}

// ── 멤버 ────────────────────────────────────────

/** 모임 전체 멤버 (유저 정보 조인) */
export async function getClubMembers(
  supabase: SupabaseClient,
  clubId: string
): Promise<ClubMemberWithUser[]> {
  const { data, error } = await supabase
    .from('club_members')
    .select('id, club_id, user_id, role, joined_at, skill_score, gender, user:users(id, name, profile_img)')
    .eq('club_id', clubId)
    .is('removed_at', null)
    .order('joined_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as ClubMemberWithUser[]
}

/** 내 club_member row (추방된 멤버는 제외) */
export async function getMyMembership(
  supabase: SupabaseClient,
  clubId: string,
  clubUserId: string
): Promise<ClubMember | null> {
  const { data } = await supabase
    .from('club_members')
    .select('*')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .is('removed_at', null)
    .maybeSingle()
  return data
}

// ── 세션 ────────────────────────────────────────

/** 모임의 세션 목록 (최신순) */
export async function getClubSessions(
  supabase: SupabaseClient,
  clubId: string
): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('club_id', clubId)
    .order('session_date', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ── 랭킹 ────────────────────────────────────────

/** 모임 랭킹 (승점 내림차순) */
export async function getClubRanking(
  supabase: SupabaseClient,
  clubId: string
): Promise<RankingRow[]> {
  const { data, error } = await supabase
    .from('player_stats')
    .select('id, club_id, member_id, wins, losses, draws, games_played, win_rate, member:club_members(id, user_id, role, skill_score, user:users(id, name, profile_img))')
    .eq('club_id', clubId)
    .order('wins', { ascending: false })
    .order('win_rate', { ascending: false })

  if (error) throw error

  return ((data ?? []) as unknown as Omit<RankingRow, 'rank'>[]).map((row, idx) => ({
    ...row,
    rank: idx + 1,
  }))
}

// ── 모임 멤버수 보완 ────────────────────────────

/** clubs 배열에 memberCount 채우기 */
export async function fillMemberCounts(
  supabase: SupabaseClient,
  clubs: ClubWithRole[]
): Promise<ClubWithRole[]> {
  if (clubs.length === 0) return clubs

  const ids = clubs.map((c) => c.id)
  const { data } = await supabase
    .from('club_members')
    .select('club_id')
    .in('club_id', ids)

  const countMap: Record<string, number> = {}
  for (const row of data ?? []) {
    countMap[row.club_id] = (countMap[row.club_id] ?? 0) + 1
  }

  return clubs.map((c) => ({ ...c, memberCount: countMap[c.id] ?? 0 }))
}

/**
 * 여러 club id 배열에 대해 memberCount를 한 번의 쿼리로 채우기.
 * home/page.tsx 에서 myClubs + allClubs 카운트를 한 번에 처리하는 데 사용.
 */
export async function buildMemberCountMap(
  supabase: SupabaseClient,
  clubIds: string[]
): Promise<Record<string, number>> {
  if (clubIds.length === 0) return {}
  const { data } = await supabase
    .from('club_members')
    .select('club_id')
    .in('club_id', clubIds)
  const countMap: Record<string, number> = {}
  for (const row of data ?? []) {
    countMap[row.club_id] = (countMap[row.club_id] ?? 0) + 1
  }
  return countMap
}

/**
 * 클럽 멤버들의 Glicko-2 레이팅 맵 (member_id → { mu, phi, sigma }).
 *
 * RSC 경계에서 직렬화되도록 plain Record 형태로 반환.
 * member_ratings 테이블이 아직 마이그레이션되지 않았거나 row가 없으면 빈 객체.
 * UI는 mu가 있으면 muToGrade, 없으면 skill_score 기반 grade로 fallback.
 */
export type RatingMap = Record<string, { mu: number; phi: number; sigma: number }>

export async function getClubMemberRatings(
  supabase: SupabaseClient,
  clubId: string,
): Promise<RatingMap> {
  const { data: members } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)

  const ids = (members ?? []).map((m) => m.id as string)
  if (ids.length === 0) return {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('member_ratings')
    .select('club_member_id, mu, phi, sigma')
    .in('club_member_id', ids)

  if (error) {
    // 테이블 없음(마이그레이션 미적용) 등 → 조용히 빈 객체 반환
    return {}
  }

  const result: RatingMap = {}
  for (const row of (data ?? []) as Array<{
    club_member_id: string
    mu: number
    phi: number
    sigma: number
  }>) {
    result[row.club_member_id] = {
      mu: row.mu,
      phi: row.phi,
      sigma: row.sigma,
    }
  }
  return result
}

/**
 * 클럽 단위 — 최근 N일 동안의 멤버별 mu 변동 합.
 * Top 5 인사이트 카드용 (최근 가장 많이 오른/내린 멤버).
 */
export type RecentDeltaMap = Record<string, { totalDelta: number; matchCount: number }>

export async function getClubRecentRatingDelta(
  supabase: SupabaseClient,
  clubId: string,
  days = 30,
): Promise<RecentDeltaMap> {
  const { data: members } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)

  const ids = (members ?? []).map((m) => m.id as string)
  if (ids.length === 0) return {}

  const since = new Date()
  since.setDate(since.getDate() - days)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('member_rating_history')
    .select('club_member_id, delta_mu, match_id')
    .in('club_member_id', ids)
    .gte('recorded_at', since.toISOString())

  if (error) return {}

  const result: RecentDeltaMap = {}
  for (const row of (data ?? []) as Array<{
    club_member_id: string
    delta_mu: number
    match_id: string | null
  }>) {
    if (row.match_id === null) continue // 시드 row 제외
    if (!result[row.club_member_id]) {
      result[row.club_member_id] = { totalDelta: 0, matchCount: 0 }
    }
    result[row.club_member_id].totalDelta += row.delta_mu
    result[row.club_member_id].matchCount += 1
  }
  return result
}

/**
 * 클럽 단위 — 멤버별 출석 횟수 (전체 또는 가입 이후).
 * 신입 적응 모니터링 카드용.
 */
export async function getClubAttendanceCounts(
  supabase: SupabaseClient,
  clubId: string,
): Promise<Record<string, number>> {
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('club_id', clubId)

  const sessionIds = (sessions ?? []).map((s) => s.id as string)
  if (sessionIds.length === 0) return {}

  const { data, error } = await supabase
    .from('attendances')
    .select('member_id')
    .in('session_id', sessionIds)
    .eq('status', 'present')

  if (error) return {}

  const result: Record<string, number> = {}
  for (const row of (data ?? []) as Array<{ member_id: string }>) {
    result[row.member_id] = (result[row.member_id] ?? 0) + 1
  }
  return result
}

/**
 * 최근 N주 출석 트렌드 (운영자 통계용).
 * 각 주(월~일)별 세션 수와 출석 수의 합 반환.
 */
export type WeeklyAttendance = {
  weekStart: string  // YYYY-MM-DD (월요일)
  sessions: number
  attendees: number
  avgPerSession: number
}

export async function getWeeklyAttendanceTrend(
  supabase: SupabaseClient,
  clubId: string,
  weeks = 4,
): Promise<WeeklyAttendance[]> {
  const now = new Date()
  // 가장 최근 월요일 0시 (KST 가정)
  const dayOfWeek = now.getDay() // 0(일)~6(토)
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const lastMonday = new Date(now)
  lastMonday.setDate(now.getDate() - daysSinceMonday)
  lastMonday.setHours(0, 0, 0, 0)

  const since = new Date(lastMonday)
  since.setDate(lastMonday.getDate() - (weeks - 1) * 7)

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, session_date')
    .eq('club_id', clubId)
    .gte('session_date', since.toISOString().slice(0, 10))

  if (!sessions || sessions.length === 0) {
    return Array.from({ length: weeks }).map((_, i) => {
      const wkStart = new Date(since)
      wkStart.setDate(since.getDate() + i * 7)
      return {
        weekStart: wkStart.toISOString().slice(0, 10),
        sessions: 0,
        attendees: 0,
        avgPerSession: 0,
      }
    })
  }

  const sessionIds = sessions.map((s) => s.id as string)
  const { data: attendances } = await supabase
    .from('attendances')
    .select('session_id')
    .in('session_id', sessionIds)
    .eq('status', 'present')

  const attCountBySession: Record<string, number> = {}
  for (const a of (attendances ?? []) as Array<{ session_id: string }>) {
    attCountBySession[a.session_id] = (attCountBySession[a.session_id] ?? 0) + 1
  }

  // 각 세션을 주별로 bucket
  const buckets: Record<string, { sessions: number; attendees: number }> = {}
  for (const s of sessions as Array<{ id: string; session_date: string }>) {
    const d = new Date(s.session_date + 'T00:00:00')
    const sd = d.getDay()
    const dsm = sd === 0 ? 6 : sd - 1
    const wkStart = new Date(d)
    wkStart.setDate(d.getDate() - dsm)
    const key = wkStart.toISOString().slice(0, 10)
    if (!buckets[key]) buckets[key] = { sessions: 0, attendees: 0 }
    buckets[key].sessions += 1
    buckets[key].attendees += attCountBySession[s.id] ?? 0
  }

  // 주차 array (오래된 → 최신)
  return Array.from({ length: weeks }).map((_, i) => {
    const wkStart = new Date(since)
    wkStart.setDate(since.getDate() + i * 7)
    const key = wkStart.toISOString().slice(0, 10)
    const b = buckets[key] ?? { sessions: 0, attendees: 0 }
    return {
      weekStart: key,
      sessions: b.sessions,
      attendees: b.attendees,
      avgPerSession: b.sessions > 0 ? b.attendees / b.sessions : 0,
    }
  })
}

/**
 * 최근 N개월 회비 납부율.
 * 각 월별 dues 행 중 paid=true 비율.
 */
export type MonthlyDuesPayment = {
  year: number
  month: number
  totalDue: number
  paidCount: number
  paidRate: number  // 0~1
}

export async function getRecentDuesPayment(
  supabase: SupabaseClient,
  clubId: string,
  months = 3,
): Promise<MonthlyDuesPayment[]> {
  const now = new Date()
  const targets: Array<{ year: number; month: number }> = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    targets.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }

  const earliest = targets[0]
  const { data, error } = await supabase
    .from('dues')
    .select('year, month, paid')
    .eq('club_id', clubId)
    .or(`year.gt.${earliest.year},and(year.eq.${earliest.year},month.gte.${earliest.month})`)

  if (error || !data) {
    return targets.map((t) => ({ ...t, totalDue: 0, paidCount: 0, paidRate: 0 }))
  }

  const buckets: Record<string, { total: number; paid: number }> = {}
  for (const row of data as Array<{ year: number; month: number; paid: boolean }>) {
    const key = `${row.year}-${row.month}`
    if (!buckets[key]) buckets[key] = { total: 0, paid: 0 }
    buckets[key].total += 1
    if (row.paid) buckets[key].paid += 1
  }

  return targets.map(({ year, month }) => {
    const b = buckets[`${year}-${month}`] ?? { total: 0, paid: 0 }
    return {
      year,
      month,
      totalDue: b.total,
      paidCount: b.paid,
      paidRate: b.total > 0 ? b.paid / b.total : 0,
    }
  })
}

/**
 * 시즌 리포트 — 클럽 단위 활동 요약 (지정 기간).
 * 세션 수 / 경기 수 / 활성 멤버 수(출석 ≥1) / 총 출석 합.
 */
export type ClubActivitySummary = {
  sessions: number
  matches: number
  activeMembers: number
  totalAttendances: number
  avgAttendancePerSession: number
}

export async function getClubActivitySummary(
  supabase: SupabaseClient,
  clubId: string,
  days: number,
): Promise<ClubActivitySummary> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceISO = since.toISOString().slice(0, 10)

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('club_id', clubId)
    .gte('session_date', sinceISO)

  const sessionIds = (sessions ?? []).map((s) => s.id as string)
  if (sessionIds.length === 0) {
    return { sessions: 0, matches: 0, activeMembers: 0, totalAttendances: 0, avgAttendancePerSession: 0 }
  }

  const [{ count: matchCount }, { data: attendances }] = await Promise.all([
    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .in('session_id', sessionIds),
    supabase
      .from('attendances')
      .select('member_id')
      .in('session_id', sessionIds)
      .eq('status', 'present'),
  ])

  const memberSet = new Set<string>()
  let totalAtt = 0
  for (const a of (attendances ?? []) as Array<{ member_id: string }>) {
    memberSet.add(a.member_id)
    totalAtt += 1
  }

  return {
    sessions: sessionIds.length,
    matches: matchCount ?? 0,
    activeMembers: memberSet.size,
    totalAttendances: totalAtt,
    avgAttendancePerSession: sessionIds.length > 0 ? totalAtt / sessionIds.length : 0,
  }
}

/**
 * 시즌 리포트 — 출석 챔피언 Top N (지정 기간).
 */
export type AttendanceChampion = {
  memberId: string
  attendances: number
}

export async function getAttendanceChampions(
  supabase: SupabaseClient,
  clubId: string,
  days: number,
  limit = 5,
): Promise<AttendanceChampion[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceISO = since.toISOString().slice(0, 10)

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('club_id', clubId)
    .gte('session_date', sinceISO)

  const sessionIds = (sessions ?? []).map((s) => s.id as string)
  if (sessionIds.length === 0) return []

  const { data: attendances } = await supabase
    .from('attendances')
    .select('member_id')
    .in('session_id', sessionIds)
    .eq('status', 'present')

  const counts: Record<string, number> = {}
  for (const a of (attendances ?? []) as Array<{ member_id: string }>) {
    counts[a.member_id] = (counts[a.member_id] ?? 0) + 1
  }

  return Object.entries(counts)
    .map(([memberId, attendances]) => ({ memberId, attendances }))
    .sort((a, b) => b.attendances - a.attendances)
    .slice(0, limit)
}

/**
 * 한 멤버의 자주 같이 뛴 파트너 Top N.
 * matches → match_players JOIN으로 같은 팀(team='A' or 'B') 멤버 카운트.
 */
export type PartnerStats = {
  partnerMemberId: string
  matchesTogether: number
}

export async function getMemberPartners(
  supabase: SupabaseClient,
  memberId: string,
  limit = 3,
): Promise<PartnerStats[]> {
  // 1. 이 멤버가 참여한 match_players row 조회 (match_id + team)
  const { data: myRows, error: e1 } = await supabase
    .from('match_players')
    .select('match_id, team')
    .eq('member_id', memberId)

  if (e1 || !myRows || myRows.length === 0) return []

  // 2. 매치별 같은 팀 동료 조회 (모든 매치를 in으로 한 번에)
  const matchTeamMap = new Map<string, string>()
  for (const r of myRows as Array<{ match_id: string; team: string }>) {
    matchTeamMap.set(r.match_id, r.team)
  }
  const matchIds = [...matchTeamMap.keys()]

  const { data: allRows, error: e2 } = await supabase
    .from('match_players')
    .select('match_id, member_id, team')
    .in('match_id', matchIds)

  if (e2 || !allRows) return []

  // 3. 같은 팀이고 자기 자신 아닌 파트너 카운트
  const counts: Record<string, number> = {}
  for (const r of allRows as Array<{
    match_id: string
    member_id: string | null
    team: string
  }>) {
    if (!r.member_id || r.member_id === memberId) continue
    const myTeam = matchTeamMap.get(r.match_id)
    if (myTeam !== r.team) continue
    counts[r.member_id] = (counts[r.member_id] ?? 0) + 1
  }

  return Object.entries(counts)
    .map(([partnerMemberId, matchesTogether]) => ({ partnerMemberId, matchesTogether }))
    .sort((a, b) => b.matchesTogether - a.matchesTogether)
    .slice(0, limit)
}

/** 한 멤버의 현재 레이팅 + 최근 history (본인 대시보드용). */
export type MemberRatingDetail = {
  current: { mu: number; phi: number; sigma: number; games_played: number; updated_at: string } | null
  history: Array<{
    mu: number
    delta_mu: number
    recorded_at: string
    match_id: string | null
  }>
}

export async function getMemberRatingDetail(
  supabase: SupabaseClient,
  clubMemberId: string,
  historyLimit = 20,
): Promise<MemberRatingDetail> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const [currentRes, historyRes] = await Promise.all([
    sb
      .from('member_ratings')
      .select('mu, phi, sigma, games_played, updated_at')
      .eq('club_member_id', clubMemberId)
      .maybeSingle(),
    sb
      .from('member_rating_history')
      .select('mu, delta_mu, recorded_at, match_id')
      .eq('club_member_id', clubMemberId)
      .order('recorded_at', { ascending: false })
      .limit(historyLimit),
  ])

  return {
    current: currentRes.error ? null : (currentRes.data ?? null),
    history: historyRes.error ? [] : (historyRes.data ?? []),
  }
}
