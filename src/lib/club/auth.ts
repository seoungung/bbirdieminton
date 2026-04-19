import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * 로그인한 auth.user를 버디모아 users 테이블에 upsert.
 * - 소셜 로그인: 이름/프로필을 OAuth 메타데이터로 항상 최신화
 * - 익명 로그인: onboard 페이지에서 이미 닉네임을 저장했으므로 덮어쓰지 않음
 */
export async function ensureClubUser(supabase: SupabaseClient, authUser: User) {
  const isAnonymous = authUser.is_anonymous === true

  if (isAnonymous) {
    // 익명 유저: row가 없을 때만 기본값으로 생성 (닉네임 덮어쓰기 방지)
    await supabase.from('users').upsert(
      {
        birdieminton_user_id: authUser.id,
        name: '게스트',
      },
      { onConflict: 'birdieminton_user_id', ignoreDuplicates: true }
    )
    return
  }

  // 소셜 로그인: 최신 프로필로 업데이트
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
 *
 * @param user  이미 auth.getUser()를 호출한 경우 전달 — 중복 호출 방지.
 *              undefined/null 이면 내부에서 auth.getUser() 를 호출.
 */
export async function getClubUserId(
  supabase: SupabaseClient,
  user?: User | null
): Promise<string | null> {
  const authUser =
    user !== undefined ? user : (await supabase.auth.getUser()).data.user
  if (!authUser) return null

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('birdieminton_user_id', authUser.id)
    .single()

  return data?.id ?? null
}
