'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/rackets', label: '라켓 도감' },
  { href: '/quiz',    label: '레벨 테스트' },
  { href: '/guide',   label: '가이드북' },
  { href: '/about',   label: '버디민턴 소개' },
  { href: '/partnership', label: '제휴 문의' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? ''

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-black text-white border-b border-white/10">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 h-[56px] flex items-center justify-between gap-4">

          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-85 transition-opacity">
            <Image src="/symbol_birdieminton-color.png" alt="birdieminton symbol" width={28} height={28} className="object-contain" unoptimized />
            <span className="text-[18px] font-extrabold tracking-tight text-white hover:text-[#BEFF00] transition-colors">
              birdieminton
            </span>
          </Link>

          {/* 데스크톱 중앙 메뉴 */}
          <div className="hidden md:flex items-center gap-7 text-[14px] font-medium">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="text-white/70 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>

          {/* 오른쪽: 로그인/마이페이지 */}
          <div className="hidden md:flex items-center shrink-0">
            {user ? (
              <Link
                href="/mypage"
                className="flex items-center gap-2 text-[13px] px-3 py-[7px] rounded-full border border-white/20 hover:border-white/40 transition-colors"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={displayName} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <User size={14} className="text-white/60" />
                )}
                <span className="text-white/70 hover:text-white max-w-[80px] truncate">{displayName}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-[13px] px-4 py-[7px] rounded-full border border-white/30 hover:border-white transition-colors"
              >
                로그인
              </Link>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button className="md:hidden p-1" onClick={() => setOpen(!open)} aria-label="메뉴">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* 모바일 드로어 */}
        {open && (
          <div className="md:hidden border-t border-white/10 px-4 pt-4 pb-5 flex flex-col gap-3 text-[14px]">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors py-1">
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10">
              {user ? (
                <Link
                  href="/mypage"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full border border-white/30 text-[13px] text-white/70"
                >
                  <User size={14} />
                  마이페이지
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block text-center py-2.5 rounded-full border border-white/30 text-[13px] text-white/70"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
