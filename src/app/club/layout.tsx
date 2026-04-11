import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '버디모아 — 배드민턴 동호회 관리',
  description: '우리 동호회 출석·경기·랭킹을 한 곳에서',
}

/**
 * /club 전용 레이아웃.
 * 글로벌 Header / Footer 를 제외하고 버디모아 독립 UI만 렌더링.
 */
export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white font-pretendard">
      {children}
    </div>
  )
}
