import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers } from '@/lib/club/client'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { BackButton } from '@/components/club/BackButton'
import { SettlementsClient } from '@/components/club/SettlementsClient'
import type { Metadata } from 'next'
import type { SessionSettlement, SettlementMember, SettlementWithMembers } from '@/types/club'

interface PageProps { params: Promise<{ clubId: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return {
    title: club ? `셔틀콕비 정산 | ${club.name}` : '셔틀콕비 정산 | 버디민턴',
    description: '세션별 셔틀콕비 정산 현황과 납부 관리',
  }
}

export default async function SettlementsPage({ params }: PageProps) {
  const { clubId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  const { data: club } = await supabase
    .from('clubs')
    .select('id, name, shuttle_default_price, settlement_account')
    .eq('id', clubId)
    .single()
  if (!club) notFound()

  const isManager = ['owner', 'manager'].includes(membership.role)

  /* 정산 목록 + 멤버 조회 */
  const [settlementsResult, membersResult] = await Promise.all([
    supabase
      .from('session_settlements')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
      .limit(50),
    getClubMembers(supabase, clubId),
  ])

  const settlements: SessionSettlement[] = settlementsResult.data ?? []
  const settlementIds = settlements.map(s => s.id)

  /* 멤버별 납부 상태 일괄 조회 */
  let memberRows: SettlementMember[] = []
  if (settlementIds.length > 0) {
    const { data } = await supabase
      .from('settlement_members')
      .select('*')
      .in('settlement_id', settlementIds)
    memberRows = data ?? []
  }

  /* 조합 */
  const memberNameMap = new Map(membersResult.map(m => [m.id, m.user?.name ?? '탈퇴 회원']))
  const settlementsWithMembers: SettlementWithMembers[] = settlements.map(s => {
    const rows = memberRows.filter(mr => mr.settlement_id === s.id)
    return {
      ...s,
      members: rows
        .map(mr => ({
          ...mr,
          memberName: memberNameMap.get(mr.member_id) ?? '탈퇴 회원',
        }))
        .sort((a, b) => a.memberName.localeCompare(b.memberName, 'ko')),
      paidCount: rows.filter(mr => mr.paid).length,
    }
  })

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <BackButton fallback={`/club/${clubId}/finance`} />
          <div className="flex-1">
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <ShuttlecockIcon size={16} className="text-emerald-600" strokeWidth={2} />
              셔틀콕비 정산
            </h1>
            <p className="text-xs text-[#999] mt-0.5">세션별 셔틀콕 사용량과 납부 현황</p>
          </div>
        </div>
      </header>
      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <SettlementsClient
          clubId={clubId}
          settlements={settlementsWithMembers}
          isManager={isManager}
          shuttleDefaultPrice={club.shuttle_default_price ?? 2500}
          settlementAccount={club.settlement_account ?? null}
        />
      </main>
    </div>
  )
}
