'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  Plus,
  KeyRound,
  BookOpen,
  Newspaper,
  Compass,
  Heart,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { SaaSClubList, type SaaSClubItem } from './SaaSClubList'
import { SidebarUserMenu } from '@/components/club/SidebarUserMenu'

interface Props {
  myClubs: SaaSClubItem[]
  user: { name: string; email: string; avatarUrl: string | null } | null
  /** 접힘 사이드바 (md~xl) 일 때 true — 아이콘 only 모드 */
  collapsed: boolean
  /** 모바일 드로어에서 nav 클릭 시 드로어 닫기용 콜백 */
  onNavigate?: () => void
  /** 시스템 마스터 여부 — true 일 때만 유저 메뉴에 "관리자" 항목 노출 */
  isMaster?: boolean
}

interface DiscoverItem {
  href: string
  label: string
  Icon: LucideIcon
  /** /clubs 의 tab query 값 — undefined 는 "전체 모임" */
  tab?: 'mine' | 'saved' | 'recent'
}

/**
 * SaaSShell 사이드바 — AppShell 패턴 적용 (collapsed/expanded 분기)
 *
 * 구성:
 *  ① 로고 (펼침: text logo / 접힘: symbol)
 *  ② "둘러보기" 섹션 — 전체/MY/찜/최근 4개 nav (tab query 연동)
 *  ③ "내 모임" 섹션 — 본인 가입 클럽 리스트 (접힘 시 32×32 아바타)
 *  ④ 액션 — "+ 새 모임 만들기" / "초대코드 입력" (접힘 시 40×40 아이콘 버튼)
 *  ⑤ "리소스" 섹션 — 사용설명서 / 블로그 (접힘 시 아이콘 only)
 *  ⑥ 하단 SidebarUserMenu (AppShell 재사용 — collapsed 모두 대응)
 */
