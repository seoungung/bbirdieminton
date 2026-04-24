'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState, useTransition } from 'react'
import { User as UserIcon, Users, MessageSquare, LogOut, Settings, ChevronDown } from 'lucide-react'
import { logout } from '@/app/login/actions'

interface Props {
  userName: string
  userEmail: string
  avatarUrl: string | null
}

export function UserMenu({ userName, userEmail, avatarUrl }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const menuRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 + ESC 키로 닫기
  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  function handleLogout() {
    setOpen(false)
    startTransition(() => logout())
  }

  return (
    <div ref={menuRef} className="relative">
      {/* 아바타 트리거 */}
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-full transition-all hover:bg-[#f5f5f5] pl-0.5 pr-2 py-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-2 disabled:opacity-50"
        aria-label="사용자 메뉴"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar url={avatarUrl} name={userName} size={32} />
        <ChevronDown
          size={13}
          className={`text-[#999] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.5}
        />
      </button>

      {/* 드롭다운 */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-2xl border border-[#e5e5e5] shadow-lg overflow-hidden z-[60] animate-[fadeInDown_150ms_ease-out]"
        >
          {/* 유저 정보 헤더 */}
          <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center gap-3">
            <Avatar url={avatarUrl} name={userName} size={44} />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[14px] text-[#111] truncate">{userName}</p>
              <p className="text-[12px] text-[#999] truncate mt-0.5">{userEmail}</p>
            </div>
          </div>

          {/* 주 메뉴 */}
          <nav className="py-1.5">
            <MenuItem
              href="/club/home"
              icon={Users}
              label="내 모임"
              description="소속된 클럽 목록"
              onClick={() => setOpen(false)}
            />
            <MenuItem
              href="/my/profile"
              icon={UserIcon}
              label="내 프로필"
              description="닉네임·프로필 관리"
              onClick={() => setOpen(false)}
            />
            <MenuItem
              href="/contact"
              icon={MessageSquare}
              label="문의하기"
              description="1:1 고객센터"
              onClick={() => setOpen(false)}
            />
          </nav>

          {/* 구분선 */}
          <div className="border-t border-[#f0f0f0]" />

          {/* 로그아웃 */}
          <div className="py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-[#fef2f2] transition-colors disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                <LogOut size={14} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-red-500">
                  {isPending ? '로그아웃 중...' : '로그아웃'}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────── */

function Avatar({ url, name, size }: { url: string | null; name: string; size: number }) {
  const [failed, setFailed] = useState(false)

  // 카카오 CDN이 http로 주는 경우 대비 https로 치환
  const safeUrl = url?.startsWith('http://') ? url.replace(/^http:\/\//, 'https://') : url
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  if (safeUrl && !failed) {
    return (
      <Image
        src={safeUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0 border border-[#f0f0f0]"
        onError={() => setFailed(true)}
        unoptimized
      />
    )
  }

  return (
    <div
      className="rounded-full bg-[#0a0a0a] text-white flex items-center justify-center shrink-0 font-bold"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-label={name}
    >
      {initial}
    </div>
  )
}

/* ─────────────────────────────────────────────── */

interface MenuItemProps {
  href: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  description: string
  onClick: () => void
}

function MenuItem({ href, icon: Icon, label, description, onClick }: MenuItemProps) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#f8f8f8] transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-[#0a0a0a]">
        <Icon size={14} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#111]">{label}</p>
        <p className="text-[11px] text-[#999] truncate mt-0.5">{description}</p>
      </div>
    </Link>
  )
}
