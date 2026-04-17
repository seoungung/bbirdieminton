'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function joinClubAction(formData: FormData) {
  const code = (formData.get('invite_code') as string).trim()
  if (code.length !== 8) return { error: '8자리 코드를 입력해주세요.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data, error } = await supabase
    .rpc('join_club_by_invite_code', { p_invite_code: code })

  if (error) {
    console.error('join_club_by_invite_code error:', error)
    return { error: '모임 참여에 실패했습니다. 다시 시도해주세요.' }
  }

  const result = data as { club_id?: string; error?: string }
  if (result?.error) return { error: result.error }
  if (!result?.club_id) return { error: '모임 참여에 실패했습니다.' }

  redirect(`/club/${result.club_id}`)
}
