import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import { AppShell } from '@/components/club/AppShell'
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

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  /* /view 경로는 기존 탭 뷰 유지 (sidebar 우회 — 탭뷰와 사이드바가 중복되므로) */
  const isViewPage = pathname.endsWith('/view')
  if (isViewPage) {
    return <div className="min-h-screen bg-[#f8f8f8]">{children}</div>
  }

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
        isManager={true /* 데모는 모든 메뉴 보여줌 */}
        isDemo
        userName="데모 체험자"
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

  /* 클럽 정보 + 유저 이름 + 읽지 않은 공지 수 병렬 조회 */
  const [clubResult, userProfileResult, unreadCount] = await Promise.all([
    supabase.from('clubs').select('name, location, thumbnail_color, owner_id').eq('id', clubId).single(),
    supabase.from('users').select('name').eq('id', clubUserId).single(),
    getUnreadCountAction(clubId).catch(() => 0),
  ])

  const club = clubResult.data
  const userProfile = userProfileResult.data
  const isOwner = club?.owner_id === clubUserId
  const isManager = ['owner', 'manager'].includes(membership.role)

  return (
    <AppShell
      clubId={clubId}
      clubName={club?.name ?? '모임'}
      clubLocation={club?.location ?? null}
      thumbnailColor={club?.thumbnail_color}
      isOwner={isOwner}
      isManager={isManager}
      userName={userProfile?.name ?? undefined}
      unreadNoticeCount={unreadCount}
    >
      {children}
    </AppShell>
  )
}
