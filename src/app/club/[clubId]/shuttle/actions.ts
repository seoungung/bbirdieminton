'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'
import type {
  ShuttleSubmission,
  ShuttlePoolLog,
  SubmissionWithMember,
} from '@/types/club'

/**
 * 운영진(owner/manager) 권한 검증 헬퍼
 * 모든 셔틀콕 액션은 운영진 전용 — 회원이 직접 입력하지 않음
 */
async function ensureManager(clubId: string) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' as const }

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return { error: '운영진(클럽장·매니저)만 셔틀콕을 관리할 수 있습니다.' as const }
  }

  return { supabase, clubUserId }
}

// ─────────────────────────────────────────────────────────────
// 조회
// ─────────────────────────────────────────────────────────────

/**
 * 세션별 출석자 + 제출 현황 조회
 * 출석자 row 가 있어도 submission 이 없으면 빈 row 반환 (운영진이 채워가며 입력)
 */
export async function getSessionSubmissionsAction(
  clubId: string,
  sessionId: string,
): Promise<{ submissions?: SubmissionWithMember[]; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  // 멤버십 확인
  const { data: membership } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()
  if (!membership) return { error: '권한이 없습니다.' }

  // 세션 + 출석자 조회 (출석자만)
  const { data: attendances, error: attErr } = await supabase
    .from('attendances')
    .select(`
      member_id,
      member:club_members!inner (
        id, role, skill_score,
        user:users!inner ( name )
      )
    `)
    .eq('session_id', sessionId)
    .eq('status', 'present')

  if (attErr) return { error: '출석자 조회 실패: ' + attErr.message }

  // 기존 제출 row 조회
  const { data: existing } = await supabase
    .from('session_shuttle_submissions')
    .select('*')
    .eq('session_id', sessionId)

  const subMap = new Map<string, ShuttleSubmission>()
  for (const s of existing ?? []) subMap.set(s.member_id, s as ShuttleSubmission)

  // 출석자별 결합 (submission 없으면 빈 row)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submissions: SubmissionWithMember[] = (attendances ?? []).map((a: any) => {
    const existing = subMap.get(a.member_id)
    return {
      id: existing?.id ?? '',
      club_id: clubId,
      session_id: sessionId,
      member_id: a.member_id,
      required_count: existing?.required_count ?? 0,
      brought_count: existing?.brought_count ?? 0,
      paid_from_pool: existing?.paid_from_pool ?? 0,
      amount_owed: existing?.amount_owed ?? 0,
      amount_paid_at: existing?.amount_paid_at ?? null,
      created_at: existing?.created_at ?? '',
      updated_at: existing?.updated_at ?? '',
      memberName: a.member?.user?.name ?? '?',
      memberRole: a.member?.role ?? 'member',
      skillScore: a.member?.skill_score ?? 0,
    }
  })

  return { submissions }
}

/** 클럽 미납자 리스트 (amount_owed > 0 AND amount_paid_at IS NULL) */
export async function getUnpaidShuttleAction(
  clubId: string,
): Promise<{
  rows?: Array<{
    submissionId: string
    memberId: string
    memberName: string
    sessionDate: string
    paidFromPool: number
    amountOwed: number
  }>
  error?: string
}> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()
  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return { error: '운영진만 미납 현황을 볼 수 있습니다.' }
  }

  const { data, error } = await supabase
    .from('session_shuttle_submissions')
    .select(`
      id, member_id, paid_from_pool, amount_owed,
      session:sessions!inner ( session_date ),
      member:club_members!inner ( user:users!inner ( name ) )
    `)
    .eq('club_id', clubId)
    .gt('amount_owed', 0)
    .is('amount_paid_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return { error: '조회 실패: ' + error.message }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []).map((r: any) => ({
    submissionId: r.id,
    memberId: r.member_id,
    memberName: r.member?.user?.name ?? '?',
    sessionDate: r.session?.session_date ?? '',
    paidFromPool: r.paid_from_pool,
    amountOwed: r.amount_owed,
  }))

  return { rows }
}

// ─────────────────────────────────────────────────────────────
// 입력 (운영진)
// ─────────────────────────────────────────────────────────────

