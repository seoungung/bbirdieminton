import Link from 'next/link'
import { BarChart3, Trophy, FileBarChart } from 'lucide-react'

export type StatsTabKey = 'analytics' | 'ranking' | 'report'

export const STATS_TABS: ReadonlyArray<{
  key: StatsTabKey
  label: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}> = [
  { key: 'analytics', label: '분석',        Icon: BarChart3 },
  { key: 'ranking',   label: '랭킹',        Icon: Trophy },
  { key: 'report',    label: '시즌 리포트', Icon: FileBarChart },
]

interface Props {
  clubId: string
  activeTab: StatsTabKey
  /**
   * 어떤 탭이 잠겨 있는지 (server-side 권한 분기 결과).
   * - 잠긴 탭은 lock 아이콘 + disabled 스타일.
   * - 클릭은 가능하나 페이지에서 차단 (server-side redirect 또는 안내).
   */
  lockedTabs?: ReadonlyArray<StatsTabKey>
  /** 일부 탭(`report`) 에서 추가로 days 같은 query 를 유지해야 할 때 */
  extraQuery?: Partial<Record<StatsTabKey, string>>
}

/**
 * PRD §2.2 [스탯] 통합 허브 상단 탭 네비.
 *
 * - searchParams 기반 라우팅 (`?tab=analytics|ranking|report`)
 * - `analytics` 가 기본 탭이라 `tab` 파라미터 생략 시 analytics 로 간주.
 * - 외부 진입점(사이드바, ranking 미러 등) 어디서든 안정적으로 활성 탭 표시.
 *
 * 권한 분기는 페이지에서 처리 — 이 컴포넌트는 라벨/링크만 담당.
 */
export function StatsTabsNav({ clubId, activeTab, lockedTabs = [], extraQuery }: Props) {
  return (
    <nav
      aria-label="스탯 탭"
      className="bg-white border-b border-[#e5e5e5] -mt-5 -mx-4 sm:mx-0 sm:mt-0 sm:rounded-2xl sm:border sm:border-[#e5e5e5] sm:mb-5 overflow-x-auto"
    >
      <ul className="flex items-center gap-0 px-2 sm:px-1 min-w-max" role="tablist">
        {STATS_TABS.map((tab) => {
          const active = tab.key === activeTab
          const locked = lockedTabs.includes(tab.key)
          const extra = extraQuery?.[tab.key]

          /* analytics 는 기본 탭이라 query 생략, 나머지는 ?tab=key 추가.
           * report 같이 추가 query 가 있으면 함께 붙임. */
          let href = `/club/${clubId}/stats`
          if (tab.key !== 'analytics' || extra) {
            const params = new URLSearchParams()
            if (tab.key !== 'analytics') params.set('tab', tab.key)
            if (extra) {
              const ep = new URLSearchParams(extra)
              for (const [k, v] of ep.entries()) params.set(k, v)
            }
            href = `${href}?${params.toString()}`
          }

          return (
            <li key={tab.key} role="presentation">
              <Link
                href={href}
                role="tab"
                aria-selected={active}
                aria-disabled={locked || undefined}
                className={`relative inline-flex items-center gap-1.5 px-3 sm:px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'text-[#0a0a0a]'
                    : locked
                    ? 'text-[#bbb] hover:text-[#999]'
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
