import { createClient } from '@/lib/supabase/server'
import { ensureClubUser, getClubUserId } from '@/lib/club/auth'
import { getMyClubs, fillMemberCounts } from '@/lib/club/client'
import { ClubListClient } from '@/components/club/ClubListClient'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import type { Metadata } from 'next'
import type { Club } from '@/types/club'

export const metadata: Metadata = { title: '모임 리스트 | 버디민턴', description: '내가 속한 배드민턴 모임 목록을 확인하세요' }

interface ClubWithCount extends Club {
  memberCount: number
}

async function fillAllClubMemberCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clubs: Club[]
): Promise<ClubWithCount[]> {
  if (clubs.length === 0) return []
  const ids = clubs.map((c) => c.id)
  const { data } = await supabase.from('club_members').select('club_id').in('club_id', ids)
  const countMap: Record<string, number> = {}
  for (const row of data ?? []) {
    countMap[row.club_id] = (countMap[row.club_id] ?? 0) + 1
  }
  return clubs.map((c) => ({ ...c, memberCount: countMap[c.id] ?? 0 }))
}

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

  await ensureClubUser(supabase, user).catch(() => {})
  const clubUserId = await getClubUserId(supabase)

  // clubUserId 없어도 빈 리스트로 보여줌 (로그인은 됐지만 club user 미생성)
  if (!clubUserId) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <ClubListClient myClubs={[]} allClubs={[]} />
      </div>
    )
  }

  const clubs = await getMyClubs(supabase, clubUserId)
  const clubsWithCount = await fillMemberCounts(supabase, clubs)

  // location, activity_place, thumbnail_color 포함해서 조회
  const { data: rawAllClubs } = await supabase
    .from('clubs')
    .select('id, name, description, court_count, created_at, owner_id, invite_code, max_members, plan, location, activity_place, thumbnail_color, thumbnail_url, category')
    .order('created_at', { ascending: false })
    .limit(50)

  // leaderName: owner 멤버의 이름을 별도 조회
  const realClubs = rawAllClubs ?? []
  const ownerIds = [...new Set(realClubs.map((c: Record<string, unknown>) => c.owner_id as string).filter(Boolean))]
  const { data: ownerUsers } = ownerIds.length > 0
    ? await supabase.from('users').select('id, name').in('id', ownerIds)
    : { data: [] }
  const ownerMap: Record<string, string> = {}
  for (const u of ownerUsers ?? []) ownerMap[u.id] = u.name

  const mappedClubs = realClubs.map((c: Record<string, unknown>) => ({
    ...c,
    location: c.location ?? '',
    thumbnailColor: c.thumbnail_color ?? '#f0f0f0',
    thumbnail_url: c.thumbnail_url ?? null,
    leaderName: ownerMap[c.owner_id as string] ?? '',
  }))

  const allClubsWithCount = await fillAllClubMemberCounts(supabase, mappedClubs as unknown as Club[])

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
        allClubs={[...allClubsWithCount, ...demoAsClubs] as never}
      />
    </div>
  )
}
