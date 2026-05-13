import type { Metadata } from 'next'
import { PricingClient } from '@/components/pricing/PricingClient'

export const metadata: Metadata = {
  title: '가격 | 버디민턴',
  description:
    '버디민턴 요금제. Free 50명·Basic 9,900원/월(100명, 공동관리자 3명, 미납 알림톡, 빈자리 자동충원)·Pro 29,900원/월(무제한, Excel/PDF 리포트). 정기결제·언제든 해지 가능. v2.0 베타 기간 모든 기능 무료.',
  openGraph: {
    title: '가격 | 버디민턴',
    description:
      'Free 50명·Basic 9,900원·Pro 29,900원. 정기결제 자동결제·언제든 해지 가능. v2.0 베타 무료.',
  },
}

export default function PricingPage() {
  return <PricingClient />
}
