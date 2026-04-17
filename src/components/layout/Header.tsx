'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, User, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/login/actions'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// 데모 체험 링크: 로그인 상태면 /club/home, 아니면 로그인 페이지
const getDemoHref = (isLoggedIn: boolean) =>
  isLoggedIn ? '/club/home' : '/login?next=%2Fclub%2Fhome'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [anonName, setAnonName] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`

  useEffect(() => {
    // 1) 캐시된 닉네임을 즉시 복원 (깜빡임 방지)
    const cached = localStorage.getItem('birdieminton_anon_name')
    if (cached) setAnonName(cached)

    const supabase = createClient()

    // 2) 서버에서 세션 검증 후 닉네임 확정
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user?.is_anonymous) {
        // 캐시가 없을 때만 DB 조회
        if (!cached) {
          const { data: profile } = await supabase
            .from('users')
            .select('name')
            .eq('birdieminton_user_id', data.user.id)
            .single()
          if (profile?.name) {
            setAnonName(profile.name)
            localStorage.setItem('birdieminton_anon_name', profile.name)
          }
        }
      } else if (!data.user) {
        // 실제로 로그아웃 상태일 때만 초기화
        setAnonName(null)
        localStorage.removeItem('birdieminton_anon_name')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user?.is_anonymous) {
        // 캐시 우선 사용
        const cachedNow = localStorage.getItem('birdieminton_anon_name')
        if (cachedNow) {
          setAnonName(cachedNow)
        } else {
          const supabaseInner = createClient()
          const { data: profile } = await supabaseInner
            .from('users')
            .select('name')
            .eq('birdieminton_user_id', session.user.id)
            .single()
          if (profile?.name) {
            setAnonName(profile.name)
            localStorage.setItem('birdieminton_anon_name', profile.name)
          }
        }
      } else if (!session?.user) {
        // 완전 로그아웃 시에만 초기화
        setAnonName(null)
        localStorage.removeItem('birdieminton_anon_name')
      }
      // 소셜 로그인 유저: anonName은 null 유지 (표시명은 OAuth 메타데이터 사용)
    })
    return () => subscription.unsubscribe()
  }, [])

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  // 익명 유저는 users 테이블 닉네임 우선, 소셜은 OAuth 메타데이터
  const displayName = anonName ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? '게스트'

  const handleLogout = () => {
    localStorage.removeItem('birdieminton_anon_name')
    setDropdownOpen(false)
    startTransition(() => logout())
  }

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-black text-white border-b border-white/10">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-6 h-[56px] flex items-center justify-between gap-4">

          {/* 로고 */}
          <Link href="/" className="flex items-center shrink-0 hover:opacity-85 transition-opacity">
            <Image src="/textlogo_height_birdieminton-white.png" alt="birdieminton" width={28} height={40} className="object-contain h-10 w-auto" unoptimized />
          </Link>

          {/* 데스크톱 중앙 메뉴 */}
          <div className="hidden md:flex items-center gap-7 text-[14px] font-medium">
            {/* 데모 체험: 로그인 상태면 /club/home, 아니면 로그인 페이지 */}
            <Link
              href={getDemoHref(!!user)}
              className="flex items-center gap-1.5 text-[#beff00] font-semibold hover:text-[#beff00]/80 transition-colors"
            >
              🏸 데모 체험
            </Link>
            <Link href="/survey" className="text-white/70 hover:text-white transition-colors">
              설문 참여
            </Link>
          </div>

          {/* 오른쪽: 로그인 / 프로필 드롭다운 */}
          <div className="hidden md:flex items-center shrink-0 relative" ref={dropdownRef}>
            {user ? (
              <>
                {/* 트리거 버튼 */}
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex items-center gap-2 text-[13px] px-3 py-[7px] rounded-full border border-white/20 hover:border-white/40 transition-colors"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={displayName} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#beff00]/20 border border-[#beff00]/30 flex items-center justify-center">
                      <User size={11} className="text-[#beff00]" />
                    </div>
                  )}
                  <span className="text-white/80 max-w-[80px] truncate">{displayName}님</span>
                  <ChevronDown
                    size={13}
                    className={`text-white/40 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* 드롭다운 패널 */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
                    {/* 유저 정보 */}
                    <div className="px-4 py-3 border-b border-white/8">
                      <p className="text-xs font-semibold text-white truncate">{displayName}님</p>
                      <p className="text-[11px] text-white/35 truncate mt-0.5">{user.email}</p>
                    </div>
                    {/* 메뉴 항목 */}
                    <div className="p-1.5">
                      <Link
                        href="/mypage"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-white/70 hover:text-white hover:bg-white/6 transition-colors"
                      >
                        <LayoutDashboard size={14} className="text-white/40" />
                        마이페이지
                      </Link>
                      <button
                        onClick={handleLogout}
                        disabled={isPending}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-colors disabled:opacity-50"
                      >
                        <LogOut size={14} />
                        {isPending ? '로그아웃 중...' : '로그아웃'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                href={loginHref}
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
            <Link
              href={getDemoHref(!!user)}
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 text-[#beff00] font-semibold py-1"
            >
              🏸 데모 체험
            </Link>
            <Link
              href="/survey"
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white transition-colors py-1"
            >
              설문 참여
            </Link>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <>
                  {/* 유저 정보 */}
                  <div className="flex items-center gap-2.5 px-1 py-1.5">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={displayName} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#beff00]/20 border border-[#beff00]/30 flex items-center justify-center shrink-0">
                        <User size={13} className="text-[#beff00]" />
                      </div>
                    )}
                    <div>
                      <p className="text-[13px] font-semibold text-white leading-none">{displayName}님</p>
                      <p className="text-[11px] text-white/35 mt-0.5 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/mypage"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 py-2.5 px-3 rounded-xl border border-white/10 text-[13px] text-white/70 hover:text-white transition-colors"
                  >
                    <LayoutDashboard size={14} />
                    마이페이지
                  </Link>
                  <button
                    onClick={() => { localStorage.removeItem('birdieminton_anon_name'); setOpen(false); startTransition(() => logout()) }}
                    disabled={isPending}
                    className="flex items-center gap-2 py-2.5 px-3 rounded-xl border border-red-500/20 text-[13px] text-red-400/70 hover:text-red-400 transition-colors"
                  >
                    <LogOut size={14} />
                    {isPending ? '로그아웃 중...' : '로그아웃'}
                  </button>
                </>
              ) : (
                <Link
                  href={loginHref}
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
