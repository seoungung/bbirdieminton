import type { Metadata } from 'next'
import { PricingClient } from '@/components/pricing/PricingClient'

export const metadata: Metadata = {
  title: '가격 | 버디민턴',
  description:
    '버디민턴 요금제. Free / Pro / Team 플랜. v2.0 베타 기간 동안 모든 기능 무료. 연간 결제 시 20% 할인.',
  openGraph: {
    title: '가격 | 버디민턴',
    description: '나에게 맞는 플랜을 선택하세요. v2.0 베타 기간 무료.',
  },
}

export default function PricingPage() {
  return <PricingClient />
}
