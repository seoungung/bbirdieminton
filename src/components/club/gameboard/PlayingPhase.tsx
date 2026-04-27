'use client'

import { useState, useMemo } from 'react'
import {
  AlertCircle, Flame, Trophy, Crown, Clock, Check, X,
  PenLine, Sparkles,
} from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { GradeBadge } from '@/components/club/GradeBadge'
import type { CourtEntry, PlayerEntry, DialogState, GameMode, KingStreaks, AssignMode } from './types'
import { formatDuration, pickTeams } from './types'

/* ── 배정 모드 라벨 (v2 단순화: 자동 / 직접) ── */
const ASSIGN_MODE_LABEL: Record<AssignMode, string> = {
  random: '자동 매칭',        // legacy 값 — 자동 매칭으로 통일
  skill_balance: '자동 매칭', // legacy 값 — 자동 매칭으로 통일
  freshness: '자동 매칭',
  custom: '직접 배정',
}

/* ── 다음 경기 프리뷰용 플레이어 칩 ── */
function PreviewPlayerChip({ player, membershipId }: { player: PlayerEntry; membershipId?: string }) {
  const isMe = player.memberId === membershipId
  const isTemp = player.memberId.startsWith('temp-')
  return (
    <span className="inline-flex items-center gap-1.5">
      {isTemp ? (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-gray-100 text-gray-400 text-[9px] font-extrabold shrink-0">
          ?
        </span>
      ) : (
        <GradeBadge score={player.skillScore} size="xs" />
      )}
      <span className={`text-xs font-semibold ${isMe ? 'text-[#111] font-extrabold' : 'text-[#111]'}`}>
        {player.name}
      </span>
      {!isTemp && player.rank && (
        <span className="text-[9px] font-bold text-[#aaa] tabular-nums">{player.rank}위</span>
      )}
      {isMe && (
        <span className="text-[9px] font-bold text-[#555] bg-[#beff00]/40 rounded px-1 py-0.5 leading-none">나</span>
      )}
    </span>
  )
}

