import { AppSearchBar } from './AppSearchBar'
import { NotificationBell } from './NotificationBell'
import { QuickCreate } from './QuickCreate'
import { UserMenu } from '@/components/layout/marketing/UserMenu'

interface Props {
  clubId: string
  isOwner: boolean
  unreadNoticeCount: number
  userName: string
  userEmail: string
  avatarUrl: string | null
}

/**
 * 클럽 앱 전역 헤더 (데스크톱 전용 — 모바일은 AppShell 내부 별도 처리)
 *
 * 구성: 검색바 (좌측, 유연폭) · 알림 · 빠른만들기 · 유저메뉴
 */
export function AppHeader({
  clubId,
  isOwner,
  unreadNoticeCount,
  userName,
  userEmail,
  avatarUrl,
}: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#f0f0f0] h-14 hidden lg:flex items-center gap-3 px-6">
      <div className="flex-1 max-w-[520px]">
        <AppSearchBar />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <NotificationBell clubId={clubId} unreadNoticeCount={unreadNoticeCount} />
        <QuickCreate clubId={clubId} isOwner={isOwner} />
        <div className="h-5 w-px bg-[#e5e5e5] mx-1" />
        <UserMenu userName={userName} userEmail={userEmail} avatarUrl={avatarUrl} />
      </div>
    </header>
  )
}
