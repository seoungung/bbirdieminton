import type { Metadata } from 'next'
import { PricingClient } from '@/components/pricing/PricingClient'

export const metadata: Metadata = {
  title: '가격 | 버디민턴',
  description:
    '버디민턴 요금제. Free 50명·Pro 9,900원/월(100명, 회비 자동화·알림톡)·Team 29,900원/월(무제한, 멀티 클럽). v2.0 베타 기간 모든 기능 무료.',
  openGraph: {
    title: '가격 | 버디민턴',
    description:
      'Free 50명·Pro 9,900원·Team 29,900원. 실력 매칭·회비 자동화·카카오 알림톡. v2.0 베타 무료.',
  },
}

export default function PricingPage() {
  return <PricingClient />
}
