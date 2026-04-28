'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { SaaSSidebar } from './SaaSSidebar'
import { SaaSHeader } from './SaaSHeader'
import type { SaaSClubItem } from './SaaSClubList'

interface Props {
  pageTitle?: string
  myClubs: SaaSClubItem[]
  user: { name: string; email: string; avatarUrl: string | null } | null
  children: React.ReactNode
}

export type { SaaSClubItem }

/**
 * SaaS 클럽 미선택 셸 (`/club/home`, `/club/create`, `/clubs/[id]`)
 *
 * 데스크톱(lg+): 260px 고정 사이드바 + h-14 헤더 + main
 * 모바일(<lg): 햄버거 드로어 + h-14 헤더 + main
 *
 * AppShell과 사이드바 폭(260px) · 헤더 높이(h-14) · 컬러 톤이 동일하므로
 * 모임 선택 전(SaaSShell) ↔ 후(AppShell) chrome 전환이 매끄러움.
 */
export function SaaSShell({ pageTitle, myClubs, user, children }: Props) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

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
      {/* ── 데스크톱 고정 사이드바 ── */}
      <aside
        className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-[260px] bg-white border-r border-[#f0f0f0] flex-col"
        aria-label="기본 네비게이션"
      >
        <SaaSSidebar myClubs={myClubs} user={user} />
      </aside>

      {/* ── 모바일 드로어 ── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
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
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── 메인 영역 ── */}
      <div className="lg:pl-[260px]">
        <SaaSHeader
          pageTitle={pageTitle}
          user={user}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
        <main id="main-content">{children}</main>
      </div>
    </div>
  )
}
