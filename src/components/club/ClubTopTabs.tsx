'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Users, BarChart3, Settings as SettingsIcon } from 'lucide-react'

export type ClubTopTabKey = 'events' | 'members' | 'stats' | 'settings'

interface TabDef {
  key: ClubTopTabKey
  label: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  /** 해당 탭이 운영자(owner/manager) 전용인지 */
  managerOnly?: boolean
}

/**
 * PRD §2.2 클럽 페이지 상단 탭 정의.
 * - 회원 뷰: [일정] · [멤버] · [스탯]
 * - 운영자 뷰: 위 3개 + [관리]
 */
const CLUB_TOP_TABS: ReadonlyArray<TabDef> = [
  { key: 'events',   label: '일정',  Icon: CalendarDays },
  { key: 'members',  label: '멤버',  Icon: Users },
  { key: 'stats',    label: '스탯',  Icon: BarChart3 },
  { key: 'settings', label: '관리',  Icon: SettingsIcon, managerOnly: true },
]

/**
 * 탭이 노출되지 않아야 하는 라우트 패턴.
 * - 게임보드 세션 내부(`/gameboard/[sessionId]`)·신규(`/gameboard/new`): 전체화면 게임 진행 UI
 *   상단 탭 가리지 않도록 hide.
 */
function shouldHideForPath(clubId: string, pathname: string): boolean {
  const base = `/club/${clubId}/gameboard`
  if (pathname.startsWith(`${base}/new`)) return true
  // /gameboard/[sessionId] 매칭 (단, /gameboard 자체는 list 페이지라 hide 안 함)
  if (pathname.startsWith(`${base}/`) && pathname !== `${base}/new`) {
    // /gameboard 외 추가 세그먼트가 있으면 sessionId 페이지로 간주
    const tail = pathname.slice(base.length + 1)
    if (tail.length > 0) return true
  }
  return false
}

/**
 * 현재 pathname 기준으로 활성 탭 판정.
 * - `/club/{id}/events*` → events
 * - `/club/{id}/members*` → members
 * - `/club/{id}/stats*` → stats
 * - `/club/{id}/settings*` → settings
 * - 그 외(대시보드 등): null (활성 탭 없음)
 */
function detectActiveTab(clubId: string, pathname: string): ClubTopTabKey | null {
  const base = `/club/${clubId}`
  for (const tab of CLUB_TOP_TABS) {
    const tabPath = `${base}/${tab.key}`
    if (pathname === tabPath || pathname.startsWith(`${tabPath}/`) || pathname.startsWith(`${tabPath}?`)) {
      return tab.key
    }
  }
  return null
}

interface Props {
  clubId: string
  /** 운영자(owner/manager) 여부 — [관리] 탭 노출 제어 */
  isManager: boolean
}

/**
 * 클럽 페이지 상단 탭 네비 (T0-1-7, PRD §2.2).
 *
 * - 모든 클럽 페이지(`/club/[clubId]/*`)에 layout 단위로 표시.
 * - 게임 진행 화면(`/gameboard/[sessionId]`, `/gameboard/new`)에서는 자동 hide.
 * - 활성 탭이 없는 페이지(대시보드 등)에서도 표시되어 다른 탭으로 이동 가능.
 *
 * 디자인 일관성: SettingsTabsNav / StatsTabsNav 패턴 동일.
 */
export function ClubTopTabs({ clubId, isManager }: Props) {
  const pathname = usePathname() ?? ''

  if (shouldHideForPath(clubId, pathname)) return null

  const activeTab = detectActiveTab(clubId, pathname)
  const visibleTabs = CLUB_TOP_TABS.filter((t) => !t.managerOnly || isManager)

  return (
    <nav
      aria-label="클럽 페이지 탭"
      className="bg-white border-b border-[#e5e5e5] overflow-x-auto print:hidden"
    >
      <ul
        className="max-w-[1088px] mx-auto flex items-center gap-0 px-2 sm:px-4 min-w-max"
        role="tablist"
      >
        {visibleTabs.map((tab) => {
          const active = tab.key === activeTab
          const href = `/club/${clubId}/${tab.key}`
          return (
            <li key={tab.key} role="presentation">
              <Link
                href={href}
                role="tab"
                aria-selected={active}
                className={`relative inline-flex items-center gap-1.5 px-3 sm:px-4 py-3 text-[13px] font-bold transition-colors whitespace-nowrap ${
                  active
                    ? 'text-[#0a0a0a]'
                    : 'text-[#999] hover:text-[#555]'
                }`}
              >
                <tab.Icon size={14} strokeWidth={active ? 2.4 : 2} />
                <span>{tab.label}</span>
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
