'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Gamepad2, Trophy, Users, Wallet, Settings as SettingsIcon,
  Megaphone, MessageSquareText, Camera, CalendarDays, Shield,
  Menu, X, LogOut, ChevronRight,
} from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'

/* ── 사이드바 메뉴 아이템 타입 ── */
interface NavItem {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  /** URL 매칭 — 시작 경로로 일치하면 activate */
  match?: string
  managerOnly?: boolean
}

interface Props {
  clubId: string
  clubName: string
  clubLocation?: string | null
  leaderName?: string | null
  thumbnailColor?: string
  isOwner: boolean
  isManager: boolean
  isDemo?: boolean
  userName?: string
  unreadNoticeCount?: number
  children: React.ReactNode
}

/**
 * 🖥️ SaaS 스타일 앱 쉘
 *
 * 데스크톱: 좌측 240px 고정 사이드바 + 우측 메인
 * 태블릿/모바일: 햄버거 → 드로어 슬라이드인
 *
 * 모든 `/club/[clubId]/*` 라우트를 감쌉니다 (`/view` 제외).
 */
export function AppShell({
  clubId,
  clubName,
  clubLocation,
  leaderName,
  thumbnailColor,
  isOwner,
  isManager,
  isDemo,
  userName,
  unreadNoticeCount = 0,
  children,
}: Props) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  /* 경로 변경 시 드로어 자동 닫기 */
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  /* body 스크롤 잠금 (드로어 열림 시) */
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  /* 네비게이션 아이템 정의 */
  const mainNav: NavItem[] = [
    { href: `/club/${clubId}`,              label: '대시보드',   Icon: Home,            match: `/club/${clubId}` },
    { href: `/club/${clubId}/gameboard`,    label: '게임보드',   Icon: Gamepad2 },
    { href: `/club/${clubId}/ranking`,      label: '랭킹',       Icon: Trophy },
    { href: `/club/${clubId}/members`,      label: '멤버',       Icon: Users },
    { href: `/club/${clubId}/settlements`,  label: '셔틀콕비',   Icon: ShuttlecockIcon },
  ]

  const communityNav: NavItem[] = [
    { href: `/club/${clubId}/notices`,      label: '공지',       Icon: Megaphone },
    { href: `/club/${clubId}/board`,        label: '게시판',     Icon: MessageSquareText },
    { href: `/club/${clubId}/album`,        label: '앨범',       Icon: Camera },
    { href: `/club/${clubId}/events`,       label: '정기모임',   Icon: CalendarDays },
  ]

  const adminNav: NavItem[] = [
    { href: `/club/${clubId}/finance`,      label: '회비 관리',  Icon: Wallet,          managerOnly: true },
    { href: `/club/${clubId}/manage`,       label: '운영·관리',  Icon: Shield,          managerOnly: true },
    { href: `/club/${clubId}/settings`,     label: '모임 설정',  Icon: SettingsIcon },
  ]

  /* 활성 경로 판정 — 현재 pathname이 href로 시작하면 active */
  const isActive = (item: NavItem) => {
    const matchPath = item.match ?? item.href
    /* 정확히 match 경로거나, 하위 경로 (단, 대시보드는 정확히 일치만) */
    if (matchPath === `/club/${clubId}`) {
      return pathname === matchPath
    }
    return pathname === matchPath || pathname.startsWith(matchPath + '/')
  }

  /* 사이드바 내용 렌더 (데스크톱 / 모바일 드로어 공통) */
  const sidebarContent = (
    <>
      {/* 상단: 로고 + 클럽 */}
      <div className="px-4 pt-5 pb-4">
        <Link
          href="/club/home"
          className="flex items-center gap-2 text-[#111] mb-4 group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center group-hover:bg-[#beff00] transition-colors">
            <ShuttlecockIcon size={14} className="text-[#beff00] group-hover:text-[#111] transition-colors" strokeWidth={2} />
          </div>
          <span className="text-sm font-extrabold tracking-tight">버디민턴</span>
        </Link>

        {/* 클럽 아이덴티티 카드 */}
        <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: thumbnailColor ?? '#beff00' }}
            >
              <ShuttlecockIcon size={16} className="text-[#111]/70" strokeWidth={1.7} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-[#111] truncate">{clubName}</p>
              <p className="text-[10px] text-[#999] truncate">
                {isDemo ? '데모 체험 중' : clubLocation || leaderName || '모임'}
              </p>
            </div>
          </div>
          {isDemo && (
            <span className="mt-2 inline-block text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded tracking-wider">
              DEMO
            </span>
          )}
        </div>
      </div>

      {/* 메인 네비게이션 */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        <NavSection title="운영" items={mainNav} isActive={isActive} unreadNoticeCount={unreadNoticeCount} />
        <NavSection
          title="커뮤니티"
          items={communityNav}
          isActive={isActive}
          unreadNoticeCount={unreadNoticeCount}
        />
        <NavSection
          title="관리"
          items={adminNav.filter(item => !item.managerOnly || isManager)}
          isActive={isActive}
          unreadNoticeCount={0}
        />
      </nav>

      {/* 하단: 유저 + 로그아웃 */}
      <div className="border-t border-[#f0f0f0] p-3">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center text-[#beff00] text-xs font-extrabold shrink-0">
            {userName?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#111] truncate">{userName ?? '게스트'}</p>
            <p className="text-[10px] text-[#999]">
              {isOwner ? '모임장' : isManager ? '운영진' : '멤버'}
            </p>
          </div>
          <Link
            href="/club/home"
            className="w-7 h-7 rounded-lg hover:bg-[#f0f0f0] flex items-center justify-center text-[#999] hover:text-[#111] transition-colors"
            aria-label="내 모임 목록"
            title="다른 모임으로"
          >
            <LogOut size={13} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* ── 데스크톱 고정 사이드바 ── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-[240px] bg-white border-r border-[#e5e5e5] flex-col">
        {sidebarContent}
      </aside>

      {/* ── 모바일 드로어 ── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* 백드롭 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          {/* 드로어 패널 */}
          <aside className="relative flex flex-col w-[280px] bg-white shadow-xl animate-slide-in">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-[#f0f0f0] flex items-center justify-center text-[#555] transition-colors"
              aria-label="메뉴 닫기"
            >
              <X size={16} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ── 메인 영역 ── */}
      <div className="lg:pl-[240px]">
        {/* 모바일 상단 바 */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-[#e5e5e5]">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f8f8f8] text-[#555] transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu size={18} />
            </button>
            <Link
              href={`/club/${clubId}`}
              className="flex items-center gap-1.5 min-w-0"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: thumbnailColor ?? '#beff00' }}
              >
                <ShuttlecockIcon size={12} className="text-[#111]/70" strokeWidth={1.7} />
              </div>
              <span className="text-sm font-bold text-[#111] truncate max-w-[160px]">
                {clubName}
              </span>
            </Link>
            <div className="w-9" />
          </div>
        </header>

        <main id="main-content">{children}</main>
      </div>
    </div>
  )
}

/* ── 사이드바 섹션 ── */
function NavSection({
  title,
  items,
  isActive,
  unreadNoticeCount,
}: {
  title: string
  items: NavItem[]
  isActive: (item: NavItem) => boolean
  unreadNoticeCount: number
}) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="px-2.5 mb-1.5 text-[10px] font-extrabold text-[#bbb] uppercase tracking-wider">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map(item => {
          const active = isActive(item)
          const showBadge = item.label === '공지' && unreadNoticeCount > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? 'bg-[#0a0a0a] text-white'
                  : 'text-[#555] hover:bg-[#f8f8f8] hover:text-[#111]'
              }`}
            >
              <item.Icon
                size={15}
                strokeWidth={active ? 2.2 : 1.9}
                className={active ? 'text-[#beff00]' : 'text-[#999] group-hover:text-[#111]'}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {showBadge && (
                <span className="text-[9px] font-extrabold text-white bg-red-500 rounded-full min-w-[16px] h-[16px] px-1 inline-flex items-center justify-center leading-none">
                  {unreadNoticeCount > 99 ? '99+' : unreadNoticeCount}
                </span>
              )}
              {active && (
                <ChevronRight size={12} className="text-[#beff00] shrink-0" strokeWidth={2.5} />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
