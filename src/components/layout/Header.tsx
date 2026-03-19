'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/rackets', label: '라켓 도감', active: true },
  { href: '/brands',  label: '브랜드',   active: false },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      {/* 메인 네비게이션 */}
      <nav className="bg-black text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[56px] flex items-center justify-between gap-4">

          {/* 로고 */}
          <Link
            href="/"
            className="text-[18px] font-extrabold tracking-tight shrink-0 hover:text-[#BEFF00] transition-colors"
          >
            Birdminton
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center gap-7 text-[14px] font-medium">
            {NAV_LINKS.map(({ href, label, active }) => (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? 'text-white hover:text-[#BEFF00] transition-colors'
                    : 'text-white/50 hover:text-white/80 transition-colors'
                }
              >
                {label}
              </Link>
            ))}
          </div>

          {/* CTA 버튼 그룹 */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button className="text-[13px] px-4 py-[7px] rounded-full border border-white/30 hover:border-white transition-colors">
              제휴문의
            </button>
            <Link
              href="/quiz"
              className="text-[13px] px-4 py-[7px] rounded-full bg-[#BEFF00] text-black font-bold hover:brightness-110 transition-all"
            >
              배린이 레벨 테스트
            </Link>
          </div>

          {/* 모바일 햄버거 */}
          <button
            className="md:hidden p-1"
            onClick={() => setOpen(!open)}
            aria-label="메뉴"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* 모바일 드로어 */}
        {open && (
          <div className="md:hidden border-t border-white/10 px-4 pt-4 pb-5 flex flex-col gap-4 text-[14px]">
            {NAV_LINKS.map(({ href, label, active }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={active ? 'text-white' : 'text-white/50'}
              >
                {label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <button className="flex-1 py-2.5 rounded-full border border-white/30 text-[13px]">
                제휴문의
              </button>
              <Link
                href="/quiz"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-full bg-[#BEFF00] text-black font-bold text-[13px] text-center"
              >
                레벨 테스트
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
