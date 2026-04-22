'use client'

import { usePathname } from 'next/navigation'
import { MarketingShell } from './marketing/MarketingShell'

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''

  const isClubAppShell =
    /^\/club\/[^/]+(\/|$)/.test(pathname) &&
    !/^\/club\/(home|create|join|login|onboard|demo)(\/|$)/.test(pathname)

  if (isClubAppShell) {
    return <main className="flex-1">{children}</main>
  }

  return <MarketingShell>{children}</MarketingShell>
}
