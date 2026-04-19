'use client'

import Link from 'next/link'
import type { UserStatus } from './types'
import { AVATAR_COLORS } from './types'

// ── DDayBadge ────────────────────────────────────────────

export function DDayBadge({ dDay }: { dDay: number }) {
  if (dDay < 0) {
    return (
      <span className="text-sm font-bold text-[#999] bg-[#f0f0f0] px-2.5 py-1 rounded-lg whitespace-nowrap">
        종료
      </span>
    )
  }
  if (dDay === 0) {
    return (
      <span className="text-sm font-extrabold text-[#beff00] bg-[#111] px-2.5 py-1 rounded-lg whitespace-nowrap">
        D-Day
      </span>
    )
  }
  return (
    <span className="text-sm font-extrabold text-[#beff00] bg-[#111] px-2.5 py-1 rounded-lg whitespace-nowrap">
      D-{dDay}
    </span>
  )
}

// ── Avatar ───────────────────────────────────────────────

export function Avatar({
  name,
  color,
  size = 'md',
}: {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const cls =
    size === 'sm' ? 'w-9 h-9 text-sm' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-12 h-12 text-base'
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-bold text-[#111] shrink-0`}
      style={{ background: color }}
    >
      {name.charAt(0)}
    </div>
  )
}

// ── CtaButton ────────────────────────────────────────────

export function CtaButton({ userStatus, clubId }: { userStatus: UserStatus; clubId: string }) {
  const base =
    'flex items-center justify-center w-full bg-[#beff00] text-[#111] font-extrabold text-lg py-4 rounded-2xl hover:brightness-95 transition-all'

  if (userStatus === 'demo' || userStatus === 'guest') return null
  if (userStatus === 'member') {
    return <Link href={`/club/${clubId}/gameboard`} className={base}>게임보드 입장하기</Link>
  }
  return <Link href="/club/join" className={base}>초대코드로 참여</Link>
}

// ── Toast ────────────────────────────────────────────────

export function Toast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#111] text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg animate-fade-in-up whitespace-nowrap pointer-events-none">
      {message}
    </div>
  )
}

// ── AvatarRow (멤버 아바타 그룹) ─────────────────────────

export function AvatarRow({
  names,
  count,
  colorOffset = 0,
}: {
  names: string[]
  count: number
  colorOffset?: number
}) {
  return (
    <div className="flex items-center pt-1">
      {names.map((name, i) => (
        <div
          key={i}
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[#111] border-2 border-white shadow-sm -ml-2 first:ml-0"
          style={{ background: AVATAR_COLORS[(colorOffset + i) % AVATAR_COLORS.length] }}
        >
          {name.charAt(0)}
        </div>
      ))}
      {count > names.length && (
        <span className="text-xs text-[#888] ml-2">+{count - names.length}명</span>
      )}
    </div>
  )
}
