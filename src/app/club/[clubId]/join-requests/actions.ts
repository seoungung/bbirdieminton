'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected'

export interface JoinRequestRow {
  id: string
  club_id: string
  user_id: string
  status: JoinRequestStatus
  created_at: string
  requester_name?: string | null
}

// ── 현재 유저의 가입 신청 상태 조회 ──────────────────────────
export async function getMyJoinRequestAction(
  clubId: string,
): Promise<JoinRequestRow | null> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return null

  const { data } = await supabase
    .from('join_requests')
    .select('id, club_id, user_id, status, created_at')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()

  return data ?? null
}

// ── 가입 신청 제출 ─────────────────────────────────────────
export async function submitJoinRequestAction(
  clubId: string,
): Promise<{ success?: true; error?: string; alreadyMember?: boolean }> {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser || authUser.is_anonymous) return { error: '로그인이 필요합니다.' }
  const clubUserId = await getClubUserId(supabase, authUser)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  // 이미 멤버인지 확인
  const { data: existing } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()

  if (existing) return { alreadyMember: true }

  // 중복 신청 방지 (upsert)
  const { error } = await supabase
    .from('join_requests')
    .upsert(
      { club_id: clubId, user_id: clubUserId, status: 'pending' },
      { onConflict: 'club_id,user_id', ignoreDuplicates: false },
    )

  if (error) return { error: '가입 신청에 실패했습니다.' }

  revalidatePath(`/club/${clubId}`)
  return { success: true }
}

// ── 가입 신청 취소 ─────────────────────────────────────────
export async function cancelJoinRequestAction(
  clubId: string,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('join_requests')
    .delete()
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .eq('status', 'pending')

  if (error) return { error: '신청 취소에 실패했습니다.' }

  revalidatePath(`/club/${clubId}`)
  return { success: true }
}

// ── 운영진: 신청 목록 조회 ─────────────────────────────────
export async function getJoinRequestsAction(
  clubId: string,
): Promise<JoinRequestRow[]> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return []

  // 운영진 권한 확인
  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership || !['owner', 'manager'].includes(membership.role)) return []

  const { data } = await supabase
    .from('join_requests')
    .select(`
      id, club_id, user_id, status, created_at,
      requester:user_id ( name )
    `)
    .eq('club_id', clubId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    club_id: row.club_id,
    user_id: row.user_id,
    status: row.status as JoinRequestStatus,
    created_at: row.created_at,
    requester_name: row.requester?.name ?? null,
  }))
}

// ── 운영진: 신청 승인 ─────────────────────────────────────
export async function approveJoinRequestAction(
  clubId: string,
  requestId: string,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  // 운영진 권한 확인
  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return { error: '운영진만 가입을 승인할 수 있습니다.' }
  }

  // user_id를 클라가 아닌 DB의 신청 row에서 직접 조회 (IDOR 방어)
  const { data: requestRow } = await supabase
    .from('join_requests')
    .select('user_id, status')
    .eq('id', requestId)
    .eq('club_id', clubId)
    .maybeSingle()

  if (!requestRow) return { error: '유효하지 않은 신청입니다.' }
  if (requestRow.status !== 'pending') {
    return { error: '이미 처리된 신청입니다.' }
  }

  // 트랜잭션처럼: 멤버 추가 + 신청 상태 업데이트
  const { error: memberError } = await supabase
    .from('club_members')
    .insert({
      club_id: clubId,
      user_id: requestRow.user_id,
      role: 'member',
    })

  if (memberError && memberError.code !== '23505') {
    // 23505 = unique violation (이미 멤버인 경우 — 그래도 approved로 처리)
    return { error: '멤버 추가에 실패했습니다.' }
  }

  await supabase
    .from('join_requests')
    .update({ status: 'approved' })
    .eq('id', requestId)
    .eq('club_id', clubId)

  revalidatePath(`/club/${clubId}/join-requests`)
  revalidatePath(`/club/${clubId}`)
  return { success: true }
}

// ── 운영진: 신청 거절 ─────────────────────────────────────
export async function rejectJoinRequestAction(
  clubId: string,
  requestId: string,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return { error: '운영진만 거절할 수 있습니다.' }
  }

  const { error } = await supabase
    .from('join_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .eq('club_id', clubId)

  if (error) return { error: '거절 처리에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/join-requests`)
  return { success: true }
}
