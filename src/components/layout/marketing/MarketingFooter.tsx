import Link from 'next/link'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'

export function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-[#e5e5e5]">
      <div className="max-w-[1088px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">

          {/* 브랜드 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-[#0a0a0a] flex items-center justify-center">
                <ShuttlecockIcon size={12} className="text-[#beff00]" strokeWidth={2} />
              </div>
              <span className="text-[15px] font-extrabold text-[#111]">버디모아</span>
            </div>
            <p className="text-[13px] text-[#999] leading-relaxed">
              배드민턴 동호회 관리의 모든 것
            </p>
          </div>

          {/* 링크 */}
          <div className="flex gap-8 text-[13px]">
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-[#111] mb-1">서비스</p>
              <Link href="/features" className="text-[#555] hover:text-[#111] transition-colors">기능소개</Link>
              <Link href="/pricing"  className="text-[#555] hover:text-[#111] transition-colors">요금제</Link>
              <Link href="/demo"     className="text-[#555] hover:text-[#111] transition-colors">데모 체험</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-[#111] mb-1">법적고지</p>
              <Link href="/terms"   className="text-[#555] hover:text-[#111] transition-colors">이용약관</Link>
              <Link href="/privacy" className="text-[#555] hover:text-[#111] transition-colors">개인정보처리방침</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#f0f0f0] text-[12px] text-[#999] leading-relaxed">
          <p>버디민턴 | 대표: 이지성 | 사업자등록번호: 123-45-67890</p>
          <p>통신판매업 신고번호: 제2026-서울-00000호 | skyyolle7@gmail.com</p>
          <p className="mt-1">ⓒ 2026 버디모아. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
