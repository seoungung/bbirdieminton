'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import { RacketCompareTray } from '@/components/racket/RacketCompareTray'

/**
 * /club/* 경로에서는 글로벌 Header / Footer / CompareTray 를 숨긴다.
 */
export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isClub = pathname.startsWith('/club')

  if (isClub) {
    return <>{children}</>
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
