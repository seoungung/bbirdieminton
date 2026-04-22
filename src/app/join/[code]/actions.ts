'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function joinByInviteCode(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) return { error: '로그인이 필요합니다.' }

  const { data, error } = await supabase
    .rpc('join_club_by_invite_code', { p_invite_code: code })

  if (error) return { error: '모임 참여에 실패했습니다. 다시 시도해주세요.' }

  const result = data as { club_id?: string; error?: string }
  if (result?.error) return { error: result.error }
  if (!result?.club_id) return { error: '모임을 찾을 수 없습니다.' }

  redirect(`/club/${result.club_id}`)
}
