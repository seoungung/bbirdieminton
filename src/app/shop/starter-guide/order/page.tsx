import Link from 'next/link'
import type { Metadata } from 'next'
import { OrderForm } from '@/components/shop/OrderForm'

export const metadata: Metadata = {
  title: '주문하기 | 배린이 라켓 완전정복 가이드',
  description: '배린이 라켓 완전정복 가이드 PDF 주문서',
}

export default function OrderPage() {
  return (
    <div className="bg-[#f8f8f8] min-h-screen">
      {/* 브레드크럼 */}
      <nav className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 py-3 text-[12px] text-[#777]">
          <Link href="/" className="hover:text-[#111]">홈</Link>
          <span className="mx-1.5 text-[#ccc]">/</span>
          <Link href="/shop" className="hover:text-[#111]">디지털 상품</Link>
          <span className="mx-1.5 text-[#ccc]">/</span>
          <Link href="/shop/starter-guide" className="hover:text-[#111]">배린이 라켓 완전정복 가이드</Link>
          <span className="mx-1.5 text-[#ccc]">/</span>
          <span className="text-[#111] font-medium">주문서</span>
        </div>
      </nav>

      {/* 헤더 */}
      <header className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 py-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111]">주문서</h1>
          <p className="text-[13px] text-[#999] mt-1">주문자 정보를 입력하고 결제를 진행해주세요.</p>
        </div>
      </header>

      <main className="max-w-[1088px] mx-auto px-4 sm:px-8 py-8">
        <OrderForm />
      </main>
    </div>
  )
}
