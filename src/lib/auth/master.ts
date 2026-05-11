import 'server-only'
import { cache } from 'react'
import { getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * 시스템 마스터 조회 결과 — 요청 단위 캐시.
 *
 * React.cache 로 래핑되어 동일 요청 안에서는 첫 호출만 실제 admin client
 * SELECT 를 수행하고, 이후 호출은 메모이즈된 결과를 그대로 반환한다.
 * (서버 컴포넌트 트리에서 layout / page / nested layout 들이
 *  중복 조회하는 비용을 0 으로 만든다.)
 *
 * 반환:
 *   - { userId, isMaster: true }  — 마스터 유저
 *   - { userId, isMaster: false } — 비마스터 유저 (정상 로그인)
 *   - null                         — 비로그인 또는 users row 없음
 */
type MasterLookup = { userId: string; isMaster: boolean } | null

const lookupMaster = cache(async (): Promise<MasterLookup> => {
  const authUser = await getAuthUser()
  if (!authUser) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('id, is_master')
    .eq('birdieminton_user_id', authUser.id)
    .maybeSingle()

  if (!data) return null
  return { userId: data.id as string, isMaster: data.is_master === true }
})

/**
 * 마스터 여부만 boolean 으로 필요한 호출지점용 헬퍼.
 * 같은 요청 안에서는 lookupMaster() 캐시 결과를 그대로 활용 → 추가 쿼리 0회.
 *
 * - 비로그인 / row 없음 → false
 * - 로그인이지만 비마스터 → false
 * - 마스터 → true
 */
export async function checkIsMaster(): Promise<boolean> {
  const result = await lookupMaster()
  return result?.isMaster === true
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
  const result = await lookupMaster()
  if (!result) return { error: 'unauthenticated' }
  if (!result.isMaster) return { error: 'not_master' }
  return { userId: result.userId }
}
