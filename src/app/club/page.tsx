import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'

/**
 * /club 진입점.
 * - 로그인 + users 테이블 row 있음 → /club/home 리다이렉트
 * - 그 외 → /club/login 리다이렉트
 */
export default async function ClubEntryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/club/login')

  const clubUserId = await getClubUserId(supabase)
  if (clubUserId) redirect('/club/home')

  // users 테이블에 row가 없는 경우 (첫 방문) → login에서 upsert 처리
  redirect('/club/login')
}
