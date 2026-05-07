'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'
import {
  validateClubName,
  validateClubDescription,
  validateCourtCount,
} from '@/lib/club/validation'
import { sanitizeClubTags } from '@/lib/club/tags'
import type { ClubFAQ } from '@/types/club'

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

// ── Phase A — 모임 프로필 통합 저장 ────────────────────
// 기본 정보(이름/카테고리/지역/활동장소/소개) + 추가 정보(태그/회비/일정/운영자 소개/사진/FAQ) 일괄 update.
// SettingsProfileExtras 의 단일 저장 흐름을 위해 통합.
// 필드 단위가 아니라 폼 전체 저장 (단순화).
// RLS 환경에서 컬럼 미존재 시 update 실패 → 에러 메시지로 안내.
export async function updateClubProfileExtrasAction(
  clubId: string,
  data: {
    // 기본 정보
    name?: string
    description?: string | null
    location?: string | null
    activity_place?: string | null
    category?: string
    thumbnail_url?: string | null
    // 추가 정보
    tags?: string[]
    fee_monthly?: number | null
    fee_per_session?: number | null
    fee_note?: string | null
    owner_bio?: string | null
    photo_urls?: string[]
    schedule_summary?: string | null
    faqs?: ClubFAQ[]
    contact_url?: string | null
  },
) {
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

  const patch: Record<string, unknown> = {}

  // ── 기본 정보 ──
  if (data.name !== undefined) {
    const nameErr = validateClubName(data.name)
    if (nameErr) return { error: nameErr }
    patch.name = data.name.trim()
  }
  if (data.description !== undefined) {
    if (data.description) {
      const descErr = validateClubDescription(data.description)
      if (descErr) return { error: descErr }
    }
    patch.description = data.description?.trim() || null
  }
  if (data.location !== undefined) {
    patch.location = data.location?.trim() || null
  }
  if (data.activity_place !== undefined) {
    patch.activity_place = data.activity_place?.trim() || null
  }
  if (data.category !== undefined) {
    patch.category = data.category
  }
  if (data.thumbnail_url !== undefined) {
    patch.thumbnail_url = data.thumbnail_url || null
  }

  if (data.tags !== undefined) {
    patch.tags = sanitizeClubTags(data.tags)
  }
  if (data.fee_monthly !== undefined) {
    patch.fee_monthly =
      data.fee_monthly === null
        ? null
        : Math.max(0, Math.floor(Number(data.fee_monthly) || 0)) || null
  }
  if (data.fee_per_session !== undefined) {
    patch.fee_per_session =
      data.fee_per_session === null
        ? null
        : Math.max(0, Math.floor(Number(data.fee_per_session) || 0)) || null
  }
  if (data.fee_note !== undefined) {
    const t = (data.fee_note ?? '').trim()
    patch.fee_note = t || null
  }
  if (data.owner_bio !== undefined) {
    const t = (data.owner_bio ?? '').trim()
    patch.owner_bio = t.slice(0, 200) || null
  }
  if (data.schedule_summary !== undefined) {
    const t = (data.schedule_summary ?? '').trim()
    patch.schedule_summary = t.slice(0, 120) || null
  }
  if (data.photo_urls !== undefined) {
    patch.photo_urls = (data.photo_urls ?? [])
      .filter((u) => typeof u === 'string' && u.length > 0)
      .slice(0, 6)
  }
  if (data.faqs !== undefined) {
    patch.faqs = (data.faqs ?? [])
      .filter(
        (f): f is ClubFAQ =>
          !!f &&
          typeof f.question === 'string' &&
          typeof f.answer === 'string' &&
          f.question.trim().length > 0 &&
          f.answer.trim().length > 0,
      )
      .slice(0, 6)
      .map((f) => ({
        question: f.question.trim().slice(0, 120),
        answer: f.answer.trim().slice(0, 500),
      }))
  }
  if (data.contact_url !== undefined) {
    const t = (data.contact_url ?? '').trim()
    /* 빈 값 → null. 길이 200 초과는 자르지 않고 거부 — UX 적으로 잘못된 입력 방지 */
    if (t.length === 0) {
      patch.contact_url = null
    } else if (t.length > 200) {
      return { error: '연락처 입력은 200자 이하여야 해요.' }
    } else {
      patch.contact_url = t
    }
  }

  if (Object.keys(patch).length === 0) {
    return { success: true }
  }

  const { error } = await supabase.from('clubs').update(patch).eq('id', clubId)
  if (error) {
    return {
      error:
        '저장에 실패했습니다. 마이그레이션이 적용되었는지 확인하세요. (' +
        error.message +
        ')',
    }
  }

  revalidatePath(`/clubs/${clubId}`)
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

  revalidatePath('/clubs')
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

  revalidatePath('/clubs')
  return { success: true }
}