/* ── 다음 경기 프리뷰 카드 (2v2) ── */
function NextMatchPreview({
  teamA,
  teamB,
  assignMode,
  membershipId,
}: {
  teamA: PlayerEntry[]
  teamB: PlayerEntry[]
  assignMode: AssignMode
  membershipId?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-[0_1px_3px_0_rgba(16,185,129,0.08)]">
      {/* 헤더 */}
      <div className="bg-emerald-50 px-3.5 py-2 flex items-center justify-between border-b border-emerald-100">
        <div className="flex items-center gap-1.5">
          <Sparkles size={11} className="text-emerald-600" strokeWidth={2.5} />
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
            다음 경기 미리보기
          </span>
        </div>
        <span className="text-[10px] font-semibold text-emerald-600/70">
          {ASSIGN_MODE_LABEL[assignMode]}
        </span>
      </div>

      {/* 팀 A */}
      <div className="px-4 py-3 flex items-center gap-3">
        <span className="text-[10px] font-extrabold text-blue-600 w-10 shrink-0">팀 A</span>
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {teamA.map(p => (
            <PreviewPlayerChip key={p.memberId} player={p} membershipId={membershipId} />
          ))}
        </div>
      </div>

      {/* 네트 라인 */}
      <div className="flex items-center gap-2 px-4">
        <div className="flex-1 border-t border-dashed border-emerald-300" />
        <span className="text-[9px] font-extrabold text-emerald-500/60 tracking-widest">VS</span>
        <div className="flex-1 border-t border-dashed border-emerald-300" />
      </div>

      {/* 팀 B */}
      <div className="px-4 py-3 flex items-center gap-3">
        <span className="text-[10px] font-extrabold text-red-500 w-10 shrink-0">팀 B</span>
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {teamB.map(p => (
            <PreviewPlayerChip key={p.memberId} player={p} membershipId={membershipId} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── 상단 참가자 플레이트 ── */
function ParticipantPlate({
  players,
  membershipId,
}: {
  players: PlayerEntry[]
  membershipId?: string
}) {
  const playing = players.filter(p => p.status === 'playing')
  const waiting = players.filter(p => p.status === 'waiting')

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-extrabold text-[#555] uppercase tracking-wider">
            참가자
          </span>
          <span className="text-xs font-bold text-[#111] tabular-nums">{players.length}명</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-bold">{playing.length}</span>
          </span>
          <span className="text-[#ccc]">·</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bbb]" />
            <span className="text-[#555] font-bold">{waiting.length}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {players.map(p => {
          const isMe = p.memberId === membershipId
          const isTemp = p.memberId.startsWith('temp-')
          const isPlaying = p.status === 'playing'
          return (
            <span
              key={p.memberId}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-semibold transition-colors ${
                isMe
                  ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                  : isPlaying
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-[#f8f8f8] border-[#e5e5e5] text-[#555]'
              }`}
            >
              {isTemp ? (
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-gray-200 text-gray-500 text-[8px] font-extrabold shrink-0">
                  ?
                </span>
              ) : (
                <GradeBadge score={p.skillScore} size="xs" />
              )}
              <span className="truncate max-w-[8rem]">{p.name}</span>
              {isMe && (
                <span className="text-[9px] font-bold text-[#beff00] bg-[#beff00]/15 rounded px-1 py-0.5 leading-none">나</span>
              )}
              <span
                className={`text-[9px] tabular-nums ${
                  isMe ? 'text-white/50' : isPlaying ? 'text-emerald-600/70' : 'text-[#aaa]'
                }`}
              >
                {p.todayGames}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

type IconComp = React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>

/* ── 모드 전환 바 (경기 중 기본 배정 방식 변경) — v2 단순화: 2개 ── */
function ModeSwitcher({
  assignMode,
  onChange,
}: {
  assignMode: AssignMode
  onChange: (v: AssignMode) => void
}) {
  const OPTS: { value: AssignMode; label: string; Icon: IconComp }[] = [
    { value: 'freshness', label: '자동 매칭', Icon: Sparkles },
    { value: 'custom',    label: '직접 배정', Icon: PenLine  },
  ]
  // legacy random/skill_balance 값이 들어오면 자동 매칭으로 표시
  const activeValue: AssignMode =
    assignMode === 'custom' ? 'custom' : 'freshness'

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-3">
      <p className="text-[10px] font-bold text-[#999] mb-2 uppercase tracking-wider">배정 방식</p>
      <div className="grid grid-cols-2 gap-1.5">
        {OPTS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-colors ${
              activeValue === opt.value
                ? 'bg-[#beff00] border-[#beff00] text-[#111]'
                : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#beff00]'
            }`}
          >
            <opt.Icon size={15} strokeWidth={2} />
            <span className="text-[10px] font-bold leading-none">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── 직접 배정 오버레이 ──────────────────────────────────────
 * 대기 중인 플레이어를 탭해 팀A/팀B에 배정합니다.
 * 탭 순환: 미선택 → 팀A → 팀B → 미선택
 */
function CustomPickOverlay({
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
      // A → B → 미선택 (cycle). B가 가득 차 있으면 한 번에 미선택으로
      setTeamA(prev => prev.filter(x => x !== id))
      if (teamB.length < 2) setTeamB(prev => [...prev, id])
      // B가 2명이면 미선택 상태로 떨어짐 (의도적, B에 끼울 자리 없음)
    } else if (teamB.includes(id)) {
      // B → 미선택
      setTeamB(prev => prev.filter(x => x !== id))
    } else {
      // 미선택 → A first, then B
      if (teamA.length < 2) {
        setTeamA(prev => [...prev, id])
      } else if (teamB.length < 2) {
        setTeamB(prev => [...prev, id])
      }
      // 둘 다 가득이면 그대로 (사용자 의도 보존)
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
            <p className="text-xs text-[#999] mt-0.5">코트 {courtIndex + 1} · 탭해서 팀 배정</p>
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
            <p className="text-[10px] font-bold text-blue-500 mb-1.5">팀 A</p>
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
            <p className="text-[10px] font-bold text-red-400 mb-1.5">팀 B</p>
            <div className="space-y-1">
              {[0, 1].map(i => (
                <div
                  key={i}
                  className={`h-8 rounded-lg flex items-center px-2.5 text-xs font-semibold transition-colors ${
                    teamB[i]
                      ? 'bg-red-50 border border-red-200 text-red-600'
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
                      ? 'bg-red-50 border-red-200'
                      : isFull
                      ? 'bg-[#f0f0f0] border-[#e5e5e5] opacity-40 cursor-not-allowed'
                      : 'bg-white border-[#e5e5e5] hover:border-[#beff00]'
                  }`}
                >
                  {/* 팀 배지 */}
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

                  {/* 급수 */}
                  {isTemp ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100 text-gray-400 text-[10px] font-extrabold shrink-0">
                      ?
                    </span>
                  ) : (
                    <GradeBadge score={p.skillScore} size="sm" />
                  )}

                  {/* 이름 + 순위 */}
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span className={`text-sm font-semibold truncate ${
                      inA ? 'text-blue-700' : inB ? 'text-red-600' : 'text-[#111]'
                    }`}>
                      {p.name}
                    </span>
                    {!isTemp && p.rank && (
                      <span className="text-[10px] font-bold text-[#aaa] tabular-nums shrink-0">
                        {p.rank}위
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[9px] font-bold text-[#555] bg-[#beff00]/40 rounded px-1 py-0.5 shrink-0">나</span>
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
            className="w-full py-3.5 bg-[#beff00] text-[#111] font-extrabold rounded-xl hover:brightness-95 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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

/* ── 대기열 단일 행 컴포넌트 ──────────────────────────────── */
function QueueRow({
  player,
  position,
  isNextUp,
  isMe,
  gameMode,
  kingStreak,
}: {
  player: PlayerEntry
  position: number
  isNextUp: boolean
  isMe: boolean
  gameMode: GameMode
  kingStreak: number
}) {
  const isTemp = player.memberId.startsWith('temp-')

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-2.5 py-2 border transition-colors ${
        isMe
          ? 'bg-[#0a0a0a] border-[#0a0a0a]'
          : isNextUp
          ? 'bg-[#f5ffe0] border-[#c8f000]/30'
          : 'bg-[#f8f8f8] border-[#e5e5e5]'
      }`}
    >
      {/* 순서 번호 */}
      <span
        className={`text-[10px] font-extrabold w-4 text-center tabular-nums shrink-0 ${
          isMe ? 'text-[#beff00]' : isNextUp ? 'text-[#7db800]' : 'text-[#ccc]'
        }`}
      >
        {position}
      </span>

      {/* 급수 배지 (임시 참가자는 '?') */}
      {isTemp ? (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100 text-gray-400 text-[10px] font-extrabold shrink-0">
          ?
        </span>
      ) : (
        <GradeBadge score={player.skillScore} size="sm" />
      )}

      {/* 이름 + 순위 */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
        <span
          className={`text-sm font-semibold truncate ${isMe ? 'text-white' : 'text-[#111]'}`}
        >
          {player.name}
        </span>
        {!isTemp && player.rank && (
          <span
            className={`text-[10px] font-bold tabular-nums ${
              isMe ? 'text-white/50' : 'text-[#aaa]'
            }`}
          >
            {player.rank}위
          </span>
        )}
        {isMe && (
          <span className="text-[9px] font-bold text-[#beff00] bg-[#beff00]/10 rounded px-1 py-0.5 leading-none">
            나
          </span>
        )}
      </div>

      {/* 오른쪽 배지 */}
      {gameMode === 'king_of_court' && kingStreak > 0 ? (
        <span
          className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 shrink-0 ${
            kingStreak >= 3
              ? 'text-amber-700 bg-amber-50 border border-amber-200'
              : 'text-[#999] bg-white border border-[#e5e5e5]'
          }`}
        >
          {kingStreak >= 3 && (
            <Crown
              size={8}
              className="inline mr-0.5 text-amber-500"
              strokeWidth={2.5}
            />
          )}
          {kingStreak}연승
        </span>
      ) : (
        <span
          className={`text-[10px] rounded-full px-1.5 py-0.5 shrink-0 ${
            isMe
              ? 'text-[#beff00]/70 bg-white/10 border border-white/10'
              : 'text-[#aaa] bg-white border border-[#e5e5e5]'
          }`}
        >
          {player.todayGames}경기
        </span>
      )}
    </div>
  )
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
  membershipId?: string
  /** 현재 기본 배정 방식 */
  assignMode: AssignMode
  /** 기본 배정 방식 변경 */
  onAssignModeChange: (v: AssignMode) => void
  /** 이번 한 경기만 직접 배정 (기본 모드와 상관없이) */
  onOpenCustomPick: (courtIndex: number) => void
  /** 직접 배정 모드일 때 열린 코트 인덱스 (null = 닫힘) */
  customPickCourt?: number | null
  onCustomAssign?: (teamA: string[], teamB: string[]) => void
  onCancelCustomPick?: () => void
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
  membershipId,
  assignMode,
  onAssignModeChange,
  onOpenCustomPick,
  customPickCourt,
  onCustomAssign,
  onCancelCustomPick,
  onDialogCancel,
  onEndGame,
  onDeleteGame,
  onAssignCourt,
  onScoreChange,
  onEndCourt,
  onCancelCourt,
}: Props) {
  const allPlayers = Array.from(playerMap.values())
  const waitingPlayers = allPlayers
    .filter((p) => p.status === 'waiting')
    .sort((a, b) => a.todayGames - b.todayGames || a.waitingSince - b.waitingSince)

  /* ── 대기열 구간 계산 ── */
  const emptyCourtsCount = courts.filter((c) => c.teamA.length === 0).length

  /* ── 다음 경기 프리뷰 (2v2 카드) ── */
  const nextMatchPreview = useMemo(() => {
    if (emptyCourtsCount === 0) return null
    if (assignMode === 'custom') return null
    if (waitingPlayers.length < 4) return null
    return pickTeams(waitingPlayers, assignMode, new Map())
  }, [emptyCourtsCount, waitingPlayers, assignMode])

  /* 프리뷰에 포함된 4명의 id set — 대기열 "이후 대기"에서 중복 제거 */
  const previewIds = useMemo(() => {
    if (!nextMatchPreview) return new Set<string>()
    return new Set([...nextMatchPreview[0], ...nextMatchPreview[1]].map((p) => p.memberId))
  }, [nextMatchPreview])

  const restPlayers = useMemo(
    () => waitingPlayers.filter((p) => !previewIds.has(p.memberId)),
    [waitingPlayers, previewIds]
  )

  /* ── 나의 순서 ── */
  const myQueueIdx = membershipId
    ? waitingPlayers.findIndex((p) => p.memberId === membershipId)
    : -1
  const myQueuePosition = myQueueIdx + 1  // 1-based, 0 = not in queue
  const myEntry = myQueueIdx >= 0 ? waitingPlayers[myQueueIdx] : null
  const amINextUp = myQueuePosition > 0 && nextMatchPreview !== null && previewIds.has(membershipId ?? '')

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
      {/* 상단 고정 헤더 */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]">
        <div className="max-w-[1088px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShuttlecockIcon size={16} className="text-[#beff00]" strokeWidth={2} aria-label="게임" />
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

      <div className="max-w-[1088px] lg:max-w-[1280px] mx-auto px-4 py-4 space-y-3">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── 상단 참가자 플레이트 (전체 한눈에) ── */}
        {allPlayers.length > 0 && (
          <ParticipantPlate players={allPlayers} membershipId={membershipId} />
        )}

        {/* ── 배정 방식 전환 바 ── */}
        <ModeSwitcher assignMode={assignMode} onChange={onAssignModeChange} />

        {/* ── 나의 대기 순서 카드 (대기 중일 때만 표시) ── */}
        {myEntry && myQueuePosition > 0 && (
          <div className="bg-[#0a0a0a] rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-[11px] mb-1">내 대기 순서</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-white tabular-nums leading-none">
                  {myQueuePosition}
                </span>
                <span className="text-white/50 text-sm">번째</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/30 text-xs">{myEntry.todayGames}경기 완료</p>
              {amINextUp && emptyCourtsCount > 0 ? (
                <p className="text-[#beff00] text-xs font-bold mt-1">다음 경기 예정</p>
              ) : (
                <div className="flex items-center justify-end gap-1 mt-1">
                  <Clock size={10} className="text-white/30" />
                  <p className="text-white/30 text-xs">대기 중</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🖥️ 데스크톱(lg+): 좌측 코트 / 우측 sticky 사이드바 (다음 경기 + 대기열)
            📱 모바일: 단순 세로 스택 */}
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-4 lg:items-start space-y-3 lg:space-y-0">
          {/* ── 왼쪽: 코트들 ── */}
          <div className="space-y-3 min-w-0">
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
              className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                hasWinner
                  ? 'border-[#beff00] shadow-[0_0_0_3px_#beff0030]'
                  : isEmpty
                  ? 'border-dashed border-[#ddd]'
                  : 'border-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]'
              }`}
            >
              {/* 코트 헤더 */}
              <div className={`flex items-center justify-between px-4 py-3 border-b transition-colors ${
                hasWinner
                  ? 'bg-[#beff00]/10 border-[#beff00]/30'
                  : isEmpty
                  ? 'bg-[#f8f8f8] border-dashed border-[#e5e5e5]'
                  : 'bg-emerald-50 border-emerald-100'
              }`}>
                <span className={`text-sm font-bold inline-flex items-center gap-1.5 ${
                  isEmpty ? 'text-[#999]' : 'text-[#111]'
                }`}>
                  {!isEmpty && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  코트 {court.courtIndex + 1}
                </span>
                {isEmpty ? (
                  canAssign ? (
                    <div className="flex items-center gap-1.5">
                      {/* 기본 모드가 custom 이 아닐 때만 오버라이드 버튼 표시 */}
                      {assignMode !== 'custom' && (
                        <button
                          onClick={() => onOpenCustomPick(court.courtIndex)}
                          disabled={isPending}
                          title="이번만 직접 배정"
                          className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#e5e5e5] text-[#555] hover:border-[#0a0a0a] hover:text-[#111] active:scale-95 disabled:opacity-50 transition-all"
                        >
                          <PenLine size={13} strokeWidth={2} />
                        </button>
                      )}
                      <button
                        onClick={() => onAssignCourt(court.courtIndex)}
                        disabled={isPending}
                        className="text-xs font-bold px-3 py-1.5 bg-[#beff00] text-[#111] rounded-xl hover:brightness-95 active:scale-95 disabled:opacity-50 transition-all"
                      >
                        다음 경기 배정
                      </button>
                    </div>
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
                <div className="py-10 text-center text-sm text-[#ccc] flex flex-col items-center gap-2 bg-[linear-gradient(135deg,#fafafa_0%,#f3f3f3_100%)]">
                  <ShuttlecockIcon size={22} className="text-[#d5d5d5]" strokeWidth={1.5} />
                  <span className="text-[11px] text-[#bbb]">비어있음</span>
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-b from-emerald-50/60 via-white to-emerald-50/40">
                  {/* 팀 A */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-[10px] font-bold text-blue-500 mb-0.5">팀 A</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {court.teamA.map((id) => {
                          const player = playerMap.get(id)
                          const name = player?.name ?? '?'
                          const isTemp = id.startsWith('temp-')
                          const isMe = id === membershipId
                          return (
                            <span key={id} className="inline-flex items-center gap-1">
                              {isTemp ? (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-gray-100 text-gray-400 text-[9px] font-extrabold shrink-0">
                                  ?
                                </span>
                              ) : (
                                <GradeBadge score={player?.skillScore ?? 0} size="xs" />
                              )}
                              <span className={`text-sm font-semibold ${isMe ? 'text-[#111] font-extrabold' : 'text-[#111]'}`}>
                                {name}
                              </span>
                              {isMe && (
                                <span className="text-[9px] font-bold text-[#555] bg-[#beff00]/40 rounded px-1 py-0.5 leading-none">
                                  나
                                </span>
                              )}
                              {isTemp && (
                                <span className="text-[9px] font-bold text-[#888] bg-[#f0f0f0] rounded px-1 py-0.5 leading-none">
                                  기록 안됨
                                </span>
                              )}
                            </span>
                          )
                        })}
                      </div>
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

                  {/* VS 구분선 / 네트 라인 + 승자 배지 */}
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 border-t-2 border-dashed border-emerald-300/70" />
                    {winState === 'deuce' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-orange-500 px-2 py-0.5 bg-orange-50 border border-orange-200 rounded-full whitespace-nowrap">
                        <Flame size={11} strokeWidth={2.2} />
                        듀스
                      </span>
                    ) : winState === 'A' || winState === 'B' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#111] px-2.5 py-0.5 bg-[#beff00] rounded-full whitespace-nowrap">
                        <Trophy size={11} strokeWidth={2.2} />
                        {winState}팀 승리!
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-emerald-600/70 tracking-widest">NET</span>
                    )}
                    <div className="flex-1 border-t-2 border-dashed border-emerald-300/70" />
                  </div>

                  {/* 팀 B */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-[10px] font-bold text-red-400 mb-0.5">팀 B</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {court.teamB.map((id) => {
                          const player = playerMap.get(id)
                          const name = player?.name ?? '?'
                          const isTemp = id.startsWith('temp-')
                          const isMe = id === membershipId
                          return (
                            <span key={id} className="inline-flex items-center gap-1">
                              {isTemp ? (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-gray-100 text-gray-400 text-[9px] font-extrabold shrink-0">
                                  ?
                                </span>
                              ) : (
                                <GradeBadge score={player?.skillScore ?? 0} size="xs" />
                              )}
                              <span className={`text-sm font-semibold ${isMe ? 'text-[#111] font-extrabold' : 'text-[#111]'}`}>
                                {name}
                              </span>
                              {isMe && (
                                <span className="text-[9px] font-bold text-[#555] bg-[#beff00]/40 rounded px-1 py-0.5 leading-none">
                                  나
                                </span>
                              )}
                              {isTemp && (
                                <span className="text-[9px] font-bold text-[#888] bg-[#f0f0f0] rounded px-1 py-0.5 leading-none">
                                  기록 안됨
                                </span>
                              )}
                            </span>
                          )
                        })}
                      </div>
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
                      {court.isSaving ? (
                        '저장 중...'
                      ) : hasWinner ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Trophy size={14} strokeWidth={2.2} />
                          {winState}팀 승리 저장
                        </span>
                      ) : (
                        '완료 →'
                      )}
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
          </div>
          {/* ── 왼쪽 컬럼 끝 ── */}

          {/* ── 오른쪽 사이드바: 데스크톱에서 sticky ── */}
          <div className="space-y-3 lg:sticky lg:top-[72px] lg:self-start">
        {/* ── 다음 경기 미리보기 (2v2 카드) ── */}
        {nextMatchPreview && (
          <NextMatchPreview
            teamA={nextMatchPreview[0]}
            teamB={nextMatchPreview[1]}
            assignMode={assignMode}
            membershipId={membershipId}
          />
        )}

        {/* ── 대기열 (이후 대기) ── */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
          {/* 헤더 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-[#111] inline-flex items-center gap-1.5">
              {gameMode === 'king_of_court' && <Crown size={14} strokeWidth={2.2} />}
              {gameMode === 'king_of_court'
                ? '도전자 대기'
                : nextMatchPreview
                ? '이후 대기'
                : '대기 중'}
            </span>
            <span className="text-[11px] font-bold text-white bg-[#0a0a0a] px-1.5 py-0.5 rounded-full leading-none">
              {nextMatchPreview ? restPlayers.length : waitingPlayers.length}
            </span>
          </div>

          {waitingPlayers.length === 0 ? (
            <p className="text-sm text-[#ccc] text-center py-3">모든 플레이어가 경기 중이에요</p>
          ) : restPlayers.length === 0 ? (
            <p className="text-[11px] text-[#ccc] text-center py-2">
              다음 경기가 배정되면 이 자리에 대기 선수가 나타나요
            </p>
          ) : (
            <div className="space-y-1.5">
              {restPlayers.map((p, idx) => {
                /* position 계산: preview 4명이 #1~#4 차지하므로 restPlayers는 #5부터 */
                const offset = nextMatchPreview ? 4 : 0
                return (
                  <QueueRow
                    key={p.memberId}
                    player={p}
                    position={offset + idx + 1}
                    isNextUp={false}
                    isMe={p.memberId === membershipId}
                    gameMode={gameMode}
                    kingStreak={kingStreaks.get(p.memberId) ?? 0}
                  />
                )
              })}
            </div>
          )}
        </div>
          </div>
          {/* ── 오른쪽 사이드바 끝 ── */}
        </div>
        {/* ── 2단 그리드 끝 ── */}
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

      {/* 직접 배정 오버레이 */}
      {customPickCourt != null && onCustomAssign && onCancelCustomPick && (
        <CustomPickOverlay
          courtIndex={customPickCourt}
          waitingPlayers={waitingPlayers}
          membershipId={membershipId}
          onConfirm={onCustomAssign}
          onCancel={onCancelCustomPick}
        />
      )}
    </div>
  )
}
