'use client'

import { usePathname } from 'next/navigation'
import { MarketingShell } from './marketing/MarketingShell'

/**
 * 글로벌 chrome 라우터.
 *
 * AppShell 라우트  → `/club/[id]/*` (단, /club/{home,create,join,login,onboard,demo} 제외)
 * SaaSShell 라우트 → `/club/home`, `/club/create`, `/clubs/*`
 * 그 외             → MarketingShell (홈, /blog, /pricing, /login, /demo, /manual 등)
 *
 * AppShell·SaaSShell은 각자의 layout.tsx에서 직접 렌더링하므로
 * 여기서는 마케팅 chrome만 제거하고 children을 그대로 통과시킨다.
 */
export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''

  const isClubAppShell =
    /^\/club\/[^/]+(\/|$)/.test(pathname) &&
    !/^\/club\/(home|create|join|login|onboard|demo)(\/|$)/.test(pathname)

  const isSaaSShell =
    pathname === '/club/home' ||
    pathname.startsWith('/club/home/') ||
    pathname === '/club/create' ||
    pathname.startsWith('/club/create/') ||
    /^\/clubs\/[^/]+(\/|$)/.test(pathname)

  if (isClubAppShell || isSaaSShell) {
    return <main className="flex-1">{children}</main>
  }

  return <MarketingShell>{children}</MarketingShell>
}
