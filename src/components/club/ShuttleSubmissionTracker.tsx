'use client'

import { useState, useTransition, useEffect } from 'react'
import { Minus, Plus, Check, AlertCircle, Coins, ArrowRightLeft, Wallet } from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { GradeBadge } from '@/components/club/GradeBadge'
import {
  upsertSubmissionAction,
  markSubmissionPaidAction,
} from '@/app/club/[clubId]/shuttle/actions'
import type { SubmissionWithMember } from '@/types/club'

interface Props {
  clubId: string
  sessionId: string
  sessionDate: string // yyyy-mm-dd
  initialSubmissions: SubmissionWithMember[]
  /** 클럽 풀 잔량 (props로 받아 헤더에 표시 — 변동 시 router.refresh()로 갱신) */
  poolCount: number
  /** 클럽 단가 (₩) */
  unitPrice: number
  /** 평일 기본 제출 개수 */
  weekdayRequired: number
  /** 주말 기본 제출 개수 */
  weekendRequired: number
  /** 운영진 권한 (false 면 read-only) */
  isManager: boolean
}

/**
 * 셔틀콕 제출 트래커
 *
 * 한국 클럽·동호회 운영 방식 — 운영진이 출석자별로 입력:
 * - 본인이 가져온 개수
 * - 부족분은 풀에서 이체 (회원에게 자동 청구 기록)
 *
 * 회원에게는 read-only 뷰 (본인 미납 여부 정도만 표시)
 */
