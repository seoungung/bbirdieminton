'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ChevronsUpDown, Plus, KeyRound, Check } from 'lucide-react'
import type { MemberRole } from '@/types/club'
import { ROLE_LABEL } from '@/lib/club/labels'

export interface ClubOption {
  id: string
  name: string
  location?: string | null
  thumbnailColor?: string
  isDemo?: boolean
  /** 현재 사용자의 이 클럽 내 역할 — 사이드바 클럽 카드에 배지로 표시 */
  role?: MemberRole
}

/** 역할별 배지 색상 — owner: lime, manager: court, member: zinc */
function roleStyle(role: MemberRole | undefined): { bg: string; text: string; ring: string } {
  switch (role) {
    case 'owner':
      return {
        bg: 'bg-[var(--color-brand-lime)]',
        text: 'text-[var(--color-brand-ink)]',
        ring: 'ring-[var(--color-brand-lime)]/30',
      }
    case 'manager':
      return {
        bg: 'bg-[var(--color-brand-court)]',
        text: 'text-white',
        ring: 'ring-[var(--color-brand-court)]/30',
      }
    case 'member':
    default:
      return {
        bg: 'bg-[#f0f0f0]',
        text: 'text-[#555]',
        ring: 'ring-[#e5e5e5]',
      }
  }
}

interface Props {
  current: ClubOption
  available?: ClubOption[]
}

export function ClubSwitcher({ current, available = [] }: Props) {
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#fafafa] border border-[#f0f0f0] hover:border-[#e5e5e5] hover:bg-[#f5f5f5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-lime)] focus-visible:ring-offset-1"
        aria-label="모임 전환"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: current.thumbnailColor ?? '#DBE64C' }}
        >
          <Image src="/symbol_birdieminton-black.png" alt="" width={20} height={20} className="h-5 w-auto opacity-70" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[14px] font-extrabold text-[#111] truncate">{current.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* 역할 배지 — 운영자/매니저/회원 (체험 중 우선) */}
            {current.isDemo ? (
              <span className="inline-flex items-center rounded-full bg-[var(--color-brand-streak-bg)] text-[var(--color-brand-streak)] px-1.5 py-0 text-[10px] font-bold leading-[1.4]">
                체험 중
              </span>
            ) : current.role ? (
              (() => {
                const s = roleStyle(current.role)
                return (
                  <span
                    className={`inline-flex items-center rounded-full ${s.bg} ${s.text} px-1.5 py-0 text-[10px] font-bold leading-[1.4] ring-1 ${s.ring}`}
                  >
                    {ROLE_LABEL[current.role]}
                  </span>
                )
              })()
            ) : null}
            {!current.isDemo && current.location && (
              <span className="text-[11px] text-[#999] truncate">{current.location}</span>
            )}
          </div>
        </div>
        <ChevronsUpDown
          size={13}
          className={`text-[#bbb] transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.2}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-2xl border border-[#e5e5e5] shadow-lg overflow-hidden z-40 animate-[fadeInDown_150ms_ease-out]"
        >
          {/* 클럽 목록 */}
          <div className="py-1.5 max-h-[280px] overflow-y-auto">
            <ClubRow club={current} isCurrent />
            {available.map((club) => (
              <Link
                key={club.id}
                href={`/club/${club.id}`}
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                <ClubRow club={club} />
              </Link>
            ))}
          </div>

          {/* 구분선 + 액션 */}
          <div className="border-t border-[#f0f0f0] py-1.5">
            <Link
              href="/club/create"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8f8f8] text-[13px] font-semibold text-[#111] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                <Plus size={13} strokeWidth={2.5} className="text-[#111]" />
              </div>
              새 모임 만들기
            </Link>
            <Link
              href="/clubs"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8f8f8] text-[13px] font-semibold text-[#555] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                <KeyRound size={12} strokeWidth={2} className="text-[#555]" />
              </div>
              모임 더보기
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ClubRow({ club, isCurrent }: { club: ClubOption; isCurrent?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
        isCurrent ? 'bg-[#fafafa]' : 'hover:bg-[#f8f8f8]'
      }`}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: club.thumbnailColor ?? '#DBE64C' }}
      >
        <Image src="/symbol_birdieminton-black.png" alt="" width={18} height={18} className="h-[18px] w-auto opacity-70" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#111] truncate">{club.name}</p>
        <p className="text-[11px] text-[#999] truncate">
          {club.isDemo ? '체험' : club.location || '모임'}
        </p>
      </div>
      {isCurrent && <Check size={13} className="text-[#0a0a0a] shrink-0" strokeWidth={2.5} />}
    </div>
  )
}
