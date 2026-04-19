'use client'

import { AlertCircle } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { CourtEntry, PlayerEntry, DialogState, GameMode, KingStreaks } from './types'
import { formatDuration } from './types'

/* ── 21점제 승자 판정 ──────────────────────────────────────
 * 배드민턴 규칙: 21점 선취 + 2점 차 이상. 30-29 → 30점에서 강제 종료.
 */
type WinState = 'A' | 'B' | 'deuce' | null

function getWinState(scoreA: number, scoreB: number): WinState {
  const max = Math.max(scoreA, scoreB)
  if (max < 21) return null
  const diff = scoreA - scoreB
  if (max >= 30) return diff > 0 ? 'A' : 'B'   // 30점 강제 종료
  if (Math.abs(diff) >= 2) return diff > 0 ? 'A' : 'B'
  return 'deuce'  // 20-20 이상 1점 차 = 듀스 진행 중
}

interface Props {
  courts: CourtEntry[]
  playerMap: Map<string, PlayerEntry>
  elapsed: number
  isPending: boolean
  error: string | null
  dialog: DialogState | null
  gameMode: GameMode
  kingStreaks: KingStreaks
  onDialogCancel: () => void
  onEndGame: () => void
  onDeleteGame: () => void
  onAssignCourt: (courtIndex: number) => void
  onScoreChange: (courtIndex: number, team: 'A' | 'B', delta: number) => void
  onEndCourt: (courtIndex: number) => void
  onCancelCourt: (courtIndex: number) => void
}

