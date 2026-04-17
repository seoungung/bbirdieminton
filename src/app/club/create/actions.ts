'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createClubAction(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const location = (formData.get('location') as string | null)?.trim() || null
  const activityPlace = (formData.get('activity_place') as string | null)?.trim() || null
  const category = (formData.get('category') as string | null) || '동호회'
  const thumbnailColor = (formData.get('thumbnail_color') as string | null) || '#beff00'
  const thumbnailUrl = (formData.get('thumbnail_url') as string | null) || null
  const courtCount = Math.min(20, Math.max(1, parseInt((formData.get('court_count') as string | null) ?? '2', 10) || 2))

  if (!name) return { error: '모임 이름을 입력해주세요.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data, error } = await supabase
    .rpc('create_club', {
      p_name:            name,
      p_description:     description,
      p_location:        location,
      p_activity_place:  activityPlace,
      p_category:        category,
      p_thumbnail_color: thumbnailColor,
      p_thumbnail_url:   thumbnailUrl,
      p_court_count:     courtCount,
    })

  if (error) {
    console.error('create_club RPC error:', error)
    return { error: '모임 생성에 실패했습니다. 다시 시도해주세요.' }
  }

  const result = data as { club_id?: string; error?: string }
  if (result?.error) return { error: result.error }
  if (!result?.club_id) return { error: '모임 생성에 실패했습니다.' }

  redirect(`/club/${result.club_id}`)
}
