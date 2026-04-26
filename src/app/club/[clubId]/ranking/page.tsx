import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getClubRanking } from '@/lib/club/client'
import { Trophy } from 'lucide-react'
import { RankingTable } from '@/components/club/RankingTable'
import { BackButton } from '@/components/club/BackButton'
import { DEMO_CLUBS, DEMO_MEMBERS } from '@/lib/club/demoData'
import type { RankingRow, ClubMemberWithUser, MemberRole } from '@/types/club'
import type { Metadata } from 'next'

interface RankingMetadataProps { params: Promise<{ clubId: string }> }

export async function generateMetadata({ params }: RankingMetadataProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find(c => c.id === clubId)
  if (demo) return { title: `랭킹 | ${demo.name}`, description: '모임 멤버 경기 승률 랭킹' }
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return { title: club ? `랭킹 | ${club.name}` : '랭킹 | 버디민턴', description: '모임 멤버 경기 승률 랭킹' }
}

export default async function RankingPage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params

  // ── 데모 클럽: 인증 없이 목 데이터 렌더 ──
  if (clubId.startsWith('demo-')) {
    const DEMO_RANKING: RankingRow[] = DEMO_MEMBERS.map((m, i) => {
      const wins = Math.max(0, 14 - i * 2)
      const losses = i * 2 + 1
      const gamesPlayed = wins + losses
      const demoMember: ClubMemberWithUser = {
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
      }
      return {
        id: `stat-${m.id}`,
        club_id: clubId,
        member_id: m.id,
        wins,
        losses,
        draws: 0,
        games_played: gamesPlayed,
        win_rate: Math.round((wins / gamesPlayed) * 1000) / 1000,
        updated_at: '2026-04-20T00:00:00Z',
        rank: i + 1,
        member: demoMember,
      }
    })

    return (
      <div>
        <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
          <div className="max-w-[1088px] mx-auto flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
                <Trophy size={16} strokeWidth={2} />
                랭킹
              </h1>
              <p className="text-xs text-[#999] mt-0.5">승률 기준 · 최다 승 우선</p>
            </div>
          </div>
        </header>
        <main className="max-w-[1088px] mx-auto px-4 py-5">
          <RankingTable ranking={DEMO_RANKING} currentUserId="demo" />
        </main>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const ranking = await getClubRanking(supabase, clubId)

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <BackButton fallback={`/club/${clubId}`} />
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <Trophy size={16} strokeWidth={2} />
              랭킹
            </h1>
            <p className="text-xs text-[#999] mt-0.5">승률 기준 · 최다 승 우선</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <RankingTable ranking={ranking} currentUserId={clubUserId} />
      </main>
    </div>
  )
}
