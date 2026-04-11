'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { redirect } from 'next/navigation'

export async function joinClubAction(formData: FormData) {
  const code = (formData.get('invite_code') as string).trim().toLowerCase()
  if (code.length !== 8) return { error: '8자리 코드를 입력해주세요.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '사용자 정보를 찾을 수 없습니다.' }

  // 초대코드로 모임 조회
  const { data: club } = await supabase
    .from('clubs')
    .select('id')
    .eq('invite_code', code)
    .single()

  if (!club) return { error: '올바르지 않은 초대코드예요. 다시 확인해주세요.' }

  // 이미 가입 여부 확인
  const { data: existing } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', club.id)
    .eq('user_id', clubUserId)
    .single()

  if (existing) redirect(`/club/${club.id}`)

  // 멤버로 추가
  const { error: joinErr } = await supabase
    .from('club_members')
    .insert({ club_id: club.id, user_id: clubUserId, role: 'member' })

  if (joinErr) {
    console.error('join error:', joinErr)
    return { error: '모임 참여에 실패했습니다. 다시 시도해주세요.' }
  }

  redirect(`/club/${club.id}`)
}