export function SaaSSidebar({ myClubs, user, collapsed, onNavigate, isMaster }: Props) {
  const pathname = usePathname() ?? ''
  const searchParams = useSearchParams()
  const currentTab = searchParams?.get('tab') ?? null

  /* 둘러보기 3개 메뉴 — 모두 /clubs 로 가되 tab query 만 다름.
     MY 모임은 별도 nav 대신 아래 "내 모임" 섹션 헤더의 "전체보기" 링크로 진입 (중복 제거). */
  const discoverItems: DiscoverItem[] = [
    { href: '/clubs', label: '전체 모임', Icon: Compass },
    { href: '/clubs?tab=saved', label: '찜한 모임', Icon: Heart, tab: 'saved' },
    { href: '/clubs?tab=recent', label: '최근 본 모임', Icon: Clock, tab: 'recent' },
  ]

  /* /clubs 페이지에서만 활성. tab query 매칭. */
  const isDiscoverActive = (item: DiscoverItem) => {
    if (pathname !== '/clubs') return false
    if (item.tab) return currentTab === item.tab
    // 전체 모임: tab 미지정 또는 'all'
    return !currentTab || currentTab === 'all'
  }

  const resources = [
    { href: '/manual', label: '사용설명서', Icon: BookOpen },
    { href: '/blog', label: '블로그', Icon: Newspaper },
  ]

  const isResourceActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* ① 로고 */}
      <div className={collapsed ? 'px-2 pt-5 pb-3' : 'px-4 pt-5 pb-3'}>
        <Link
          href="/clubs"
          onClick={onNavigate}
          className={`flex items-center hover:opacity-80 transition-opacity ${
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
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {/* ② 둘러보기 — 전체/MY/찜/최근 */}
        <div className="mt-1">
          {collapsed ? (
            <div className="mx-2 mb-2 border-t border-[#f0f0f0]" />
          ) : (
            <p className="px-3 mb-2 text-[11px] font-bold text-[#999] uppercase tracking-widest">
              둘러보기
            </p>
          )}
          <div className={`space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
            {discoverItems.map((item) => {
              const active = isDiscoverActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={`relative group flex items-center rounded-lg text-[14px] font-medium transition-colors ${
                    collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
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
                    className={
                      active ? 'text-[#0a0a0a]' : 'text-[#bbb] group-hover:text-[#555]'
                    }
                  />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </div>

        {/* ③ 내 모임 — 가입 클럽 빠른 진입. 헤더 우측 "전체보기" 링크로 카드 그리드(/clubs?tab=mine) 진입. */}
        <div className="mt-5">
          {collapsed ? (
            <div className="mx-2 mb-2 border-t border-[#f0f0f0]" />
          ) : (
            <div className="px-3 mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest">
                내 모임
                {myClubs.length > 0 && (
                  <span className="ml-1 text-[10px] font-bold text-[#bbb] tabular-nums">
                    {myClubs.length}
                  </span>
                )}
              </p>
              {myClubs.length > 0 && (
                <Link
                  href="/clubs?tab=mine"
                  onClick={onNavigate}
                  className="text-[10px] font-bold text-[#999] hover:text-[#111] transition-colors uppercase tracking-wide"
                >
                  전체보기 →
                </Link>
              )}
            </div>
          )}
          <SaaSClubList clubs={myClubs} collapsed={collapsed} onNavigate={onNavigate} />
        </div>

        {/* ④ 액션 — 새 모임 / 초대코드 */}
        <div className={`mt-3 space-y-1.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {collapsed ? (
            <>
              <Link
                href="/club/create"
                onClick={onNavigate}
                title="새 모임 만들기"
                aria-label="새 모임 만들기"
                className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl bg-[var(--color-brand-lime)] text-[#0a0a0a] hover:bg-[var(--color-brand-lime-dim)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-1"
              >
                <Plus size={18} strokeWidth={2.7} />
              </Link>
              <Link
                href="/club/join"
                onClick={onNavigate}
                title="초대코드 입력"
                aria-label="초대코드 입력"
                className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl border border-[#e5e5e5] bg-white text-[#111] hover:bg-[#fafafa] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-1"
              >
                <KeyRound size={15} strokeWidth={2.4} className="text-[#555]" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/club/create"
                onClick={onNavigate}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[var(--color-brand-lime)] text-[#0a0a0a] text-[13px] font-extrabold hover:bg-[var(--color-brand-lime-dim)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-1"
              >
                <Plus size={14} strokeWidth={2.7} />
                새 모임 만들기
              </Link>
              <Link
                href="/club/join"
                onClick={onNavigate}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#e5e5e5] bg-white text-[#111] text-[13px] font-bold hover:bg-[#fafafa] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-1"
              >
                <KeyRound size={13} strokeWidth={2.4} className="text-[#555]" />
                초대코드 입력
              </Link>
            </>
          )}
        </div>

        {/* ⑤ 리소스 */}
        <div className="mt-7">
          {collapsed ? (
            <div className="mx-2 mb-2 border-t border-[#f0f0f0]" />
          ) : (
            <p className="px-6 mb-2 text-[11px] font-bold text-[#999] uppercase tracking-widest">
              리소스
            </p>
          )}
          <div className={`space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
            {resources.map(({ href, label, Icon }) => {
              const active = isResourceActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  title={collapsed ? label : undefined}
                  className={`relative group flex items-center rounded-lg text-[14px] font-medium transition-colors ${
                    collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
                  } ${
                    active
                      ? 'bg-[#f5f5f5] text-[#0a0a0a]'
                      : 'text-[#555] hover:bg-[#fafafa] hover:text-[#111]'
                  }`}
                >
                  {active && !collapsed && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] bg-[#0a0a0a] rounded-r-full" />
                  )}
                  <Icon
                    size={collapsed ? 18 : 15}
                    strokeWidth={active ? 2.2 : 1.9}
                    className={
                      active ? 'text-[#0a0a0a]' : 'text-[#bbb] group-hover:text-[#555]'
                    }
                  />
                  {!collapsed && <span className="flex-1 truncate">{label}</span>}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ⑥ 하단 유저 메뉴 — SidebarUserMenu 재사용 (AppShell 동일) */}
      {user ? (
        <div className={`border-t border-[#f0f0f0] ${collapsed ? 'px-2 py-3' : 'px-3 py-3'}`}>
          <SidebarUserMenu
            userName={user.name}
            userEmail={user.email}
            avatarUrl={user.avatarUrl}
            collapsed={collapsed}
            isMaster={isMaster}
          />
        </div>
      ) : (
        <div className={`border-t border-[#f0f0f0] ${collapsed ? 'px-2 py-3' : 'px-3 py-3'}`}>
          <Link
            href="/login"
            onClick={onNavigate}
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
}
