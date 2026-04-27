'use client'

import { Check, X } from 'lucide-react'
import type { EventAttendStatus } from '@/types/club'

interface Props {
  myStatus: EventAttendStatus | null
  isFull: boolean
  isPending: boolean
  onChange: (next: EventAttendStatus) => void
}

export function RsvpToggle({ myStatus, isFull, isPending, onChange }: Props) {
  return (
    <section className="bg-white rounded-3xl border border-[#e5e5e5] p-5">
      <p className="text-[11px] font-extrabold text-[#999] uppercase tracking-widest mb-3">
        내 참석 여부
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <RsvpButton
          active={myStatus === 'going'}
          tone="going"
          disabled={isPending || (myStatus !== 'going' && isFull)}
          onClick={() => onChange('going')}
        >
          <Check size={16} strokeWidth={2.5} />
          참가할게요
        </RsvpButton>
        <RsvpButton
          active={myStatus === 'not_going'}
          tone="not_going"
          disabled={isPending}
          onClick={() => onChange('not_going')}
        >
          <X size={16} strokeWidth={2.5} />
          불참
        </RsvpButton>
      </div>
      {myStatus !== 'going' && isFull && (
        <p className="text-[11px] text-[#999] mt-2">
          정원이 가득 찼어요. 자리가 나면 다시 시도해주세요.
        </p>
      )}
    </section>
  )
}

function RsvpButton({
  active,
  tone,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  tone: 'going' | 'not_going'
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  const styles =
    tone === 'going'
      ? active
        ? 'bg-[#beff00] text-[#0a0a0a] border-[#beff00] shadow-sm'
        : 'bg-white text-[#111] border-[#e5e5e5] hover:border-[#beff00]'
      : active
      ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
      : 'bg-white text-[#555] border-[#e5e5e5] hover:border-[#999]'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-extrabold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles}`}
    >
      {children}
    </button>
  )
}