export function PlayingPhase({
  courts,
  playerMap,
  elapsed,
  isPending,
  error,
  dialog,
  gameMode,
  kingStreaks,
  onDialogCancel,
  onEndGame,
  onDeleteGame,
  onAssignCourt,
  onScoreChange,
  onEndCourt,
  onCancelCourt,
}: Props) {
  const waitingPlayers = Array.from(playerMap.values())
    .filter((p) => p.status === 'waiting')
    .sort((a, b) => a.todayGames - b.todayGames || a.waitingSince - b.waitingSince)

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
      {/* 상단 고정 헤더 */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]">
        <div className="max-w-[1088px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#beff00]">🏸</span>
            <span className="text-white font-bold text-sm">게임 진행 중</span>
            <span className="text-white/40 text-xs font-mono tabular-nums">
              {formatDuration(elapsed)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDeleteGame}
              disabled={isPending}
              className="text-xs px-3 py-1.5 border border-white/20 text-white/50 rounded-xl hover:border-red-400/40 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              삭제
            </button>
            <button
              onClick={onEndGame}
              disabled={isPending}
              className="text-xs px-3 py-1.5 bg-[#beff00] text-[#111] font-semibold rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
            >
              게임 마감
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1088px] mx-auto px-4 py-4 space-y-3">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* 코트 카드 */}
        {courts.map((court) => {
          const isEmpty = court.teamA.length === 0
          const canAssign = isEmpty && waitingPlayers.length >= 4
          const courtElapsed = court.startedAt > 0 ? Date.now() - court.startedAt : 0
          const winState = isEmpty ? null : getWinState(court.scoreA, court.scoreB)
          const hasWinner = winState === 'A' || winState === 'B'

          return (
            <div
              key={court.courtIndex}
              className={`bg-white rounded-2xl border overflow-hidden transition-colors ${
                hasWinner ? 'border-[#beff00] shadow-[0_0_0_2px_#beff0040]' : 'border-[#e5e5e5]'
              }`}
            >
              {/* 코트 헤더 */}
              <div className={`flex items-center justify-between px-4 py-3 border-b transition-colors ${
                hasWinner ? 'bg-[#beff00]/10 border-[#beff00]/30' : 'bg-[#f8f8f8] border-[#e5e5e5]'
              }`}>
                <span className="text-sm font-bold text-[#111]">코트 {court.courtIndex + 1}</span>
                {isEmpty ? (
                  canAssign ? (
                    <button
                      onClick={() => onAssignCourt(court.courtIndex)}
                      disabled={isPending}
                      className="text-xs font-bold px-3 py-1.5 bg-[#beff00] text-[#111] rounded-xl hover:brightness-95 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      다음 경기 배정
                    </button>
                  ) : (
                    <span className="text-xs text-[#bbb]">
                      대기 {waitingPlayers.length}명{waitingPlayers.length < 4 ? ' (4명 필요)' : ''}
                    </span>
                  )
                ) : (
                  <span className="text-[11px] text-[#999] font-mono tabular-nums">
                    {formatDuration(courtElapsed)}
                  </span>
                )}
              </div>

              {/* 코트 내용 */}
              {isEmpty ? (
                <div className="py-8 text-center text-sm text-[#ccc]">비어있음</div>
              ) : (
                <div className="p-4">
                  {/* 팀 A */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-[10px] font-bold text-blue-500 mb-0.5">팀 A</p>
                      <p className="text-sm font-semibold text-[#111] flex flex-wrap items-center gap-x-1 gap-y-0.5">
                        {court.teamA.map((id, idx) => {
                          const name = playerMap.get(id)?.name ?? '?'
                          const isTemp = id.startsWith('temp-')
                          return (
                            <span key={id} className="inline-flex items-center gap-1">
                              {idx > 0 && <span className="text-[#ccc]">·</span>}
                              {name}
                              {isTemp && (
                                <span className="text-[9px] font-bold text-[#888] bg-[#f0f0f0] rounded px-1 py-0.5 leading-none">
                                  기록 안됨
                                </span>
                              )}
                            </span>
                          )
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onScoreChange(court.courtIndex, 'A', -1)}
                        className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#555] font-bold hover:bg-[#e5e5e5] active:scale-90 transition-all select-none"
                      >
                        −
                      </button>
                      <span className="text-2xl font-extrabold text-[#111] w-9 text-center tabular-nums">
                        {court.scoreA}
                      </span>
                      <button
                        onClick={() => onScoreChange(court.courtIndex, 'A', 1)}
                        className="w-8 h-8 rounded-full bg-[#beff00] flex items-center justify-center text-[#111] font-bold hover:brightness-95 active:scale-90 transition-all select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* VS 구분선 / 승자 배지 */}
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-[#f0f0f0]" />
                    {winState === 'deuce' ? (
                      <span className="text-[11px] font-extrabold text-orange-500 px-2 py-0.5 bg-orange-50 rounded-full whitespace-nowrap">
                        듀스 🔥
                      </span>
                    ) : winState === 'A' || winState === 'B' ? (
                      <span className="text-[11px] font-extrabold text-[#111] px-2.5 py-0.5 bg-[#beff00] rounded-full whitespace-nowrap">
                        🏆 {winState}팀 승리!
                      </span>
                    ) : (
                      <span className="text-[11px] font-extrabold text-[#ccc]">VS</span>
                    )}
                    <div className="flex-1 h-px bg-[#f0f0f0]" />
                  </div>

                  {/* 팀 B */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-[10px] font-bold text-red-400 mb-0.5">팀 B</p>
                      <p className="text-sm font-semibold text-[#111] flex flex-wrap items-center gap-x-1 gap-y-0.5">
                        {court.teamB.map((id, idx) => {
                          const name = playerMap.get(id)?.name ?? '?'
                          const isTemp = id.startsWith('temp-')
                          return (
                            <span key={id} className="inline-flex items-center gap-1">
                              {idx > 0 && <span className="text-[#ccc]">·</span>}
                              {name}
                              {isTemp && (
                                <span className="text-[9px] font-bold text-[#888] bg-[#f0f0f0] rounded px-1 py-0.5 leading-none">
                                  기록 안됨
                                </span>
                              )}
                            </span>
                          )
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onScoreChange(court.courtIndex, 'B', -1)}
                        className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#555] font-bold hover:bg-[#e5e5e5] active:scale-90 transition-all select-none"
                      >
                        −
                      </button>
                      <span className="text-2xl font-extrabold text-[#111] w-9 text-center tabular-nums">
                        {court.scoreB}
                      </span>
                      <button
                        onClick={() => onScoreChange(court.courtIndex, 'B', 1)}
                        className="w-8 h-8 rounded-full bg-[#beff00] flex items-center justify-center text-[#111] font-bold hover:brightness-95 active:scale-90 transition-all select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 경기 액션 버튼 */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => onCancelCourt(court.courtIndex)}
                      disabled={court.isSaving || isPending}
                      className="flex-1 py-2.5 text-sm font-semibold border border-[#e5e5e5] text-[#999] rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-400 active:scale-[0.99] disabled:opacity-50 transition-all"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => onEndCourt(court.courtIndex)}
                      disabled={court.isSaving || isPending}
                      className={`flex-[2] py-2.5 text-sm font-bold rounded-xl disabled:opacity-50 transition-all active:scale-[0.99] ${
                        hasWinner
                          ? 'bg-[#beff00] text-[#111] border border-[#beff00] hover:brightness-95 animate-pulse'
                          : 'border border-[#e5e5e5] text-[#555] hover:bg-[#f8f8f8] active:bg-[#f0f0f0]'
                      }`}
                    >
                      {court.isSaving
                        ? '저장 중...'
                        : hasWinner
                        ? `🏆 ${winState}팀 승리 저장`
                        : '완료 →'}
                    </button>
                  </div>

                  {/* 임시 참가자 포함 안내 */}
                  {[...court.teamA, ...court.teamB].some(id => id.startsWith('temp-')) && (
                    <p className="text-[10px] text-[#999] mt-2 text-center">
                      임시 참가자 포함 경기 — 랭킹에 반영되지 않아요
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* 대기열 */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-[#111]">
              {gameMode === 'king_of_court' ? '👑 도전자 대기' : '대기 중'}
            </span>
            <span className="text-[11px] font-bold text-white bg-[#0a0a0a] px-1.5 py-0.5 rounded-full leading-none">
              {waitingPlayers.length}
            </span>
          </div>

          {waitingPlayers.length === 0 ? (
            <p className="text-sm text-[#ccc] text-center py-3">모든 플레이어가 경기 중이에요</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {waitingPlayers.map((p) => {
                const streak = kingStreaks.get(p.memberId) ?? 0
                return (
                  <div
                    key={p.memberId}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border ${
                      streak >= 3
                        ? 'bg-[#fff8e1] border-[#ffe082]'
                        : 'bg-[#f8f8f8] border-[#e5e5e5]'
                    }`}
                  >
                    {streak >= 3 && <span className="text-[11px]">👑</span>}
                    <span className="text-xs font-semibold text-[#111]">{p.name}</span>
                    {gameMode === 'king_of_court' && streak > 0 ? (
                      <span className="text-[10px] font-bold text-[#b8860b] bg-[#fff8e1] border border-[#ffe082] rounded-full px-1.5 py-0.5">
                        {streak}연승
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#aaa] bg-white border border-[#e5e5e5] rounded-full px-1.5 py-0.5">
                        {p.todayGames}경기
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {dialog && (
        <ConfirmDialog
          open
          title={dialog.title}
          description={dialog.description}
          confirmText={dialog.confirmText}
          variant={dialog.variant}
          onConfirm={dialog.onConfirm}
          onCancel={onDialogCancel}
        />
      )}
    </div>
  )
}
