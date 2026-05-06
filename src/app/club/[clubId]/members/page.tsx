import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers, getClubMemberRatings } from '@/lib/club/client'
import { Users } from 'lucide-react'
import { MembersClient } from '@/components/club/MembersClient'
import { DEMO_CLUBS, DEMO_MEMBERS } from '@/lib/club/demoData'
import type { ClubMemberWithUser, PlayerStats, MemberRole } from '@/types/club'
import type { Metadata } from 'next'

interface MembersMetadataProps { params: Promise<{ clubId: string }> }

export async function generateMetadata({ params }: MembersMetadataProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find(c => c.id === clubId)
  if (demo) return { title: `멤버 관리 | ${demo.name}`, description: '모임 멤버 목록 및 역할 관리' }
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return { title: club ? `멤버 관리 | ${club.name}` : '멤버 관리 | 버디민턴', description: '모임 멤버 목록 및 역할 관리' }
}

export default async function MembersPage({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params

  // ── 데모 클럽: 인증 없이 목 데이터 렌더 ──
  if (clubId.startsWith('demo-')) {
    const DEMO_MEMBER_LIST: ClubMemberWithUser[] = DEMO_MEMBERS.map((m) => ({
      id: m.id,
      club_id: clubId,
      user_id: m.id,
      role: m.role as MemberRole,
      skill_score: m.skill,
      joined_at: '2026-01-01T00:00:00Z',
      removed_at: null,
      user: {
        id: m.id,
        birdieminton_user_id: m.id,
        name: m.name,
        phone: null,
        profile_img: null,
        created_at: '2026-01-01T00:00:00Z',
      },
    }))
    const DEMO_STATS: PlayerStats[] = DEMO_MEMBERS.map((m, i) => ({
      id: `stat-${m.id}`,
      club_id: clubId,
      member_id: m.id,
      wins: Math.max(0, 14 - i * 2),
      losses: i * 2 + 1,
      draws: 0,
      games_played: 15,
      win_rate: Math.round(((14 - i * 2) / 15) * 1000) / 1000,
      updated_at: '2026-04-20T00:00:00Z',
    }))

    return (
      <div>
        <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
          <div className="max-w-[1088px] mx-auto flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
                <Users size={16} strokeWidth={2} />
                회원 관리
              </h1>
              <p className="text-xs text-[#999] mt-0.5">총 {DEMO_MEMBER_LIST.length}명</p>
            </div>
          </div>
        </header>
        <main className="max-w-[1088px] mx-auto px-4 py-5">
          <MembersClient
            clubId={clubId}
            members={DEMO_MEMBER_LIST}
            statsData={DEMO_STATS}
            isManager={false}
            isOwner={false}
            myMemberId="demo"
          />
        </main>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/clubs')

  const { data: club } = await supabase.from('clubs').select('*').eq('id', clubId).single()
  if (!club) notFound()

  const members = await getClubMembers(supabase, clubId)
  const isManager = ['owner', 'manager'].includes(membership.role)
  const isOwner = membership.role === 'owner'

  // player_stats + Glicko-2 레이팅 병렬 조회
  const [statsResult, ratingsMap] = await Promise.all([
    supabase.from('player_stats').select('*').eq('club_id', clubId),
    getClubMemberRatings(supabase, clubId),
  ])
  const statsData = statsResult.data

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <Users size={16} strokeWidth={2} />
              회원 관리
            </h1>
            <p className="text-xs text-[#999] mt-0.5">총 {members.length}명</p>
          </div>
        </div>
      </header>
      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <MembersClient
          clubId={clubId}
          members={members}
          statsData={statsData ?? []}
          isManager={isManager}
          isOwner={isOwner}
          myMemberId={membership.id}
          ratingsMap={ratingsMap}
        />
      </main>
    </div>
  )
}
