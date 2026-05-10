'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState, useTransition } from 'react'
import { User as UserIcon, Users, MessageSquare, LogOut, ChevronUp, Wrench } from 'lucide-react'
import { logout } from '@/app/login/actions'

interface Props {
  userName: string
  userEmail: string
  avatarUrl: string | null
  /** 접힘 사이드바 (아이콘 only)일 때 true */
  collapsed: boolean
  /** 시스템 마스터(슈퍼어드민) 여부 — true 일 때만 메뉴에 "관리자" 항목 노출 */
  isMaster?: boolean
}

/**
 * 사이드바 하단 유저 메뉴 (클럽 앱).
 *
 * - collapsed: 38×38 아바타만 표시 → 클릭 시 우측 위로 드롭다운 펼침
 * - expanded:  아바타 + 이름 + 이메일 + 위쪽 화살표 → 클릭 시 위쪽으로 드롭다운 펼침
 *
 * 마케팅 헤더용 UserMenu 와 별개로, 사이드바 좌측 하단에 anchor 되도록 위치 조정.
 */
export function SidebarUserMenu({ userName, userEmail, avatarUrl, collapsed, isMaster }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const menuRef = useRef<HTMLDivElement>(null)

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
      {/* 트리거 */}
      {collapsed ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={isPending}
          aria-label="사용자 메뉴"
          aria-expanded={open}
          aria-haspopup="menu"
          title={userName}
          className="w-full flex items-center justify-center py-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-lime)] focus-visible:ring-offset-1 disabled:opacity-50"
        >
          <Avatar url={avatarUrl} name={userName} size={36} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={isPending}
          aria-label="사용자 메뉴"
          aria-expanded={open}
          aria-haspopup="menu"
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-[#fafafa] border border-[#f0f0f0] hover:bg-[#f5f5f5] hover:border-[#e5e5e5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-lime)] focus-visible:ring-offset-1 disabled:opacity-50"
        >
          <Avatar url={avatarUrl} name={userName} size={32} />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[12.5px] font-semibold text-[#111] truncate leading-tight">
              {userName}
            </p>
            <p className="text-[10.5px] text-[#999] truncate mt-0.5 leading-tight">
              {userEmail}
            </p>
          </div>
          <ChevronUp
            size={13}
            strokeWidth={2.4}
            className={`text-[#999] transition-transform duration-200 shrink-0 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {/* 드롭다운 — 위쪽 + 좌측 정렬 */}
      {open && (
        <div
          role="menu"
          className={`absolute z-[60] w-[260px] bg-white rounded-2xl border border-[#e5e5e5] shadow-lg overflow-hidden animate-[fadeInUpAnchor_160ms_ease-out] ${
            collapsed
              ? 'left-full bottom-0 ml-2'
              : 'left-0 right-0 bottom-full mb-2 w-auto min-w-[240px]'
          }`}
        >
          {/* 유저 정보 헤더 */}
          <div className="px-4 py-3.5 border-b border-[#f0f0f0] flex items-center gap-3">
            <Avatar url={avatarUrl} name={userName} size={40} />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[13.5px] text-[#111] truncate">{userName}</p>
              <p className="text-[11.5px] text-[#999] truncate mt-0.5">{userEmail}</p>
            </div>
          </div>

          {/* 주 메뉴 */}
          <nav className="py-1.5">
            <SidebarMenuItem
              href="/clubs"
              icon={Users}
              label="내 모임"
              description="소속된 클럽 목록"
              onClick={() => setOpen(false)}
            />
            <SidebarMenuItem
              href="/my/profile"
              icon={UserIcon}
              label="내 프로필"
              description="닉네임·프로필 관리"
              onClick={() => setOpen(false)}
            />
            <SidebarMenuItem
              href="/contact"
              icon={MessageSquare}
              label="문의하기"
              description="1:1 고객센터"
              onClick={() => setOpen(false)}
            />
          </nav>

          {/* 마스터 전용 링크 — isMaster=true 일 때만 노출. 일반 유저에게는 절대 안 보임. */}
          {isMaster && (
            <>
              <div className="border-t border-[#f0f0f0]" />
              <nav className="py-1.5">
                <Link
                  href="/admin"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fef2f2] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#fee2e2] flex items-center justify-center text-[#b91c1c]">
                    <Wrench size={14} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#b91c1c]">관리자</p>
                    <p className="text-[11px] text-[#999] truncate mt-0.5">
                      시스템 마스터 콘솔
                    </p>
                  </div>
                </Link>
              </nav>
            </>
          )}

          <div className="border-t border-[#f0f0f0]" />

          {/* 로그아웃 */}
          <div className="py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--color-brand-team-b-bg)] transition-colors disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-streak-bg)] flex items-center justify-center text-[var(--color-brand-streak)]">
                <LogOut size={14} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[var(--color-brand-streak)]">
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

interface SidebarMenuItemProps {
  href: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  description: string
  onClick: () => void
}

function SidebarMenuItem({ href, icon: Icon, label, description, onClick }: SidebarMenuItemProps) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8f8f8] transition-colors"
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
