import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import {
  getClubRanking,
  getClubMemberRatings,
  getMyMembership,
} from '@/lib/club/client'
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

/**
 * T0-1-2: /ranking 는 PRD §2.2 [스탯] 통합 허브의 [랭킹] 탭과 양쪽 미러링.
 *
 * - 사이드바 "커뮤니티" 섹션의 진입점은 그대로 /ranking 유지.
 * - 동일 데이터를 /club/[clubId]/stats?tab=ranking 에서도 동일 컴포넌트로 노출.
 * - 권한: 멤버십 필수 (인증만 허용했던 v1 정책을 stats 와 정합).
 */
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

  /* 멤버십 검증 — stats?tab=ranking 와 진입 정책 일치 (회원만 노출). */
  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/clubs')

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
