'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'

/**
 * 세션 정산 생성
 * - 게임 마감 시 호출
 * - 출석자 전원에 대해 settlement_members 행 자동 생성 (미납 상태)
 */
export async function createSettlementAction(input: {
  clubId: string
  sessionId: string
  shuttleCount: number
  shuttleUnitPrice: number
  extraCost: number
  memo?: string | null
}) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  // 권한 검증
  const { data: myMembership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', input.clubId)
    .eq('user_id', clubUserId)
    .single()
  if (!myMembership || !['owner', 'manager'].includes(myMembership.role)) {
    return { error: '정산 권한이 없습니다. (owner/manager만 가능)' }
  }

  // 출석자 목록 조회
  const { data: attendances, error: attErr } = await supabase
    .from('attendances')
    .select('member_id')
    .eq('session_id', input.sessionId)
    .eq('status', 'present')
  if (attErr) return { error: '출석자 조회 실패: ' + attErr.message }

  const attendees = attendances ?? []
  if (attendees.length === 0) return { error: '출석자가 없습니다.' }

  const totalCost = input.shuttleCount * input.shuttleUnitPrice + input.extraCost
  const perPersonAmount = Math.ceil(totalCost / attendees.length)

  // 정산 행 생성
  const { data: settlement, error: sErr } = await supabase
    .from('session_settlements')
    .insert({
      session_id: input.sessionId,
      club_id: input.clubId,
      shuttle_count: input.shuttleCount,
      shuttle_unit_price: input.shuttleUnitPrice,
      extra_cost: input.extraCost,
      attendee_count: attendees.length,
      per_person_amount: perPersonAmount,
      memo: input.memo ?? null,
    })
    .select()
    .single()
  if (sErr || !settlement) return { error: '정산 저장 실패: ' + (sErr?.message ?? 'unknown') }

  // 멤버별 납부 상태 일괄 생성
  const memberRows = attendees.map(a => ({
    settlement_id: settlement.id,
    member_id: a.member_id,
    amount: perPersonAmount,
    paid: false,
  }))
  const { error: mErr } = await supabase.from('settlement_members').insert(memberRows)
  if (mErr) {
    // 롤백: 생성한 settlement 삭제
    await supabase.from('session_settlements').delete().eq('id', settlement.id)
    return { error: '멤버 배정 실패: ' + mErr.message }
  }

  revalidatePath(`/club/${input.clubId}/settlements`)
  return { success: true, settlementId: settlement.id, perPersonAmount, totalCost, attendeeCount: attendees.length }
}

/**
 * 멤버별 납부 상태 토글
 */
export async function toggleSettlementPaidAction(
  clubId: string,
  settlementMemberId: string,
  currentPaid: boolean
) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: myMembership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()
  if (!myMembership || !['owner', 'manager'].includes(myMembership.role)) {
    return { error: '권한이 없습니다.' }
  }

  const { error } = await supabase
    .from('settlement_members')
    .update({ paid: !currentPaid })
    .eq('id', settlementMemberId)
  if (error) return { error: '납부 상태 변경 실패: ' + error.message }

  revalidatePath(`/club/${clubId}/settlements`)
  return { success: true }
}

/**
 * 정산 삭제 (owner/manager)
 */
export async function deleteSettlementAction(clubId: string, settlementId: string) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: myMembership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()
  if (!myMembership || !['owner', 'manager'].includes(myMembership.role)) {
    return { error: '권한이 없습니다.' }
  }

  const { error } = await supabase
    .from('session_settlements')
    .delete()
    .eq('id', settlementId)
  if (error) return { error: '삭제 실패: ' + error.message }

  revalidatePath(`/club/${clubId}/settlements`)
  return { success: true }
}

/**
 * 클럽 설정의 셔틀콕 기본 가격 + 입금 계좌 업데이트
 */
export async function updateShuttleSettingsAction(
  clubId: string,
  shuttlePrice: number,
  settlementAccount: string | null
) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: myMembership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()
  if (!myMembership || !['owner', 'manager'].includes(myMembership.role)) {
    return { error: '권한이 없습니다.' }
  }

  if (shuttlePrice < 0 || shuttlePrice > 100000) {
    return { error: '가격이 올바르지 않습니다.' }
  }

  const { error } = await supabase
    .from('clubs')
    .update({
      shuttle_default_price: shuttlePrice,
      settlement_account: settlementAccount?.trim() || null,
    })
    .eq('id', clubId)
  if (error) return { error: '설정 저장 실패: ' + error.message }

  revalidatePath(`/club/${clubId}/settlements`)
  revalidatePath(`/club/${clubId}/settings`)
  return { success: true }
}
