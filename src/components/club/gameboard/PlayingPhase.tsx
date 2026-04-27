'use client'

import { useState, useMemo } from 'react'
import {
  AlertCircle, Flame, Trophy, Crown, Clock,
  PenLine, Sparkles,
} from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { GradeBadge } from '@/components/club/GradeBadge'
import type { CourtEntry, PlayerEntry, DialogState, GameMode, KingStreaks, AssignMode } from './types'
import { formatDuration, pickTeams } from './types'
import { CustomPickOverlay } from './playing/CustomPickOverlay'
import { QueueRow } from './playing/QueueRow'

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

/* CustomPickOverlay 는 ./playing/CustomPickOverlay.tsx 로 이동 */

/* CustomPickOverlay 는 ./playing/CustomPickOverlay.tsx 로 이동됨 */

/* ── 승자 판정 (21/25점 클럽 옵션) ──────────────────────────
 * 정식 대회는 21점 / 일반 클럽·동호회는 25점 듀스가 표준.
 * target 점수 선취 + 2점 차 이상. (target+9)점 강제 종료.
 *   21점제: 30점 캡 (9점 듀스 max)
 *   25점제: 34점 캡 (9점 듀스 max — 기존 30 캡에서 일관된 듀스 길이로)
 */
type WinState = 'A' | 'B' | 'deuce' | null

function getWinState(scoreA: number, scoreB: number, target: 21 | 25 = 25): WinState {
  const max = Math.max(scoreA, scoreB)
  if (max < target) return null
  const diff = scoreA - scoreB
  const cap = target + 9
  if (max >= cap) return diff > 0 ? 'A' : 'B'    // 강제 종료
  if (Math.abs(diff) >= 2) return diff > 0 ? 'A' : 'B'
  return 'deuce'
}

/* QueueRow 는 ./playing/QueueRow.tsx 로 이동됨 */

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
  /** 게임 종료 점수 (21 정식 / 25 일반) — 디폴트 25 */
  matchPointTarget?: 21 | 25
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
  matchPointTarget = 25,
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
  /** 첫 번째 빈 코트 인덱스 — 다음 매치 미리보기를 이 코트 카드에 임베드 */
  const firstEmptyCourtIdx = courts.findIndex((c) => c.teamA.length === 0)

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
            📱 모바일: 단순 세로 스택
            💻 큰 화면(xl+)에서는 코트들도 2열 그리드 — 우동배 운영 화면 패턴 */}
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-4 lg:items-start space-y-3 lg:space-y-0">
          {/* ── 왼쪽: 코트들 (xl+에서 2열) ── */}
          <div className="space-y-3 xl:space-y-0 xl:grid xl:grid-cols-2 xl:gap-3 min-w-0">
        {/* 코트 카드 */}
        {courts.map((court, idx) => {
          const isEmpty = court.teamA.length === 0
          const canAssign = isEmpty && waitingPlayers.length >= 4
          const courtElapsed = court.startedAt > 0 ? Date.now() - court.startedAt : 0
          const winState = isEmpty ? null : getWinState(court.scoreA, court.scoreB, matchPointTarget)
          const hasWinner = winState === 'A' || winState === 'B'
          /** 이 코트가 첫 번째 빈 코트이고 다음 매치 미리보기 있음 → 카드 내부에 임베드 */
          const showEmbeddedPreview = isEmpty && idx === firstEmptyCourtIdx && nextMatchPreview !== null

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
                showEmbeddedPreview && nextMatchPreview ? (
                  /* 다음 매치 미리보기 임베드 — 우동배 운영 화면 패턴 */
                  <div className="py-5 px-5 bg-emerald-50/60 border-t border-emerald-100">
                    <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider mb-2 inline-flex items-center gap-1">
                      <Sparkles size={11} strokeWidth={2.5} />
                      이 코트로 들어올 다음 매치
                    </p>
                    {/* 팀 A */}
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[10px] font-bold text-blue-600 w-8 shrink-0">팀 A</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 flex-1">
                        {nextMatchPreview[0].map((p) => {
                          const isMe = p.memberId === membershipId
                          const isTemp = p.memberId.startsWith('temp-')
                          return (
                            <span key={p.memberId} className="inline-flex items-center gap-1">
                              {isTemp ? (
                                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-gray-100 text-gray-400 text-[8px] font-extrabold">?</span>
                              ) : (
                                <GradeBadge score={p.skillScore} size="xs" />
                              )}
                              <span className={`text-xs font-semibold ${isMe ? 'text-[#111] font-extrabold' : 'text-[#222]'}`}>
                                {p.name}
                              </span>
                              {isMe && (
                                <span className="text-[9px] font-bold text-[#555] bg-[#beff00]/40 rounded px-1 py-0.5 leading-none">나</span>
                              )}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    {/* 네트 */}
                    <div className="flex items-center gap-2 my-1.5">
                      <div className="flex-1 border-t border-dashed border-emerald-300" />
                      <span className="text-[9px] font-extrabold text-emerald-500/70 tracking-widest">VS</span>
                      <div className="flex-1 border-t border-dashed border-emerald-300" />
                    </div>
                    {/* 팀 B */}
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-red-500 w-8 shrink-0">팀 B</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 flex-1">
                        {nextMatchPreview[1].map((p) => {
                          const isMe = p.memberId === membershipId
                          const isTemp = p.memberId.startsWith('temp-')
                          return (
                            <span key={p.memberId} className="inline-flex items-center gap-1">
                              {isTemp ? (
                                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-gray-100 text-gray-400 text-[8px] font-extrabold">?</span>
                              ) : (
                                <GradeBadge score={p.skillScore} size="xs" />
                              )}
                              <span className={`text-xs font-semibold ${isMe ? 'text-[#111] font-extrabold' : 'text-[#222]'}`}>
                                {p.name}
                              </span>
                              {isMe && (
                                <span className="text-[9px] font-bold text-[#555] bg-[#beff00]/40 rounded px-1 py-0.5 leading-none">나</span>
                              )}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 빈 슬롯 + 안내 */
                  <div className="py-10 px-5 bg-[linear-gradient(135deg,#fafafa_0%,#f3f3f3_100%)]">
                    <div className="flex items-center gap-2 opacity-60">
                      <p className="text-[10px] font-bold text-blue-400 w-8 shrink-0">팀 A</p>
                      <div className="flex-1 grid grid-cols-2 gap-1.5">
                        {[0, 1].map((i) => (
                          <div key={i} className="h-7 rounded-lg border border-dashed border-[#ccc] bg-white/40" />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 my-2.5 opacity-60">
                      <div className="flex-1 border-t border-dashed border-[#d5d5d5]" />
                      <span className="text-[9px] font-extrabold text-[#bbb] tracking-widest">VS</span>
                      <div className="flex-1 border-t border-dashed border-[#d5d5d5]" />
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                      <p className="text-[10px] font-bold text-red-400 w-8 shrink-0">팀 B</p>
                      <div className="flex-1 grid grid-cols-2 gap-1.5">
                        {[0, 1].map((i) => (
                          <div key={i} className="h-7 rounded-lg border border-dashed border-[#ccc] bg-white/40" />
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-1.5 text-[#bbb]">
                      <ShuttlecockIcon size={12} className="text-[#d5d5d5]" strokeWidth={1.8} />
                      <span className="text-[11px]">
                        {canAssign
                          ? '상단 "다음 경기 배정" 버튼으로 시작'
                          : `대기 ${waitingPlayers.length}명 (4명 이상 필요)`}
                      </span>
                    </div>
                  </div>
                )
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
