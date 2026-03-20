import Link from 'next/link'
import Image from 'next/image'
import { Fragment } from 'react'

const LEGAL_LINKS = [
  { href: '/terms',    label: '이용약관' },
  { href: '/privacy',  label: '개인정보처리방침', bold: true },
  { href: '/business', label: '사업자정보확인' },
]

export default function Footer() {
  return (
    <footer className="bg-[#1C1C1C] text-white/50 text-[13px]">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-10">

        {/* 로고 */}
        <div className="flex items-center gap-2 mb-5">
          <Image
            src="/symbol_birdieminton-white.png"
            alt="birdieminton symbol"
            width={26}
            height={26}
            className="object-contain"
            unoptimized
          />
          <p className="text-white font-extrabold text-[18px] tracking-tight">
            birdieminton
          </p>
        </div>

        {/* 법적 링크 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5 text-[12px]">
          {LEGAL_LINKS.map(({ href, label, bold }, i) => (
            <Fragment key={href}>
              {i > 0 && <span className="text-white/20">|</span>}
              <Link
                href={href}
                className={
                  (bold ? 'text-white/80 font-semibold ' : '') +
                  'hover:text-white transition-colors'
                }
              >
                {label}
              </Link>
            </Fragment>
          ))}
        </div>

        {/* 사업자 정보 */}
        <p className="text-[11px] leading-[1.9] text-white/35 mb-6">
          상호 : 버드민턴&nbsp;&nbsp;|&nbsp;&nbsp;대표자 : -&nbsp;&nbsp;|&nbsp;&nbsp;사업자등록번호 : -<br />
          통신판매업신고번호 : -&nbsp;&nbsp;|&nbsp;&nbsp;개인정보책임자 : -&nbsp;&nbsp;|&nbsp;&nbsp;E-mail : hello@birdminton.kr
        </p>

        {/* 구분선 + 카피라이트 */}
        <div className="border-t border-white/10 pt-5">
          <p className="text-[11px] text-white/25 tracking-wide uppercase">
            COPYRIGHT BIRDMINTON. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  )
}
