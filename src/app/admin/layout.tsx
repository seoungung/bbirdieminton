'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin', label: '홈', icon: 'home' },
  { href: '/admin/quiz', label: '퀴즈 통계', icon: 'chart' },
  { href: '/admin/images', label: '이미지 관리', icon: 'image' },
  { href: '/admin/rackets', label: '라켓 데이터', icon: 'racket' },
] as const

function NavIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className ?? 'w-5 h-5'
  switch (icon) {
    case 'home':
      return (
        <svg className={cls} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      )
    case 'chart':
      return (
        <svg className={cls} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      )
    case 'image':
      return (
        <svg className={cls} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
      )
    case 'racket':
      return (
        <svg className={cls} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      )
    default:
      return null
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('admin_authed')
    if (stored === 'true') {
      setAuthed(true)
    }
    setChecking(false)
  }, [])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setError('')
    const res = await fetch('/api/admin/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoginLoading(false)
    if (!res.ok) {
      setError('비밀번호가 틀렸습니다.')
      return
    }
    localStorage.setItem('admin_authed', 'true')
    localStorage.setItem('admin_password', password)
    setAuthed(true)
  }, [password])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin_authed')
    localStorage.removeItem('admin_password')
    window.location.reload()
  }, [])

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  // Loading check
  if (checking) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#e5e5e5] border-t-[#beff00] rounded-full animate-spin" />
      </div>
    )
  }

  // Auth overlay
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-[#e5e5e5] p-8">
          <p className="text-[#beff00] text-xs font-bold uppercase tracking-widest mb-2">Admin</p>
          <h1 className="text-2xl font-extrabold text-[#111111] mb-6">관리자 로그인</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="관리자 비밀번호"
              className="h-12 px-4 rounded-xl bg-[#f8f8f8] border border-[#e5e5e5] text-[#111111] placeholder:text-[#999999] text-sm outline-none focus:border-[#beff00] transition-colors"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="h-12 bg-[#beff00] text-black font-extrabold text-sm rounded-xl hover:bg-[#a8e600] transition-colors disabled:opacity-50"
            >
              {loginLoading ? '확인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-[#e5e5e5] flex-col z-20">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-[#e5e5e5]">
          <p className="text-[#beff00] text-[10px] font-bold uppercase tracking-widest">Admin</p>
          <p className="text-sm font-extrabold text-[#111111] mt-0.5">버디민턴 관리자</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#beff00] text-black font-bold'
                    : 'text-[#555555] hover:bg-[#f0f0f0] hover:text-[#111111]'
                }`}
              >
                <NavIcon icon={item.icon} className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 border-t border-[#e5e5e5] pt-3 flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#999999] hover:text-[#555555] hover:bg-[#f0f0f0] transition-colors"
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            사이트로 돌아가기
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#999999] hover:text-red-500 hover:bg-[#f0f0f0] transition-colors text-left"
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            로그아웃
          </button>
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="md:hidden bg-white border-b border-[#e5e5e5] sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[#beff00] text-[10px] font-bold uppercase tracking-widest">Admin</p>
            <p className="text-sm font-extrabold text-[#111111]">버디민턴 관리자</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-[#999999] hover:text-red-500 transition-colors"
          >
            로그아웃
          </button>
        </div>
        {/* Tab bar */}
        <nav className="flex border-t border-[#e5e5e5]">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                  active
                    ? 'text-black bg-[#beff00]'
                    : 'text-[#999999] hover:text-[#555555]'
                }`}
              >
                <NavIcon icon={item.icon} className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Content */}
      <main className="md:ml-56">
        {children}
      </main>
    </div>
  )
}
