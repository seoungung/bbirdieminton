import type { Metadata } from 'next'
import './globals.css'
import { CompareProvider } from '@/context/CompareContext'
import { MainShell } from '@/components/layout/MainShell'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  metadataBase: new URL('https://birdieminton.com'),
  icons: {
    icon: '/favicon_birdieminton-color.png',
    shortcut: '/favicon_birdieminton-color.png',
  },
  title: {
    default: 'birdieminton | 배드민턴, 제대로 시작하는 법',
    template: '%s | birdieminton',
  },
  description: '배린이를 위한 라켓 도감. 레벨 테스트로 내 실력을 진단하고 딱 맞는 라켓을 찾아보세요.',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://birdieminton.com',
    siteName: 'birdieminton',
    title: 'birdieminton | 배드민턴, 제대로 시작하는 법',
    description: '배린이를 위한 라켓 도감. 레벨 테스트로 내 실력을 진단하고 딱 맞는 라켓을 찾아보세요.',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'birdieminton' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'birdieminton | 배드민턴, 제대로 시작하는 법',
    description: '배린이를 위한 라켓 도감. 레벨 테스트로 내 실력을 진단하고 딱 맞는 라켓을 찾아보세요.',
  },
  alternates: {
    canonical: 'https://birdieminton.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <CompareProvider>
          <MainShell>{children}</MainShell>
        </CompareProvider>
        <Analytics />
      </body>
    </html>
  )
}
