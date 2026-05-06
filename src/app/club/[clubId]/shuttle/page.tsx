import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { ShuttleManageClient } from '@/components/club/ShuttleManageClient'
import { ShuttleSubmissionTracker } from '@/components/club/ShuttleSubmissionTracker'
import {
  getUnpaidShuttleAction,
  getPoolLogAction,
  getSessionSubmissionsAction,
} from '@/app/club/[clubId]/shuttle/actions'
import type { Metadata } from 'next'
import type { ShuttlePoolLog } from '@/types/club'

interface Props {
  params: Promise<{ clubId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clubId } = await params
  const supabase = await createClient()
  const { data: club } = await supabase
    .from('clubs')
    .select('name')
    .eq('id', clubId)
    .maybeSingle()
  return {
    title: club ? `셔틀콕 관리 | ${club.name}` : '셔틀콕 관리 | 버디민턴',
    description: '동호회 셔틀콕 풀·미납자·설정 관리',
  }
}

export default async function ShuttlePage({ params }: Props) {
  const { clubId } = await params

  // 데모 분기 — 데모 사용자는 데모 대시보드로 안전 회귀
  if (clubId.startsWith('demo-')) redirect(`/club/${clubId}`)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/clubs')

  // 운영진(owner/manager)만 진입
  if (!['owner', 'manager'].includes(membership.role)) {
    redirect(`/club/${clubId}`)
  }

  // 클럽 + 미납자 + 풀 로그 + 진행 중 세션 병렬 조회
  const [clubResult, unpaidResult, poolLogResult, activeSessionResult] = await Promise.all([
    supabase
      .from('clubs')
      .select(
        'name, shuttle_pool_count, shuttle_weekday_required, shuttle_weekend_required, shuttle_default_price, settlement_account',
      )
      .eq('id', clubId)
      .maybeSingle(),
    getUnpaidShuttleAction(clubId),
    getPoolLogAction(clubId, 30),
    // 진행 중 세션 (오늘 진행 중인 게임이 있으면 그 세션 트래커 노출)
    supabase
      .from('sessions')
      .select('id, session_date')
      .eq('club_id', clubId)
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const club = clubResult.data
  if (!club) notFound()

  const unpaidRows = unpaidResult.rows ?? []
  const poolLog: ShuttlePoolLog[] = poolLogResult.rows ?? []
  const activeSession = activeSessionResult.data

  // 진행 중 세션이 있으면 출석자 + 제출 현황 조회
  const sessionSubmissions = activeSession
    ? await getSessionSubmissionsAction(clubId, activeSession.id)
    : null

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <ShuttlecockIcon size={16} className="text-[var(--color-brand-court)]" strokeWidth={2} />
              셔틀콕 관리
            </h1>
            <p className="text-xs text-[#999] mt-0.5">
              여유분 풀 · 미납자 · 설정 (운영진 전용)
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-4 py-5 space-y-5">
        {/* 진행 중 세션이 있고 출석자가 있을 때 — Tracker 자동 노출 */}
        {activeSession && sessionSubmissions?.submissions && sessionSubmissions.submissions.length > 0 && (
          <section>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest mb-2 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              오늘 진행 중인 세션
            </p>
            <ShuttleSubmissionTracker
              clubId={clubId}
              sessionId={activeSession.id}
              sessionDate={activeSession.session_date}
              initialSubmissions={sessionSubmissions.submissions}
              poolCount={club.shuttle_pool_count ?? 0}
              unitPrice={club.shuttle_default_price ?? 2500}
              weekdayRequired={club.shuttle_weekday_required ?? 2}
              weekendRequired={club.shuttle_weekend_required ?? 3}
              isManager
            />
          </section>
        )}

        {/* 풀·미납자·로그 관리 */}
        <ShuttleManageClient
          clubId={clubId}
          clubName={club.name}
          poolCount={club.shuttle_pool_count ?? 0}
          weekdayRequired={club.shuttle_weekday_required ?? 2}
          weekendRequired={club.shuttle_weekend_required ?? 3}
          unitPrice={club.shuttle_default_price ?? 2500}
          unpaidRows={unpaidRows}
          poolLog={poolLog}
          settlementAccount={club.settlement_account}
        />
      </main>
    </div>
  )
}
