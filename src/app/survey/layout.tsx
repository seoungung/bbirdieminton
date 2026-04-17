import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '배드민턴 동호회 운영 설문 | Birdieminton',
  description: '총무·모임장·코치분들의 현실적인 고충을 듣고 싶어요. 3분이면 충분합니다.',
  openGraph: {
    title: '배드민턴 동호회 운영, 어떻게 하고 계세요?',
    description: '총무·모임장·코치분들의 현실적인 고충을 듣고 싶어요.',
  },
}

export default function SurveyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