/**
 * 출석자별 셔틀콕 제출 입력 (upsert)
 * paid_from_pool > 이전 값이면 풀에서 차감 + 청구 기록
 */
export async function upsertSubmissionAction(input: {
  clubId: string
  sessionId: string
  memberId: string
  requiredCount: number
  broughtCount: number
  paidFromPool: number
}): Promise<{ success?: true; error?: string; warning?: string }> {
  const guard = await ensureManager(input.clubId)
  if ('error' in guard) return { error: guard.error }
  const { supabase, clubUserId } = guard

  // 클럽 단가 조회 (amount_owed 자동 계산)
  const { data: club } = await supabase
    .from('clubs')
    .select('shuttle_default_price, shuttle_pool_count')
    .eq('id', input.clubId)
    .maybeSingle()
  if (!club) return { error: '클럽 정보를 찾을 수 없습니다.' }

  const unitPrice = club.shuttle_default_price ?? 2500
  const newAmountOwed = input.paidFromPool * unitPrice

  // 기존 row 조회 (풀 차감 차이 계산용)
  const { data: existing } = await supabase
    .from('session_shuttle_submissions')
    .select('id, paid_from_pool, amount_paid_at')
    .eq('session_id', input.sessionId)
    .eq('member_id', input.memberId)
    .maybeSingle()

  const previousPool = existing?.paid_from_pool ?? 0
  const poolDelta = input.paidFromPool - previousPool

  // 풀 잔량 부족 경고 (차단은 하지 않음 — 사용자 결정대로)
  let warning: string | undefined
  if (poolDelta > 0 && club.shuttle_pool_count < poolDelta) {
    warning = `여유분 풀이 부족합니다 (현재 ${club.shuttle_pool_count}개, 필요 ${poolDelta}개). 잔량은 0으로 처리됩니다.`
  }

  // upsert
  const { data: upserted, error: upErr } = await supabase
    .from('session_shuttle_submissions')
    .upsert(
      {
        club_id: input.clubId,
        session_id: input.sessionId,
        member_id: input.memberId,
        required_count: input.requiredCount,
        brought_count: input.broughtCount,
        paid_from_pool: input.paidFromPool,
        amount_owed: newAmountOwed,
        // amount_paid_at: 미납 상태 유지 (이미 결제된 경우 보존)
        amount_paid_at: existing?.amount_paid_at ?? null,
      },
      { onConflict: 'session_id,member_id' },
    )
    .select('id')
    .single()

  if (upErr || !upserted) return { error: '저장 실패: ' + (upErr?.message ?? '') }

  // 풀 차이만큼 로그 INSERT (트리거가 clubs.shuttle_pool_count 자동 갱신)
  if (poolDelta !== 0) {
    await supabase.from('shuttle_pool_log').insert({
      club_id: input.clubId,
      delta: -poolDelta, // 이체출고 → 음수
      reason: 'pool_payment',
      related_submission_id: upserted.id,
      amount_paid: poolDelta * unitPrice,
      created_by: clubUserId,
      note: poolDelta > 0 ? '풀 이체출고' : '풀 이체 환원',
    })
  }

  revalidatePath(`/club/${input.clubId}/shuttle`)
  revalidatePath(`/club/${input.clubId}/gameboard`)
  return { success: true, warning }
}

/** 미납 → 납부 완료 표시 (회원이 동호회에 결제 후 운영진이 체크) */
export async function markSubmissionPaidAction(
  clubId: string,
  submissionId: string,
): Promise<{ success?: true; error?: string }> {
  const guard = await ensureManager(clubId)
  if ('error' in guard) return { error: guard.error }
  const { supabase } = guard

  const { error } = await supabase
    .from('session_shuttle_submissions')
    .update({ amount_paid_at: new Date().toISOString() })
    .eq('id', submissionId)
    .eq('club_id', clubId)

  if (error) return { error: '저장 실패: ' + error.message }
  revalidatePath(`/club/${clubId}/shuttle`)
  return { success: true }
}

// ─────────────────────────────────────────────────────────────
// 풀 관리
// ─────────────────────────────────────────────────────────────

