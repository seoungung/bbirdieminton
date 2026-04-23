import type { Metadata } from 'next'
import './globals.css'
import { MainShell } from '@/components/layout/MainShell'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  metadataBase: new URL('https://birdieminton.com'),
  icons: {
    icon: '/favicon_birdieminton-color.png',
    shortcut: '/favicon_birdieminton-color.png',
  },
  title: {
    default: '버디민턴 | 배드민턴 동호회 관리 플랫폼',
    template: '%s | 버디민턴',
  },
  description: '배드민턴 동호회 운영의 모든 것. 게임보드, 랭킹, 정산, 공지를 한 곳에서.',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://birdieminton.com',
    siteName: '버디민턴',
    title: '버디민턴 | 배드민턴 동호회 관리 플랫폼',
    description: '배드민턴 동호회 운영의 모든 것. 게임보드, 랭킹, 정산, 공지를 한 곳에서.',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: '버디민턴' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '버디민턴 | 배드민턴 동호회 관리 플랫폼',
    description: '배드민턴 동호회 운영의 모든 것. 게임보드, 랭킹, 정산, 공지를 한 곳에서.',
  },
  alternates: {
    canonical: 'https://birdieminton.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <MainShell>{children}</MainShell>
        <Analytics />
      </body>
    </html>
  )
}
