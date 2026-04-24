'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Gamepad2, Trophy, Users, Wallet, Settings as SettingsIcon,
  Megaphone, BarChart3,
  Menu, X,
  Bell, Search, User as UserIcon,
} from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { ClubSwitcher, type ClubOption } from './ClubSwitcher'
import { AppHeader } from './AppHeader'
import { HelpCard } from './HelpCard'
import { AppSearchBar } from './AppSearchBar'
import { NotificationBell } from './NotificationBell'
import { QuickCreate } from './QuickCreate'
import { UserMenu } from '@/components/layout/marketing/UserMenu'

/* ── 사이드바 메뉴 아이템 타입 ── */
interface NavItem {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  match?: string
  ownerOnly?: boolean
  /** Pro 플랜 전용 (Phase 2) */
  proOnly?: boolean
}

interface Props {
  clubId: string
  clubName: string
  clubLocation?: string | null
  leaderName?: string | null
  thumbnailColor?: string
  isOwner: boolean
  isDemo?: boolean
  userName?: string
  userEmail?: string
  avatarUrl?: string | null
  unreadNoticeCount?: number
  /** 유저가 소속된 다른 클럽들 (현재 클럽 제외) */
  availableClubs?: ClubOption[]
  children: React.ReactNode
}

/**
 * SaaS 스타일 앱 쉘 (v2 — Apple 미니멀리즘)
 *
 * 데스크톱: 260px 고정 사이드바 + 상단 헤더 + 메인
 * 모바일: 햄버거 드로어 + 상단 헤더 + 하단 탭바
 */
