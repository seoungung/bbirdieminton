'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { SaaSSidebar } from './SaaSSidebar'
import type { SaaSClubItem } from './SaaSClubList'

/* below-fold floating widget — 첫 페인트 후 lazy 로드 */
const HelpFloatingWidget = dynamic(
  () => import('@/components/club/HelpFloatingWidget').then(m => ({ default: m.HelpFloatingWidget })),
  { ssr: false },
)

interface Props {
  pageTitle?: string
  myClubs: SaaSClubItem[]
  user: { name: string; email: string; avatarUrl: string | null } | null
  children: React.ReactNode
}

export type { SaaSClubItem }

/**
 * SaaS 클럽 미선택 셸 (`/clubs`, `/club/create`, `/clubs/[id]`)
 *
 * AppShell과 동일한 사이드바/브레이크포인트/유저 메뉴 패턴 사용:
 *  · md 미만(<768px): 햄버거 드로어 (282px) + 모바일 상단 바 (h-14)
 *  · md ~ xl 미만:    강제 접힘 사이드바 (68px, 아이콘 only)
 *  · xl 이상(≥1280px): 펼침 사이드바 (220px, 사용자 토글 가능)
 *
 * 데스크톱에서는 별도 상단 헤더가 없고, 사이드바가 모든 navigation을 처리.
 * 우측 하단 floating 고객센터 위젯(HelpFloatingWidget) 포함 — AppShell과 동일.
 */
export function SaaSShell({ pageTitle, myClubs, user, children }: Props) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  /* 데스크톱 사이드바 접기/펼치기 — localStorage 영구 저장 (AppShell과 키 공유).
   * xl+ (≥1280px) 에서만 토글 의미 있음. */
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
   * useSyncExternalStore 로 외부 미디어쿼리 구독 → setState-in-effect 회피. */
  const subscribeXl = useCallback((onChange: () => void) => {
    const mql = window.matchMedia('(min-width: 1280px)')
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  const isXlScreen = useSyncExternalStore(
    subscribeXl,
    () => window.matchMedia('(min-width: 1280px)').matches,
    () => false, // SSR 기본값: 모바일/태블릿 가정 (강제 접힘)
  )

  /* 실효 접힘 상태: xl 미만이면 강제 접힘, xl+ 면 사용자 설정 따름 */
  const effectiveCollapsed = !isXlScreen || sidebarCollapsed

  /* 경로 변경 시 드로어 자동 닫기 */
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  /* 드로어 열림 시 body 스크롤 잠금 */
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

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ── 데스크톱 사이드바 (md+ 노출) ──
          · md ~ xl 미만: 강제 접힘 (68px, 아이콘 only)
          · xl+: 사용자 설정 따라 220px 펼침 또는 68px 접힘 (토글 가능) */}
      <aside
        className={`hidden md:flex fixed inset-y-0 left-0 z-30 bg-white border-r border-[#f0f0f0] flex-col print:hidden transition-[width] duration-200 ${
          effectiveCollapsed ? 'w-[68px]' : 'w-[220px]'
        }`}
        aria-label="기본 네비게이션"
      >
        <SaaSSidebar
          myClubs={myClubs}
          user={user}
          collapsed={effectiveCollapsed}
        />
        {/* 토글 버튼 — xl+ 에서만 노출 (그 이하는 강제 접힘이라 토글 의미 X) */}
        <button
          type="button"
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
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex flex-col w-[282px] bg-white shadow-xl animate-slide-in">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-[#f0f0f0] flex items-center justify-center text-[#555] transition-colors z-10"
              aria-label="메뉴 닫기"
            >
              <X size={16} />
            </button>
            <SaaSSidebar
              myClubs={myClubs}
              user={user}
              collapsed={false}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── 메인 영역 — md+ 에서 사이드바 폭만큼 좌측 패딩 ── */}
      <div
        className={`print:pl-0 transition-[padding] duration-200 ${
          effectiveCollapsed ? 'md:pl-[68px]' : 'md:pl-[220px]'
        }`}
      >
        {/* 모바일 상단 바 (< md 에서만) — 햄버거 + 로고 + 페이지타이틀 */}
        <header className="md:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#f0f0f0] print:hidden">
          <div className="flex items-center gap-2 px-3 h-14">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] text-[#555] transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu size={18} />
            </button>
            <Link
              href="/clubs"
              className="flex items-center gap-2 min-w-0 flex-1"
              aria-label="버디민턴 홈"
            >
              <Image
                src="/symbol_birdieminton-black.png"
                alt=""
                width={22}
                height={22}
                className="h-5 w-auto object-contain shrink-0"
                aria-hidden="true"
              />
              <span className="text-sm font-bold text-[#111] truncate">
                {pageTitle ?? '버디민턴'}
              </span>
            </Link>
          </div>
        </header>

        <main id="main-content" className="print:pb-0">{children}</main>
      </div>

      {/* ── 우측 하단 floating 고객센터 위젯 (인쇄 시 숨김) ── */}
      <HelpFloatingWidget />
    </div>
  )
}
