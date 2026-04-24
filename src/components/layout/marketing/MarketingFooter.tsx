import Link from 'next/link'
import Image from 'next/image'

export function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-[#e5e5e5]">
      <div className="max-w-[1088px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-10">

          {/* ── 좌측: 로고 + 슬로건 + 사업자정보 ── */}
          <div>
            {/* 로고 */}
            <div className="flex items-center mb-2">
              <Image
                src="/textlogo_width_birdieminton-black.png"
                alt="버디민턴"
                width={120}
                height={28}
                className="h-7 w-auto object-contain"
              />
            </div>

            {/* 슬로건 */}
            <p className="text-[11px] text-[#999] leading-relaxed mb-5">
              배드민턴 동호회 관리의 모든 것
            </p>

            {/* 사업자정보 */}
            <div className="text-[10px] text-[#999] leading-relaxed space-y-0.5">
              <p>상호명: 버디민턴 | 대표자명: 양성웅 | 사업자등록번호: 227-11-71746</p>
              <p>통신판매업 신고번호: 간이과세자로 통신판매업 신고 면제 대상</p>
              <p>사업장 주소: 서울특별시 관악구 은천로35다길 26-13, 101호(봉천동, 성현쉐르빌)</p>
              <p>유선전화번호: 010-4977-3867 | 이메일: skyyolle7@gmail.com</p>
              <p>호스팅 제공자: Vercel Inc.</p>
              <p className="mt-1.5 text-[#bbb]">ⓒ 2026 버디민턴. All rights reserved.</p>
            </div>
          </div>

          {/* ── 우측: 링크 3열 ── */}
          <div className="grid grid-cols-3 gap-4 text-[11px]">
            <div className="flex flex-col gap-1.5">
              <p className="font-bold text-[#111] mb-1 text-[12px]">서비스</p>
              <Link href="/product" className="text-[#555] hover:text-[#111] transition-colors">제품 소개</Link>
              <Link href="/demo"    className="text-[#555] hover:text-[#111] transition-colors">데모 체험</Link>
              <Link href="/shop"    className="text-[#555] hover:text-[#111] transition-colors">SHOP</Link>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-bold text-[#111] mb-1 text-[12px]">지원</p>
              <Link href="/faq"     className="text-[#555] hover:text-[#111] transition-colors">자주 묻는 질문</Link>
              <Link href="/contact" className="text-[#555] hover:text-[#111] transition-colors">문의하기</Link>
              <Link href="/blog"    className="text-[#555] hover:text-[#111] transition-colors">블로그</Link>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-bold text-[#111] mb-1 text-[12px]">법적고지</p>
              <Link href="/terms"          className="text-[#555] hover:text-[#111] transition-colors">이용약관</Link>
              <Link href="/privacy"        className="text-[#555] hover:text-[#111] transition-colors">개인정보처리방침</Link>
              <Link href="/policy/refund"  className="text-[#555] hover:text-[#111] transition-colors">환불정책</Link>
              <Link href="/business"       className="text-[#555] hover:text-[#111] transition-colors">사업자정보 확인</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