export function AppShell({
  clubId,
  clubName,
  clubLocation,
  thumbnailColor,
  isOwner,
  isDemo,
  userName,
  userEmail,
  avatarUrl,
  unreadNoticeCount = 0,
  availableClubs = [],
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
    { href: `/club/${clubId}`,           label: '대시보드', Icon: Home,     match: `/club/${clubId}` },
    { href: `/club/${clubId}/gameboard`, label: '게임보드', Icon: Gamepad2 },
  ]

  const communityNav: NavItem[] = [
    { href: `/club/${clubId}/ranking`,   label: '랭킹', Icon: Trophy },
    { href: `/club/${clubId}/notices`,   label: '공지', Icon: Megaphone },
  ]

  const adminNav: NavItem[] = [
    { href: `/club/${clubId}/members`,   label: '회원',   Icon: Users,        ownerOnly: true },
    { href: `/club/${clubId}/finance`,   label: '정산',   Icon: Wallet,       ownerOnly: true },
    { href: `#`,                         label: '분석',   Icon: BarChart3,    ownerOnly: true, proOnly: true },
    { href: `/club/${clubId}/settings`,  label: '설정',   Icon: SettingsIcon, ownerOnly: true },
  ]

  /* 하단 탭바 (모바일 전용) */
  const bottomTabs = [
    { href: `/club/${clubId}`,           label: '홈',     Icon: Home,     match: `/club/${clubId}` },
    { href: `/club/${clubId}/gameboard`, label: '게임보드', Icon: Gamepad2, match: `/club/${clubId}/gameboard` },
    { href: `/club/${clubId}/ranking`,   label: '랭킹',   Icon: Trophy,   match: `/club/${clubId}/ranking` },
    { href: `/my/profile`,               label: '내정보', Icon: UserIcon, match: `/my/profile` },
  ]

  /* 활성 경로 판정 */
  const isActive = (item: NavItem) => {
    const matchPath = item.match ?? item.href
    if (matchPath === `/club/${clubId}`) {
      return pathname === matchPath
    }
    return pathname === matchPath || pathname.startsWith(matchPath + '/')
  }

  const currentClub: ClubOption = {
    id: clubId,
    name: clubName,
    location: clubLocation,
    thumbnailColor,
    isDemo,
  }

  /* 사이드바 내용 렌더 */
  const sidebarContent = (
    <>
      {/* 상단: 로고 */}
      <div className="px-4 pt-5 pb-4">
        <Link
          href="/club/home"
          className="flex items-center gap-2 text-[#111] mb-4 group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
            <ShuttlecockIcon size={14} className="text-[#beff00]" strokeWidth={2} />
          </div>
          <span className="text-[16px] font-extrabold tracking-tight">버디민턴</span>
        </Link>

        {/* 클럽 스위처 */}
        <ClubSwitcher current={currentClub} available={availableClubs} />
      </div>

      {/* 메인 네비게이션 */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
        <NavSection title="운영" items={mainNav} isActive={isActive} unreadNoticeCount={0} />
        <NavSection
          title="커뮤니티"
          items={communityNav}
          isActive={isActive}
          unreadNoticeCount={unreadNoticeCount}
        />
        <NavSection
          title="관리"
          items={adminNav.filter(item => !item.ownerOnly || isOwner)}
          isActive={isActive}
          unreadNoticeCount={0}
        />
      </nav>

      {/* 하단: 도움말 카드 */}
      <div className="p-3">
        <HelpCard />
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ── 데모 배너 ── */}
      {isDemo && (
        <div className="sticky top-0 z-50 bg-[#0a0a0a] text-white flex items-center justify-between px-4 py-2.5">
          <p className="text-[13px] font-medium flex items-center gap-2">
            <span className="text-[#beff00]">●</span>
            데모 체험 중 · 모든 데이터는 가상입니다
          </p>
          <Link
            href="/club/create"
            className="text-[12px] font-bold bg-[#beff00] text-[#0a0a0a] px-3.5 py-1.5 rounded-full hover:bg-[#a8e600] transition-colors whitespace-nowrap"
          >
            내 모임 만들기 →
          </Link>
        </div>
      )}

      {/* ── 데스크톱 고정 사이드바 ── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-[260px] bg-white border-r border-[#f0f0f0] flex-col">
        {sidebarContent}
      </aside>

      {/* ── 모바일 드로어 ── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex flex-col w-[282px] bg-white shadow-xl animate-slide-in">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-[#f0f0f0] flex items-center justify-center text-[#555] transition-colors z-10"
              aria-label="메뉴 닫기"
            >
              <X size={16} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ── 메인 영역 ── */}
      <div className="lg:pl-[260px]">
        {/* 데스크톱 전역 헤더 */}
        {userName && userEmail !== undefined && (
          <AppHeader
            clubId={clubId}
            isOwner={isOwner}
            unreadNoticeCount={unreadNoticeCount}
            userName={userName}
            userEmail={userEmail ?? ''}
            avatarUrl={avatarUrl ?? null}
          />
        )}

        {/* 모바일 상단 바 (검색·알림·유저 포함) */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2 px-3 h-14">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] text-[#555] transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu size={18} />
            </button>
            <Link
              href={`/club/${clubId}`}
              className="flex items-center gap-1.5 min-w-0 flex-1"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: thumbnailColor ?? '#beff00' }}
              >
                <ShuttlecockIcon size={12} className="text-[#111]/70" strokeWidth={1.7} />
              </div>
              <span className="text-sm font-bold text-[#111] truncate">
                {clubName}
              </span>
            </Link>
            <NotificationBell clubId={clubId} unreadNoticeCount={unreadNoticeCount} />
            <QuickCreate clubId={clubId} isOwner={isOwner} />
            {userName && userEmail !== undefined ? (
              <UserMenu userName={userName} userEmail={userEmail ?? ''} avatarUrl={avatarUrl ?? null} />
            ) : (
              <Link
                href="/login"
                className="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#555]"
                aria-label="로그인"
              >
                <UserIcon size={15} />
              </Link>
            )}
          </div>
        </header>

        <main id="main-content" className="pb-16 lg:pb-0">{children}</main>
      </div>

      {/* ── 모바일 하단 탭바 ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur-md border-t border-[#f0f0f0] flex items-center justify-around h-16">
        {bottomTabs.map(({ href, label, Icon, match }) => {
          const active = match === `/club/${clubId}`
            ? pathname === match
            : pathname === match || pathname.startsWith(match + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 py-2 px-3 transition-colors ${
                active ? 'text-[#0a0a0a]' : 'text-[#bbb]'
              }`}
            >
              {active && (
                <span className="absolute top-0 w-8 h-[2px] bg-[#0a0a0a] rounded-b-full" />
              )}
              <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          )
        })}
      </nav>
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
      <p className="px-3 mb-2 text-[11px] font-bold text-[#999] uppercase tracking-widest">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map(item => {
          const active = isActive(item)
          const showBadge = item.label === '공지' && unreadNoticeCount > 0

          /* 좌측 활성 바 + 연회색 배경 스타일 */
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                active
                  ? 'bg-[#f5f5f5] text-[#0a0a0a]'
                  : 'text-[#555] hover:bg-[#fafafa] hover:text-[#111]'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] bg-[#0a0a0a] rounded-r-full" />
              )}
              <item.Icon
                size={15}
                strokeWidth={active ? 2.2 : 1.9}
                className={active ? 'text-[#0a0a0a]' : 'text-[#bbb] group-hover:text-[#555]'}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.proOnly && (
                <span className="text-[9px] font-extrabold text-[#f59e0b] bg-[#fef3c7] px-1.5 py-0.5 rounded tracking-wider">
                  PRO
                </span>
              )}
              {showBadge && (
                <span className="text-[10px] font-extrabold text-white bg-[#10b981] rounded-full min-w-[18px] h-[18px] px-1.5 inline-flex items-center justify-center leading-none">
                  {unreadNoticeCount > 99 ? '99+' : unreadNoticeCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
