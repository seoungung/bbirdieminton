'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import {
  Home, Gamepad2, Trophy, Compass,
  Menu, X, ChevronLeft, ChevronRight,
  BookOpen, Newspaper,
  // T0-1-7: Users / SettingsIcon / BarChart3 / CalendarDays 사이드바 hide
  //   (PRD §2.2 상단 탭 [일정]·[멤버]·[스탯]·[관리] 으로 이동 — ClubTopTabs.tsx).
  // T0-1-6: Award hide (Stage A W5 /mypage 흡수 시 복구).
} from 'lucide-react'
// T0-1-4: ShuttlecockIcon import 제거 (사이드바 hide로 미사용). Stage C 에서 복구.
import { ClubSwitcher, type ClubOption } from './ClubSwitcher'
import { SidebarSearch } from './SidebarSearch'
import { SidebarNotificationBell } from './SidebarNotificationBell'
import { SidebarUserMenu } from './SidebarUserMenu'

/* HelpFloatingWidget 은 below-fold 라 lazy. SSR=false 로 서버 렌더 스킵. */
const HelpFloatingWidget  = dynamic(() => import('./HelpFloatingWidget').then(m => ({ default: m.HelpFloatingWidget })),   { ssr: false })

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
  userName?: string
  userEmail?: string
  avatarUrl?: string | null
  unreadNoticeCount?: number
  /** 현재 사용자의 이 클럽 내 역할 (사이드바 배지 표시용) */
  role?: 'owner' | 'manager' | 'member'
  /** 유저가 소속된 다른 클럽들 (현재 클럽 제외) */
  availableClubs?: ClubOption[]
  /** 시스템 마스터(슈퍼어드민) 여부 — 사이드바 유저 메뉴 "관리자" 노출용 */
  isMaster?: boolean
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
  userName,
  userEmail,
  avatarUrl,
  unreadNoticeCount = 0,
  role,
  availableClubs = [],
  isMaster,
  children,
}: Props) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  /* 데스크톱 사이드바 접기/펼치기 — localStorage 영구 저장.
   * xl+ (≥1280px) 에서만 토글 의미 있음. xl 미만은 항상 접힌 상태. */
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('appshell-sidebar-collapsed') === '1'
  })
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem('appshell-sidebar-collapsed', next ? '1' : '0')
      }
      return next
    })
  }

  /* xl 브레이크포인트 (1280px) 감지 — 미만이면 사이드바 강제 접힘.
   * 모바일 (< md, 768px)는 사이드바 자체가 안 보이고 햄버거 드로어만.
   *
   * useSyncExternalStore 패턴: useEffect 내부 setState 회피
   * (react-hooks/set-state-in-effect 위반 방지). */
  const isXlScreen = useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia('(min-width: 1280px)')
      mql.addEventListener('change', notify)
      return () => mql.removeEventListener('change', notify)
    },
    () => window.matchMedia('(min-width: 1280px)').matches,
    () => false, // SSR snapshot
  )

  /* 실효 접힘 상태: xl 미만이면 강제 접힘, xl+ 면 사용자 설정 따름 */
  const effectiveCollapsed = !isXlScreen || sidebarCollapsed

  /* 경로 변경 시 드로어 자동 닫기 — "Adjusting state while rendering" 패턴.
   * useEffect 내부 setState (cascading renders) 회피하면서도
   * useRef 렌더 중 접근(react-hooks/refs) 도 회피하기 위해 useState 로 이전 pathname 저장.
   * React 공식 가이드: https://react.dev/reference/react/useState#storing-information-from-previous-renders */
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    if (drawerOpen) setDrawerOpen(false)
  }

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

  /* 네비게이션 아이템 정의.
   *
   * T0-1-7: PRD §2.2 상단 탭([일정]·[멤버]·[스탯]·[관리]) 신설에 따라
   *   - `events`, `members`, `stats`, `settings` 는 사이드바에서 hide (ClubTopTabs 에서 처리).
   *   - 사이드바에는 대시보드·게임보드·랭킹·리소스만 남김.
   *   - 외부 진입점(Dashboard ShortcutCard, SetupPhase 등) 은 그대로 작동. */
  const mainNav: NavItem[] = [
    { href: `/club/${clubId}`,           label: '대시보드',   Icon: Home,         match: `/club/${clubId}` },
    { href: `/club/${clubId}/gameboard`, label: '게임보드',   Icon: Gamepad2 },
  ]

  const communityNav: NavItem[] = [
    /* T0-1-2: 랭킹은 사이드바 유지 + stats?tab=ranking 양쪽 미러링.
     *   회원도 직접 진입 가능해야 하므로 stats 통합 허브와는 별개로 사이드바 노출. */
    { href: `/club/${clubId}/ranking`,   label: '랭킹',   Icon: Trophy },
    // T0-1-6: /me 사이드바 hide. Stage A W5 에서 /mypage 로 흡수 예정.
    // Stage 0 W2 의 Glicko mu/phi 전환 검증용으로 라우트 살려둠 (직접 URL 진입 가능).
    // { href: `/club/${clubId}/me`,        label: '내 카드', Icon: Award },
  ]

  /* T0-1-7: adminNav 의 [회원]·[스탯]·[관리] 는 상단 탭으로 이동.
   *   사이드바 [관리] 섹션은 비워둠 — NavSection 의 `items.length === 0` 가드로 헤더도 자동 hide. */
  const adminNav: NavItem[] = [
    // T0-1-4: /shuttle 사이드바 hide. Stage C TC-1-5 에서 /session/{id}/summary 정산소로 통합 예정.
    // 직접 URL 진입(/shuttle)은 가능 — 운영자 임시 접근용.
    // { href: `/club/${clubId}/shuttle`,   label: '셔틀콕', Icon: ShuttlecockIcon, ownerOnly: true },
  ]

  const resourceNav: NavItem[] = [
    { href: '/clubs',   label: '모임 둘러보기', Icon: Compass,    match: '/clubs' },
    { href: '/manual',  label: '사용설명서',     Icon: BookOpen,   match: '/manual' },
    { href: '/blog',    label: '블로그',         Icon: Newspaper,  match: '/blog' },
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
    role,
  }

  /* 사이드바 내용 렌더 — collapsed 일 때는 아이콘만 표시 (lg+ 데스크톱 한정) */
  const renderSidebar = (collapsed: boolean) => (
    <>
      {/* 상단: 로고 */}
      <div className={collapsed ? 'px-2 pt-5 pb-3' : 'px-4 pt-5 pb-3'}>
        <Link
          href="/clubs"
          className={`flex items-center mb-3 hover:opacity-80 transition-opacity ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? '버디민턴' : undefined}
        >
          {collapsed ? (
            <Image
              src="/symbol_birdieminton-black.png"
              alt="버디민턴"
              width={28}
              height={28}
              priority
              className="h-7 w-7 object-contain"
            />
          ) : (
            <Image
              src="/textlogo_height_birdieminton-black.png"
              alt="버디민턴"
              width={120}
              height={28}
              priority
              className="h-6 w-auto object-contain"
            />
          )}
        </Link>

        {/* 클럽 스위처 — 접힘 상태에서는 숨김 (펼치기 후 사용) */}
        {!collapsed && <ClubSwitcher current={currentClub} available={availableClubs} />}
      </div>

      {/* 검색 + 알림 — 사이드바 상단 액션 영역 */}
      <div
        className={`pb-3 border-b border-[#f0f0f0] ${
          collapsed ? 'px-2 space-y-1' : 'px-3 space-y-1.5'
        }`}
      >
        <SidebarSearch collapsed={collapsed} />
        <SidebarNotificationBell
          clubId={clubId}
          unreadNoticeCount={unreadNoticeCount}
          collapsed={collapsed}
        />
      </div>

      {/* 메인 네비게이션 */}
      <nav className={`flex-1 overflow-y-auto py-4 space-y-6 ${collapsed ? 'px-2' : 'px-3'}`}>
        <NavSection title="운영" items={mainNav} isActive={isActive} unreadNoticeCount={0} collapsed={collapsed} />
        <NavSection
          title="커뮤니티"
          items={communityNav}
          isActive={isActive}
          unreadNoticeCount={unreadNoticeCount}
          collapsed={collapsed}
        />
        <NavSection
          title="관리"
          items={adminNav.filter(item => !item.ownerOnly || isOwner)}
          isActive={isActive}
          unreadNoticeCount={0}
          collapsed={collapsed}
        />
        <NavSection
          title="리소스"
          items={resourceNav}
          isActive={isActive}
          unreadNoticeCount={0}
          collapsed={collapsed}
        />
      </nav>

      {/* 하단: 유저 메뉴 — 로그인 상태에서만 노출 */}
      {userName && userEmail !== undefined ? (
        <div
          className={`border-t border-[#f0f0f0] ${
            collapsed ? 'px-2 py-3' : 'px-3 py-3'
          }`}
        >
          <SidebarUserMenu
            userName={userName}
            userEmail={userEmail ?? ''}
            avatarUrl={avatarUrl ?? null}
            collapsed={collapsed}
            isMaster={isMaster}
          />
        </div>
      ) : (
        <div className={`border-t border-[#f0f0f0] ${collapsed ? 'px-2 py-3' : 'px-3 py-3'}`}>
          <Link
            href="/login"
            className={`flex items-center rounded-lg text-[13px] font-semibold text-[#111] hover:bg-[#f5f5f5] transition-colors ${
              collapsed ? 'justify-center py-2' : 'gap-2 px-3 py-2'
            }`}
            title={collapsed ? '로그인' : undefined}
          >
            <span className={collapsed ? 'sr-only' : ''}>로그인</span>
            {collapsed && <span aria-hidden="true">→</span>}
          </Link>
        </div>
      )}
    </>
  )

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ── 사이드바 (md+ 노출) ──
          · md ~ xl 미만: 강제 접힘 (68px, 아이콘 only)
          · xl+: 사용자 설정 따라 220px 펼침 또는 68px 접힘 (토글 가능)
          · md 미만: 숨김 (햄버거 드로어로 대체) */}
      <aside
        className={`hidden md:flex fixed inset-y-0 left-0 z-30 bg-white border-r border-[#f0f0f0] flex-col print:hidden transition-[width] duration-200 ${
          effectiveCollapsed ? 'w-[68px]' : 'w-[220px]'
        }`}
      >
        {renderSidebar(effectiveCollapsed)}
        {/* 토글 버튼 — xl+ 에서만 노출 (그 이하는 강제 접힘이라 토글 의미 X) */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          title={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          className="hidden xl:flex absolute top-6 -right-3 w-6 h-6 rounded-full bg-white border border-[#e5e5e5] hover:bg-[#f5f5f5] items-center justify-center text-[#555] z-10 shadow-sm transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ── 모바일 드로어 (< md 에서만) ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
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
            {renderSidebar(false)}
          </aside>
        </div>
      )}

      {/* ── 메인 영역 — md+ 에서 사이드바 폭만큼 좌측 패딩 ── */}
      <div
        className={`print:pl-0 transition-[padding] duration-200 ${
          effectiveCollapsed ? 'md:pl-[68px]' : 'md:pl-[220px]'
        }`}
      >
        {/* 모바일 상단 바 (< md 에서만) — 햄버거 + 로고 + 클럽명 만 (검색·알림·유저메뉴는 드로어 사이드바로 이동) */}
        <header className="md:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#f0f0f0] print:hidden">
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
              className="flex items-center gap-2 min-w-0 flex-1"
            >
              <Image
                src="/symbol_birdieminton-black.png"
                alt="버디민턴"
                width={22}
                height={22}
                className="h-5 w-auto object-contain shrink-0"
              />
              <span className="text-sm font-bold text-[#111] truncate">
                {clubName}
              </span>
            </Link>
          </div>
        </header>

        <main id="main-content" className="print:pb-0">{children}</main>
      </div>

      {/* ── 우측 하단 floating 고객센터 위젯 (인쇄 시 숨김) ── */}
      <HelpFloatingWidget />

      {/* 하단 탭바 제거됨 (사이드바·드로어로 충분) */}
    </div>
  )
}

