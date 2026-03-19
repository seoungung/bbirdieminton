import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CompareProvider } from '@/context/CompareContext'
import { RacketCompareTray } from '@/components/racket/RacketCompareTray'

export const metadata: Metadata = {
  title: '버드민턴 | 배드민턴 라켓 백과사전',
  description: '배드민턴 라켓 도감 — 배린이를 위한 라켓 추천 & 자가진단 퀴즈',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <CompareProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <RacketCompareTray />
        </CompareProvider>
      </body>
    </html>
  )
}
