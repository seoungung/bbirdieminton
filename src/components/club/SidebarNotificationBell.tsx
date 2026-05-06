'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Bell, Megaphone, UserPlus, Wallet } from 'lucide-react'

interface Notification {
  id: string
  type: 'notice' | 'join_request' | 'finance'
  title: string
  timeAgo: string
  href: string
  read?: boolean
}

interface Props {
  clubId: string
  unreadNoticeCount: number
  /** 접힘 사이드바 (md~xl)일 때 true: 아이콘만 + 카운트 dot */
  collapsed: boolean
  /** 추후: 실제 알림 데이터 주입 */
  notifications?: Notification[]
}

/**
 * 사이드바 내장 알림 벨 (`NotificationBell` 의 사이드바 변형).
 *
 * - collapsed: 36×36 벨 아이콘 (미확인 dot) → 클릭 시 우측 옆에 패널
 * - expanded:  벨 + "알림" 라벨 + 미확인 배지 → 클릭 시 우측 옆에 패널
 *
 * 드롭다운 anchor: 사이드바가 화면 좌측이므로, 드롭다운은 우측 옆 (`left-full`) 에 배치.
 */
export function SidebarNotificationBell({
  clubId,
  unreadNoticeCount,
  collapsed,
  notifications,
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
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

  const totalUnread = unreadNoticeCount + (notifications?.filter((n) => !n.read).length ?? 0)

  const iconMap = {
    notice: Megaphone,
    join_request: UserPlus,
    finance: Wallet,
  }

  return (
    <div ref={ref} className="relative">
      {collapsed ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={`알림 ${totalUnread}건`}
          aria-expanded={open}
          aria-haspopup="menu"
          title="알림"
          className="relative w-full flex items-center justify-center py-2 rounded-lg text-[#555] hover:bg-[#f5f5f5] hover:text-[#111] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-lime)] focus-visible:ring-offset-1"
        >
          <Bell size={18} strokeWidth={1.9} />
          {totalUnread > 0 && (
            <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[var(--color-brand-court)]" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={`알림 ${totalUnread}건`}
          aria-expanded={open}
          aria-haspopup="menu"
          className="relative group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#555] hover:bg-[#fafafa] hover:text-[#111] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-lime)] focus-visible:ring-offset-1"
        >
          <Bell
            size={15}
            strokeWidth={1.9}
            className="text-[#bbb] group-hover:text-[#555]"
          />
          <span className="flex-1 text-left truncate">알림</span>
          {totalUnread > 0 && (
            <span className="text-[10px] font-extrabold text-white bg-[var(--color-brand-court)] rounded-full min-w-[18px] h-[18px] px-1.5 inline-flex items-center justify-center leading-none">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>
      )}

      {open && (
        <div
          role="menu"
          className="absolute z-50 left-full top-0 ml-2 w-[340px] bg-white rounded-2xl border border-[#e5e5e5] shadow-lg overflow-hidden animate-[fadeInDown_150ms_ease-out]"
        >
          {/* 헤더 */}
          <div className="px-5 py-3.5 border-b border-[#f0f0f0] flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#111]">알림</p>
              {totalUnread > 0 && (
                <p className="text-[11px] text-[#999] mt-0.5">{totalUnread}건 미확인</p>
              )}
            </div>
          </div>

          {/* 목록 */}
          <div className="max-h-[360px] overflow-y-auto">
            {unreadNoticeCount > 0 && (
              <Link
                href={`/club/${clubId}/notices`}
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-start gap-3 px-5 py-3 hover:bg-[#f8f8f8] transition-colors border-l-2 border-[var(--color-brand-court)]"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-court-bg)] flex items-center justify-center text-[var(--color-brand-court)] shrink-0 mt-0.5">
                  <Megaphone size={14} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#111] truncate">
                    새 공지 {unreadNoticeCount}건
                  </p>
                  <p className="text-[11px] text-[#999] mt-0.5">공지사항 확인하기 →</p>
                </div>
              </Link>
            )}

            {notifications?.map((n) => {
              const Icon = iconMap[n.type]
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className={`flex items-start gap-3 px-5 py-3 hover:bg-[#f8f8f8] transition-colors ${
                    !n.read
                      ? 'border-l-2 border-[var(--color-brand-court)]'
                      : 'border-l-2 border-transparent'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-[#555] shrink-0 mt-0.5">
                    <Icon size={14} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#111] truncate">{n.title}</p>
                    <p className="text-[11px] text-[#999] mt-0.5">{n.timeAgo}</p>
                  </div>
                </Link>
              )
            })}

            {unreadNoticeCount === 0 && (!notifications || notifications.length === 0) && (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-3">
                  <Bell size={18} className="text-[#bbb]" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] font-semibold text-[#111]">새 알림이 없어요</p>
                <p className="text-[11px] text-[#999] mt-1">중요한 소식이 생기면 여기에 표시됩니다</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
