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

  revalidatePath(`/club/${clubId}/view`)
  revalidatePath(`/club/${clubId}/settings`)
  return { success: true }
}
