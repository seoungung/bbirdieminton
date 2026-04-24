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
        clubName={demo?.name ?? '데모 모임'}
        clubLocation={demo?.location ?? null}
        leaderName={demo?.leaderName ?? null}
        thumbnailColor={demo?.thumbnailColor}
        isOwner={false}
        isDemo
        userName="데모 체험자"
        userEmail="demo@birdieminton.com"
        avatarUrl={null}
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

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  /* 클럽 정보 + 유저 프로필 + 읽지 않은 공지 수 + 소속 클럽 목록 병렬 조회 */
  const [clubResult, userProfileResult, unreadCount, clubsResult] = await Promise.all([
    supabase.from('clubs').select('name, location, thumbnail_color, owner_id').eq('id', clubId).single(),
    supabase.from('users').select('name').eq('id', clubUserId).single(),
    getUnreadCountAction(clubId).catch(() => 0),
    // 내가 소속된 다른 클럽 목록 (현재 클럽 제외)
    supabase
      .from('club_members')
      .select('club:clubs(id, name, location, thumbnail_color)')
      .eq('user_id', clubUserId)
      .neq('club_id', clubId),
  ])

  const club = clubResult.data
  const userProfile = userProfileResult.data
  const isOwner = club?.owner_id === clubUserId

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
      clubName={club?.name ?? '모임'}
      clubLocation={club?.location ?? null}
      thumbnailColor={club?.thumbnail_color}
      isOwner={isOwner}
      userName={userProfile?.name ?? user.email?.split('@')[0] ?? '이름없음'}
      userEmail={userEmail}
      avatarUrl={avatarUrl}
      unreadNoticeCount={unreadCount}
      availableClubs={availableClubs}
    >
      {children}
    </AppShell>
  )
}