export function ShuttleSubmissionTracker({
  clubId,
  sessionId,
  sessionDate,
  initialSubmissions,
  poolCount: initialPoolCount,
  unitPrice,
  weekdayRequired,
  weekendRequired,
  isManager,
}: Props) {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [poolCount, setPoolCount] = useState(initialPoolCount)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => setSubmissions(initialSubmissions), [initialSubmissions])
  useEffect(() => setPoolCount(initialPoolCount), [initialPoolCount])

  // 요일 판정 (0=일, 6=토)
  const dateObj = new Date(sessionDate)
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
  const defaultRequired = isWeekend ? weekendRequired : weekdayRequired

  // ─── 입력 핸들러 ──────────────────────────────────────────
  function updateLocal(memberId: string, patch: Partial<SubmissionWithMember>) {
    setSubmissions((prev) =>
      prev.map((s) => (s.member_id === memberId ? { ...s, ...patch } : s)),
    )
  }

  function persist(member: SubmissionWithMember, broughtDelta: number, poolDelta: number) {
    if (!isManager) return
    const newBrought = Math.max(0, member.brought_count + broughtDelta)
    const newPool = Math.max(0, member.paid_from_pool + poolDelta)
    const required =
      member.required_count === 0 ? defaultRequired : member.required_count

    // 낙관적 업데이트
    updateLocal(member.member_id, {
      brought_count: newBrought,
      paid_from_pool: newPool,
      required_count: required,
      amount_owed: newPool * unitPrice,
    })
    setPoolCount((p) => Math.max(0, p - poolDelta))
    setError(null)
    setWarning(null)

    startTransition(async () => {
      const r = await upsertSubmissionAction({
        clubId,
        sessionId,
        memberId: member.member_id,
        requiredCount: required,
        broughtCount: newBrought,
        paidFromPool: newPool,
      })
      if (r.error) {
        setError(r.error)
        // 롤백
        updateLocal(member.member_id, {
          brought_count: member.brought_count,
          paid_from_pool: member.paid_from_pool,
        })
        setPoolCount((p) => p + poolDelta)
      } else if (r.warning) {
        setWarning(r.warning)
      }
    })
  }

  function markPaid(submissionId: string) {
    if (!isManager || !submissionId) return
    setError(null)
    startTransition(async () => {
      const r = await markSubmissionPaidAction(clubId, submissionId)
      if (r.error) setError(r.error)
      else {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === submissionId
              ? { ...s, amount_paid_at: new Date().toISOString() }
              : s,
          ),
        )
      }
    })
  }

  // ─── 통계 ───────────────────────────────────────────────────
  const totalBrought = submissions.reduce((sum, s) => sum + s.brought_count, 0)
  const totalFromPool = submissions.reduce((sum, s) => sum + s.paid_from_pool, 0)
  const totalUnpaid = submissions
    .filter((s) => s.amount_owed > 0 && !s.amount_paid_at)
    .reduce((sum, s) => sum + s.amount_owed, 0)

  return (
    <div className="space-y-3">
      {/* 헤더 — 풀 잔량 + 기본 정보 */}
      <div className="bg-[#0a0a0a] text-white rounded-2xl p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShuttlecockIcon size={16} className="text-[#beff00]" strokeWidth={2} />
            <span className="text-sm font-bold">셔틀콕 제출</span>
          </div>
          <span className="text-[10px] text-white/40">
            {isWeekend ? '주말' : '평일'} · 기본 {defaultRequired}개
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">여유분 풀</p>
            <p className="text-lg font-extrabold tabular-nums">
              {poolCount}
              <span className="text-xs font-medium text-white/50 ml-0.5">개</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">단가</p>
            <p className="text-lg font-extrabold tabular-nums">
              {unitPrice.toLocaleString()}
              <span className="text-xs font-medium text-white/50 ml-0.5">원</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">미납</p>
            <p className="text-lg font-extrabold tabular-nums">
              {totalUnpaid > 0 ? (
                <span className="text-amber-300">
                  {totalUnpaid.toLocaleString()}
                  <span className="text-xs font-medium text-amber-300/70 ml-0.5">원</span>
                </span>
              ) : (
                <span className="text-[#beff00]">0</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 에러 / 경고 */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 text-xs rounded-xl">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}
      {warning && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 text-amber-700 text-xs rounded-xl">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span className="leading-relaxed">{warning}</span>
        </div>
      )}

      {/* 출석자 행 리스트 */}
      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] text-center py-12">
          <ShuttlecockIcon size={32} className="text-[#ddd] mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-[#999]">출석자가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((s) => (
            <SubmissionRow
              key={s.member_id}
              submission={s}
              defaultRequired={defaultRequired}
              unitPrice={unitPrice}
              poolCount={poolCount}
              isManager={isManager}
              isPending={isPending}
              onChangeBrought={(delta) => persist(s, delta, 0)}
              onChangePool={(delta) => persist(s, 0, delta)}
              onMarkPaid={() => markPaid(s.id)}
            />
          ))}
        </div>
      )}

      {/* 하단 요약 */}
      {submissions.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-3 text-[12px] text-[#555] flex items-center justify-around">
          <span className="inline-flex items-center gap-1.5">
            <ShuttlecockIcon size={11} className="text-[#666]" strokeWidth={2} />
            가져옴 <strong className="text-[#111] tabular-nums">{totalBrought}</strong>
          </span>
          <span className="text-[#ddd]">·</span>
          <span className="inline-flex items-center gap-1.5">
            <ArrowRightLeft size={11} className="text-[#666]" />
            풀이체 <strong className="text-[#111] tabular-nums">{totalFromPool}</strong>
          </span>
          <span className="text-[#ddd]">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Wallet size={11} className="text-[#666]" />
            총 <strong className="text-[#111] tabular-nums">{totalBrought + totalFromPool}</strong>개
          </span>
        </div>
      )}
    </div>
  )
}

