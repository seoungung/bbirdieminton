import Link from 'next/link'
import { Building2, Users, Wallet, Megaphone } from 'lucide-react'

export type SettingsTabKey = 'info' | 'members' | 'finance' | 'notices'

export const SETTINGS_TABS: ReadonlyArray<{
  key: SettingsTabKey
  label: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}> = [
  { key: 'info',     label: '클럽 정보',    Icon: Building2 },
  { key: 'members',  label: '회원·권한',    Icon: Users },
  { key: 'finance',  label: '회비',         Icon: Wallet },
  { key: 'notices',  label: '공지·가입신청', Icon: Megaphone },
]

interface Props {
  clubId: string
  activeTab: SettingsTabKey
  /** 공지 미확인 수 — '공지·가입신청' 탭에 배지 표시 */
  unreadNoticeCount?: number
}

/**
 * [관리] 페이지 상단 탭 네비.
 *
 * - searchParams 기반 라우팅 (`?tab=info|members|finance|notices`)
 * - 새로고침·공유·외부 진입(알림벨 등) 모두 안정 지원.
 * - 서버 컴포넌트로 렌더 가능 — 활성 탭은 props 로 주입.
 */
export function SettingsTabsNav({ clubId, activeTab, unreadNoticeCount = 0 }: Props) {
  return (
    <nav
      aria-label="관리 탭"
      className="bg-white border-b border-[#e5e5e5] -mt-5 -mx-4 sm:mx-0 sm:mt-0 sm:rounded-2xl sm:border sm:border-[#e5e5e5] sm:mb-5 overflow-x-auto"
    >
      <ul className="flex items-center gap-0 px-2 sm:px-1 min-w-max" role="tablist">
        {SETTINGS_TABS.map((tab) => {
          const active = tab.key === activeTab
          const href = `/club/${clubId}/settings${tab.key === 'info' ? '' : `?tab=${tab.key}`}`
          const showBadge = tab.key === 'notices' && unreadNoticeCount > 0
          return (
            <li key={tab.key} role="presentation">
              <Link
                href={href}
                role="tab"
                aria-selected={active}
                className={`relative inline-flex items-center gap-1.5 px-3 sm:px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'text-[#0a0a0a]'
                    : 'text-[#999] hover:text-[#555]'
                }`}
              >
                <tab.Icon size={14} strokeWidth={active ? 2.4 : 2} />
                <span>{tab.label}</span>
                {showBadge && (
                  <span className="ml-0.5 text-[10px] font-extrabold text-white bg-[var(--color-brand-court)] rounded-full min-w-[18px] h-[18px] px-1.5 inline-flex items-center justify-center leading-none">
                    {unreadNoticeCount > 99 ? '99+' : unreadNoticeCount}
                  </span>
                )}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-2 right-2 bottom-0 h-[2px] bg-[#0a0a0a] rounded-full"
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
