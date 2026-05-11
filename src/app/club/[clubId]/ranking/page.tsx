import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getClubRanking, getClubMemberRatings } from '@/lib/club/client'
import { Trophy } from 'lucide-react'
import { RankingTable } from '@/components/club/RankingTable'
import { RankingGuideBanner } from '@/components/club/RankingGuideBanner'
import type { Metadata } from 'next'

interface RankingMetadataProps { params: Promise<{ clubId: string }> }

export async function generateMetadata({ params }: RankingMetadataProps): Promise<Metadata> {
  const { clubId } = await params
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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const [ranking, ratingsMap] = await Promise.all([
    getClubRanking(supabase, clubId),
    getClubMemberRatings(supabase, clubId),
  ])

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

      <main className="max-w-[1088px] mx-auto px-4 py-5 space-y-4">
        <RankingGuideBanner />
        <RankingTable ranking={ranking} currentUserId={clubUserId} ratingsMap={ratingsMap} />
      </main>
    </div>
  )
}
