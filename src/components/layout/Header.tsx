'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/rackets', label: '라켓 도감' },
  { href: '/quiz',    label: '레벨 테스트' },
  { href: '/guide',   label: '가이드북' },
  { href: '/about',   label: '버디민턴 소개' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-black text-white border-b border-white/10">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 h-[56px] flex items-center justify-between gap-4">

          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 hover:opacity-85 transition-opacity"
          >
            <Image
              src="/symbol_birdieminton-color.png"
              alt="birdieminton symbol"
              width={28}
              height={28}
              className="object-contain"
              unoptimized
            />
            <span className="text-[18px] font-extrabold tracking-tight text-white hover:text-[#BEFF00] transition-colors">
              birdieminton
            </span>
          </Link>

          {/* 데스크톱 중앙 메뉴 */}
          <div className="hidden md:flex items-center gap-7 text-[14px] font-medium">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-white/70 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* 오른쪽: 제휴 문의 */}
          <div className="hidden md:flex items-center shrink-0">
            <a
              href="mailto:hello@birdieminton.com"
              className="text-[13px] px-4 py-[7px] rounded-full border border-white/30 hover:border-white transition-colors"
            >
              제휴 문의
            </a>
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
          <div className="md:hidden border-t border-white/10 px-4 pt-4 pb-5 flex flex-col gap-3 text-[14px]">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition-colors py-1"
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10">
              <a
                href="mailto:hello@birdieminton.com"
                className="block text-center py-2.5 rounded-full border border-white/30 text-[13px] text-white/70"
              >
                제휴 문의
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
