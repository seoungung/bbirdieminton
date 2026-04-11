import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * 로그인한 auth.user를 버디모아 users 테이블에 upsert.
 * 첫 로그인 시 자동 생성, 이후에는 이름/프로필 최신화.
 */
export async function ensureClubUser(supabase: SupabaseClient, authUser: User) {
  const { error } = await supabase.from('users').upsert(
    {
      birdieminton_user_id: authUser.id,
      name:
        authUser.user_metadata?.full_name ??
        authUser.user_metadata?.name ??
        authUser.email?.split('@')[0] ??
        '이름없음',
      profile_img: authUser.user_metadata?.avatar_url ?? null,
    },
    { onConflict: 'birdieminton_user_id' }
  )
  if (error) throw error
}

/**
 * auth.uid() 로 버디모아 users.id (uuid) 조회.
 * RLS 정책상 본인 row만 반환됨.
 */
export async function getClubUserId(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('birdieminton_user_id', user.id)
    .single()

  return data?.id ?? null
}
