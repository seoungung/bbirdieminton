'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClubUserId } from '@/lib/club/auth'
import { redirect } from 'next/navigation'

export async function createClubAction(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const courtCount = parseInt(formData.get('court_count') as string, 10) || 2

  if (!name) return { error: '모임 이름을 입력해주세요.' }

  // 인증 확인은 일반 클라이언트로
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '사용자 정보를 찾을 수 없습니다.' }

  // INSERT는 service role 클라이언트로 (RLS 우회)
  const admin = createAdminClient()

  // 1. clubs 생성
  const { data: club, error: clubErr } = await admin
    .from('clubs')
    .insert({ owner_id: clubUserId, name, description, court_count: courtCount })
    .select('id')
    .single()

  if (clubErr || !club) {
    console.error('clubs insert error:', clubErr)
    return { error: '모임 생성에 실패했습니다. 다시 시도해주세요.' }
  }

  // 2. 생성자를 owner로 club_members에 추가
  const { error: memberErr } = await admin
    .from('club_members')
    .insert({ club_id: club.id, user_id: clubUserId, role: 'owner' })

  if (memberErr) {
    console.error('club_members insert error:', memberErr)
    return { error: '멤버 등록에 실패했습니다.' }
  }

  redirect(`/club/${club.id}`)
}
