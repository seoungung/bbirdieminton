import Link from 'next/link'
import Image from 'next/image'

export function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-[#f0f0f0]">
      <div className="max-w-[1088px] mx-auto px-4 sm:px-6 py-12">

        {/* ── 4컬럼 레이아웃 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">

          {/* 컬럼 1: 브랜드 */}
          <div className="col-span-2 md:col-span-1 mb-2 md:mb-0">
            <div className="flex items-center mb-2">
              <Image
                src="/textlogo_height_birdieminton-black.png"
                alt="버디민턴"
                width={130}
                height={30}
                className="h-7 w-auto object-contain"
              />
            </div>
            <p className="text-[11px] text-[#999] leading-relaxed">
              배드민턴 동호회 관리의 모든 것
            </p>
          </div>

          {/* 컬럼 2: 서비스 */}
          <div>
            <p className="text-[12px] font-semibold text-[#111] mb-3">서비스</p>
            <ul className="space-y-2 text-[12px] text-[#666]">
              <li><Link href="/product" className="hover:text-[#111] transition-colors">제품 소개</Link></li>
              <li><Link href="/demo"    className="hover:text-[#111] transition-colors">데모 체험</Link></li>
              <li><Link href="/shop"    className="hover:text-[#111] transition-colors">SHOP</Link></li>
            </ul>
          </div>

          {/* 컬럼 3: 지원 */}
          <div>
            <p className="text-[12px] font-semibold text-[#111] mb-3">지원</p>
            <ul className="space-y-2 text-[12px] text-[#666]">
              <li><Link href="/faq"     className="hover:text-[#111] transition-colors">자주 묻는 질문</Link></li>
              <li><Link href="/contact" className="hover:text-[#111] transition-colors">문의하기</Link></li>
              <li><Link href="/blog"    className="hover:text-[#111] transition-colors">블로그</Link></li>
            </ul>
          </div>

          {/* 컬럼 4: 법적고지 */}
          <div>
            <p className="text-[12px] font-semibold text-[#111] mb-3">법적고지</p>
            <ul className="space-y-2 text-[12px] text-[#666]">
              <li><Link href="/terms"          className="hover:text-[#111] transition-colors">이용약관</Link></li>
              <li><Link href="/privacy"        className="hover:text-[#111] transition-colors">개인정보처리방침</Link></li>
              <li><Link href="/policy/refund"  className="hover:text-[#111] transition-colors">환불정책</Link></li>
              <li><Link href="/business"       className="hover:text-[#111] transition-colors">사업자정보 확인</Link></li>
            </ul>
          </div>
        </div>

        {/* ── 사업자정보 (하단 컴팩트) ── */}
        <div className="mt-12 pt-6 border-t border-[#f5f5f5]">
          <div className="text-[10px] text-[#bbb] leading-[1.7] space-y-0.5">
            <p>
              <span className="text-[#999]">상호명</span> 버디민턴 ·{' '}
              <span className="text-[#999]">대표</span> 양성웅 ·{' '}
              <span className="text-[#999]">사업자등록번호</span> 227-11-71746 ·{' '}
              <span className="text-[#999]">통신판매업</span> 간이과세자 신고 면제
            </p>
            <p>
              <span className="text-[#999]">사업장</span> 서울특별시 관악구 은천로35다길 26-13, 101호(봉천동, 성현쉐르빌) ·{' '}
              <span className="text-[#999]">전화</span> 010-4977-3867 ·{' '}
              <span className="text-[#999]">이메일</span> skyyolle7@gmail.com
            </p>
            <p>
              <span className="text-[#999]">호스팅</span> Vercel Inc.
            </p>
            <p className="pt-2 text-[#ccc]">ⓒ 2026 버디민턴. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
