import Link from 'next/link'
import Image from 'next/image'
import { Menu, User as UserIcon } from 'lucide-react'
import { UserMenu } from '@/components/layout/marketing/UserMenu'

interface Props {
  pageTitle?: string
  user: { name: string; email: string; avatarUrl: string | null } | null
  onOpenDrawer: () => void
}

/**
 * SaaSShell 전역 헤더 (h-14, sticky, white/90 + backdrop-blur)
 * AppHeader와 시각적으로 동일한 톤 — 클럽 선택 전후 chrome 일관성 유지
 *
 * 데스크톱(lg+): 페이지 타이틀 (좌) ─ UserMenu (우)
 * 모바일(<lg): 햄버거 (좌) ─ 로고 (중) ─ UserMenu (우)
 */
export function SaaSHeader({ pageTitle, user, onOpenDrawer }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#f0f0f0] h-14 flex items-center">
      {/* 모바일 헤더 */}
      <div className="lg:hidden w-full flex items-center gap-2 px-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] text-[#555] transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu size={18} />
        </button>
        <Link
          href="/club/home"
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
          <span className="text-sm font-extrabold text-[#111] truncate">
            {pageTitle ?? '버디민턴'}
          </span>
        </Link>
        {user ? (
          <UserMenu userName={user.name} userEmail={user.email} avatarUrl={user.avatarUrl} />
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

      {/* 데스크톱 헤더 */}
      <div className="hidden lg:flex w-full items-center gap-3 px-6">
        {pageTitle ? (
          <h1 className="text-[15px] font-extrabold text-[#111] tracking-tight truncate">
            {pageTitle}
          </h1>
        ) : (
          <span aria-hidden="true" />
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          {user ? (
            <UserMenu userName={user.name} userEmail={user.email} avatarUrl={user.avatarUrl} />
          ) : (
            <Link
              href="/login"
              className="text-[13px] font-bold text-[#111] px-3.5 py-1.5 rounded-full border border-[#e5e5e5] hover:bg-[#fafafa] transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
