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
  /** 추후: 실제 알림 데이터 주입 */
  notifications?: Notification[]
}

export function NotificationBell({ clubId, unreadNoticeCount, notifications }: Props) {
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
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-full hover:bg-[#f5f5f5] flex items-center justify-center text-[#555] hover:text-[#111] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-2"
        aria-label={`알림 ${totalUnread}건`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell size={17} strokeWidth={1.8} />
        {totalUnread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#10b981] ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl border border-[#e5e5e5] shadow-lg overflow-hidden z-50 animate-[fadeInDown_150ms_ease-out]"
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

          {/* 알림 목록 */}
          <div className="max-h-[360px] overflow-y-auto">
            {/* 공지 미확인 (실제 데이터) */}
            {unreadNoticeCount > 0 && (
              <Link
                href={`/club/${clubId}/notices`}
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-start gap-3 px-5 py-3 hover:bg-[#f8f8f8] transition-colors border-l-2 border-[#10b981]"
              >
                <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center text-[#10b981] shrink-0 mt-0.5">
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

            {/* 추가 알림 (placeholder or 실제) */}
            {notifications?.map((n) => {
              const Icon = iconMap[n.type]
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className={`flex items-start gap-3 px-5 py-3 hover:bg-[#f8f8f8] transition-colors ${
                    !n.read ? 'border-l-2 border-[#10b981]' : 'border-l-2 border-transparent'
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

            {/* 빈 상태 */}
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
