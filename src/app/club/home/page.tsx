import { createClient } from '@/lib/supabase/server'
import { ensureClubUser, getClubUserId } from '@/lib/club/auth'
import { getMyClubs, buildMemberCountMap } from '@/lib/club/client'
import { ClubListClient } from '@/components/club/ClubListClient'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import type { Metadata } from 'next'
import type { Club } from '@/types/club'

export const metadata: Metadata = { title: '모임 리스트 | 버디민턴', description: '내가 속한 배드민턴 모임 목록을 확인하세요' }

export default async function ClubHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 비로그인 → 데모 모임 카드 3개 표시
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <ClubListClient myClubs={[]} allClubs={DEMO_CLUBS as never} isGuest />
      </div>
    )
  }

  // user를 전달해 auth.getUser() 이중 호출 방지
  await ensureClubUser(supabase, user).catch(() => {})
  const clubUserId = await getClubUserId(supabase, user)

  // clubUserId 없어도 빈 리스트로 보여줌 (로그인은 됐지만 club user 미생성)
  if (!clubUserId) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <ClubListClient myClubs={[]} allClubs={[]} />
      </div>
    )
  }

  // ── 병렬 조회: 내 모임 목록 + 전체 모임 목록 ──────────────
  const [clubs, rawAllClubsResult] = await Promise.all([
    getMyClubs(supabase, clubUserId),
    supabase
      .from('clubs')
      .select('id, name, description, court_count, created_at, owner_id, invite_code, max_members, plan, location, activity_place, thumbnail_color, thumbnail_url, category')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const realClubs = rawAllClubsResult.data ?? []

  // ── 병렬 조회: owner 이름 + 멤버 수 (단 1회 쿼리로 통합) ──
  const ownerIds = [...new Set(realClubs.map((c: Record<string, unknown>) => c.owner_id as string).filter(Boolean))]
  const allClubIds = [...new Set([
    ...clubs.map(c => c.id),
    ...realClubs.map((c: Record<string, unknown>) => c.id as string),
  ])]

  const [ownerUsersResult, countMap] = await Promise.all([
    ownerIds.length > 0
      ? supabase.from('users').select('id, name').in('id', ownerIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    buildMemberCountMap(supabase, allClubIds),
  ])

  const ownerMap: Record<string, string> = {}
  for (const u of ownerUsersResult.data ?? []) ownerMap[u.id] = u.name

  // 내 모임에 카운트 적용 (별도 쿼리 불필요 — countMap 재사용)
  const clubsWithCount = clubs.map(c => ({ ...c, memberCount: countMap[c.id] ?? 0 }))

  const allClubsWithCount = realClubs.map((c: Record<string, unknown>) => ({
    ...c,
    location: c.location ?? '',
    thumbnailColor: c.thumbnail_color ?? '#f0f0f0',
    thumbnail_url: c.thumbnail_url ?? null,
    leaderName: ownerMap[c.owner_id as string] ?? '',
    memberCount: countMap[c.id as string] ?? 0,
  }))

  // 전체 모임에 데모 클럽도 포함 (체험용으로 항상 표시)
  const demoAsClubs = DEMO_CLUBS.map(d => ({
    id: d.id,
    name: d.name,
    description: d.description,
    court_count: d.court_count,
    created_at: d.created_at,
    memberCount: d.memberCount,
    isDemo: true,
    location: d.location,
    leaderName: d.leaderName,
    thumbnailColor: d.thumbnailColor,
  }))

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <ClubListClient
        myClubs={clubsWithCount as never}
        allClubs={[...allClubsWithCount as unknown as Club[], ...demoAsClubs] as never}
      />
    </div>
  )
}
