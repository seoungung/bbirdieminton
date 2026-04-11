'use client'

import Header from './Header'
import Footer from './Footer'
import { RacketCompareTray } from '@/components/racket/RacketCompareTray'

export function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <RacketCompareTray />
    </>
  )
}
