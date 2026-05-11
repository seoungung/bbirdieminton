import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase 클라이언트 — 모듈 싱글톤.
 *
 * service-role 키는 프로세스 lifetime 동안 변하지 않으므로 인스턴스를
 * 재사용해 createClient() 호출 비용을 피한다.
 * 첫 호출 시점에 lazy init 되며 이후 동일 인스턴스를 반환.
 *
 * 주의: 이 클라이언트는 RLS 를 우회한다. 호출 측이 권한 검증
 * (assertMaster 등) 을 반드시 선행해야 한다.
 */
let _admin: SupabaseClient | null = null

export function createAdminClient(): SupabaseClient {
  if (_admin) return _admin

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  _admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _admin
}
