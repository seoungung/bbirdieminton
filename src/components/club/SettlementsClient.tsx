'use client'

import { useState, useTransition } from 'react'
import {
  ChevronDown, ChevronUp, CheckCircle2, Circle, Copy, Check,
  Trash2, Settings2, AlertCircle,
} from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  toggleSettlementPaidAction,
  deleteSettlementAction,
  updateShuttleSettingsAction,
} from '@/app/club/[clubId]/settlements/actions'
import type { SettlementWithMembers } from '@/types/club'

interface Props {
  clubId: string
  settlements: SettlementWithMembers[]
  isManager: boolean
  shuttleDefaultPrice: number
  settlementAccount: string | null
}

export function SettlementsClient({
  clubId,
  settlements: initialSettlements,
  isManager,
  shuttleDefaultPrice: initialPrice,
  settlementAccount: initialAccount,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [settlements, setSettlements] = useState(initialSettlements)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [priceInput, setPriceInput] = useState(String(initialPrice))
  const [accountInput, setAccountInput] = useState(initialAccount ?? '')
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ── 집계 ── */
  const totalSettlements = settlements.length
  const pendingCount = settlements.reduce(
    (sum, s) => sum + (s.members.length - s.paidCount),
    0
  )
  const pendingAmount = settlements.reduce(
    (sum, s) => sum + s.members.filter(m => !m.paid).reduce((a, m) => a + m.amount, 0),
    0
  )

  /* ── 납부 토글 (낙관적 업데이트) ── */
  const handleTogglePaid = (settlementId: string, settlementMemberId: string, currentPaid: boolean) => {
    if (!isManager) return
    setError(null)

    /* 낙관적 업데이트 */
    setSettlements(prev =>
      prev.map(s => {
        if (s.id !== settlementId) return s
        const members = s.members.map(m =>
          m.id === settlementMemberId
            ? { ...m, paid: !currentPaid, paid_at: !currentPaid ? new Date().toISOString() : null }
            : m
        )
        return {
          ...s,
          members,
          paidCount: members.filter(m => m.paid).length,
        }
      })
    )

    startTransition(async () => {
      const result = await toggleSettlementPaidAction(clubId, settlementMemberId, currentPaid)
      if (result.error) {
        setError(result.error)
        /* 롤백 */
        setSettlements(prev =>
          prev.map(s => {
            if (s.id !== settlementId) return s
            const members = s.members.map(m =>
              m.id === settlementMemberId
                ? { ...m, paid: currentPaid, paid_at: currentPaid ? new Date().toISOString() : null }
                : m
            )
            return { ...s, members, paidCount: members.filter(m => m.paid).length }
          })
        )
      }
    })
  }

  /* ── 정산 삭제 ── */
  const confirmDelete = () => {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteTarget(null)
    startTransition(async () => {
      const result = await deleteSettlementAction(clubId, target)
      if (result.error) {
        setError(result.error)
        return
      }
      setSettlements(prev => prev.filter(s => s.id !== target))
      if (expanded === target) setExpanded(null)
    })
  }

  /* ── 클럽 설정 저장 ── */
  const handleSaveSettings = () => {
    const price = parseInt(priceInput.replace(/,/g, ''), 10)
    if (isNaN(price) || price < 0) {
      setError('가격이 올바르지 않습니다.')
      return
    }
    startTransition(async () => {
      const result = await updateShuttleSettingsAction(clubId, price, accountInput || null)
      if (result.error) {
        setError(result.error)
        return
      }
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 2000)
    })
  }

  /* ── 특정 정산의 카톡 메시지 복사 ── */
  const handleCopyMessage = async (s: SettlementWithMembers) => {
    const [y, m, d] = s.created_at.split('T')[0].split('-')
    const dateStr = `${Number(m)}/${Number(d)}`
    const unpaidNames = s.members.filter(mm => !mm.paid).map(mm => mm.memberName)
    const lines = [
      `📢 ${dateStr} 셔틀콕비 정산`,
      '',
      `🏸 셔틀콕 ${s.shuttle_count}개 × ${s.shuttle_unit_price.toLocaleString()}원`,
    ]
    if (s.extra_cost > 0) lines.push(`💧 추가 ${s.extra_cost.toLocaleString()}원`)
    lines.push(
      `💵 총 ${(s.shuttle_count * s.shuttle_unit_price + s.extra_cost).toLocaleString()}원 ÷ ${s.attendee_count}명`,
      `💰 1인당 ${s.per_person_amount.toLocaleString()}원`
    )
    if (initialAccount) lines.push('', `입금: ${initialAccount}`, `* 입금자명에 본인 이름 적어주세요!`)
    if (unpaidNames.length > 0) {
      lines.push('', `🔴 미납자 (${unpaidNames.length}명)`, unpaidNames.join(', '))
    }
    void y
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      /* 잠깐 복사됨 표시 */
      setExpanded(`copied-${s.id}`)
      setTimeout(() => {
        setExpanded(prev => (prev === `copied-${s.id}` ? s.id : prev))
      }, 1500)
    } catch {
      setError('클립보드 복사 실패')
    }
  }

  return (
    <div className="space-y-4">
      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="총 정산" value={`${totalSettlements}건`} tone="default" />
        <SummaryCard label="미납 건" value={`${pendingCount}건`} tone={pendingCount > 0 ? 'warn' : 'default'} />
        <SummaryCard
          label="미납 금액"
          value={pendingAmount > 0 ? `${pendingAmount.toLocaleString()}원` : '-'}
          tone={pendingAmount > 0 ? 'warn' : 'default'}
          compact
        />
      </div>

      {/* 설정 아코디언 */}
      {isManager && (
        <div className="bg-white rounded-2xl border border-[#e5e5e5]">
          <button
            onClick={() => setShowSettings(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-2">
              <Settings2 size={14} className="text-[#555]" />
              <span className="text-sm font-semibold text-[#111]">기본 설정</span>
            </div>
            {showSettings ? (
              <ChevronUp size={16} className="text-[#999]" />
            ) : (
              <ChevronDown size={16} className="text-[#999]" />
            )}
          </button>
          {showSettings && (
            <div className="px-4 pb-4 pt-1 border-t border-[#f0f0f0] space-y-3">
              <div>
                <p className="text-xs font-semibold text-[#555] mb-1.5">셔틀콕 기본 가격 (원)</p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={priceInput}
                  onChange={e => setPriceInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="2500"
                  className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors tabular-nums"
                />
                <p className="text-[10px] text-[#bbb] mt-1">정산 다이얼로그에서 이 가격이 기본값으로 뜹니다</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#555] mb-1.5">입금 계좌 안내</p>
                <input
                  type="text"
                  value={accountInput}
                  onChange={e => setAccountInput(e.target.value)}
                  placeholder="예: 신한 110-xxx-xxxx (홍길동)"
                  maxLength={80}
                  className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors"
                />
                <p className="text-[10px] text-[#bbb] mt-1">카톡 공유 메시지에 자동으로 포함됩니다</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={isPending}
                  className="px-4 py-2 bg-[#0a0a0a] text-white text-xs font-bold rounded-xl hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
                >
                  {settingsSaved ? (
                    <span className="inline-flex items-center gap-1">
                      <Check size={12} />
                      저장됨
                    </span>
                  ) : (
                    '설정 저장'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {/* 정산 목록 */}
      {settlements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] py-14 text-center">
          <ShuttlecockIcon size={40} className="text-[#ccc] mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm font-bold text-[#111]">아직 정산 내역이 없어요</p>
          <p className="text-xs text-[#999] mt-1">게임 마감 시 셔틀콕비를 입력하면 자동으로 기록됩니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#999] uppercase tracking-wider px-1 mt-2">정산 내역</p>
          {settlements.map(s => {
            const isOpen = expanded === s.id || expanded === `copied-${s.id}`
            const allPaid = s.paidCount === s.members.length
            const date = new Date(s.created_at)
            return (
              <div
                key={s.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-colors ${
                  allPaid ? 'border-emerald-200' : 'border-[#e5e5e5]'
                }`}
              >
                {/* 카드 헤더 */}
                <button
                  onClick={() => setExpanded(prev => (prev === s.id ? null : s.id))}
                  className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-[#fafafa] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-[#111]">
                        {date.toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </p>
                      {allPaid ? (
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                          완납
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold text-orange-600 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">
                          미납 {s.members.length - s.paidCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#999]">
                      🏸 {s.shuttle_count}개 · {s.attendee_count}명 · 1인당{' '}
                      <span className="font-bold text-[#111] tabular-nums">
                        {s.per_person_amount.toLocaleString()}원
                      </span>
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-[#ccc] shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-[#ccc] shrink-0" />
                  )}
                </button>

                {/* 펼침 영역 */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#f0f0f0] space-y-3">
                    {/* 비용 상세 */}
                    <div className="bg-[#f8f8f8] rounded-xl p-3 space-y-1 text-xs">
                      <div className="flex justify-between text-[#555]">
                        <span>셔틀콕 {s.shuttle_count}개 × {s.shuttle_unit_price.toLocaleString()}원</span>
                        <span className="font-semibold tabular-nums">
                          {(s.shuttle_count * s.shuttle_unit_price).toLocaleString()}원
                        </span>
                      </div>
                      {s.extra_cost > 0 && (
                        <div className="flex justify-between text-[#555]">
                          <span>추가 비용</span>
                          <span className="font-semibold tabular-nums">
                            {s.extra_cost.toLocaleString()}원
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm border-t border-[#e5e5e5] pt-1 mt-1">
                        <span className="font-bold text-[#111]">총 비용</span>
                        <span className="font-extrabold text-[#111] tabular-nums">
                          {(s.shuttle_count * s.shuttle_unit_price + s.extra_cost).toLocaleString()}원
                        </span>
                      </div>
                      {s.memo && (
                        <p className="text-[11px] text-[#777] italic pt-1 border-t border-[#e5e5e5]">
                          💬 {s.memo}
                        </p>
                      )}
                    </div>

                    {/* 멤버별 납부 상태 */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-[#999] uppercase tracking-wider">
                          납부 현황
                        </p>
                        <p className="text-[11px] text-[#999]">
                          {s.paidCount} / {s.members.length}
                        </p>
                      </div>
                      <div className="space-y-1">
                        {[...s.members]
                          .sort((a, b) => Number(a.paid) - Number(b.paid))
                          .map(m => (
                            <button
                              key={m.id}
                              onClick={() =>
                                isManager && handleTogglePaid(s.id, m.id, m.paid)
                              }
                              disabled={!isManager || isPending}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-colors ${
                                m.paid
                                  ? 'bg-emerald-50/40 border-emerald-200/60 hover:bg-emerald-50'
                                  : 'bg-white border-[#e5e5e5] hover:border-orange-200'
                              } ${!isManager ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              {m.paid ? (
                                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                              ) : (
                                <Circle size={14} className="text-[#ccc] shrink-0" />
                              )}
                              <span
                                className={`text-sm font-semibold flex-1 text-left ${
                                  m.paid ? 'text-[#111]' : 'text-[#555]'
                                }`}
                              >
                                {m.memberName}
                              </span>
                              <span className="text-[11px] font-bold text-[#111] tabular-nums">
                                {m.amount.toLocaleString()}원
                              </span>
                              {m.paid ? (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                                  완료
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">
                                  미납
                                </span>
                              )}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleCopyMessage(s)}
                        disabled={isPending}
                        className="flex-1 py-2.5 text-xs font-semibold border border-[#e5e5e5] text-[#555] rounded-xl hover:bg-[#f8f8f8] disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-1.5"
                      >
                        {expanded === `copied-${s.id}` ? (
                          <>
                            <Check size={12} className="text-emerald-600" />
                            <span className="text-emerald-700">복사됨!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            카톡 메시지 복사
                          </>
                        )}
                      </button>
                      {isManager && (
                        <button
                          onClick={() => setDeleteTarget(s.id)}
                          disabled={isPending}
                          className="px-3 py-2.5 text-xs font-semibold border border-[#e5e5e5] text-[#999] rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-500 disabled:opacity-50 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {deleteTarget && (
        <ConfirmDialog
          open
          title="정산 삭제"
          description="이 정산 기록을 삭제하시겠어요?&#10;&#10;납부 현황도 함께 사라지며, 이 작업은 되돌릴 수 없습니다."
          confirmText="삭제"
          variant="destructive"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

/* ── 상단 요약 카드 ── */
function SummaryCard({
  label,
  value,
  tone,
  compact,
}: {
  label: string
  value: string
  tone: 'default' | 'warn'
  compact?: boolean
}) {
  const valueColor = tone === 'warn' ? 'text-orange-600' : 'text-[#111]'
  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 text-center">
      <p
        className={`${compact ? 'text-base' : 'text-2xl'} font-extrabold tabular-nums truncate ${valueColor}`}
      >
        {value}
      </p>
      <p className="text-xs text-[#999] mt-1">{label}</p>
    </div>
  )
}
