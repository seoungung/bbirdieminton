'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { GradeBadge } from '@/components/club/GradeBadge'
import type { PlayerEntry } from '../types'

/**
 * 직접 배정 오버레이
 *
 * 대기 중인 플레이어를 탭해 팀 A/팀 B에 배정합니다.
 * 탭 순환 규칙:
 *   미선택 → 팀A → 팀B → 미선택
 *   B가 가득 찬 상태에서 A에 있는 사람을 탭하면: B에 자리 없으니 미선택으로 떨어짐 (의도)
 */
export function CustomPickOverlay({
  courtIndex,
  waitingPlayers,
  membershipId,
  onConfirm,
  onCancel,
}: {
  courtIndex: number
  waitingPlayers: PlayerEntry[]
  membershipId?: string
  onConfirm: (teamA: string[], teamB: string[]) => void
  onCancel: () => void
}) {
  const [teamA, setTeamA] = useState<string[]>([])
  const [teamB, setTeamB] = useState<string[]>([])

  function cyclePlayer(id: string) {
    if (teamA.includes(id)) {
      setTeamA(prev => prev.filter(x => x !== id))
      if (teamB.length < 2) setTeamB(prev => [...prev, id])
    } else if (teamB.includes(id)) {
      setTeamB(prev => prev.filter(x => x !== id))
    } else {
      if (teamA.length < 2) {
        setTeamA(prev => [...prev, id])
      } else if (teamB.length < 2) {
        setTeamB(prev => [...prev, id])
      }
    }
  }

  const canConfirm = teamA.length === 2 && teamB.length === 2

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm">
      <div className="mt-auto bg-white rounded-t-3xl max-h-[85vh] flex flex-col">
        {/* 헤더 */}
        <div className="px-5 pt-5 pb-4 border-b border-[#f0f0f0] flex items-center justify-between shrink-0">
          <div>
            <p className="text-base font-bold text-[#111]">직접 배정</p>
            <p className="text-xs text-[#999] mt-0.5">
              코트 {courtIndex + 1} · 한 번 탭 → 팀 A · 두 번 탭 → 팀 B · 세 번 탭 → 취소
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#555] hover:bg-[#e5e5e5] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* 팀 슬롯 미리보기 */}
        <div className="px-5 py-3 grid grid-cols-2 gap-3 shrink-0 bg-[#f8f8f8]">
          <div>
            <p className="text-[10px] font-bold text-blue-500 mb-1.5">팀 A · {teamA.length}/2</p>
            <div className="space-y-1">
              {[0, 1].map(i => (
                <div
                  key={i}
                  className={`h-8 rounded-lg flex items-center px-2.5 text-xs font-semibold transition-colors ${
                    teamA[i]
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'bg-white border border-dashed border-[#ccc] text-[#ccc]'
                  }`}
                >
                  {teamA[i]
                    ? waitingPlayers.find(p => p.memberId === teamA[i])?.name ?? '?'
                    : `${i + 1}번 선수`}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--color-brand-streak)] mb-1.5">팀 B · {teamB.length}/2</p>
            <div className="space-y-1">
              {[0, 1].map(i => (
                <div
                  key={i}
                  className={`h-8 rounded-lg flex items-center px-2.5 text-xs font-semibold transition-colors ${
                    teamB[i]
                      ? 'bg-[var(--color-brand-streak-bg)] border border-[var(--color-brand-streak-soft)] text-[var(--color-brand-streak)]'
                      : 'bg-white border border-dashed border-[#ccc] text-[#ccc]'
                  }`}
                >
                  {teamB[i]
                    ? waitingPlayers.find(p => p.memberId === teamB[i])?.name ?? '?'
                    : `${i + 1}번 선수`}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 대기 선수 목록 */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5 min-h-0">
          {waitingPlayers.length === 0 ? (
            <p className="text-sm text-[#ccc] text-center py-6">대기 중인 선수가 없어요</p>
          ) : (
            waitingPlayers.map(p => {
              const inA = teamA.includes(p.memberId)
              const inB = teamB.includes(p.memberId)
              const isMe = p.memberId === membershipId
              const isFull = !inA && !inB && teamA.length === 2 && teamB.length === 2
              const isTemp = p.memberId.startsWith('temp-')
              return (
                <button
                  key={p.memberId}
                  onClick={() => !isFull && cyclePlayer(p.memberId)}
                  disabled={isFull}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-[0.99] ${
                    inA
                      ? 'bg-blue-50 border-blue-200'
                      : inB
                      ? 'bg-[var(--color-brand-streak-bg)] border-[var(--color-brand-streak-soft)]'
                      : isFull
                      ? 'bg-[#f0f0f0] border-[#e5e5e5] opacity-40 cursor-not-allowed'
                      : 'bg-white border-[#e5e5e5] hover:border-[var(--color-brand-lime)]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                      inA
                        ? 'bg-blue-500 text-white'
                        : inB
                        ? 'bg-red-400 text-white'
                        : 'bg-[#f0f0f0] text-[#bbb]'
                    }`}
                  >
                    {inA ? 'A' : inB ? 'B' : '?'}
                  </div>

                  {isTemp ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100 text-gray-400 text-[10px] font-extrabold shrink-0">
                      ?
                    </span>
                  ) : (
                    <GradeBadge score={p.skillScore} size="sm" />
                  )}

                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span
                      className={`text-sm font-semibold truncate ${
                        inA ? 'text-blue-700' : inB ? 'text-[var(--color-brand-streak)]' : 'text-[#111]'
                      }`}
                    >
                      {p.name}
                    </span>
                    {!isTemp && p.rank && (
                      <span className="text-[10px] font-bold text-[#aaa] tabular-nums shrink-0">
                        {p.rank}위
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[9px] font-bold text-[#555] bg-[var(--color-brand-lime)]/40 rounded px-1 py-0.5 shrink-0">
                        나
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-[#aaa] shrink-0">{p.todayGames}경기</span>
                </button>
              )
            })
          )}
        </div>

        {/* 확인 버튼 */}
        <div className="px-5 py-4 border-t border-[#f0f0f0] shrink-0">
          {!canConfirm && (
            <p className="text-xs text-[#aaa] text-center mb-2">
              팀A 2명, 팀B 2명을 선택해주세요 ({teamA.length + teamB.length}/4)
            </p>
          )}
          <button
            onClick={() => canConfirm && onConfirm(teamA, teamB)}
            disabled={!canConfirm}
            className="w-full py-3.5 bg-[var(--color-brand-lime)] text-[#111] font-extrabold rounded-xl hover:brightness-95 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="inline-flex items-center gap-1.5">
              <Check size={16} strokeWidth={2.5} />
              배정 확정
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
