import { createClient } from '@/lib/supabase/server'
import { ensureClubUser, getClubUserId } from '@/lib/club/auth'
import { getMyClubs, buildMemberCountMap } from '@/lib/club/client'
import { ClubListClient } from '@/components/club/ClubListClient'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import type { Metadata } from 'next'
import type { Club } from '@/types/club'

type PublicClubRow = {
  id: string
  name: string
  description: string | null
  location: string | null
  activity_place: string | null
  category: string | null
  court_count: number
  thumbnail_color: string | null
  thumbnail_url: string | null
  created_at: string
  owner_id: string
  owner_name: string | null
  member_count: number
}

export const metadata: Metadata = { title: '내 모임 | 버디민턴', description: '가입한 모임 전체와 새 모임 디스커버리' }

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

  // ── 병렬 조회: 내 모임 목록 + 전체 공개 모임 목록 (RPC) ───
  const [clubs, rawAllClubsResult] = await Promise.all([
    getMyClubs(supabase, clubUserId),
    supabase.rpc('list_public_clubs', { p_limit: 50 }),
  ])

  const realClubs = (rawAllClubsResult.data as PublicClubRow[] | null) ?? []

  // 내 모임 카운트 (RLS 통과 — 본인 가입 클럽이므로)
  const myClubIds = clubs.map(c => c.id)
  const countMap = await buildMemberCountMap(supabase, myClubIds)

  // 내 모임에 카운트 적용
  const clubsWithCount = clubs.map(c => ({ ...c, memberCount: countMap[c.id] ?? 0 }))

  // 전체 공개 클럽 — RPC가 owner_name, member_count 직접 반환
  const allClubsWithCount = realClubs.map((c: PublicClubRow) => ({
    ...c,
    location: c.location ?? '',
    thumbnailColor: c.thumbnail_color ?? '#f0f0f0',
    thumbnail_url: c.thumbnail_url ?? null,
    leaderName: c.owner_name ?? '',
    memberCount: c.member_count,
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
