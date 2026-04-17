'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'

// ── 멤버 역할 변경 (owner 전용) ──────────────────────────
export async function updateMemberRoleAction(
  memberId: string,
  clubId: string,
  newRole: 'manager' | 'member'
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
  if (!myMembership || myMembership.role !== 'owner') return { error: '권한이 없습니다.' }

  const { error } = await supabase
    .from('club_members')
    .update({ role: newRole })
    .eq('id', memberId)
  if (error) return { error: '역할 변경에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/members`)
  revalidatePath(`/club/${clubId}/view`)
  return { success: true }
}

// ── 실력 점수 변경 (owner/manager 가능) ─────────────────
export async function updateSkillScoreAction(
  memberId: string,
  clubId: string,
  skillScore: number
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
  if (!myMembership || !['owner', 'manager'].includes(myMembership.role))
    return { error: '권한이 없습니다.' }

  const { error } = await supabase
    .from('club_members')
    .update({ skill_score: skillScore })
    .eq('id', memberId)
  if (error) return { error: '실력 점수 변경에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/members`)
  return { success: true }
}

// ── 멤버 강퇴 (owner 전용, Q3: removed_at 소프트 삭제) ───
export async function removeMemberAction(memberId: string, clubId: string) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: myMembership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()
  if (!myMembership || myMembership.role !== 'owner')
    return { error: '운영자만 멤버를 내보낼 수 있습니다.' }

  // 대상 멤버 확인
  const { data: target } = await supabase
    .from('club_members')
    .select('role')
    .eq('id', memberId)
    .single()
  if (!target) return { error: '멤버를 찾을 수 없습니다.' }
  if (target.role === 'owner') return { error: '운영자는 내보낼 수 없습니다.' }

  // removed_at 소프트 삭제 (과거 경기 기록 보존 — Q3 결정)
  const { error } = await supabase
    .from('club_members')
    .update({ removed_at: new Date().toISOString() })
    .eq('id', memberId)
  if (error) return { error: '멤버 내보내기에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/members`)
  revalidatePath(`/club/${clubId}/view`)
  return { success: true }
}

// ── 초대코드 재발급 (owner 전용) ─────────────────────────
export async function regenerateInviteCodeAction(clubId: string) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: myMembership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()
  if (!myMembership || myMembership.role !== 'owner')
    return { error: '운영자만 초대코드를 재발급할 수 있습니다.' }

  // 8자 alphanumeric 코드 생성 (UNIQUE 충돌 시 최대 5회 재시도)
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let newCode = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    newCode = Array.from({ length: 8 }, () =>
      CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join('')

    const { data: existing } = await supabase
      .from('clubs')
      .select('id')
      .eq('invite_code', newCode)
      .maybeSingle()
    if (!existing) break  // 충돌 없으면 확정
    if (attempt === 4) return { error: '코드 생성에 실패했습니다. 다시 시도해주세요.' }
  }

  const { error } = await supabase
    .from('clubs')
    .update({ invite_code: newCode })
    .eq('id', clubId)
  if (error) return { error: '초대코드 재발급에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/settings`)
  revalidatePath(`/club/${clubId}/view`)
  return { success: true, invite_code: newCode }
}
