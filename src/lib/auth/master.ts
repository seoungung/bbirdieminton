import 'server-only'
import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/supabase/server'

export type AssertMasterResult =
  | { userId: string }
  | { error: 'unauthenticated' | 'not_master' }

/**
 * 요청당 1회만 조회 (React cache). admin client 로 RLS 우회.
 */
const lookupIsMaster = cache(async (authUid: string): Promise<{ id: string; isMaster: boolean } | null> => {
  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('id, is_master')
    .eq('id', authUid)
    .maybeSingle()
  if (!data) return null
  return { id: data.id, isMaster: data.is_master === true }
})

export async function assertMaster(): Promise<AssertMasterResult> {
  const authUser = await getAuthUser()
  if (!authUser) return { error: 'unauthenticated' }
  const result = await lookupIsMaster(authUser.id)
  if (!result) return { error: 'unauthenticated' }
  if (!result.isMaster) return { error: 'not_master' }
  return { userId: result.id }
}