// ─── 단일 출석자 행 ─────────────────────────────────────────
function SubmissionRow({
  submission,
  defaultRequired,
  unitPrice,
  poolCount,
  isManager,
  isPending,
  onChangeBrought,
  onChangePool,
  onMarkPaid,
}: {
  submission: SubmissionWithMember
  defaultRequired: number
  unitPrice: number
  poolCount: number
  isManager: boolean
  isPending: boolean
  onChangeBrought: (delta: number) => void
  onChangePool: (delta: number) => void
  onMarkPaid: () => void
}) {
  const required = submission.required_count || defaultRequired
  const total = submission.brought_count + submission.paid_from_pool
  const shortage = Math.max(0, required - total)
  const isUnpaid = submission.amount_owed > 0 && !submission.amount_paid_at
  const isPaid = submission.amount_owed > 0 && submission.amount_paid_at

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-3">
      {/* 상단: 이름 + 요구 개수 */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <GradeBadge score={submission.skillScore} size="sm" />
          <span className="text-sm font-bold text-[#111] truncate">
            {submission.memberName}
          </span>
        </div>
        <span className="text-[11px] text-[#999] shrink-0">
          요구 <strong className="text-[#111] tabular-nums">{required}</strong>개
        </span>
      </div>

      {/* 본인 가져옴 + 풀 이체 (운영진만 +/-) */}
      <div className="grid grid-cols-2 gap-2">
        {/* 본인 가져옴 */}
        <div className="bg-[#f8f8f8] rounded-xl p-2.5">
          <p className="text-[10px] font-bold text-[#999] uppercase tracking-wider mb-1.5">본인</p>
          <div className="flex items-center justify-between gap-1">
            {isManager && (
              <button
                onClick={() => onChangeBrought(-1)}
                disabled={isPending || submission.brought_count <= 0}
                className="w-7 h-7 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center text-[#555] hover:border-[#0a0a0a] active:scale-95 disabled:opacity-30 transition-all"
              >
                <Minus size={11} />
              </button>
            )}
            <span className="text-base font-extrabold text-[#111] tabular-nums flex-1 text-center">
              {submission.brought_count}
            </span>
            {isManager && (
              <button
                onClick={() => onChangeBrought(1)}
                disabled={isPending}
                className="w-7 h-7 rounded-lg bg-[#beff00] flex items-center justify-center text-[#111] active:scale-95 disabled:opacity-30 transition-all"
              >
                <Plus size={11} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* 풀 이체 */}
        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-2.5">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5 inline-flex items-center gap-1">
            <ArrowRightLeft size={9} />
            풀이체
          </p>
          <div className="flex items-center justify-between gap-1">
            {isManager && (
              <button
                onClick={() => onChangePool(-1)}
                disabled={isPending || submission.paid_from_pool <= 0}
                className="w-7 h-7 rounded-lg bg-white border border-amber-200 flex items-center justify-center text-amber-700 hover:border-amber-400 active:scale-95 disabled:opacity-30 transition-all"
              >
                <Minus size={11} />
              </button>
            )}
            <span className="text-base font-extrabold text-amber-700 tabular-nums flex-1 text-center">
              {submission.paid_from_pool}
            </span>
            {isManager && (
              <button
                onClick={() => onChangePool(1)}
                disabled={isPending || poolCount <= 0}
                title={poolCount <= 0 ? '여유분 풀이 부족합니다' : '풀에서 1개 이체'}
                className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white active:scale-95 disabled:opacity-30 transition-all"
              >
                <Plus size={11} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 하단 상태 라인 */}
      <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px]">
        {/* 좌측: 충족 / 부족 */}
        <div>
          {shortage > 0 ? (
            <span className="inline-flex items-center gap-1 text-red-500 font-bold">
              <AlertCircle size={11} strokeWidth={2.5} />
              {shortage}개 부족
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
              <Check size={11} strokeWidth={2.5} />
              충족
            </span>
          )}
        </div>

        {/* 우측: 미납 / 납부 완료 */}
        <div>
          {isUnpaid && (
            <button
              onClick={onMarkPaid}
              disabled={!isManager || isPending}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-200 hover:bg-amber-200 disabled:opacity-50 transition-colors"
            >
              <Coins size={11} />
              미납 {submission.amount_owed.toLocaleString()}원
            </button>
          )}
          {isPaid && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
              <Check size={11} strokeWidth={2.5} />
              납부 완료
            </span>
          )}
          {submission.amount_owed === 0 && submission.paid_from_pool === 0 && shortage === 0 && (
            <span className="text-[#bbb]">{(unitPrice * 0).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  )
}
