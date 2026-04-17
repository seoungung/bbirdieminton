'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'

export async function toggleDuePaidAction(
  clubId: string,
  memberId: string,
  year: number,
  month: number,
  amount: number,
  currentPaid: boolean
) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: myMembership } = await supabase
    .from('club_members').select('role').eq('club_id', clubId).eq('user_id', clubUserId).single()
  if (!myMembership || !['owner', 'manager'].includes(myMembership.role)) return { error: '권한이 없습니다.' }

  const newPaid = !currentPaid

  const { error } = await supabase.from('dues').upsert({
    club_id: clubId,
    member_id: memberId,
    year,
    month,
    amount,
    paid: newPaid,
    paid_at: newPaid ? new Date().toISOString() : null,
  }, { onConflict: 'club_id,member_id,year,month' })

  if (error) return { error: '회비 상태 변경에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/finance`)
  return { success: true }
}

/**
 * P0 #4 수정: 금액 변경 시 기존 paid:true 보존
 * applyFrom: 'this_month' | 'next_month'
 * - this_month: 이번 달도 새 금액으로 (단, paid=true는 건드리지 않음)
 * - next_month: 다음 달부터 적용 (이번 달 rows 변경 없음)
 */
export async function setMonthlyAmountAction(
  clubId: string,
  amount: number,
  year: number,
  month: number,
  applyFrom: 'this_month' | 'next_month' = 'next_month'
) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: myMembership } = await supabase
    .from('club_members').select('role').eq('club_id', clubId).eq('user_id', clubUserId).single()
  if (!myMembership || !['owner', 'manager'].includes(myMembership.role)) return { error: '권한이 없습니다.' }

  // 적용 시작 월 계산
  let targetYear = year
  let targetMonth = month
  if (applyFrom === 'next_month') {
    if (month === 12) { targetYear = year + 1; targetMonth = 1 }
    else { targetMonth = month + 1 }
  }

  const { data: members } = await supabase.from('club_members').select('id').eq('club_id', clubId)
  if (!members) return { error: '회원 조회 실패' }

  // 기존 dues 조회 (paid 상태 보존용)
  const { data: existingDues } = await supabase
    .from('dues')
    .select('member_id, paid')
    .eq('club_id', clubId)
    .eq('year', targetYear)
    .eq('month', targetMonth)

  const existingMap = new Map((existingDues ?? []).map(d => [d.member_id, d.paid]))

  const rows = members.map(m => ({
    club_id: clubId,
    member_id: m.id,
    year: targetYear,
    month: targetMonth,
    amount,
    // 핵심: 이미 paid=true인 row는 건드리지 않음
    paid: existingMap.get(m.id) ?? false,
  }))

  const { error } = await supabase.from('dues').upsert(rows, {
    onConflict: 'club_id,member_id,year,month',
    ignoreDuplicates: false,
  })

  if (error) return { error: '금액 설정에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/finance`)
  return { success: true, appliedFrom: `${targetYear}-${String(targetMonth).padStart(2, '0')}` }
}
