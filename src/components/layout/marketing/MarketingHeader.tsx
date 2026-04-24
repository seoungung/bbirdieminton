'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/login/actions'
import { UserMenu } from './UserMenu'

const navLinks = [
  { href: '/product', label: '제품 소개' },
  { href: '/demo',    label: '데모 체험' },
]

interface UserState {
  isLoggedIn: boolean
  name: string
  email: string
  avatarUrl: string | null
}

export function MarketingHeader() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [user, setUser] = useState<UserState | null>(null) // null = 로딩 중

  useEffect(() => {
    const supabase = createClient()

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.is_anonymous) {
        setUser({ isLoggedIn: false, name: '', email: '', avatarUrl: null })
        return
      }
      setUser({
        isLoggedIn: true,
        name:
          (user.user_metadata?.name as string | undefined) ??
          (user.user_metadata?.full_name as string | undefined) ??
          user.email?.split('@')[0] ??
          '이름없음',
        email: user.email ?? '',
        avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      })
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

        {/* 데스크톱 우측 — 로그인 상태 분기 */}
        <div className="hidden md:flex items-center gap-3 shrink-0 min-w-[120px] justify-end">
          {user === null ? (
            // 로딩 중 — 아바타 자리 placeholder
            <div className="w-10 h-8 rounded-full bg-[#f5f5f5] animate-pulse" />
          ) : user.isLoggedIn ? (
            <UserMenu
              userName={user.name}
              userEmail={user.email}
              avatarUrl={user.avatarUrl}
            />
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
          {/* 유저 정보 카드 (로그인 시) */}
          {user?.isLoggedIn && (
            <div className="bg-[#f8f8f8] rounded-2xl p-4 mb-2 flex items-center gap-3">
              {user.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.avatarUrl.startsWith('http://') ? user.avatarUrl.replace(/^http:\/\//, 'https://') : user.avatarUrl}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border border-[#f0f0f0]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[14px] text-[#111] truncate">{user.name}</p>
                <p className="text-[12px] text-[#999] truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* 네비 링크 */}
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

          {/* 로그인 상태별 버튼 */}
          <div className="pt-3 border-t border-[#f0f0f0] flex flex-col gap-2">
            {user === null ? (
              <div className="h-10 rounded-full bg-[#f0f0f0] animate-pulse" />
            ) : user.isLoggedIn ? (
              <>
                <Link
                  href="/club/home"
                  onClick={() => setOpen(false)}
                  className="text-center py-2.5 rounded-full bg-[#0a0a0a] text-[13px] font-semibold text-white"
                >
                  내 모임
                </Link>
                <Link
                  href="/my/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-[#e5e5e5] text-[13px] text-[#555]"
                >
                  <UserIcon size={13} />
                  내 프로필
                </Link>
                <button
                  onClick={() => {
                    setOpen(false)
                    startTransition(() => logout())
                  }}
                  disabled={isPending}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[13px] text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
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
