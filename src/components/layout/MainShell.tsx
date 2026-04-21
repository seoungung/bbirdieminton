'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import { RacketCompareTray } from '@/components/racket/RacketCompareTray'

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''

  /**
   * 클럽 앱 쉘(AppShell)이 자체 사이드바 + 헤더를 제공하는 경로에선
   * 글로벌 Header/Footer를 숨겨 중복 헤더를 방지합니다.
   *
   * 예외: /club/[id]/view — 구 탭뷰, 자체 헤더 있음 (글로벌 Header 숨김)
   * 허용: /club (허브 루트), /club/home, /club/create, /club/join, /club/login, /club/onboard, /club/demo
   *       → 이들은 글로벌 Header 유지
   */
  const isClubAppShell =
    /^\/club\/[^/]+(\/|$)/.test(pathname) &&
    !/^\/club\/(home|create|join|login|onboard|demo)(\/|$)/.test(pathname)

  if (isClubAppShell) {
    return (
      <>
        <main className="flex-1">{children}</main>
        <RacketCompareTray />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <RacketCompareTray />
    </>
  )
}
