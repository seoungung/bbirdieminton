import { redirect } from 'next/navigation'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { BackButton } from '@/components/club/BackButton'
import { getClubUserId } from '@/lib/club/auth'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import { ImportClient } from './ImportClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '엑셀 임포트 | 버디민턴' }

export default async function ImportPage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params

  // 데모 모임: 체험 UI
  if (clubId.startsWith('demo-')) {
    const demo = DEMO_CLUBS.find(c => c.id === clubId)
    return (
      <div>
        <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
          <div className="max-w-[1088px] mx-auto flex items-center gap-3">
            <BackButton fallback={`/club/${clubId}/manage`} />
            <h1 className="font-bold text-[#111] text-base">엑셀 임포트 (체험)</h1>
          </div>
        </header>
        <main className="max-w-[1088px] mx-auto px-4 py-5">
          <div className="bg-[#fff8e1] border border-[#ffe082] rounded-2xl px-4 py-3 mb-4 text-sm text-[#b8860b] font-semibold">
            🎮 체험 모드 — 실제 저장되지 않아요
          </div>
          <ImportClient clubId={clubId} clubName={demo?.name ?? '체험 모임'} isDemo />
        </main>
      </div>
    )
  }

  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase, user)
  if (!clubUserId) redirect('/login')

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()

  if (!membership) redirect('/club/home')
  if (!['owner', 'manager'].includes(membership.role)) {
    redirect(`/club/${clubId}/manage`)
  }

  const { data: club } = await supabase
    .from('clubs')
    .select('name')
    .eq('id', clubId)
    .single()

  // 최근 임포트 이력 (감사 로그)
  const { data: recentLogs } = await supabase
    .from('import_logs')
    .select('id, import_type, rows_added, rows_skipped, rows_failed, created_at')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <BackButton fallback={`/club/${clubId}/manage`} />
          <h1 className="font-bold text-[#111] text-base">엑셀 임포트</h1>
        </div>
      </header>
      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <ImportClient clubId={clubId} clubName={club?.name ?? '모임'} recentLogs={recentLogs ?? []} />
      </main>
    </div>
  )
}
