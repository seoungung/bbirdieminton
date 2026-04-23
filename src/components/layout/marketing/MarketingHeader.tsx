'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'

const navLinks = [
  { href: '/features', label: '기능소개' },
  { href: '/pricing',  label: '요금제' },
  { href: '/shop',     label: 'SHOP' },
  { href: '/demo',     label: '데모 체험' },
]

export function MarketingHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e5e5e5]">
      <div className="max-w-[1088px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
            <ShuttlecockIcon size={14} className="text-[#beff00]" strokeWidth={2} />
          </div>
          <span className="text-[17px] font-extrabold tracking-tight text-[#111]">버디민턴</span>
        </Link>

        {/* 데스크톱 nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[14px] font-medium text-[#555] hover:text-[#111] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* 데스크톱 CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="text-[13px] font-medium text-[#555] hover:text-[#111] transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/club/new"
            className="text-[13px] font-semibold px-4 py-2 rounded-full bg-[#beff00] text-[#0a0a0a] hover:bg-[#a8e600] transition-colors"
          >
            무료로 시작하기
          </Link>
        </div>

        {/* 모바일 햄버거 */}
        <button
          className="md:hidden p-1 text-[#555]"
          onClick={() => setOpen(!open)}
          aria-label="메뉴"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* 모바일 드로어 */}
      {open && (
        <div className="md:hidden border-t border-[#e5e5e5] px-4 pt-4 pb-5 flex flex-col gap-3 bg-white">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-[14px] text-[#555] hover:text-[#111] py-1 transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#f0f0f0] flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-center py-2.5 rounded-full border border-[#e5e5e5] text-[13px] text-[#555]"
            >
              로그인
            </Link>
            <Link
              href="/club/new"
              onClick={() => setOpen(false)}
              className="text-center py-2.5 rounded-full bg-[#beff00] text-[13px] font-semibold text-[#0a0a0a]"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
