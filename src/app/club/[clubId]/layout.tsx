import { redirect } from 'next/navigation'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import { AppShell } from '@/components/club/AppShell'
import type { ClubOption } from '@/components/club/ClubSwitcher'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import { getUnreadCountAction } from '@/app/club/[clubId]/notices/actions'

export default async function ClubDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params

  /* ── 데모 모임: 인증 없이 데모 데이터로 AppShell 렌더 ── */
  if (clubId.startsWith('demo-')) {
    const demo = DEMO_CLUBS.find(c => c.id === clubId)
    return (
      <AppShell
        clubId={clubId}
        clubName={demo?.name ?? '체험 모임'}
        clubLocation={demo?.location ?? null}
        leaderName={demo?.leaderName ?? null}
        thumbnailColor={demo?.thumbnailColor}
        isOwner={false}
        isDemo
        userName="체험자"
        userEmail="demo@birdieminton.com"
        avatarUrl={null}
        role="member"
      >
        {children}
      </AppShell>
    )
  }

  /* ── 실제 모임: 인증 + 멤버십 확인 ── */
  const [user, supabase] = await Promise.all([getAuthUser(), createClient()])
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase, user)
  if (!clubUserId) redirect('/login')

  /* 클럽 정보 먼저 조회 (owner self-heal 판단을 위해 membership보다 선행) */
  const { data: club } = await supabase
    .from('clubs')
    .select('name, location, thumbnail_color, owner_id, court_count')
    .eq('id', clubId)
    .maybeSingle()

  if (!club) redirect('/clubs')

  const isOwner = club.owner_id === clubUserId

  let membership = await getMyMembership(supabase, clubId, clubUserId)

  /* Self-heal: owner인데 멤버십 row 없음 → RPC로 복구 후 재조회 */
  if (!membership && isOwner) {
    const { data: healResult } = await supabase
      .rpc('ensure_owner_membership', { p_club_id: clubId })
    if (!(healResult as { ok?: boolean })?.ok) {
      redirect('/clubs')
    }
    membership = await getMyMembership(supabase, clubId, clubUserId)
  }

  if (!membership) redirect(`/clubs/${clubId}`)

  /* last_visited 추적 — fire-and-forget, 실패해도 진입 막지 않음 */
  void supabase.from('users')
    .update({ last_visited_club_id: clubId })
    .eq('id', clubUserId)

  /* 유저 프로필 + 읽지 않은 공지 수 + 소속 클럽 목록 + 마스터 여부 병렬 조회.
   * is_master 는 마이그레이션 미적용 환경에서도 깨지지 않도록 PromiseLike 를 Promise.resolve 로 감싸 catch 가능하게. */
  const [userProfileResult, unreadCount, clubsResult, isMaster] = await Promise.all([
    supabase.from('users').select('name').eq('id', clubUserId).single(),
    getUnreadCountAction(clubId).catch(() => 0),
    // 내가 소속된 다른 클럽 목록 (현재 클럽 제외)
    supabase
      .from('club_members')
      .select('club:clubs(id, name, location, thumbnail_color)')
      .eq('user_id', clubUserId)
      .neq('club_id', clubId),
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

  const userProfile = userProfileResult.data

  /* 다른 클럽 목록 정리 */
  const availableClubs: ClubOption[] = (clubsResult.data ?? [])
    .map((row: { club: unknown }) => row.club)
    .filter((c): c is { id: string; name: string; location: string | null; thumbnail_color: string | null } =>
      c !== null && typeof c === 'object' && 'id' in c
    )
    .map((c) => ({
      id: c.id,
      name: c.name,
      location: c.location,
      thumbnailColor: c.thumbnail_color ?? undefined,
    }))

  /* 유저 메타데이터 (이메일·아바타) */
  const userEmail = user.email ?? ''
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ?? null

  return (
    <AppShell
      clubId={clubId}
      clubName={club.name}
      clubLocation={club.location ?? null}
      thumbnailColor={club.thumbnail_color}
      isOwner={isOwner}
      userName={userProfile?.name ?? user.email?.split('@')[0] ?? '이름없음'}
      userEmail={userEmail}
      avatarUrl={avatarUrl}
      unreadNoticeCount={unreadCount}
      role={membership.role as 'owner' | 'manager' | 'member'}
      availableClubs={availableClubs}
      isMaster={isMaster}
    >
      {children}
    </AppShell>
  )
}
