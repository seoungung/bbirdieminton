import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '버디민턴',
  description: '배드민턴 동호회 운영 SaaS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
