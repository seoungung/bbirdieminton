import { CheckCircle2, Download } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '결제 완료 | 버디민턴' }

interface SuccessPageProps {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>
}

export default async function PdfSuccessPage({ searchParams }: SuccessPageProps) {
  const { paymentKey, orderId, amount } = await searchParams

  // 서버에서 토스 confirm 호출
  let confirmed = false
  if (paymentKey && orderId && amount) {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${siteUrl}/api/payments/toss/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        cache: 'no-store',
      })
      confirmed = res.ok
    } catch {
      confirmed = false
    }
  }

  if (!confirmed) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-10 text-center max-w-md w-full">
          <p className="text-lg font-bold text-[#111] mb-2">결제 확인 중 오류가 발생했습니다</p>
          <p className="text-sm text-[#999] mb-6">결제가 완료됐다면 고객센터로 연락해주세요.</p>
          <Link href="/pdf" className="inline-block px-6 py-3 bg-[#0a0a0a] text-white rounded-xl text-sm font-bold hover:bg-[#222] transition-colors">
            다시 시도하기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-10 text-center max-w-md w-full">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={28} className="text-[#10b981]" strokeWidth={2} />
        </div>
        <h1 className="text-xl font-extrabold text-[#111] mb-2">결제가 완료됐습니다 🎉</h1>
        <p className="text-sm text-[#555] mb-1">주문번호: <span className="font-mono text-[#111]">{orderId}</span></p>
        <p className="text-sm text-[#999] mb-8">결제하신 이메일로 PDF 다운로드 링크를 발송해드립니다.</p>
        <a
          href="#"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#beff00] text-[#0a0a0a] rounded-xl text-sm font-extrabold hover:bg-[#a8e600] transition-colors mb-4"
        >
          <Download size={15} />
          PDF 다운로드
        </a>
        <div className="block">
          <Link href="/" className="text-sm text-[#999] hover:text-[#555] transition-colors">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
