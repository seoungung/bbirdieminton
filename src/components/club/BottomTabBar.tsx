'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, Trophy, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { label: '홈', icon: Home, href: '' },
  { label: '세션', icon: CalendarDays, href: '/session/new' },
  { label: '랭킹', icon: Trophy, href: '/ranking' },
  { label: '설정', icon: Settings, href: '/settings' },
]

export function BottomTabBar({ clubId }: { clubId: string }) {
  const pathname = usePathname()
  const base = `/club/${clubId}`

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-[#e5e5e5] z-40 safe-area-pb">
      <div className="max-w-lg mx-auto grid grid-cols-4">
        {TABS.map(({ label, icon: Icon, href }) => {
          const to = base + href
          // 홈 탭은 정확히 base 경로일 때만 활성
          const isActive =
            href === ''
              ? pathname === base || pathname === base + '/'
              : pathname.startsWith(to)

          return (
            <Link
              key={label}
              href={to}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors',
                isActive ? 'text-[#111]' : 'text-[#bbb] hover:text-[#555]'
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? 'text-[#111]' : 'text-[#bbb]'}
              />
              {label}
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 bg-[#beff00] rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
