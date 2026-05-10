import 'server-only'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { ensureClubUser, getClubUserId } from '@/lib/club/auth'
import { getMyClubs } from '@/lib/club/client'
import type { SaaSClubItem } from './SaaSClubList'

export interface SaaSShellData {
  user: { name: string; email: string; avatarUrl: string | null } | null
  myClubs: SaaSClubItem[]
  /** 시스템 마스터(슈퍼어드민) 여부 — true 일 때만 사이드바에 "관리자" 메뉴 노출 */
  isMaster: boolean
}

/**
 * SaaSShell layout에서 사용할 사이드바/헤더 데이터.
 * - 비로그인: user=null, myClubs=[]
 * - 로그인: ensureClubUser → getMyClubs
 *
 * page.tsx에서도 동일 데이터(getMyClubs 등)를 다시 조회할 수 있으나,
 * createClient + getAuthUser는 React.cache로 요청당 1회만 실제 호출됨.
 */
export async function getSaaSShellData(): Promise<SaaSShellData> {
  const authUser = await getAuthUser()
  if (!authUser) {
    return { user: null, myClubs: [], isMaster: false }
  }

  const supabase = await createClient()
  await ensureClubUser(supabase, authUser).catch(() => {})
  const clubUserId = await getClubUserId(supabase, authUser)

  const fullName =
    (authUser.user_metadata?.full_name as string | undefined) ??
    (authUser.user_metadata?.name as string | undefined) ??
    authUser.email?.split('@')[0] ??
    '이름없음'

  const user = {
    name: fullName,
    email: authUser.email ?? '',
    avatarUrl: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
  }

  if (!clubUserId) {
    return { user, myClubs: [], isMaster: false }
  }

  // is_master 조회 — 본인 row 는 RLS 상 본인이 읽을 수 있음.
  // 컬럼이 없는 (마이그레이션 미적용) 환경에서도 안전하게 false fallback.
  // Supabase builder 는 PromiseLike 를 반환하므로 Promise.resolve 로 감싸 catch 사용.
  const [clubs, masterRes] = await Promise.all([
    getMyClubs(supabase, clubUserId),
    Promise.resolve(
      supabase
        .from('users')
        .select('is_master')
        .eq('id', clubUserId)
        .maybeSingle()
    )
      .then((r) => (r.data as { is_master?: boolean } | null)?.is_master === true)
      .catch(() => false),
  ])

  const myClubs: SaaSClubItem[] = clubs.map((c) => ({
    id: c.id,
    name: c.name,
    location: c.location ?? null,
    thumbnailColor: c.thumbnail_color ?? null,
  }))

  return { user, myClubs, isMaster: masterRes }
}
