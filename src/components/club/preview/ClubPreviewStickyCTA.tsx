'use client'

import Link from 'next/link'
import {
  Heart,
  Clock,
  ArrowRight,
  LogIn,
  RefreshCcw,
  UserPlus,
} from 'lucide-react'
import type { JoinRequestStatus } from '@/app/club/[clubId]/join-requests/actions'

interface Props {
  clubId: string
  isLoggedIn: boolean
  isMember: boolean
  status: JoinRequestStatus | null
  isPending: boolean
  onSubmit: () => void
  onCancel: () => void
}

/**
 * 페이지 하단 sticky CTA.
 * - 좌: 찜 (시각만, 향후 phase)
 * - 우: 상태별 메인 CTA (flex-1)
 *
 * 6단 분기:
 *  1) 멤버      → 모임 들어가기
 *  2) 비로그인  → 로그인하고 가입 신청
 *  3) pending   → 승인 대기 안내 + 신청 취소 텍스트 버튼
 *  4) rejected  → 다시 신청하기
 *  5) approved  → 모임 들어가기 (멤버 row 누락 fallback)
 *  6) idle      → 가입 신청하기
 */
export function ClubPreviewStickyCTA({
  clubId,
  isLoggedIn,
  isMember,
  status,
  isPending,
  onSubmit,
  onCancel,
}: Props) {
  const limeBtn =
    'flex-1 inline-flex items-center justify-center gap-1.5 h-12 rounded-xl bg-[var(--color-brand-lime)] text-[#111] font-extrabold text-[15px] hover:bg-[var(--color-brand-lime-dim)] active:scale-[0.99] transition-all disabled:opacity-60 disabled:active:scale-100'

  const grayBtn =
    'flex-1 inline-flex items-center justify-center gap-1.5 h-12 rounded-xl bg-[#f0f0f0] text-[#666] font-bold text-[15px] cursor-not-allowed'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#ebebeb]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-[720px] mx-auto px-4 py-3">
        <div className="flex items-center gap-2.5">
          {/* 찜 — 시각 자리 (향후 phase) */}
          <button
            type="button"
            aria-label="찜하기"
            aria-disabled
            tabIndex={-1}
            className="shrink-0 w-12 h-12 rounded-xl border border-[#e5e5e5] flex items-center justify-center text-[#999] hover:bg-[#fafafa] transition-colors cursor-default"
          >
            <Heart size={22} strokeWidth={2} />
          </button>

          {renderMainCTA()}
        </div>

        {/* pending 보조 액션 — 신청 취소 */}
        {!isMember && isLoggedIn && status === 'pending' && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="mt-2 w-full text-center text-[12px] font-medium text-[#999] hover:text-[#666] underline-offset-4 hover:underline disabled:opacity-50"
          >
            신청 취소
          </button>
        )}
      </div>
    </div>
  )

  function renderMainCTA() {
    /* 1. 이미 멤버 — 입장 */
    if (isMember) {
      return (
        <Link href={`/club/${clubId}`} className={limeBtn}>
          이 모임 들어가기
          <ArrowRight size={17} strokeWidth={2.4} />
        </Link>
      )
    }

    /* 2. 비로그인 */
    if (!isLoggedIn) {
      const next = encodeURIComponent(`/clubs/${clubId}`)
      return (
        <Link href={`/login?next=${next}`} className={limeBtn}>
          <LogIn size={17} strokeWidth={2.4} />
          로그인하고 가입 신청
        </Link>
      )
    }

    /* 3. pending — 승인 대기 */
    if (status === 'pending') {
      return (
        <button type="button" disabled className={grayBtn}>
          <Clock size={17} strokeWidth={2.2} />
          승인 대기 중
        </button>
      )
    }

    /* 4. rejected — 다시 신청 */
    if (status === 'rejected') {
      return (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className={limeBtn}
        >
          <RefreshCcw size={17} strokeWidth={2.4} />
          다시 신청하기
        </button>
      )
    }

    /* 5. approved — 입장 (fallback) */
    if (status === 'approved') {
      return (
        <Link href={`/club/${clubId}`} className={limeBtn}>
          이 모임 들어가기
          <ArrowRight size={17} strokeWidth={2.4} />
        </Link>
      )
    }

    /* 6. idle — 가입 신청 */
    return (
      <button
        type="button"
        onClick={onSubmit}
        disabled={isPending}
        className={limeBtn}
      >
        <UserPlus size={17} strokeWidth={2.4} />
        가입 신청하기
      </button>
    )
  }
}
