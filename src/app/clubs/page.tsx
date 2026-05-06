import type { Metadata } from 'next'

import { createClient } from '@/lib/supabase/server'
import { ensureClubUser, getClubUserId } from '@/lib/club/auth'
import { getMyClubs } from '@/lib/club/client'
import { ClubsDiscoveryClient } from '@/components/club/discovery/ClubsDiscoveryClient'
import type { ClubDiscoveryItem } from '@/components/club/discovery/types'
import { SaaSShell } from '@/components/layout/saas/SaaSShell'
import { getSaaSShellData } from '@/components/layout/saas/getSaaSShellData'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import type { ClubWithRole } from '@/types/club'

export const metadata: Metadata = {
  title: '모임 둘러보기 | 버디민턴',
  description:
    '운영 중인 배드민턴 모임을 둘러보세요. 분위기·실력·회비·운영 스타일을 미리 보고 가입을 결정합니다.',
  openGraph: {
    title: '모임 둘러보기 | 버디민턴',
    description:
      '분위기·실력·운영을 미리 보고 결정하는 배드민턴 모임 카탈로그.',
  },
}

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

function toDiscoveryItems(realClubs: PublicClubRow[]): ClubDiscoveryItem[] {
  return realClubs.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    location: c.location ?? null,
    activityPlace: c.activity_place ?? null,
    category: c.category ?? null,
    thumbnailUrl: c.thumbnail_url ?? null,
    thumbnailColor: c.thumbnail_color ?? '#f0f0f0',
    memberCount: c.member_count,
    courtCount: c.court_count,
    isAcceptingMembers: true,
    ownerName: c.owner_name ?? null,
    createdAt: c.created_at,
  }))
}

/**
 * 내가 가입한 모임 (`getMyClubs` 결과) 을 ClubDiscoveryItem 배열로 변환.
 *
 * MY 모임 탭 표시용 — `realClubs` 와 형태를 맞춰 ClubsCard 컴포넌트가 그대로 렌더 가능하게.
 * memberCount 는 별도 buildMemberCountMap 으로 채움 (ClubWithRole 자체 memberCount 는 0 으로 초기화됨).
 */
function myClubsToDiscoveryItems(
  rows: ClubWithRole[],
  memberCountMap: Record<string, number>,
): ClubDiscoveryItem[] {
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    location: c.location ?? null,
    activityPlace: c.activity_place ?? null,
    category: c.category ?? null,
    thumbnailUrl: c.thumbnail_url ?? null,
    thumbnailColor: c.thumbnail_color ?? '#f0f0f0',
    memberCount: memberCountMap[c.id] ?? c.memberCount ?? 0,
    courtCount: c.court_count ?? 0,
    isAcceptingMembers: true,
    ownerName: null,
    createdAt: c.created_at ?? new Date().toISOString(),
  }))
}

const DEMO_DISCOVERY_ITEMS: ClubDiscoveryItem[] = DEMO_CLUBS.map((d) => ({
  id: d.id,
  name: d.name,
  description: d.description,
  location: d.location,
  activityPlace: d.activityPlace,
  category: d.category,
  thumbnailUrl: null,
  thumbnailColor: d.thumbnailColor,
  memberCount: d.memberCount,
  courtCount: d.court_count,
  isAcceptingMembers: true,
  ownerName: d.leaderName,
  isDemo: true,
  createdAt: d.created_at,
}))

type ClubsTab = 'all' | 'mine' | 'saved' | 'recent'

function parseTab(raw: string | undefined): ClubsTab {
  if (raw === 'mine' || raw === 'saved' || raw === 'recent') return raw
  return 'all'
}

interface PageProps {
  searchParams?: Promise<{ tab?: string }>
}

/**
 * /clubs — 모임 둘러보기 (단일 hub).
 *
 * 사이드바 "둘러보기" 4개 nav (전체/MY/찜/최근) 와 동작:
 *   · ?tab=mine   → MY 모임 (getMyClubs 결과)
 *   · ?tab=saved  → 찜한 모임 (localStorage 'favoriteClubs')
 *   · ?tab=recent → 최근 본 모임 (localStorage 'recentClubs')
 *   · 그 외/없음 → 전체 모임 (실제 + 데모)
 *
 * Phase 2 큐레이션 (인기/신규/모집중) 은 클럽 볼륨 부족으로 미렌더.
 * 컴포넌트는 보존됨 (`discovery/ClubsCurationSection.tsx`, `ClubsMiniCard.tsx`).
 *
 * 비로그인 사용자도 진입 가능. ClubListClient(4탭) 는 보존 — Phase 4 재도입 후보.
 */
export default async function ClubsListingPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) ?? {}
  const tab = parseTab(resolvedParams.tab)

  const [shellData, supabase] = await Promise.all([
    getSaaSShellData(),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()

  // 비로그인 → 전체 모임 + 데모만, myClubs=[]
  if (!user) {
    const { data, error } = await supabase.rpc('list_public_clubs', { p_limit: 60 })
    const realClubs = !error && data ? (data as PublicClubRow[]) : []
    const allClubs = [...toDiscoveryItems(realClubs), ...DEMO_DISCOVERY_ITEMS]
    return (
      <SaaSShell myClubs={shellData.myClubs} user={shellData.user}>
        <ClubsDiscoveryClient clubs={allClubs} myClubs={[]} tab={tab} />
      </SaaSShell>
    )
  }

  await ensureClubUser(supabase, user).catch(() => {})
  const clubUserId = await getClubUserId(supabase, user)

  // clubUserId 미생성 (예외) → 데모만
  if (!clubUserId) {
    return (
      <SaaSShell myClubs={shellData.myClubs} user={shellData.user}>
        <ClubsDiscoveryClient
          clubs={[...DEMO_DISCOVERY_ITEMS]}
          myClubs={[]}
          tab={tab}
        />
      </SaaSShell>
    )
  }

  // 정상 — 전체 모임 + 데모 + 내 모임 모두 페치
  const [rawAllClubsResult, myClubRows] = await Promise.all([
    supabase.rpc('list_public_clubs', { p_limit: 60 }),
    getMyClubs(supabase, clubUserId).catch(() => [] as ClubWithRole[]),
  ])
  const realClubs = (rawAllClubsResult.data as PublicClubRow[] | null) ?? []

  // myClubs memberCount 보충 — list_public_clubs 결과에 같은 id 가 있으면 거기서 가져오기
  const memberCountMap: Record<string, number> = {}
  for (const r of realClubs) {
    memberCountMap[r.id] = r.member_count
  }

  const allClubs = [...toDiscoveryItems(realClubs), ...DEMO_DISCOVERY_ITEMS]
  const myClubs = myClubsToDiscoveryItems(myClubRows, memberCountMap)

  return (
    <SaaSShell myClubs={shellData.myClubs} user={shellData.user}>
      <ClubsDiscoveryClient clubs={allClubs} myClubs={myClubs} tab={tab} />
    </SaaSShell>
  )
}
