'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Plus, Megaphone, Gamepad2, UserPlus, CalendarDays } from 'lucide-react'

interface Props {
  clubId: string
  isOwner: boolean
}

export function QuickCreate({ clubId, isOwner }: Props) {
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

  const items: {
    href: string
    Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
    label: string
    description: string
    ownerOnly?: boolean
  }[] = [
    {
      href: `/club/${clubId}/gameboard`,
      Icon: Gamepad2,
      label: '게임보드 열기',
      description: '현장 팀 배정·경기 시작',
    },
    {
      href: `/club/${clubId}/notices`,
      Icon: Megaphone,
      label: '공지 작성',
      description: '회원에게 알림 발송',
      ownerOnly: true,
    },
    {
      href: `/club/${clubId}`,
      Icon: CalendarDays,
      label: '정기모임 추가',
      description: '일정·참석 투표',
      ownerOnly: true,
    },
    {
      href: `/club/${clubId}/settings`,
      Icon: UserPlus,
      label: '회원 초대',
      description: '초대코드 공유',
      ownerOnly: true,
    },
  ]

  const visibleItems = items.filter((it) => !it.ownerOnly || isOwner)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-[#0a0a0a] text-white hover:bg-[#222] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-lime)] focus-visible:ring-offset-2"
        aria-label="빠른 만들기"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-[260px] bg-white rounded-2xl border border-[#e5e5e5] shadow-lg overflow-hidden z-50 animate-[fadeInDown_150ms_ease-out]"
        >
          <div className="px-4 py-3 border-b border-[#f0f0f0]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#999]">
              빠른 만들기
            </p>
          </div>
          <nav className="py-1.5">
            {visibleItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8f8f8] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-[#0a0a0a] shrink-0">
                  <item.Icon size={14} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#111]">{item.label}</p>
                  <p className="text-[11px] text-[#999] truncate mt-0.5">{item.description}</p>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
