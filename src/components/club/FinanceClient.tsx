'use client'

import { useState, useTransition } from 'react'
import { toggleDuePaidAction, setMonthlyAmountAction } from '@/app/club/[clubId]/finance/actions'
import type { ClubMemberWithUser } from '@/types/club'

interface Due {
  id: string
  member_id: string
  amount: number
  paid: boolean
  paid_at: string | null
}

interface Props {
  clubId: string
  members: ClubMemberWithUser[]
  duesData: Due[]
  isManager: boolean
  year: number
  month: number
}

export function FinanceClient({ clubId, members, duesData, isManager, year, month }: Props) {
  const [isPending, startTransition] = useTransition()
  const [amountInput, setAmountInput] = useState('')
  const [showAmountEdit, setShowAmountEdit] = useState(false)
  const [localDues, setLocalDues] = useState<Due[]>(duesData)

  const duesMap = Object.fromEntries(localDues.map(d => [d.member_id, d]))

  const paidCount = members.filter(m => duesMap[m.id]?.paid).length
  const totalAmount = members.reduce((sum, m) => sum + (duesMap[m.id]?.amount ?? 0), 0)
  const paidAmount = members.filter(m => duesMap[m.id]?.paid).reduce((sum, m) => sum + (duesMap[m.id]?.amount ?? 0), 0)
  const defaultAmount = localDues[0]?.amount ?? 0

  function handleToggle(member: ClubMemberWithUser) {
    if (!isManager) return
    const due = duesMap[member.id]
    const currentPaid = due?.paid ?? false
    const amount = due?.amount ?? defaultAmount

    // 낙관적 업데이트
    setLocalDues(prev => {
      const existing = prev.find(d => d.member_id === member.id)
      if (existing) {
        return prev.map(d => d.member_id === member.id ? { ...d, paid: !currentPaid, paid_at: !currentPaid ? new Date().toISOString() : null } : d)
      }
      return [...prev, { id: '', member_id: member.id, amount, paid: true, paid_at: new Date().toISOString() }]
    })

    startTransition(async () => {
      await toggleDuePaidAction(clubId, member.id, year, month, amount, currentPaid)
    })
  }

  function handleSetAmount() {
    const amount = parseInt(amountInput.replace(/,/g, ''))
    if (isNaN(amount) || amount < 0) return
    startTransition(async () => {
      await setMonthlyAmountAction(clubId, amount, year, month)
      setShowAmountEdit(false)
      setAmountInput('')
    })
  }

  return (
    <div className="space-y-4">
      {/* 월간 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 text-center">
          <p className="text-2xl font-extrabold text-[#111]">{paidCount}<span className="text-base font-normal text-[#999]">/{members.length}</span></p>
          <p className="text-sm text-[#999] mt-1">납부 완료</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 text-center">
          <p className="text-2xl font-extrabold text-[#beff00] text-shadow">{members.length - paidCount}</p>
          <p className="text-sm text-[#999] mt-1">미납</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 text-center">
          <p className="text-base font-extrabold text-[#111] tabular-nums truncate">{paidAmount.toLocaleString()}<span className="text-xs font-normal text-[#999]">원</span></p>
          <p className="text-sm text-[#999] mt-1">수납 완료</p>
        </div>
      </div>

      {/* 월 회비 금액 설정 */}
      {isManager && (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-[#111]">이달 회비</p>
              <p className="text-lg font-extrabold text-[#111] mt-0.5">{defaultAmount.toLocaleString()}원</p>
            </div>
            {showAmountEdit ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  placeholder="금액 입력"
                  className="w-28 border border-[#e5e5e5] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#111]"
                  autoFocus
                />
                <button onClick={handleSetAmount} disabled={isPending}
                  className="text-sm px-3 py-1.5 bg-[#beff00] text-[#111] rounded-lg font-bold disabled:opacity-50">설정</button>
                <button onClick={() => setShowAmountEdit(false)}
                  className="text-sm px-3 py-1.5 bg-[#f0f0f0] text-[#555] rounded-lg">취소</button>
              </div>
            ) : (
              <button onClick={() => setShowAmountEdit(true)}
                className="text-sm px-3 py-2 border border-[#e5e5e5] rounded-lg text-[#555] hover:border-[#111] transition-colors">
                금액 변경
              </button>
            )}
          </div>
        </div>
      )}

      {/* 납부 진행바 */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
        <div className="flex justify-between text-sm text-[#999] mb-2">
          <span>납부율</span>
          <span>{members.length > 0 ? Math.round((paidCount / members.length) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-[#f0f0f0] rounded-full h-2">
          <div
            className="bg-[#beff00] h-2 rounded-full transition-all"
            style={{ width: `${members.length > 0 ? (paidCount / members.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 회원별 납부 현황 */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-[#999] uppercase tracking-wider px-1">납부 현황</p>
        {/* 미납 먼저 */}
        {[...members].sort((a, b) => {
          const aPaid = duesMap[a.id]?.paid ?? false
          const bPaid = duesMap[b.id]?.paid ?? false
          return Number(aPaid) - Number(bPaid)
        }).map(member => {
          const due = duesMap[member.id]
          const paid = due?.paid ?? false
          const amount = due?.amount ?? defaultAmount

          return (
            <div key={member.id} className={`bg-white rounded-2xl border p-4 flex items-center gap-3 transition-all ${paid ? 'border-[#e5e5e5]' : 'border-orange-200'}`}>
              <div className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-bold text-[#555] shrink-0">
                {member.user?.name?.[0] ?? '?'}
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-[#111]">{member.user?.name ?? '이름없음'}</p>
                <p className="text-sm text-[#999] mt-0.5">
                  {paid ? `${amount.toLocaleString()}원 납부완료` : `${amount.toLocaleString()}원 미납`}
                </p>
              </div>
              {paid ? (
                <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">✓ 완료</span>
              ) : (
                <span className="text-sm font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full">미납</span>
              )}
              {isManager && (
                <button
                  onClick={() => handleToggle(member)}
                  disabled={isPending}
                  className={`text-sm px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                    paid
                      ? 'bg-[#f0f0f0] text-[#555] hover:bg-[#e0e0e0]'
                      : 'bg-[#beff00] text-[#111] hover:brightness-95'
                  }`}
                >
                  {paid ? '취소' : '납부확인'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
