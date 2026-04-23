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
              <span className="text-[15px] font-extrabold text-[#111]">버디민턴</span>
            </div>
            <p className="text-[13px] text-[#999] leading-relaxed">
              배드민턴 동호회 관리의 모든 것
            </p>
          </div>

          {/* 링크 */}
          <div className="flex gap-8 text-[13px]">
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-[#111] mb-1">서비스</p>
              <Link href="/product" className="text-[#555] hover:text-[#111] transition-colors">제품 소개</Link>
              <Link href="/demo"    className="text-[#555] hover:text-[#111] transition-colors">데모 체험</Link>
              <Link href="/shop"    className="text-[#555] hover:text-[#111] transition-colors">SHOP</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-[#111] mb-1">법적고지</p>
              <Link href="/terms"          className="text-[#555] hover:text-[#111] transition-colors">이용약관</Link>
              <Link href="/privacy"        className="text-[#555] hover:text-[#111] transition-colors">개인정보처리방침</Link>
              <Link href="/policy/refund"  className="text-[#555] hover:text-[#111] transition-colors">환불정책</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#f0f0f0] text-[12px] text-[#999] leading-relaxed space-y-0.5">
          <p>상호명: 버디민턴 | 대표자명: 양성웅 | 사업자등록번호: 227-11-71746</p>
          <p>통신판매업 신고번호: 간이과세자로 통신판매업 신고 면제 대상</p>
          <p>사업장 주소: 서울특별시 관악구 은천로35다길 26-13, 101호(봉천동, 성현쉐르빌)</p>
          <p>유선전화번호: 010-4977-3867 | 이메일: skyyolle7@gmail.com</p>
          <p>호스팅 제공자: Vercel Inc.</p>
          <p className="mt-2">ⓒ 2026 버디민턴. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
