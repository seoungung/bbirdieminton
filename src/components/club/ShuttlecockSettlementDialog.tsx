'use client'

import { useState, useTransition } from 'react'
import { X, Check, Minus, Plus, Copy, Share2, MessageSquare } from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { createSettlementAction } from '@/app/club/[clubId]/settlements/actions'

interface Props {
  open: boolean
  clubId: string
  sessionId: string
  clubName: string
  sessionDate: string  // yyyy-mm-dd
  attendeeCount: number
  defaultShuttlePrice: number
  settlementAccount: string | null
  /** 정산 저장 후 호출 (성공 시에만) */
  onSaved: () => void
  /** 건너뛰기/닫기 */
  onSkip: () => void
}

/**
 * 셔틀콕비 정산 다이얼로그
 *
 * 게임 마감 시 표시되어 셔틀콕 개수/단가/추가비용을 입력받아 1인당 부담금을 자동 계산.
 * 저장 시 session_settlements 테이블에 기록되고 출석자 전원에게 미납 상태로 설정됨.
 */
export function ShuttlecockSettlementDialog({
  open,
  clubId,
  sessionId,
  clubName,
  sessionDate,
  attendeeCount,
  defaultShuttlePrice,
  settlementAccount,
  onSaved,
  onSkip,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [shuttleCount, setShuttleCount] = useState(8)
  const [shuttleUnitPrice, setShuttleUnitPrice] = useState(defaultShuttlePrice)
  const [extraCost, setExtraCost] = useState(0)
  const [memo, setMemo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  if (!open) return null

  const totalCost = shuttleCount * shuttleUnitPrice + extraCost
  const perPersonAmount = attendeeCount > 0 ? Math.ceil(totalCost / attendeeCount) : 0
  const canSave = shuttleCount > 0 && shuttleUnitPrice > 0 && attendeeCount > 0

  /** 카톡 공유 메시지 생성 */
  function buildShareMessage(): string {
    const [y, m, d] = sessionDate.split('-')
    const dateStr = `${Number(m)}/${Number(d)}`
    const lines = [
      `📢 ${dateStr} ${clubName} 셔틀콕비 정산`,
      '',
      `🏸 셔틀콕 ${shuttleCount}개 × ${shuttleUnitPrice.toLocaleString()}원`,
    ]
    if (extraCost > 0) lines.push(`💧 추가 ${extraCost.toLocaleString()}원`)
    lines.push(
      `💵 총 ${totalCost.toLocaleString()}원 ÷ ${attendeeCount}명`,
      `💰 1인당 ${perPersonAmount.toLocaleString()}원`
    )
    if (settlementAccount) {
      lines.push('', `입금: ${settlementAccount}`, `* 입금자명에 본인 이름 적어주세요!`)
    }
    void y  // unused
    return lines.join('\n')
  }

  async function handleCopyMessage() {
    try {
      await navigator.clipboard.writeText(buildShareMessage())
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      setError('클립보드 복사 실패')
    }
  }

  /** Web Share API — 모바일에서 카톡/문자 등 직접 공유 (지원 안 되면 클립보드 fallback) */
  async function handleNativeShare() {
    const text = buildShareMessage()
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: '셔틀콕비 정산', text })
        return
      } catch {
        // 사용자 취소 등 — 조용히 무시
        return
      }
    }
    // fallback: 클립보드 복사
    await handleCopyMessage()
  }

  function handleSave() {
    if (!canSave || isPending) return
    setError(null)

    startTransition(async () => {
      const result = await createSettlementAction({
        clubId,
        sessionId,
        shuttleCount,
        shuttleUnitPrice,
        extraCost,
        memo: memo.trim() || null,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      onSaved()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="px-5 pt-5 pb-3 border-b border-[#f0f0f0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShuttlecockIcon size={18} className="text-emerald-600" strokeWidth={1.8} />
            <p className="text-base font-extrabold text-[#111]">셔틀콕비 정산</p>
          </div>
          <button
            onClick={onSkip}
            disabled={isPending}
            className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#555] hover:bg-[#e5e5e5] disabled:opacity-50 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* 셔틀콕 개수 */}
          <NumberField
            label="셔틀콕 사용량"
            value={shuttleCount}
            onChange={setShuttleCount}
            suffix="개"
            step={1}
            min={0}
            max={100}
          />

          {/* 개당 가격 */}
          <NumberField
            label="개당 가격"
            value={shuttleUnitPrice}
            onChange={setShuttleUnitPrice}
            suffix="원"
            step={100}
            min={0}
            max={100000}
          />

          {/* 추가 비용 */}
          <NumberField
            label="추가 비용 (음료·간식)"
            value={extraCost}
            onChange={setExtraCost}
            suffix="원"
            step={1000}
            min={0}
            max={10000000}
            optional
          />

          {/* 메모 */}
          <div>
            <p className="text-xs font-semibold text-[#555] mb-1.5">메모 (선택)</p>
            <input
              type="text"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="예: 콕 나눠쓴 세션"
              maxLength={60}
              className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors"
            />
          </div>

          {/* 결과 요약 카드 */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-emerald-700/70">
              <span>셔틀콕 {shuttleCount}개 × {shuttleUnitPrice.toLocaleString()}원</span>
              <span className="font-bold tabular-nums">{(shuttleCount * shuttleUnitPrice).toLocaleString()}원</span>
            </div>
            {extraCost > 0 && (
              <div className="flex justify-between text-xs text-emerald-700/70">
                <span>추가 비용</span>
                <span className="font-bold tabular-nums">{extraCost.toLocaleString()}원</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t border-emerald-200 pt-2">
              <span className="font-semibold text-emerald-800">총 비용 ÷ {attendeeCount}명</span>
              <span className="font-extrabold text-emerald-800 tabular-nums">{totalCost.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs font-bold text-emerald-700">💰 1인당</span>
              <span className="text-2xl font-extrabold text-emerald-700 tabular-nums">
                {perPersonAmount.toLocaleString()}
                <span className="text-base font-bold ml-0.5">원</span>
              </span>
            </div>
          </div>

          {/* 입금 계좌 */}
          {settlementAccount && (
            <div className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-xl p-3">
              <p className="text-[10px] font-bold text-[#999] uppercase tracking-wider mb-1">입금 계좌</p>
              <p className="text-sm font-semibold text-[#111]">{settlementAccount}</p>
            </div>
          )}

          {/* 카톡/메시지 공유 — Web Share API 우선, fallback 클립보드 */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-[#999] uppercase tracking-wider">
              미납자에게 알리기
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleNativeShare}
                disabled={!canSave}
                className="flex items-center justify-center gap-1.5 py-2.5 border border-[#0a0a0a] bg-[#0a0a0a] text-white text-xs font-bold rounded-xl hover:bg-[#222] disabled:opacity-50 transition-colors"
              >
                <Share2 size={13} strokeWidth={2.5} />
                메시지 공유
              </button>
              <button
                onClick={handleCopyMessage}
                disabled={!canSave}
                className="flex items-center justify-center gap-1.5 py-2.5 border border-[#e5e5e5] text-[#555] text-xs font-bold rounded-xl hover:bg-[#f8f8f8] disabled:opacity-50 transition-colors"
              >
                {shareCopied ? (
                  <>
                    <Check size={13} className="text-emerald-600" strokeWidth={2.5} />
                    <span className="text-emerald-700">복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    텍스트 복사
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-[#999] leading-relaxed flex items-start gap-1.5">
              <MessageSquare size={11} className="text-[#bbb] mt-0.5 shrink-0" strokeWidth={2} />
              모바일은 <strong className="text-[#666] font-semibold">메시지 공유</strong>로 카톡 단체방에 바로 보낼 수 있어요. 안 되면 텍스트 복사 후 직접 붙여넣기.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}
        </div>

        {/* 하단 액션 */}
        <div className="px-5 py-4 border-t border-[#f0f0f0] flex gap-2 shrink-0">
          <button
            onClick={onSkip}
            disabled={isPending}
            className="flex-1 py-3 text-sm font-semibold border border-[#e5e5e5] text-[#555] rounded-xl hover:bg-[#f8f8f8] disabled:opacity-50 transition-colors"
          >
            건너뛰기
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || isPending}
            className="flex-[2] py-3 text-sm font-extrabold bg-[#beff00] text-[#111] rounded-xl hover:brightness-95 active:scale-[0.99] disabled:opacity-40 transition-all inline-flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Check size={14} strokeWidth={2.5} />
                정산 확정
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/** 증감 버튼 달린 숫자 입력 */
function NumberField({
  label,
  value,
  onChange,
  suffix,
  step,
  min,
  max,
  optional,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  suffix: string
  step: number
  min: number
  max: number
  optional?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#555] mb-1.5">
        {label}
        {optional && <span className="text-[#bbb] font-normal ml-1">(선택)</span>}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#e5e5e5] text-[#555] hover:border-[#0a0a0a] active:scale-95 disabled:opacity-30 transition-all shrink-0"
        >
          <Minus size={14} />
        </button>
        <div className="flex-1 flex items-center justify-between border border-[#e5e5e5] rounded-xl px-3 py-2.5 bg-white">
          <input
            type="number"
            value={value}
            onChange={e => {
              const n = parseInt(e.target.value || '0', 10)
              if (!Number.isNaN(n) && n >= min && n <= max) onChange(n)
            }}
            min={min}
            max={max}
            step={step}
            className="flex-1 bg-transparent text-sm font-bold text-[#111] outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs text-[#999] font-semibold ml-2">{suffix}</span>
        </div>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#e5e5e5] text-[#555] hover:border-[#0a0a0a] active:scale-95 disabled:opacity-30 transition-all shrink-0"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
