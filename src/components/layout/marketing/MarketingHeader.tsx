'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { Menu, X, LogOut } from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/login/actions'

const navLinks = [
  { href: '/product', label: '제품 소개' },
  { href: '/demo',    label: '데모 체험' },
]

export function MarketingHeader() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      const loggedIn = !!user && !user.is_anonymous
      setIsLoggedIn(loggedIn)
      setUserName(
        (user?.user_metadata?.name as string | undefined) ??
        (user?.user_metadata?.full_name as string | undefined) ??
        null
      )
    }
    checkAuth()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })
    return () => sub.subscription.unsubscribe()
  }, [])

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

        {/* 데스크톱 CTA — 로그인 상태 분기 */}
        <div className="hidden md:flex items-center gap-3 shrink-0 min-w-[180px] justify-end">
          {isLoggedIn === null ? (
            // 초기 로딩 (세션 확인 중) — 깜빡임 방지용 placeholder
            <div className="h-8 w-32 rounded-full bg-[#f0f0f0] animate-pulse" />
          ) : isLoggedIn ? (
            <>
              {userName && (
                <span className="text-[13px] text-[#999]">{userName} 님</span>
              )}
              <Link
                href="/club/home"
                className="text-[13px] font-semibold px-4 py-2 rounded-full bg-[#0a0a0a] text-white hover:bg-[#222] transition-colors"
              >
                내 모임
              </Link>
              <button
                onClick={() => startTransition(() => logout())}
                disabled={isPending}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#999] hover:text-[#111] transition-colors disabled:opacity-50"
                aria-label="로그아웃"
              >
                <LogOut size={14} />
                {isPending ? '...' : '로그아웃'}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13px] font-medium text-[#555] hover:text-[#111] transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/login?next=%2Fclub%2Fhome"
                className="text-[13px] font-semibold px-4 py-2 rounded-full bg-[#beff00] text-[#0a0a0a] hover:bg-[#a8e600] transition-colors"
              >
                무료로 시작하기
              </Link>
            </>
          )}
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
            {isLoggedIn === null ? (
              <div className="h-10 rounded-full bg-[#f0f0f0] animate-pulse" />
            ) : isLoggedIn ? (
              <>
                {userName && (
                  <p className="text-center text-[12px] text-[#999] py-1">
                    {userName} 님
                  </p>
                )}
                <Link
                  href="/club/home"
                  onClick={() => setOpen(false)}
                  className="text-center py-2.5 rounded-full bg-[#0a0a0a] text-[13px] font-semibold text-white"
                >
                  내 모임
                </Link>
                <button
                  onClick={() => {
                    setOpen(false)
                    startTransition(() => logout())
                  }}
                  disabled={isPending}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-[#e5e5e5] text-[13px] text-[#999] hover:text-[#111] disabled:opacity-50"
                >
                  <LogOut size={13} />
                  {isPending ? '로그아웃 중...' : '로그아웃'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-center py-2.5 rounded-full border border-[#e5e5e5] text-[13px] text-[#555]"
                >
                  로그인
                </Link>
                <Link
                  href="/login?next=%2Fclub%2Fhome"
                  onClick={() => setOpen(false)}
                  className="text-center py-2.5 rounded-full bg-[#beff00] text-[13px] font-semibold text-[#0a0a0a]"
                >
                  무료로 시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
