'use client'

import { useState, useTransition } from 'react'
import {
  X, Plus, Coins, Settings, Share2, Copy, Check,
  AlertCircle, ClipboardList,
} from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import {
  replenishPoolAction,
  adjustPoolAction,
  updateShuttleConfigAction,
  markSubmissionPaidAction,
} from '@/app/club/[clubId]/shuttle/actions'
import type { ShuttlePoolLog } from '@/types/club'

interface UnpaidRow {
  submissionId: string
  memberId: string
  memberName: string
  sessionDate: string
  paidFromPool: number
  amountOwed: number
}

interface Props {
  clubId: string
  clubName: string
  poolCount: number
  weekdayRequired: number
  weekendRequired: number
  unitPrice: number
  unpaidRows: UnpaidRow[]
  poolLog: ShuttlePoolLog[]
  settlementAccount: string | null
}

/**
 * 셔틀콕 관리 — 운영진 전용
 *
 * 영역 4개:
 * 1) 풀 잔량 + 충전·조정 다이얼로그
 * 2) 셔틀콕 설정 (평일/주말 기본 + 단가)
 * 3) 미납자 리스트 + 카톡 공유 (Web Share API)
 * 4) 풀 변동 감사 로그
 */
export function ShuttleManageClient({
  clubId,
  clubName,
  poolCount,
  weekdayRequired,
  weekendRequired,
  unitPrice,
  unpaidRows,
  poolLog,
  settlementAccount,
}: Props) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [openReplenish, setOpenReplenish] = useState(false)
  const [openAdjust, setOpenAdjust] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  function showSuccess(msg: string) {
    setSuccess(msg)
    setError(null)
    setTimeout(() => setSuccess(null), 2500)
  }

  function showError(msg: string) {
    setError(msg)
    setSuccess(null)
  }

  // ─── 미납자 카톡 공유 메시지 ──────────────────────────────
  function buildUnpaidMessage(): string {
    const totalUnpaid = unpaidRows.reduce((s, r) => s + r.amountOwed, 0)
    const lines = [
      `📢 ${clubName} 셔틀콕 미납 안내`,
      '',
      `미납자: 총 ${unpaidRows.length}명 / ${totalUnpaid.toLocaleString()}원`,
      '',
      ...unpaidRows.slice(0, 30).map((r) => {
        const [, m, d] = r.sessionDate.split('-')
        return `· ${r.memberName} (${Number(m)}/${Number(d)}) ${r.amountOwed.toLocaleString()}원`
      }),
    ]
    if (unpaidRows.length > 30) lines.push(`… 외 ${unpaidRows.length - 30}명`)
    if (settlementAccount) {
      lines.push('', `입금: ${settlementAccount}`, '* 입금자명에 본인 이름을 적어주세요!')
    }
    return lines.join('\n')
  }

  async function handleNativeShare() {
    const text = buildUnpaidMessage()
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: '셔틀콕 미납 안내', text })
        return
      } catch {
        return
      }
    }
    await handleCopyMessage()
  }

  async function handleCopyMessage() {
    try {
      await navigator.clipboard.writeText(buildUnpaidMessage())
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      showError('클립보드 복사 실패')
    }
  }

  function handleMarkPaid(submissionId: string) {
    startTransition(async () => {
      const r = await markSubmissionPaidAction(clubId, submissionId)
      if (r.error) showError(r.error)
      else showSuccess('납부 완료 처리됨')
    })
  }

  return (
    <div className="space-y-4">
      {/* 알림 */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--color-brand-streak-bg)] text-[var(--color-brand-streak)] text-xs rounded-xl">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--color-brand-court-bg)] text-[var(--color-brand-court-deep)] text-xs rounded-xl">
          <Check size={14} className="shrink-0" strokeWidth={2.5} />
          {success}
        </div>
      )}

      {/* 1) 풀 잔량 + 액션 버튼 */}
      <section className="bg-[#0a0a0a] text-white rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShuttlecockIcon size={16} className="text-[var(--color-brand-lime)]" strokeWidth={2} />
            <span className="text-sm font-bold">여유분 풀</span>
          </div>
          <button
            onClick={() => setOpenSettings(true)}
            className="text-[11px] text-white/60 hover:text-white inline-flex items-center gap-1 transition-colors"
          >
            <Settings size={12} />
            설정
          </button>
        </div>
        <div className="flex items-baseline gap-1.5 mb-4">
          <span className="text-4xl font-extrabold tabular-nums">{poolCount}</span>
          <span className="text-sm font-medium text-white/60">개 보유</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setOpenReplenish(true)}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[var(--color-brand-lime)] text-[#111] font-bold text-xs hover:brightness-95 active:scale-[0.99] transition-all"
          >
            <Plus size={13} strokeWidth={2.5} />
            충전
          </button>
          <button
            onClick={() => setOpenAdjust(true)}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 font-bold text-xs hover:bg-white/15 transition-colors"
          >
            <ClipboardList size={13} />
            수동 조정
          </button>
        </div>
      </section>

      {/* 2) 미납자 리스트 */}
      <section className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-[#111] inline-flex items-center gap-1.5">
              <Coins size={14} className="text-amber-600" strokeWidth={2.2} />
              미납자
              {unpaidRows.length > 0 && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
                  {unpaidRows.length}명
                </span>
              )}
            </p>
            {unpaidRows.length > 0 && (
              <p className="text-[11px] text-[#999] mt-0.5">
                총 {unpaidRows.reduce((s, r) => s + r.amountOwed, 0).toLocaleString()}원
              </p>
            )}
          </div>
          {unpaidRows.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleNativeShare}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0a0a0a] text-white text-[11px] font-bold hover:bg-[#222] transition-colors"
              >
                <Share2 size={11} strokeWidth={2.5} />
                공유
              </button>
              <button
                onClick={handleCopyMessage}
                title="텍스트 복사"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#e5e5e5] text-[#555] hover:border-[#0a0a0a] transition-colors"
              >
                {shareCopied ? (
                  <Check size={11} className="text-[var(--color-brand-court)]" strokeWidth={2.5} />
                ) : (
                  <Copy size={11} />
                )}
              </button>
            </div>
          )}
        </div>

        {unpaidRows.length === 0 ? (
          <p className="text-center text-[12px] text-[#999] py-6">
            ✓ 모든 셔틀콕 청구가 결제 완료되었어요
          </p>
        ) : (
          <ul className="space-y-1.5 max-h-[320px] overflow-y-auto">
            {unpaidRows.map((r) => {
              const [, m, d] = r.sessionDate.split('-')
              return (
                <li
                  key={r.submissionId}
                  className="flex items-center gap-2 bg-amber-50/60 border border-amber-100 rounded-xl px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#111] truncate">
                      {r.memberName}
                      <span className="text-[10px] text-[#999] font-medium ml-1.5">
                        {Number(m)}/{Number(d)} · 풀이체 {r.paidFromPool}개
                      </span>
                    </p>
                  </div>
                  <span className="text-[12px] font-extrabold text-amber-700 tabular-nums shrink-0">
                    {r.amountOwed.toLocaleString()}원
                  </span>
                  <button
                    onClick={() => handleMarkPaid(r.submissionId)}
                    disabled={isPending}
                    className="text-[10px] font-bold px-2 py-1 rounded-md bg-[var(--color-brand-court)] text-white hover:bg-[var(--color-brand-court)] active:scale-95 disabled:opacity-50 transition-all shrink-0"
                  >
                    납부완료
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* 3) 풀 변동 로그 */}
      <section className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
        <p className="text-sm font-bold text-[#111] mb-3">최근 풀 변동</p>
        {poolLog.length === 0 ? (
          <p className="text-center text-[12px] text-[#999] py-6">
            아직 변동 기록이 없어요
          </p>
        ) : (
          <ul className="space-y-1 max-h-[260px] overflow-y-auto text-[12px]">
            {poolLog.map((log) => {
              const date = new Date(log.created_at)
              const reasonLabel = {
                replenish: '충전',
                pool_payment: '회원 이체',
                manual_adjust: '수동 조정',
              }[log.reason]
              return (
                <li
                  key={log.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f8f8f8]"
                >
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      log.delta > 0
                        ? 'text-[var(--color-brand-court-deep)] bg-[var(--color-brand-court-bg)] border border-[var(--color-brand-court-soft)]/40'
                        : 'text-amber-700 bg-amber-50 border border-amber-100'
                    }`}
                  >
                    {log.delta > 0 ? '+' : ''}
                    {log.delta}
                  </span>
                  <span className="flex-1 min-w-0 truncate text-[#555]">
                    {reasonLabel}
                    {log.note && (
                      <span className="text-[#999] ml-1.5">· {log.note}</span>
                    )}
                  </span>
                  <span className="text-[10px] text-[#bbb] tabular-nums shrink-0">
                    {date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* ─── 다이얼로그들 ─── */}
      {openReplenish && (
        <ReplenishDialog
          clubId={clubId}
          unitPrice={unitPrice}
          onClose={() => setOpenReplenish(false)}
          onSuccess={() => {
            setOpenReplenish(false)
            showSuccess('풀 충전 완료')
          }}
          onError={showError}
        />
      )}

      {openAdjust && (
        <AdjustDialog
          clubId={clubId}
          onClose={() => setOpenAdjust(false)}
          onSuccess={() => {
            setOpenAdjust(false)
            showSuccess('풀 조정 완료')
          }}
          onError={showError}
        />
      )}

      {openSettings && (
        <SettingsDialog
          clubId={clubId}
          weekdayRequired={weekdayRequired}
          weekendRequired={weekendRequired}
          unitPrice={unitPrice}
          onClose={() => setOpenSettings(false)}
          onSuccess={() => {
            setOpenSettings(false)
            showSuccess('설정 저장됨')
          }}
          onError={showError}
        />
      )}
    </div>
  )
}

// ─── 풀 충전 다이얼로그 ─────────────────────────────────────
function ReplenishDialog({
  clubId,
  unitPrice,
  onClose,
  onSuccess,
  onError,
}: {
  clubId: string
  unitPrice: number
  onClose: () => void
  onSuccess: () => void
  onError: (m: string) => void
}) {
  const [count, setCount] = useState(12)
  const [amountPaid, setAmountPaid] = useState(0)
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const r = await replenishPoolAction({
        clubId,
        count,
        amountPaid: amountPaid > 0 ? amountPaid : undefined,
        note: note.trim() || undefined,
      })
      if (r.error) onError(r.error)
      else onSuccess()
    })
  }

  const suggestedAmount = count * unitPrice

  return (
    <Dialog title="셔틀콕 풀 충전" onClose={onClose}>
      <div className="space-y-3">
        <NumberRow label="충전 개수" value={count} onChange={setCount} suffix="개" min={1} max={500} step={6} />
        <NumberRow
          label="구매 금액 (선택)"
          value={amountPaid}
          onChange={setAmountPaid}
          suffix="원"
          min={0}
          max={10000000}
          step={1000}
          placeholder={`예상 ${suggestedAmount.toLocaleString()}원`}
        />
        <div>
          <p className="text-[11px] font-semibold text-[#555] mb-1.5">메모 (선택)</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 김민준 님이 사오심"
            maxLength={60}
            className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a] transition-colors"
          />
        </div>
      </div>
      <DialogActions onCancel={onClose} onConfirm={handleSubmit} confirmLabel="충전" disabled={isPending || count <= 0} />
    </Dialog>
  )
}

// ─── 수동 조정 다이얼로그 ───────────────────────────────────
function AdjustDialog({
  clubId,
  onClose,
  onSuccess,
  onError,
}: {
  clubId: string
  onClose: () => void
  onSuccess: () => void
  onError: (m: string) => void
}) {
  const [delta, setDelta] = useState(0)
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!note.trim()) {
      onError('수동 조정 사유를 적어주세요.')
      return
    }
    startTransition(async () => {
      const r = await adjustPoolAction({ clubId, delta, note })
      if (r.error) onError(r.error)
      else onSuccess()
    })
  }

  return (
    <Dialog title="풀 수동 조정" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-[12px] text-[#666] leading-relaxed">
          재고 조사·분실·반품 등으로 잔량을 직접 조정합니다. 사유는 감사 로그에 기록됩니다.
        </p>
        <NumberRow
          label="조정 (+/−)"
          value={delta}
          onChange={setDelta}
          suffix="개"
          min={-1000}
          max={1000}
          step={1}
          allowNegative
        />
        <div>
          <p className="text-[11px] font-semibold text-[#555] mb-1.5">사유 *</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 분실 4개 / 재고 조사 결과"
            maxLength={100}
            required
            className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a] transition-colors"
          />
        </div>
      </div>
      <DialogActions onCancel={onClose} onConfirm={handleSubmit} confirmLabel="조정" disabled={isPending || delta === 0 || !note.trim()} />
    </Dialog>
  )
}

// ─── 셔틀콕 설정 다이얼로그 ─────────────────────────────────
function SettingsDialog({
  clubId,
  weekdayRequired,
  weekendRequired,
  unitPrice,
  onClose,
  onSuccess,
  onError,
}: {
  clubId: string
  weekdayRequired: number
  weekendRequired: number
  unitPrice: number
  onClose: () => void
  onSuccess: () => void
  onError: (m: string) => void
}) {
  const [wd, setWd] = useState(weekdayRequired)
  const [we, setWe] = useState(weekendRequired)
  const [price, setPrice] = useState(unitPrice)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const r = await updateShuttleConfigAction({
        clubId,
        weekdayRequired: wd,
        weekendRequired: we,
        unitPrice: price,
      })
      if (r.error) onError(r.error)
      else onSuccess()
    })
  }

  return (
    <Dialog title="셔틀콕 기본 설정" onClose={onClose}>
      <div className="space-y-3">
        <NumberRow label="평일 1인당" value={wd} onChange={setWd} suffix="개" min={0} max={20} step={1} />
        <NumberRow label="주말 1인당" value={we} onChange={setWe} suffix="개" min={0} max={20} step={1} />
        <NumberRow label="셔틀콕 단가" value={price} onChange={setPrice} suffix="원" min={0} max={100000} step={100} />
      </div>
      <DialogActions onCancel={onClose} onConfirm={handleSubmit} confirmLabel="저장" disabled={isPending} />
    </Dialog>
  )
}

// ─── 공통 다이얼로그 셸 ────────────────────────────────────
function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col">
        <div className="px-5 pt-5 pb-3 border-b border-[#f0f0f0] flex items-center justify-between shrink-0">
          <p className="text-base font-extrabold text-[#111]">{title}</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#555] hover:bg-[#e5e5e5] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

function DialogActions({
  onCancel,
  onConfirm,
  confirmLabel,
  disabled,
}: {
  onCancel: () => void
  onConfirm: () => void
  confirmLabel: string
  disabled?: boolean
}) {
  return (
    <div className="px-5 py-4 border-t border-[#f0f0f0] flex gap-2 shrink-0">
      <button
        onClick={onCancel}
        className="flex-1 py-3 text-sm font-semibold border border-[#e5e5e5] text-[#555] rounded-xl hover:bg-[#f8f8f8] transition-colors"
      >
        취소
      </button>
      <button
        onClick={onConfirm}
        disabled={disabled}
        className="flex-[2] py-3 text-sm font-extrabold bg-[var(--color-brand-lime)] text-[#111] rounded-xl hover:brightness-95 disabled:opacity-40 transition-all"
      >
        {confirmLabel}
      </button>
    </div>
  )
}

function NumberRow({
  label,
  value,
  onChange,
  suffix,
  min,
  max,
  step,
  placeholder,
  allowNegative,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  suffix: string
  min: number
  max: number
  step: number
  placeholder?: string
  allowNegative?: boolean
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#555] mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={!allowNegative && value <= min}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#e5e5e5] text-[#555] hover:border-[#0a0a0a] active:scale-95 disabled:opacity-30 transition-all shrink-0"
        >
          −
        </button>
        <div className="flex-1 flex items-center justify-between border border-[#e5e5e5] rounded-xl px-3 py-2 bg-white">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const n = parseInt(e.target.value || '0', 10)
              if (!Number.isNaN(n) && n >= min && n <= max) onChange(n)
            }}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm font-bold text-[#111] outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs text-[#999] font-semibold ml-2 shrink-0">{suffix}</span>
        </div>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#e5e5e5] text-[#555] hover:border-[#0a0a0a] active:scale-95 disabled:opacity-30 transition-all shrink-0"
        >
          +
        </button>
      </div>
    </div>
  )
}
