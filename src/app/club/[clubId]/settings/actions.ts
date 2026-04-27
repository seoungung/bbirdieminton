'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'
import {
  validateClubName,
  validateClubDescription,
  validateCourtCount,
} from '@/lib/club/validation'

// ── 모임 프로필 저장 ─────────────────────────────────────
export async function updateClubProfileAction(
  clubId: string,
  data: {
    name: string
    description?: string
    location?: string
    activity_place?: string
    thumbnail_color?: string
    category?: string
    court_count?: number
  }
) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()
  if (!membership || !['owner', 'manager'].includes(membership.role))
    return { error: '권한이 없습니다.' }

  const nameErr = validateClubName(data.name)
  if (nameErr) return { error: nameErr }

  if (data.description) {
    const descErr = validateClubDescription(data.description)
    if (descErr) return { error: descErr }
  }

  if (data.court_count !== undefined) {
    const courtErr = validateCourtCount(data.court_count)
    if (courtErr) return { error: courtErr }
  }

  const { error } = await supabase
    .from('clubs')
    .update({
      name:             data.name.trim(),
      description:      data.description?.trim()    || null,
      location:         data.location?.trim()       || null,
      activity_place:   data.activity_place?.trim() || null,
      thumbnail_color:  data.thumbnail_color,
      category:         data.category,
      court_count:      data.court_count,
    })
    .eq('id', clubId)

  if (error) return { error: '저장에 실패했습니다.' }

  revalidatePath(`/club/${clubId}`)
  revalidatePath(`/club/${clubId}/settings`)
  return { success: true }
}

// ── 게임 규칙: 종료 점수 (21/25) ───────────────────────────
export async function updateMatchPointTargetAction(
  clubId: string,
  target: 21 | 25,
) {
  if (target !== 21 && target !== 25) {
    return { error: '종료 점수는 21 또는 25만 가능합니다.' }
  }
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()
  if (!membership || !['owner', 'manager'].includes(membership.role))
    return { error: '운영진(클럽장·매니저)만 변경할 수 있습니다.' }

  const { error } = await supabase
    .from('clubs')
    .update({ match_point_target: target })
    .eq('id', clubId)

  if (error) return { error: '저장 실패: ' + error.message }
  revalidatePath(`/club/${clubId}/settings`)
  revalidatePath(`/club/${clubId}/gameboard`)
  return { success: true }
}

// ── 모임 삭제 (owner 전용) ─────────────────────────────────
// SettingsClient에서 직접 RPC 호출하던 것을 Server Action으로 이전.
// 표준 사용자 경로의 권한 검증을 추가 (RPC 자체 가드는 별도 마이그레이션에서).
export async function deleteClubAction(clubId: string) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  const { data: club } = await supabase
    .from('clubs')
    .select('owner_id')
    .eq('id', clubId)
    .maybeSingle()

  if (!club) return { error: '모임을 찾을 수 없습니다.' }
  if (club.owner_id !== clubUserId) {
    return { error: '모임 삭제는 클럽장만 가능합니다.' }
  }

  const { error } = await supabase.rpc('delete_club_cascade', {
    p_club_id: clubId,
  })
  if (error) return { error: '모임 삭제에 실패했습니다.' }

  revalidatePath('/club/home')
  return { success: true }
}

// ── 모임 나가기 (멤버 본인) ─────────────────────────────────
export async function leaveClubAction(clubId: string) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  // owner는 모임 나가기 대신 모임 삭제 또는 owner 이관 필요
  const { data: club } = await supabase
    .from('clubs')
    .select('owner_id')
    .eq('id', clubId)
    .maybeSingle()
  if (club?.owner_id === clubUserId) {
    return {
      error: '클럽장은 모임을 나갈 수 없어요. 다른 멤버에게 클럽장을 이관하거나 모임을 삭제해 주세요.',
    }
  }

  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
  if (error) return { error: '모임 나가기에 실패했습니다.' }

  revalidatePath('/club/home')
  return { success: true }
}
