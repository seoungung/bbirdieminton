import 'server-only'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient, getAuthUser } from '@/lib/supabase/server'

/**
 * 시스템 마스터(슈퍼어드민) 여부를 확인.
 *
 * users.is_master 컬럼은 RLS 적용 대상이지만, 본인 row 는 본인이 읽을 수 있다는
 * 전제 하에 동작. 만약 정책상 막혀있다면 이 함수는 false 를 반환할 수 있으므로
 * 호출 측은 false → 권한 없음으로 처리해야 한다.
 *
 * @param supabase  서버 컴포넌트/액션의 createClient() 인스턴스
 * @param user      이미 getUser() 호출한 결과가 있다면 전달 (중복 호출 방지)
 */
export async function isMaster(
  supabase: SupabaseClient,
  user?: User | null
): Promise<boolean> {
  const authUser =
    user !== undefined ? user : (await supabase.auth.getUser()).data.user
  if (!authUser) return false

  const { data } = await supabase
    .from('users')
    .select('is_master')
    .eq('birdieminton_user_id', authUser.id)
    .maybeSingle()

  return data?.is_master === true
}

export type AssertMasterResult =
  | { userId: string }
  | { error: 'unauthenticated' | 'not_master' }

/**
 * 서버 컴포넌트/액션 진입 시 마스터 권한 검증.
 *
 * 사용 패턴:
 *   const guard = await assertMaster()
 *   if ('error' in guard) notFound()       // /admin 페이지에서는 존재 자체를 숨김
 *   const admin = createAdminClient()       // 이후 service-role 작업
 *
 * 반환:
 *   - { userId } : users.id (auth.uid 가 아니라 birdieminton users 테이블 PK)
 *   - { error: 'unauthenticated' } : 비로그인
 *   - { error: 'not_master' } : 로그인 했으나 마스터 아님
 */
export async function assertMaster(): Promise<AssertMasterResult> {
  const authUser = await getAuthUser()
  if (!authUser) return { error: 'unauthenticated' }

  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('id, is_master')
    .eq('birdieminton_user_id', authUser.id)
    .maybeSingle()

  if (!data) return { error: 'unauthenticated' }
  if (data.is_master !== true) return { error: 'not_master' }
  return { userId: data.id }
}
