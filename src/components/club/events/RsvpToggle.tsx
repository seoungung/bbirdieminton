'use client'

import { Check, X, Clock } from 'lucide-react'
import type { EventAttendStatus } from '@/types/club'

interface Props {
  myStatus: EventAttendStatus | null
  isFull: boolean
  isPending: boolean
  onChange: (next: EventAttendStatus) => void
  /** 현재 대기 인원 (만석일 때 노출) */
  waitlistCount?: number
  /** 본인 대기 순번 (1+, null = 대기 중 아님) */
  myWaitlistPosition?: number | null
  onJoinWaitlist?: () => void
  onCancelWaitlist?: () => void
}

export function RsvpToggle({
  myStatus,
  isFull,
  isPending,
  onChange,
  waitlistCount = 0,
  myWaitlistPosition = null,
  onJoinWaitlist,
  onCancelWaitlist,
}: Props) {
  const isOnWaitlist = myWaitlistPosition !== null
  /* 대기 영역: 만석 + 본인 going 아닐 때만 노출 */
  const showWaitlistArea = isFull && myStatus !== 'going'

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

      {/* 대기 영역 — 만석일 때 */}
      {showWaitlistArea && (
        <div className="mt-3 border-t border-[#f0f0f0] pt-3 space-y-2">
          {isOnWaitlist ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#555]">
                  <Clock size={14} strokeWidth={2.2} className="text-[#999]" />
                  대기 <strong className="text-[#111] tabular-nums">{myWaitlistPosition}</strong>번 / 총 <span className="tabular-nums">{waitlistCount}</span>명
                </span>
                <button
                  type="button"
                  onClick={onCancelWaitlist}
                  disabled={isPending || !onCancelWaitlist}
                  className="text-[12px] font-semibold text-[#999] hover:text-[#555] underline-offset-2 hover:underline disabled:opacity-50"
                >
                  대기 취소
                </button>
              </div>
              <p className="text-[11px] text-[#999]">
                참가자가 취소하면 자동으로 참석으로 승격돼요.
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onJoinWaitlist}
                disabled={isPending || !onJoinWaitlist}
                className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] text-sm font-extrabold hover:bg-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Clock size={15} strokeWidth={2.4} />
                대기 신청
                {waitlistCount > 0 && (
                  <span className="text-[11px] font-semibold text-[#999] tabular-nums">
                    (현재 {waitlistCount}명 대기)
                  </span>
                )}
              </button>
              <p className="text-[11px] text-[#999]">
                정원이 가득 찼어요. 자리가 나면 자동으로 참석으로 승격돼요.
              </p>
            </>
          )}
        </div>
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
        ? 'bg-[var(--color-brand-lime)] text-[#0a0a0a] border-[var(--color-brand-lime)] shadow-sm'
        : 'bg-white text-[#111] border-[#e5e5e5] hover:border-[var(--color-brand-lime)]'
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