/** 풀 충전 (운영진이 셔틀콕 사다 넣음) */
export async function replenishPoolAction(input: {
  clubId: string
  count: number
  amountPaid?: number
  note?: string
}): Promise<{ success?: true; error?: string }> {
  const guard = await ensureManager(input.clubId)
  if ('error' in guard) return { error: guard.error }
  const { supabase, clubUserId } = guard

  if (input.count <= 0) return { error: '충전 개수는 1개 이상이어야 합니다.' }
  if (input.count > 10000) return { error: '한 번에 충전할 수 있는 개수가 너무 큽니다.' }

  const { error } = await supabase.from('shuttle_pool_log').insert({
    club_id: input.clubId,
    delta: input.count,
    reason: 'replenish',
    amount_paid: input.amountPaid ?? null,
    created_by: clubUserId,
    note: input.note?.trim() || null,
  })

  if (error) return { error: '저장 실패: ' + error.message }
  revalidatePath(`/club/${input.clubId}/shuttle`)
  return { success: true }
}

/** 풀 수동 조정 (재고 조사 등 +/- 모두 가능) */
export async function adjustPoolAction(input: {
  clubId: string
  delta: number
  note: string
}): Promise<{ success?: true; error?: string }> {
  const guard = await ensureManager(input.clubId)
  if ('error' in guard) return { error: guard.error }
  const { supabase, clubUserId } = guard

  if (input.delta === 0) return { error: '0이 아닌 값을 입력하세요.' }
  if (Math.abs(input.delta) > 10000) return { error: '조정값이 너무 큽니다.' }
  if (!input.note.trim()) return { error: '수동 조정 사유를 적어주세요.' }

  const { error } = await supabase.from('shuttle_pool_log').insert({
    club_id: input.clubId,
    delta: input.delta,
    reason: 'manual_adjust',
    created_by: clubUserId,
    note: input.note.trim(),
  })

  if (error) return { error: '저장 실패: ' + error.message }
  revalidatePath(`/club/${input.clubId}/shuttle`)
  return { success: true }
}

/** 풀 변동 로그 조회 (감사 추적) */
export async function getPoolLogAction(
  clubId: string,
  limit = 50,
): Promise<{ rows?: ShuttlePoolLog[]; error?: string }> {
  const guard = await ensureManager(clubId)
  if ('error' in guard) return { error: guard.error }
  const { supabase } = guard

  const { data, error } = await supabase
    .from('shuttle_pool_log')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { error: '조회 실패: ' + error.message }
  return { rows: (data ?? []) as ShuttlePoolLog[] }
}

// ─────────────────────────────────────────────────────────────
// 클럽 셔틀콕 설정
// ─────────────────────────────────────────────────────────────

/** 클럽의 셔틀콕 기본 설정 변경 (평일/주말 개수 + 단가) */
export async function updateShuttleConfigAction(input: {
  clubId: string
  weekdayRequired: number
  weekendRequired: number
  unitPrice: number
}): Promise<{ success?: true; error?: string }> {
  const guard = await ensureManager(input.clubId)
  if ('error' in guard) return { error: guard.error }
  const { supabase } = guard

  if (input.weekdayRequired < 0 || input.weekdayRequired > 20)
    return { error: '평일 제출 개수는 0~20개 범위여야 합니다.' }
  if (input.weekendRequired < 0 || input.weekendRequired > 20)
    return { error: '주말 제출 개수는 0~20개 범위여야 합니다.' }
  if (input.unitPrice < 0 || input.unitPrice > 100000)
    return { error: '단가는 0~100,000원 범위여야 합니다.' }

  const { error } = await supabase
    .from('clubs')
    .update({
      shuttle_weekday_required: input.weekdayRequired,
      shuttle_weekend_required: input.weekendRequired,
      shuttle_default_price: input.unitPrice,
    })
    .eq('id', input.clubId)

  if (error) return { error: '저장 실패: ' + error.message }
  revalidatePath(`/club/${input.clubId}/settings`)
  revalidatePath(`/club/${input.clubId}/shuttle`)
  return { success: true }
}
