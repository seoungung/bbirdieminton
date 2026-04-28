'use client'

import Link from 'next/link'
import { Clock, RefreshCcw, LogIn, ArrowRight, UserPlus } from 'lucide-react'
import type { JoinRequestStatus } from '@/app/club/[clubId]/join-requests/actions'

interface ClubPreviewCTAProps {
  clubId: string
  isLoggedIn: boolean
  isMember: boolean
  status: JoinRequestStatus | null
  isPending: boolean
  onSubmit: () => void
  onCancel: () => void
}

/**
 * 비멤버 미리보기의 CTA 영역.
 * 상태별 분기:
 *  - 멤버      → "이 모임 들어가기" 링크
 *  - 비로그인  → "로그인하고 가입 신청" 링크
 *  - pending   → 대기 안내 + 신청 취소 버튼
 *  - rejected  → 거절 안내 + 다시 신청 버튼
 *  - approved  → "모임 입장" 링크 (멤버 row 누락 케이스용 fallback 안내)
 *  - 신청 안 함 → 가입 신청 버튼
 */
export function ClubPreviewCTA(props: ClubPreviewCTAProps) {
  const {
    clubId,
    isLoggedIn,
    isMember,
    status,
    isPending,
    onSubmit,
    onCancel,
  } = props

  /* 1. 멤버 — 바로 입장 */
  if (isMember) {
    return (
      <Link
        href={`/club/${clubId}`}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#beff00] text-[#111] font-bold text-sm py-3.5 rounded-2xl hover:brightness-95 transition-all"
      >
        이 모임 들어가기
        <ArrowRight size={16} strokeWidth={2.4} />
      </Link>
    )
  }

  /* 2. 비로그인 */
  if (!isLoggedIn) {
    const next = encodeURIComponent(`/clubs/${clubId}`)
    return (
      <Link
        href={`/login?next=${next}`}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#beff00] text-[#111] font-bold text-sm py-3.5 rounded-2xl hover:brightness-95 transition-all"
      >
        <LogIn size={16} strokeWidth={2.4} />
        로그인하고 가입 신청하기
      </Link>
    )
  }

  /* 3. 신청 pending */
  if (status === 'pending') {
    return (
      <div className="space-y-2">
        <div className="bg-white border border-[#f0f0f0] rounded-2xl px-4 py-3.5 flex items-center gap-3">
          <Clock size={18} className="text-[#f59e0b] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#111]">신청 완료</p>
            <p className="text-xs text-[#666] mt-0.5">
              운영자가 승인하면 모임에 입장할 수 있어요.
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="w-full inline-flex items-center justify-center border border-[#e5e5e5] text-[#555] font-semibold text-sm py-3 rounded-2xl hover:bg-white transition-all disabled:opacity-50"
        >
          신청 취소
        </button>
      </div>
    )
  }

  /* 4. 신청 rejected — 다시 신청 가능 */
  if (status === 'rejected') {
    return (
      <div className="space-y-2">
        <div className="bg-white border border-[#f0f0f0] rounded-2xl px-4 py-3.5 flex items-center gap-3">
          <RefreshCcw size={18} className="text-[#999] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#111]">이전 신청이 거절됐어요</p>
            <p className="text-xs text-[#666] mt-0.5">
              다시 신청을 보낼 수 있어요.
            </p>
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isPending}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#beff00] text-[#111] font-bold text-sm py-3.5 rounded-2xl hover:brightness-95 transition-all disabled:opacity-50"
        >
          <UserPlus size={16} strokeWidth={2.4} />
          다시 가입 신청
        </button>
      </div>
    )
  }

  /* 5. 신청 approved — 멤버십이 없는데 approved 인 fallback 케이스 */
  if (status === 'approved') {
    return (
      <div className="space-y-2">
        <div className="bg-white border border-[#f0f0f0] rounded-2xl px-4 py-3.5">
          <p className="text-sm font-bold text-[#111]">가입이 승인됐어요</p>
          <p className="text-xs text-[#666] mt-0.5">
            모임에 입장해보세요.
          </p>
        </div>
        <Link
          href={`/club/${clubId}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#beff00] text-[#111] font-bold text-sm py-3.5 rounded-2xl hover:brightness-95 transition-all"
        >
          모임 입장
          <ArrowRight size={16} strokeWidth={2.4} />
        </Link>
      </div>
    )
  }

  /* 6. 신청 안 함 — 가입 신청 */
  return (
    <button
      onClick={onSubmit}
      disabled={isPending}
      className="w-full inline-flex items-center justify-center gap-2 bg-[#beff00] text-[#111] font-bold text-sm py-3.5 rounded-2xl hover:brightness-95 transition-all disabled:opacity-50"
    >
      <UserPlus size={16} strokeWidth={2.4} />
      가입 신청
    </button>
  )
}
