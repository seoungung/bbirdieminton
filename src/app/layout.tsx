import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: '버디민턴',
  description: '배드민턴 동호회 운영 SaaS',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light', // Stage E 이전까지 라이트 모드 고정
  themeColor: '#003a0b', // forest — v2 primary
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-beige text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