/* ── 사이드바 섹션 ── */
function NavSection({
  title,
  items,
  isActive,
  unreadNoticeCount,
  collapsed = false,
}: {
  title: string
  items: NavItem[]
  isActive: (item: NavItem) => boolean
  unreadNoticeCount: number
  /** true 일 때 라벨/뱃지/섹션 타이틀 숨기고 아이콘만 중앙 정렬 */
  collapsed?: boolean
}) {
  if (items.length === 0) return null
  return (
    <div>
      {/* 섹션 타이틀 — 접힘 상태에서는 가는 구분선으로 대체 */}
      {collapsed ? (
        <div className="mx-2 mb-2 border-t border-[#f0f0f0]" />
      ) : (
        <p className="px-3 mb-2 text-[11px] font-bold text-[#999] uppercase tracking-widest">
          {title}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map(item => {
          const active = isActive(item)
          const showBadge = item.label === '공지' && unreadNoticeCount > 0

          /* 투어용 data 속성 계산 (href suffix 매칭) */
          const tourId = item.href.endsWith('/gameboard') ? 'nav-gameboard'
            : item.href.endsWith('/ranking') ? 'nav-ranking'
            : item.href.endsWith('/notices') ? 'nav-notices'
            : item.href.endsWith('/events') ? 'nav-events'
            : item.href.endsWith('/members') ? 'nav-members'
            : item.href.endsWith('/finance') ? 'nav-finance'
            : item.href.endsWith('/settings') ? 'nav-settings'
            : /^\/club\/[^/]+$/.test(item.href) ? 'nav-dashboard'
            : undefined

          /* 좌측 활성 바 + 연회색 배경 스타일 */
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={tourId}
              title={collapsed ? item.label : undefined}
              className={`relative group flex items-center rounded-lg text-[14px] font-medium transition-colors ${
                collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-3'
              } ${
                active
                  ? 'bg-[#f5f5f5] text-[#0a0a0a]'
                  : 'text-[#555] hover:bg-[#fafafa] hover:text-[#111]'
              }`}
            >
              {active && !collapsed && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] bg-[#0a0a0a] rounded-r-full" />
              )}
              <item.Icon
                size={collapsed ? 18 : 15}
                strokeWidth={active ? 2.2 : 1.9}
                className={active ? 'text-[#0a0a0a]' : 'text-[#bbb] group-hover:text-[#555]'}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.proOnly && (
                    <span className="text-[9px] font-extrabold text-white bg-[var(--color-brand-elite)] px-1.5 py-0.5 rounded tracking-wider">
                      PRO
                    </span>
                  )}
                  {showBadge && (
                    <span className="text-[10px] font-extrabold text-white bg-[var(--color-brand-court)] rounded-full min-w-[18px] h-[18px] px-1.5 inline-flex items-center justify-center leading-none">
                      {unreadNoticeCount > 99 ? '99+' : unreadNoticeCount}
                    </span>
                  )}
                </>
              )}
              {/* 접힘 상태에서도 공지 미확인 갯수는 작은 점으로 표시 */}
              {collapsed && showBadge && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--color-brand-court)] rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
