import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getClubRanking } from '@/lib/club/client'
import { RankingTable } from '@/components/club/RankingTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '랭킹 | 버디모아' }

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
  if (!user) redirect('/club/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/club/login')

  const ranking = await getClubRanking(supabase, clubId)

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-base font-bold text-[#111]">🏆 랭킹</h1>
          <p className="text-xs text-[#999] mt-0.5">승점 기준 · 승 +3점, 패 +1점</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        <RankingTable ranking={ranking} currentUserId={clubUserId} />
      </main>
    </div>
  )
}
