'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'
import type { MemberRow, DuesRow, ImportResult } from '@/lib/club/import/types'

/**
 * 운영진 권한 검증 — 공통 헬퍼
 */
async function assertManager(clubId: string): Promise<{ membershipId: string } | { error: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('id, role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()

  if (!membership) return { error: '모임 멤버가 아닙니다' }
  if (!['owner', 'manager'].includes(membership.role)) {
    return { error: '운영진만 임포트 할 수 있습니다' }
  }
  return { membershipId: membership.id }
}

/**
 * 회원 임포트 — Excel 에서 파싱된 유효 행 배열을 받아 DB 반영
 *
 * 동작:
 * 1. 전화번호로 기존 유저 매칭 → 이미 클럽 멤버면 skip, 아니면 club_members 추가
 * 2. 매칭 안 되면 placeholder 유저 생성 (birdieminton_user_id = NULL, is_placeholder = true)
 * 3. 이후 실제 가입 시 merge_placeholder_user_by_phone RPC 로 병합
 */
export async function importMembersAction(
  clubId: string,
  rows: MemberRow[]
): Promise<ImportResult> {
  // 데모 모임: DB 쓰기 없이 성공
  if (clubId.startsWith('demo-')) {
    return { success: true, added: rows.length, skipped: 0, failed: 0, message: '체험 모드: 실제 저장 안 됨' }
  }

  const auth = await assertManager(clubId)
  if ('error' in auth) {
    return { success: false, added: 0, skipped: 0, failed: 0, errorDetail: auth.error }
  }

  const admin = createAdminClient()

  // 클럽 존재 확인
  const { data: club } = await admin.from('clubs').select('id').eq('id', clubId).single()
  if (!club) return { success: false, added: 0, skipped: 0, failed: 0, errorDetail: '모임을 찾을 수 없습니다' }

  let added = 0
  let skipped = 0
  let failed = 0

  for (const row of rows) {
    try {
      if (!row.name) { failed++; continue }

      // 1. 전화번호 매칭: 기존 유저 or placeholder 있으면 재사용
      let userId: string | null = null
      if (row.phone) {
        const { data: existing } = await admin
          .from('users')
          .select('id')
          .eq('phone', row.phone)
          .maybeSingle()
        if (existing) userId = existing.id
      }

      // 2. 매칭 안 되면 placeholder 유저 생성
      if (!userId) {
        const { data: newUser, error: userErr } = await admin
          .from('users')
          .insert({
            name: row.name,
            phone: row.phone ?? null,
            birdieminton_user_id: null,
            is_placeholder: true,
            quiz_level: row.quiz_level ?? null,
          })
          .select('id')
          .single()
        if (userErr || !newUser) { failed++; continue }
        userId = newUser.id
      }

      // 3. 이미 해당 클럽의 멤버인지 체크
      const { data: existingMember } = await admin
        .from('club_members')
        .select('id')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .maybeSingle()

      if (existingMember) { skipped++; continue }

      // 4. club_members 에 추가
      const { error: memErr } = await admin
        .from('club_members')
        .insert({
          club_id: clubId,
          user_id: userId,
          role: row.role ?? 'member',
          skill_score: row.skill_score ?? 1000,
          joined_at: row.joined_at ?? new Date().toISOString(),
        })

      if (memErr) { failed++; continue }
      added++
    } catch {
      failed++
    }
  }

  // 임포트 로그 기록
  await admin.from('import_logs').insert({
    club_id: clubId,
    imported_by: auth.membershipId,
    import_type: 'members',
    rows_added: added,
    rows_skipped: skipped,
    rows_failed: failed,
  })

  revalidatePath(`/club/${clubId}/members`)
  revalidatePath(`/club/${clubId}/view`)
  revalidatePath(`/club/${clubId}/import`)

  return {
    success: true,
    added,
    skipped,
    failed,
    message: `${added}명 추가 / ${skipped}명 이미 존재 / ${failed}건 실패`,
  }
}

/**
 * 회비 이력 임포트 — 이름으로 기존 멤버 매칭
 */
export async function importDuesAction(
  clubId: string,
  rows: DuesRow[]
): Promise<ImportResult> {
  if (clubId.startsWith('demo-')) {
    return { success: true, added: rows.length, skipped: 0, failed: 0, message: '체험 모드: 실제 저장 안 됨' }
  }

  const auth = await assertManager(clubId)
  if ('error' in auth) {
    return { success: false, added: 0, skipped: 0, failed: 0, errorDetail: auth.error }
  }

  const admin = createAdminClient()

  // 클럽 멤버 전원 조회 (이름 기반 매칭용)
  const { data: members } = await admin
    .from('club_members')
    .select('id, user:users(name)')
    .eq('club_id', clubId)
    .is('removed_at', null)

  if (!members) return { success: false, added: 0, skipped: 0, failed: 0, errorDetail: '멤버 조회 실패' }

  // 이름 → member.id 맵 (동명이인 처리: 첫 매칭 사용, 경고로 처리)
  const nameMap = new Map<string, string>()
  for (const m of members as unknown as Array<{ id: string; user: { name: string } | null }>) {
    const nm = m.user?.name
    if (nm && !nameMap.has(nm)) nameMap.set(nm, m.id)
  }

  let added = 0
  let skipped = 0
  let failed = 0

  for (const row of rows) {
    try {
      const memberId = nameMap.get(row.name)
      if (!memberId) { failed++; continue }  // 매칭 안 됨

      // 동일 (club_id, member_id, year, month) 이 이미 있으면 skip
      const { data: existing } = await admin
        .from('dues')
        .select('id')
        .eq('club_id', clubId)
        .eq('member_id', memberId)
        .eq('year', row.year)
        .eq('month', row.month)
        .maybeSingle()

      if (existing) { skipped++; continue }

      const { error: insErr } = await admin
        .from('dues')
        .insert({
          club_id: clubId,
          member_id: memberId,
          year: row.year,
          month: row.month,
          amount: row.amount,
          paid: row.paid,
          paid_at: row.paid && row.paid_at ? row.paid_at : null,
          note: row.note ?? null,
        })

      if (insErr) { failed++; continue }
      added++
    } catch {
      failed++
    }
  }

  await admin.from('import_logs').insert({
    club_id: clubId,
    imported_by: auth.membershipId,
    import_type: 'dues',
    rows_added: added,
    rows_skipped: skipped,
    rows_failed: failed,
  })

  revalidatePath(`/club/${clubId}/finance`)
  revalidatePath(`/club/${clubId}/import`)

  return {
    success: true,
    added,
    skipped,
    failed,
    message: `${added}건 추가 / ${skipped}건 중복 / ${failed}건 매칭실패`,
  }
}
