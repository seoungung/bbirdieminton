'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  AlertCircle, Printer, Plus, Minus, Flame, Trophy,
  RefreshCw, Check, Coffee, Play, Sparkles, Scale, HeartHandshake,
  Undo2, ArrowUp, ArrowDown, Trash2, UserPlus, UserPlus2,
} from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { scoreToGrade, type Grade } from '@/lib/club/grade'
import { cn } from '@/lib/utils'
import { useLongPress } from '@/hooks/useLongPress'
import type { ClubMemberWithUser } from '@/types/club'
import type {
  CourtEntry, PlayerEntry, DialogState, GameMode, KingStreaks, AssignMode,
} from './types'
import { formatDuration, pickTeams } from './types'
import { CustomPickOverlay } from './playing/CustomPickOverlay'
import { MemberPickerModal } from './setup/MemberPickerModal'
import { GuestAddModal } from './setup/GuestAddModal'

/* ── 배정 모드 (Phase 4) — 자동 랜덤 / 실력 균등 / 신입 친화 3개만 노출 ──
 *   freshness ↔ 자동 랜덤 (파트너 중복 최소화 — 일반 사용자엔 "랜덤"으로 보임)
 *   skill_balance ↔ 실력 균등
 *   newcomer_friendly ↔ 신입 친화
 *   'random' / 'custom' 은 UI 노출 안함. (호환을 위해 타입은 보존) */
const ASSIGN_MODE_OPTS: { value: AssignMode; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { value: 'freshness',         label: '자동 랜덤', Icon: Sparkles       },
  { value: 'skill_balance',     label: '실력 균등', Icon: Scale          },
  { value: 'newcomer_friendly', label: '신입 친화', Icon: HeartHandshake },
]

/* ── 승자 판정 (21/25점 클럽 옵션) ── */
type WinState = 'A' | 'B' | 'deuce' | null

function getWinState(scoreA: number, scoreB: number, target: 21 | 25 = 25): WinState {
  const max = Math.max(scoreA, scoreB)
  if (max < target) return null
  const diff = scoreA - scoreB
  const cap = target + 9
  if (max >= cap) return diff > 0 ? 'A' : 'B'
  if (Math.abs(diff) >= 2) return diff > 0 ? 'A' : 'B'
  return 'deuce'
}

/* ── 풀 필터 칩 (4종 독립 필터) ── */
type GenderFilter = 'all' | 'male' | 'female' | 'guest'
type StatusFilter = 'all' | 'waiting' | 'playing' | 'resting' | 'departed'
type GradeChip = 'all' | 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

const GENDER_FILTER_OPTS: { value: GenderFilter; label: string }[] = [
  { value: 'all',    label: '전체' },
  { value: 'male',   label: '남자' },
  { value: 'female', label: '여자' },
  { value: 'guest',  label: '게스트' },
]

const STATUS_FILTER_OPTS: { value: StatusFilter; label: string }[] = [
  { value: 'all',      label: '전체' },
  { value: 'waiting',  label: '대기' },
  { value: 'playing',  label: '게임' },
  { value: 'resting',  label: '휴식' },
  { value: 'departed', label: '퇴장' },
]

const GRADE_LABEL_MAP: Record<GradeChip, string> = {
  all: '전체',
  S: 'S',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
}

const GRADE_CHIPS: GradeChip[] = ['all', 'S', 'A', 'B', 'C', 'D', 'E', 'F']

/* ── 플레이어 카드 ────────────────────────────────────────────────
 * 색상 룰 (Phase 4):
 *  · gender === 'F' → 빨강 (var(--color-brand-team-b))
 *  · gender === 'M' || null/undefined → 파랑 (var(--color-brand-team-a))
 *  · resting → opacity-50 grayscale
 *  · departed → opacity-30 grayscale (더 강한 회색)
 *
 * 1단: 3-flex (좌 회원·게스트 배지 / 중 NG / 우 N분·상태)
 * 2단: 등급 + 이름 중앙 정렬
 */
function PlayerCard({
  player,
  now,
  isInMatchingBoard,
  onClick,
  onLongPress,
}: {
  player: PlayerEntry
  now: number
  isInMatchingBoard?: boolean
  onClick?: () => void
  /** long-press / 우클릭 시 — 메뉴 띄울 좌표 전달. 미지정 시 long-press 비활성. */
  onLongPress?: (x: number, y: number) => void
}) {
  const isTemp = player.memberId.startsWith('temp-') || player.memberId.startsWith('guest-')
  const isPlaying = player.status === 'playing'
  const isResting = player.status === 'resting'
  const isDeparted = player.status === 'departed'
  const isFemale = player.gender === 'F'
  const grade = scoreToGrade(player.skillScore)
  const waitMin = isPlaying
    ? 0
    : Math.max(0, Math.floor((now - player.waitingSince) / 60000))

  const rightLabel = isResting
    ? '휴식'
    : isPlaying
    ? '경기중'
    : isDeparted
    ? '퇴장'
    : `${waitMin}분`

  const statusLabel = isDeparted ? '퇴장' : isResting ? '휴식 중' : isPlaying ? '경기 중' : '대기 중'

  const { handlers: lpHandlers, wasLongPressRef } = useLongPress({
    onLongPress: (x, y) => onLongPress?.(x, y),
  })

  const handleClick = () => {
    // long-press 가 직전에 트리거됐으면 일반 클릭 무시
    if (wasLongPressRef.current) {
      wasLongPressRef.current = false
      return
    }
    onClick?.()
  }

  /* 상태별 카드 룩:
   *  · 정상: 파스텔 bg (성별) + 다크 텍스트, 회원·등급 배지는 ink black 채움
   *  · 게임중: 정상 카드 그대로 + 위에 흰 50% 오버레이 + 검정 이름 (중앙)
   *  · 휴식중: 정상 카드 그대로 + 위에 검정 50% 오버레이 + 흰 이름 (중앙)
   *  · 퇴장: 카드 자체를 그레이로 교체 + 2단에 큰 "퇴장" 텍스트 */
  return (
    <button
      type="button"
      onClick={handleClick}
      onTouchStart={onLongPress ? lpHandlers.onTouchStart : undefined}
      onTouchEnd={onLongPress ? lpHandlers.onTouchEnd : undefined}
      onTouchCancel={onLongPress ? lpHandlers.onTouchCancel : undefined}
      onTouchMove={onLongPress ? lpHandlers.onTouchMove : undefined}
      onContextMenu={onLongPress ? lpHandlers.onContextMenu : undefined}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl p-2.5 text-left transition-all min-h-[80px]',
        'flex flex-col gap-1',
        'ring-0 hover:ring-2 hover:ring-offset-1 hover:ring-offset-white',
        // 퇴장 — 카드 자체 교체 (그레이)
        isDeparted
          ? 'bg-[var(--color-brand-bg-muted)] text-[var(--color-brand-text-sub)] hover:ring-[var(--color-brand-border)]'
          : // 정상 / 게임중 / 휴식중 — 동일 파스텔 카드 (오버레이로 차이)
            isFemale
            ? 'bg-[var(--color-brand-team-b)] text-[var(--color-text-strong)] hover:ring-[var(--color-brand-team-b)]/60'
            : 'bg-[var(--color-brand-team-a)] text-[var(--color-text-strong)] hover:ring-[var(--color-brand-team-a)]/60',
        isInMatchingBoard && 'outline outline-2 outline-offset-2 outline-[var(--color-brand-lime)]',
      )}
      aria-label={`${player.name} ${statusLabel}`}
    >
      {/* 1단: 3-flex 메타 (회원/게스트 | NG | 분/상태) */}
      <div className="flex items-center justify-between text-[12px] font-semibold leading-none">
        <span
          className={cn(
            'rounded px-1.5 py-0.5 uppercase tracking-wide text-white',
            isDeparted ? 'bg-[var(--color-brand-text-sub)]' : 'bg-[var(--color-brand-ink)]',
          )}
        >
          {isTemp ? '게스트' : '회원'}
        </span>
        <span className={cn('tabular-nums', isDeparted ? 'text-[var(--color-brand-text-sub)]' : 'text-[var(--color-text-body)]')}>
          {player.todayGames}G
        </span>
        <span className={cn('tabular-nums', isDeparted ? 'text-[var(--color-brand-text-sub)]' : 'text-[var(--color-text-body)]')}>
          {rightLabel}
        </span>
      </div>

      {/* 2단: 퇴장이면 큰 "퇴장" 텍스트 / 그 외는 등급+이름 */}
      {isDeparted ? (
        <div className="flex items-center justify-center">
          <span className="text-2xl font-extrabold tracking-wide text-[var(--color-brand-text-sub)]">
            퇴장
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-1.5">
          <span className="rounded bg-[var(--color-brand-ink)] px-1.5 py-0.5 font-mono text-sm font-bold leading-none text-white md:text-[15px]">
            {grade}
          </span>
          <span className="truncate text-lg font-bold leading-tight md:text-xl">
            {player.name}
          </span>
        </div>
      )}

      {/* 게임중 오버레이 — 흰 65% bg + "게임중" (검정, 우측 상단, 14px) */}
      {isPlaying && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl bg-white/65"
          aria-hidden
        >
          <span className="absolute right-2.5 top-2.5 text-[14px] font-extrabold tracking-wide text-black">
            게임중
          </span>
        </div>
      )}

      {/* 휴식중 오버레이 — 검정 65% bg + "휴식중" (흰, 우측 상단, 14px) */}
      {isResting && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl bg-black/65"
          aria-hidden
        >
          <span className="absolute right-2.5 top-2.5 text-[14px] font-extrabold tracking-wide text-white">
            휴식중
          </span>
        </div>
      )}
    </button>
  )
}

/* ── 매칭보드 / 대기순서 미니 카드 (2v2 미리보기) — 중앙 정렬 + 폰트 +2px ──
 * 색상 룰: PlayerCard 와 동일하게 gender 기반.
 *  · gender === 'F' → 빨강 (var(--color-brand-team-b))
 *  · gender === 'M' || null/undefined → 파랑 (var(--color-brand-team-a))
 */
function MiniSlotCard({
  player,
}: {
  player: PlayerEntry | null | undefined
}) {
  if (!player) {
    return (
      <div className="flex h-10 items-center justify-center rounded-md border border-dashed border-[var(--color-brand-border)] bg-[var(--color-surface-sub)] text-xs font-medium text-[var(--color-brand-text-muted)]">
        대기
      </div>
    )
  }
  const grade = scoreToGrade(player.skillScore)
  const isFemale = player.gender === 'F'
  const bg = isFemale
    ? 'bg-[var(--color-brand-team-b)]'
    : 'bg-[var(--color-brand-team-a)]'
  return (
    <div
      className={cn(
        'flex h-10 items-center justify-center gap-1.5 rounded-md px-2 text-white',
        bg,
      )}
    >
      <span className="rounded bg-white/20 px-1 font-mono text-[11px] font-bold leading-none">
        {grade}
      </span>
      <span className="truncate text-sm font-bold">{player.name}</span>
    </div>
  )
}

/* ── 컨텍스트 메뉴 ── */
function PlayerContextMenu({
  x,
  y,
  player,
  onTogglePlayerStatus,
  onClose,
}: {
  x: number
  y: number
  player: PlayerEntry
  onTogglePlayerStatus: (memberId: string, target: 'waiting' | 'resting' | 'departed') => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', esc)
    }
  }, [onClose])

  const isPlaying = player.status === 'playing'

  /* status별 메뉴 옵션 */
  type MenuOption = { target: 'waiting' | 'resting' | 'departed'; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }
  const menuOptions: MenuOption[] = (() => {
    if (isPlaying) return []
    if (player.status === 'waiting') return [
      { target: 'resting',  label: '휴식중으로',   Icon: Coffee },
      { target: 'departed', label: '퇴장',          Icon: Minus  },
    ]
    if (player.status === 'resting') return [
      { target: 'waiting',  label: '대기중 복귀',   Icon: Play  },
      { target: 'departed', label: '퇴장',          Icon: Minus },
    ]
    if (player.status === 'departed') return [
      { target: 'waiting',  label: '대기중 복귀',   Icon: Play   },
      { target: 'resting',  label: '휴식중으로',    Icon: Coffee },
    ]
    return []
  })()

  return (
    <div
      ref={ref}
      style={{ left: x, top: y }}
      className="fixed z-50 min-w-[160px] rounded-lg border border-[var(--color-brand-border)] bg-white py-1 shadow-lg"
      role="menu"
    >
      <div className="border-b border-[var(--color-brand-border-sub)] px-3 py-1.5 text-[11px] font-bold text-[var(--color-brand-text-sub)]">
        {player.name}
      </div>
      {isPlaying ? (
        <p className="px-3 py-2 text-[10px] text-[var(--color-brand-text-muted)]">
          코트에서 빠진 후 변경 가능해요
        </p>
      ) : (
        menuOptions.map((opt) => (
          <button
            key={opt.target}
            type="button"
            onClick={() => {
              onTogglePlayerStatus(player.memberId, opt.target)
              onClose()
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-body)] transition-colors hover:bg-[var(--color-surface-sub)]"
          >
            <opt.Icon size={13} strokeWidth={2.4} />
            {opt.label}
          </button>
        ))
      )}
    </div>
  )
}

/* ── 점수 입력 모달 (D안: 키패드 방식) ────────────────────────
 * 좌·우팀 점수 동시 표시 + 활성 팀 키패드 입력 + 듀스/승자 자동 감지.
 * 키보드 단축키: 0~9 입력 / Backspace 백스페이스 / Tab 활성팀 전환 /
 *                Enter 저장 / ESC 취소. */
function ScoreInputModal({
  open,
  initialScoreA,
  initialScoreB,
  matchPointTarget,
  onClose,
  onSave,
}: {
  open: boolean
  initialScoreA: number
  initialScoreB: number
  matchPointTarget: 21 | 25
  onClose: () => void
  onSave: (scoreA: number, scoreB: number) => void
}) {
  const [scoreA, setScoreA] = useState(initialScoreA)
  const [scoreB, setScoreB] = useState(initialScoreB)
  const [activeTeam, setActiveTeam] = useState<'A' | 'B'>('A')
  const [pendingInput, setPendingInput] = useState('')

  /* open 될 때마다 props 로 초기화 */
  useEffect(() => {
    if (open) {
      setScoreA(initialScoreA)
      setScoreB(initialScoreB)
      setActiveTeam('A')
      setPendingInput('')
    }
  }, [open, initialScoreA, initialScoreB])

  /* body 스크롤 잠금 */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  const setActiveScore = (val: number) => {
    const clamped = Math.max(0, Math.min(30, val))
    if (activeTeam === 'A') setScoreA(clamped)
    else setScoreB(clamped)
  }

  const handleDigit = (d: string) => {
    const newInput = pendingInput + d
    const parsed = parseInt(newInput, 10)
    if (isNaN(parsed) || parsed > 30) return
    setPendingInput(newInput)
    setActiveScore(parsed)
  }

  const handleBackspace = () => {
    const newInput = pendingInput.slice(0, -1)
    setPendingInput(newInput)
    const parsed = newInput === '' ? 0 : parseInt(newInput, 10) || 0
    setActiveScore(parsed)
  }

  const handleClear = () => {
    setPendingInput('')
    setActiveScore(0)
  }

  const handleTeamSwitch = (team: 'A' | 'B') => {
    setActiveTeam(team)
    setPendingInput('')
  }

  const handleSave = useCallbackSafe(() => {
    onSave(scoreA, scoreB)
  }, [scoreA, scoreB, onSave])

  /* 키보드 단축키 */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      else if (e.key === 'Enter') { e.preventDefault(); handleSave() }
      else if (e.key === 'Tab') {
        e.preventDefault()
        handleTeamSwitch(activeTeam === 'A' ? 'B' : 'A')
      } else if (/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        handleDigit(e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, activeTeam, pendingInput, scoreA, scoreB, handleSave])

  if (!open) return null

  const winState = getWinState(scoreA, scoreB, matchPointTarget)
  const hasWinner = winState === 'A' || winState === 'B'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div
        className="relative z-10 w-full max-w-[420px] rounded-2xl bg-white p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-modal-title"
      >
        <h2 id="score-modal-title" className="mb-4 text-lg font-bold text-[var(--color-text-strong)]">
          점수 입력
        </h2>

        {/* 양 팀 점수 표시 — 코트 팀 색상 (좌=그린 / 우=라임) */}
        <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <button
            type="button"
            onClick={() => handleTeamSwitch('A')}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl py-3 transition-all',
              activeTeam === 'A'
                ? 'bg-[var(--color-brand-court-team-a)]/10 ring-2 ring-[var(--color-brand-court-team-a)]'
                : 'border border-[var(--color-brand-border)] hover:bg-[var(--color-surface-sub)]',
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-text-sub)]">
              좌팀
            </span>
            <span className="text-5xl font-extrabold leading-none tabular-nums text-[var(--color-brand-court-team-a)]">
              {scoreA}
            </span>
          </button>

          <div className="flex items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-text-muted)]">vs</span>
          </div>

          <button
            type="button"
            onClick={() => handleTeamSwitch('B')}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl py-3 transition-all',
              activeTeam === 'B'
                ? 'bg-[var(--color-brand-court-team-b)]/20 ring-2 ring-[var(--color-brand-court-team-b)]'
                : 'border border-[var(--color-brand-border)] hover:bg-[var(--color-surface-sub)]',
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-text-sub)]">
              우팀
            </span>
            <span className="text-5xl font-extrabold leading-none tabular-nums text-[#7C7C00]">
              {scoreB}
            </span>
          </button>
        </div>

        {/* 듀스 / 승자 자동 감지 — 가운데 정렬, 크게 */}
        {winState === 'deuce' && (
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-4 py-1.5 text-base font-extrabold text-orange-600">
              <Flame size={16} strokeWidth={2.6} /> 듀스
            </span>
          </div>
        )}
        {hasWinner && (
          <div className="mb-4 flex justify-center">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-base font-extrabold',
                winState === 'A'
                  ? 'bg-[var(--color-brand-court-team-a)] text-white'
                  : 'bg-[var(--color-brand-court-team-b)] text-[#0a0a0a]',
              )}
            >
              <Trophy size={16} strokeWidth={2.6} /> {winState === 'A' ? '좌팀' : '우팀'} 승
            </span>
          </div>
        )}

        {/* 키패드 */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          {(['1','2','3','4','5','6','7','8','9'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              className="h-12 rounded-lg bg-[var(--color-surface-muted)] text-base font-bold text-[var(--color-text-body)] transition-all hover:bg-[var(--color-brand-bg-muted)] active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-lg bg-[var(--color-surface-muted)] text-sm font-bold text-[var(--color-brand-text-sub)] transition-all hover:bg-[var(--color-brand-bg-muted)] active:scale-95"
            aria-label="0으로 초기화"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-lg bg-[var(--color-surface-muted)] text-base font-bold text-[var(--color-text-body)] transition-all hover:bg-[var(--color-brand-bg-muted)] active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-lg bg-[var(--color-surface-muted)] text-base font-bold text-[var(--color-brand-text-sub)] transition-all hover:bg-[var(--color-brand-bg-muted)] active:scale-95"
            aria-label="백스페이스"
          >
            ⌫
          </button>
        </div>

        {/* 푸터: 취소 / 저장 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--color-brand-border)] bg-white py-3 text-sm font-bold text-[var(--color-text-body)] transition-colors hover:bg-[var(--color-surface-sub)]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-[2] rounded-lg bg-[var(--color-brand-ink)] py-3 text-sm font-extrabold text-[var(--color-brand-lime)] transition-all hover:brightness-110 active:scale-[0.99]"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

/* useEffect 내부 stale closure 방지용 — useCallback 대신 ref 패턴 */
function useCallbackSafe<T extends (...args: never[]) => unknown>(fn: T, deps: React.DependencyList): T {
  const ref = useRef(fn)
  useEffect(() => { ref.current = fn }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  return useRef(((...args: never[]) => ref.current(...args)) as T).current
}

/* ── 대기순서 항목 컨텍스트 메뉴 ── */
function QueueItemContextMenu({
  x,
  y,
  qIdx,
  total,
  canStart,
  canRevert,
  onStart,
  onRevert,
  onMoveTop,
  onMoveBottom,
  onDelete,
  onClose,
}: {
  x: number
  y: number
  qIdx: number
  total: number
  /** 빈 코트가 있을 때만 true — 시작하기 활성 조건 */
  canStart: boolean
  /** 매칭보드가 비어있을 때만 true — 되돌리기 활성 조건 */
  canRevert: boolean
  onStart: () => void
  onRevert: () => void
  onMoveTop: () => void
  onMoveBottom: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', esc)
    }
  }, [onClose])

  const isFirst = qIdx === 0
  const isLast = qIdx === total - 1

  return (
    <div
      ref={ref}
      style={{ left: x, top: y }}
      className="fixed z-50 min-w-[160px] rounded-lg border border-[var(--color-brand-border)] bg-white py-1 shadow-lg"
      role="menu"
    >
      <div className="border-b border-[var(--color-brand-border-sub)] px-3 py-1.5 text-[11px] font-bold text-[var(--color-brand-text-sub)]">
        대기 {qIdx + 1}번
      </div>
      <button
        type="button"
        disabled={!canStart}
        onClick={() => { onStart(); onClose() }}
        className="mx-1 my-1 flex items-center justify-center gap-1.5 rounded-md bg-[var(--color-brand-ink)] px-3 py-2 text-sm font-bold text-[var(--color-brand-lime)] transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:hover:brightness-100 disabled:cursor-not-allowed"
        title={canStart ? undefined : '빈 코트가 없습니다'}
        style={{ width: 'calc(100% - 0.5rem)' }}
      >
        <Play size={14} strokeWidth={2.6} />
        시작하기
      </button>
      <button
        type="button"
        disabled={!canRevert}
        onClick={() => { onRevert(); onClose() }}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-body)] transition-colors hover:bg-[var(--color-surface-sub)] disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      >
        <Undo2 size={13} strokeWidth={2.4} />
        되돌리기
      </button>
      <button
        type="button"
        disabled={isFirst}
        onClick={() => { onMoveTop(); onClose() }}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-body)] transition-colors hover:bg-[var(--color-surface-sub)] disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      >
        <ArrowUp size={13} strokeWidth={2.4} />
        맨 위로
      </button>
      <button
        type="button"
        disabled={isLast}
        onClick={() => { onMoveBottom(); onClose() }}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-body)] transition-colors hover:bg-[var(--color-surface-sub)] disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      >
        <ArrowDown size={13} strokeWidth={2.4} />
        맨 아래로
      </button>
      <button
        type="button"
        onClick={() => { onDelete(); onClose() }}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-brand-streak)] transition-colors hover:bg-[var(--color-brand-streak-bg)]"
      >
        <Trash2 size={13} strokeWidth={2.4} />
        삭제하기
      </button>
    </div>
  )
}

/* ── 대기순서 항목 — long-press / 우클릭으로 메뉴 ── */
function QueueListItem({
  qIdx,
  match,
  onOpenMenu,
}: {
  qIdx: number
  match: { teamA: PlayerEntry[]; teamB: PlayerEntry[] }
  onOpenMenu: (x: number, y: number, qIdx: number) => void
}) {
  const { handlers } = useLongPress({
    onLongPress: (x, y) => onOpenMenu(x, y, qIdx),
  })

  return (
    <li
      className="rounded-lg border border-[var(--color-brand-border-sub)] bg-[var(--color-surface-sub)]/50 p-2 select-none"
      onTouchStart={handlers.onTouchStart}
      onTouchEnd={handlers.onTouchEnd}
      onTouchCancel={handlers.onTouchCancel}
      onTouchMove={handlers.onTouchMove}
      onContextMenu={handlers.onContextMenu}
    >
      <div className="mb-1.5 text-base font-bold text-[var(--color-text-body)]">
        {qIdx + 1}번
      </div>
      {/* 매칭보드와 동일 레이아웃 — 좌=Team A 묶음, 우=Team B 묶음, vs 세로 divider */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-1.5">
        <div className="grid grid-rows-2 gap-1">
          <MiniSlotCard player={match.teamA[0]} />
          <MiniSlotCard player={match.teamA[1]} />
        </div>
        <div className="flex flex-col items-center justify-center gap-0.5 px-0.5">
          <div className="w-px flex-1 bg-[#d4d4d4]" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-brand-text-muted)]">vs</span>
          <div className="w-px flex-1 bg-[#d4d4d4]" />
        </div>
        <div className="grid grid-rows-2 gap-1">
          <MiniSlotCard player={match.teamB[0]} />
          <MiniSlotCard player={match.teamB[1]} />
        </div>
      </div>
    </li>
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
  /** king-streak 데이터 — 표시 폐기됐지만 데이터는 보존됨 (다음 phase 활용) */
  kingStreaks: KingStreaks
  membershipId?: string
  /** 클럽명 / 세션 정보 (헤더 표시) */
  clubName?: string
  sessionDate?: string
  /** 현재 기본 배정 방식 */
  assignMode: AssignMode
  /** 기본 배정 방식 변경 */
  onAssignModeChange: (v: AssignMode) => void
  /** 게임 종료 점수 (21 정식 / 25 일반) — 디폴트 25 */
  matchPointTarget?: 21 | 25
  /** 이번 한 경기만 직접 배정 — 호환 보존 (UI 진입점 폐기). custom 모드는 GameBoardClient 가 호출 시에만 활성. */
  onOpenCustomPick: (courtIndex: number) => void
  /** 직접 배정 모드일 때 열린 코트 인덱스 (null = 닫힘) */
  customPickCourt?: number | null
  onCustomAssign?: (teamA: string[], teamB: string[]) => void
  onCancelCustomPick?: () => void
  onDialogCancel: () => void
  onEndGame: () => void
  onDeleteGame: () => void
  onAssignCourt: (courtIndex: number, teamAIds?: string[], teamBIds?: string[]) => void
  onScoreChange: (courtIndex: number, team: 'A' | 'B', delta: number) => void
  onEndCourt: (courtIndex: number) => void
  onCancelCourt: (courtIndex: number) => void
  /** 코트 1개 추가 — 항상 가능 */
  onAddCourt?: () => void
  /** 코트 1개 제거 — 마지막 코트가 비어있고 코트 ≥ 2 일 때만 가능 */
  onRemoveCourt?: () => void
  /** 상태 전환: waiting / resting / departed (playing 상태는 무시) */
  onTogglePlayerStatus?: (memberId: string, target: 'waiting' | 'resting' | 'departed') => void
  /** 회원/게스트 추가 — 진행 중 세션에 출석/게스트 인입.
   *  members 와 onAddPlayers 둘 다 있으면 헤더에 "+회원/+게스트" 버튼 노출. */
  members?: ClubMemberWithUser[]
  onAddPlayers?: (data: {
    memberIds?: string[]
    guests?: Array<{ name: string; gender: 'M' | 'F' | null; grade: Grade | null }>
  }) => void | Promise<void>
}

export function PlayingPhase({
  courts,
  playerMap,
  elapsed,
  isPending,
  error,
  dialog,
  membershipId,
  clubName,
  sessionDate,
  onAssignModeChange,
  matchPointTarget = 25,
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
  onAddCourt,
  onRemoveCourt,
  onTogglePlayerStatus,
  members,
  onAddPlayers,
}: Props) {
  const allPlayers = useMemo(() => Array.from(playerMap.values()), [playerMap])

  /* 회원/게스트 추가 모달 상태 — 운영진이 진행 중 세션에 인원 인입 */
  const [memberPickerOpen, setMemberPickerOpen] = useState(false)
  const [guestAddOpen, setGuestAddOpen] = useState(false)
  const canAddPlayers = !!members && !!onAddPlayers
  /* 이미 playerMap 에 있는 회원 — 멤버 피커에서 비활성 처리 */
  const memberIdsAlreadyIn = useMemo(() => {
    const set = new Set<string>()
    for (const p of playerMap.values()) {
      if (!p.memberId.startsWith('guest-') && !p.memberId.startsWith('temp-')) {
        set.add(p.memberId)
      }
    }
    return set
  }, [playerMap])

  /** 부모 elapsed 가 1초마다 갱신되므로 그 시점의 "지금"을 동일 시각으로 한 번만 계산. */
  const now = Date.now()

  /* 매칭보드/대기순서에 쓰는 "정상 대기" 풀 (휴식·경기중 제외) */
  const waitingPlayers = useMemo(
    () =>
      allPlayers
        .filter((p) => p.status === 'waiting')
        .sort((a, b) => a.todayGames - b.todayGames || a.waitingSince - b.waitingSince),
    [allPlayers],
  )

  /* ── 매칭보드: 명시적 상태 (빈 상태로 시작) ── */
  type MatchingBoard = { teamA: string[]; teamB: string[] }
  const [matchingBoard, setMatchingBoard] = useState<MatchingBoard | null>(null)

  /* ── 배정방식 토글: null = 수동 모드 (기본).
   *   값이 있으면 그 모드의 자동 추첨이 활성. 같은 모드 재클릭 시 null 로 복귀.
   *   풀 카드 클릭 시에도 자동으로 null 해제 (수동 모드로 전환).
   */
  const [autoMode, setAutoMode] = useState<AssignMode | null>(null)

  /* 매칭보드에서 PlayerEntry 조회 */
  const matchingBoardEntries = useMemo<[PlayerEntry[], PlayerEntry[]] | null>(() => {
    if (!matchingBoard) return null
    const toEntries = (ids: string[]) =>
      ids.map((id) => playerMap.get(id)).filter((p): p is PlayerEntry => p !== undefined)
    return [toEntries(matchingBoard.teamA), toEntries(matchingBoard.teamB)]
  }, [matchingBoard, playerMap])

  /* 매칭보드에 들어간 4명 ID 집합 */
  const matchingBoardIds = useMemo(
    () => new Set([...(matchingBoard?.teamA ?? []), ...(matchingBoard?.teamB ?? [])]),
    [matchingBoard],
  )

  /* ── 풀 카드 클릭: 매칭보드 슬롯 토글 (alternating: A→B→A→B) ──
   *   휴식·경기중·퇴장 카드는 무반응.
   *   자동 모드 활성 중 클릭 시 자동 모드 해제 (수동 모드로 복귀).
   *   클릭 순서: 1번째→A1, 2번째→B1, 3번째→A2, 4번째→B2.
   *   이미 있는 카드 클릭 시 제거 (토글).
   */
  const handlePoolPlayerClick = (memberId: string) => {
    const player = playerMap.get(memberId)
    if (!player) return
    if (player.status === 'resting' || player.status === 'playing' || player.status === 'departed') return

    // 자동 모드 활성 중이면 해제 — 풀 카드 클릭은 수동 모드 신호
    if (autoMode !== null) setAutoMode(null)

    setMatchingBoard((prev) => {
      const board: MatchingBoard = prev ?? { teamA: [], teamB: [] }
      const inA = board.teamA.includes(memberId)
      const inB = board.teamB.includes(memberId)

      // 이미 있으면 제거 (토글)
      if (inA || inB) {
        const next: MatchingBoard = {
          teamA: board.teamA.filter((id) => id !== memberId),
          teamB: board.teamB.filter((id) => id !== memberId),
        }
        return next.teamA.length === 0 && next.teamB.length === 0 ? null : next
      }

      // capacity 체크
      const aFull = board.teamA.length >= 2
      const bFull = board.teamB.length >= 2
      if (aFull && bFull) return prev
      if (aFull) return { ...board, teamB: [...board.teamB, memberId] }
      if (bFull) return { ...board, teamA: [...board.teamA, memberId] }

      // alternating: A 가 같거나 적으면 A 에, 더 많으면 B 에
      if (board.teamA.length <= board.teamB.length) {
        return { ...board, teamA: [...board.teamA, memberId] }
      }
      return { ...board, teamB: [...board.teamB, memberId] }
    })
  }

  /* ── 배정 방식 버튼 클릭: 토글 (ON/OFF) ──
   *   같은 모드 재클릭 → 끄기 (autoMode = null + 매칭보드 비움 = 수동 모드 복귀).
   *   다른 모드 클릭 → 갈아끼우기 (autoMode 변경 + 매칭보드 새로 추첨).
   *   GameBoardClient 의 assignMode 도 함께 업데이트해 다음 라운드 fallback 일관성 유지.
   */
  const handleAssignModeToggle = (mode: AssignMode) => {
    if (autoMode === mode) {
      // 같은 모드 다시 → 끄기
      setAutoMode(null)
      setMatchingBoard(null)
      return
    }
    setAutoMode(mode)
    onAssignModeChange(mode)
    if (waitingPlayers.length < 4) {
      setMatchingBoard(null)
      return
    }
    const result = pickTeams(waitingPlayers, mode, new Map())
    if (!result) {
      setMatchingBoard(null)
      return
    }
    setMatchingBoard({
      teamA: result[0].map((p) => p.memberId),
      teamB: result[1].map((p) => p.memberId),
    })
  }

  /* ── 초기화: 매칭보드 비우기 + 자동 모드 해제 (수동 모드 복귀) ── */
  const handleClearMatchingBoard = () => {
    setMatchingBoard(null)
    setAutoMode(null)
  }

  /* ── 대기순서 큐: 수동 push 전용 ──
   *   자동 채움 로직 모두 제거됨. queueMatches 변경 경로:
   *    1) handleRegisterMatch — 빈 코트 없을 때 push
   *    2) 컨텍스트 메뉴 액션 (되돌리기 / 맨위 / 맨아래 / 삭제)
   *   페이지 진입 시: 빈 상태.
   */
  type QueueItem = { id: string; teamA: PlayerEntry[]; teamB: PlayerEntry[]; isManual: boolean }
  const [queueMatches, setQueueMatches] = useState<QueueItem[]>([])

  /* 큐에 들어간 항목 중 더 이상 대기 상태가 아닌 멤버가 있으면 자동 정리.
   * (예: 큐 항목의 4명이 코트로 등록되거나 휴식/퇴장 처리된 경우)
   * — 자동 채움이 아니라 stale 항목 제거 only. */
  useEffect(() => {
    setQueueMatches((prev) => {
      if (prev.length === 0) return prev
      const waitingIds = new Set(waitingPlayers.map((p) => p.memberId))
      const filtered = prev.filter((q) => {
        const ids = [...q.teamA.map((p) => p.memberId), ...q.teamB.map((p) => p.memberId)]
        return ids.every((id) => waitingIds.has(id))
      })
      return filtered.length === prev.length ? prev : filtered
    })
  }, [waitingPlayers])

  /* 첫 번째 빈 코트 — 등록 버튼 활성 조건 */
  const firstEmptyCourtIdx = courts.findIndex((c) => c.teamA.length === 0)

  /* ── 등록: 매칭보드 4명 → 빈 코트 1순위 / 빈 코트 없으면 대기순서 큐 맨뒤로 ── */
  const handleRegisterMatch = () => {
    if (!matchingBoard) return
    if (matchingBoard.teamA.length < 2 || matchingBoard.teamB.length < 2) return

    if (firstEmptyCourtIdx >= 0) {
      // 1순위: 빈 코트로 보냄
      onAssignCourt(firstEmptyCourtIdx, matchingBoard.teamA, matchingBoard.teamB)
    } else {
      // 2순위: 대기순서 큐 맨뒤로 push (수동 항목)
      const teamAEntries = matchingBoard.teamA
        .map((id) => playerMap.get(id))
        .filter((p): p is PlayerEntry => !!p)
      const teamBEntries = matchingBoard.teamB
        .map((id) => playerMap.get(id))
        .filter((p): p is PlayerEntry => !!p)
      if (teamAEntries.length === 2 && teamBEntries.length === 2) {
        setQueueMatches((prev) => [
          ...prev,
          {
            id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            teamA: teamAEntries,
            teamB: teamBEntries,
            isManual: true,
          },
        ])
      }
    }
    setMatchingBoard(null)
    // 등록 후 자동 모드 reset — 다음 라운드는 수동부터 시작
    setAutoMode(null)
  }

  /* 풀 필터 상태 (4종 독립) */
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [gradeFilter, setGradeFilter] = useState<GradeChip>('all')
  const [sortBy, setSortBy] = useState<'name' | 'wait' | 'games'>('wait')

  /* 풀 필터링 + 정렬 (4종 필터 동시 적용) */
  const visiblePlayers = useMemo(() => {
    let pool = allPlayers

    // 성별
    if (genderFilter === 'male') pool = pool.filter((p) => p.gender === 'M')
    else if (genderFilter === 'female') pool = pool.filter((p) => p.gender === 'F')
    else if (genderFilter === 'guest') {
      pool = pool.filter(
        (p) => p.memberId.startsWith('temp-') || p.memberId.startsWith('guest-'),
      )
    }

    // 상태
    if (statusFilter !== 'all') pool = pool.filter((p) => p.status === statusFilter)

    // 급수
    if (gradeFilter !== 'all')
      pool = pool.filter((p) => scoreToGrade(p.skillScore) === gradeFilter)

    // 정렬
    const sorted = [...pool]
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    else if (sortBy === 'wait')
      sorted.sort(
        (a, b) =>
          Number(b.status === 'waiting') - Number(a.status === 'waiting') ||
          a.waitingSince - b.waitingSince,
      )
    else sorted.sort((a, b) => a.todayGames - b.todayGames)
    return sorted
  }, [allPlayers, genderFilter, statusFilter, gradeFilter, sortBy])

  /* 헤더 세션 라벨: "[클럽명] YYYY-MM-DD(저녁)" */
  const headerLabel = useMemo(() => {
    const club = clubName ?? '클럽'
    const datePart = sessionDate ?? ''
    const period = (() => {
      const h = new Date().getHours()
      if (h < 12) return '오전'
      if (h < 17) return '오후'
      return '저녁'
    })()
    return `[${club}] ${datePart}(${period})`
  }, [clubName, sessionDate])

  /* 컨텍스트 메뉴 상태 (휴식/복귀 토글) */
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; player: PlayerEntry } | null>(null)
  const handleOpenPlayerMenu = (x: number, y: number, player: PlayerEntry) => {
    if (!onTogglePlayerStatus) return
    setCtxMenu({ x, y, player })
  }

  /* 대기순서 컨텍스트 메뉴 상태 */
  const [queueCtxMenu, setQueueCtxMenu] = useState<{ x: number; y: number; qIdx: number } | null>(null)
  const handleOpenQueueMenu = (x: number, y: number, qIdx: number) => {
    setQueueCtxMenu({ x, y, qIdx })
  }

  /* ── 대기순서 메뉴 액션들 ── */
  /** 시작하기 — 빈 코트가 있을 때만. 큐 항목 4명을 첫 빈 코트에 배치하고 큐에서 제거. */
  const handleQueueStart = (qIdx: number) => {
    if (firstEmptyCourtIdx < 0) return
    const item = queueMatches[qIdx]
    if (!item) return
    onAssignCourt(
      firstEmptyCourtIdx,
      item.teamA.map((p) => p.memberId),
      item.teamB.map((p) => p.memberId),
    )
    setQueueMatches((prev) => prev.filter((_, i) => i !== qIdx))
  }

  const handleQueueRevert = (qIdx: number) => {
    // 매칭보드가 비어있을 때만 — 큐 항목 4명을 매칭보드로 복귀
    if (matchingBoard) return
    const item = queueMatches[qIdx]
    if (!item) return
    setMatchingBoard({
      teamA: item.teamA.map((p) => p.memberId),
      teamB: item.teamB.map((p) => p.memberId),
    })
    setQueueMatches((prev) => prev.filter((_, i) => i !== qIdx))
  }

  const handleQueueMoveTop = (qIdx: number) => {
    setQueueMatches((prev) => {
      if (qIdx <= 0 || qIdx >= prev.length) return prev
      const next = [...prev]
      const [item] = next.splice(qIdx, 1)
      // 이동 시 항목을 수동으로 마킹 (자동 큐는 useEffect 가 재배치하므로)
      next.unshift({ ...item, isManual: true })
      return next
    })
  }

  const handleQueueMoveBottom = (qIdx: number) => {
    setQueueMatches((prev) => {
      if (qIdx < 0 || qIdx >= prev.length - 1) return prev
      const next = [...prev]
      const [item] = next.splice(qIdx, 1)
      next.push({ ...item, isManual: true })
      return next
    })
  }

  const handleQueueDelete = (qIdx: number) => {
    setQueueMatches((prev) => prev.filter((_, i) => i !== qIdx))
  }

  /* 코트 +/- 가능 여부 (헤더 우측 인라인 컨트롤) */
  const removable = useMemo(() => {
    if (courts.length <= 1) return false
    const last = courts[courts.length - 1]
    return (
      !!last &&
      last.matchDbId === null &&
      last.teamA.length === 0 &&
      last.teamB.length === 0
    )
  }, [courts])

  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground">
      {/* ── 1. 다크 헤더 바 ───────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-[var(--color-brand-ink)]">
        <div className="mx-auto max-w-[1280px] px-3 sm:px-4">
          {/* 모바일: 2행 stack / 태블릿+: 1행 */}
          <div className="flex flex-col gap-1.5 py-2 md:h-14 md:flex-row md:items-center md:justify-between md:gap-3 md:py-0">
            {/* 행 1: 로고 + 라벨 + 타이머 */}
            <div className="flex min-w-0 items-center gap-2 md:gap-3">
              <div className="relative h-6 w-6 shrink-0 md:h-7 md:w-7">
                <Image
                  src="/symbol_birdieminton-color.png"
                  alt="버디민턴"
                  fill
                  sizes="28px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-white md:flex-none md:text-base">
                {headerLabel}
              </span>
              <span
                className="shrink-0 tabular-nums text-[11px] font-mono text-white/50 md:text-xs"
                aria-label="전체 게임 시간"
              >
                {formatDuration(elapsed)}
              </span>
            </div>

            {/* 행 2: 코트 +/- + 결과보기 + 삭제 (모바일은 우측 정렬) */}
            <div className="flex items-center justify-end gap-1.5 md:gap-2">
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-1 py-0.5 md:gap-1.5 md:px-1.5 md:py-1">
                <button
                  type="button"
                  onClick={onAddCourt}
                  disabled={isPending || !onAddCourt}
                  aria-label="코트 추가"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 disabled:opacity-30 transition-all md:h-7 md:w-7"
                >
                  <Plus size={12} strokeWidth={2.6} />
                </button>
                <span className="w-5 text-center tabular-nums text-xs font-extrabold text-white md:w-6 md:text-sm">
                  {courts.length}
                </span>
                <button
                  type="button"
                  onClick={onRemoveCourt}
                  disabled={!removable || isPending || !onRemoveCourt}
                  aria-label="코트 제거"
                  title={removable ? '마지막 코트 제거' : '마지막 코트가 사용 중'}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all md:h-7 md:w-7"
                >
                  <Minus size={12} strokeWidth={2.6} />
                </button>
                {/* 라벨 — 좁은 화면 숨김 */}
                <span className="hidden px-1.5 text-[11px] font-semibold text-white/70 md:inline">코트 수</span>
              </div>

              {/* 회원/게스트 추가 — 진행 중에도 늦게 도착한 회원 / 갑작스런 게스트 인입 가능 */}
              {canAddPlayers && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMemberPickerOpen(true)}
                    disabled={isPending}
                    title="회원 추가"
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 active:scale-95 disabled:opacity-50 transition-all md:px-3 md:py-1.5 md:text-xs"
                  >
                    <UserPlus size={12} strokeWidth={2.4} />
                    <span className="hidden md:inline">회원</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestAddOpen(true)}
                    disabled={isPending}
                    title="게스트 추가"
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 active:scale-95 disabled:opacity-50 transition-all md:px-3 md:py-1.5 md:text-xs"
                  >
                    <UserPlus2 size={12} strokeWidth={2.4} />
                    <span className="hidden md:inline">게스트</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onEndGame}
                disabled={isPending}
                className="rounded-full bg-[var(--color-brand-lime)] px-3 py-1 text-xs font-extrabold text-[var(--color-brand-ink)] hover:brightness-95 active:scale-95 disabled:opacity-50 transition-all md:px-4 md:py-1.5 md:text-sm"
              >
                결과보기
              </button>
              {/* 삭제 — 모바일 숨김 (드물게 쓰는 destructive 액션) */}
              <button
                type="button"
                onClick={onDeleteGame}
                disabled={isPending}
                className="hidden rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80 hover:border-red-400/60 hover:text-red-300 disabled:opacity-50 transition-colors md:inline-flex"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-4 space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-streak-bg)] px-3 py-2.5 text-xs text-[var(--color-brand-streak)]">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── 2. 코트 행 — 4개 이하: 균등 배치 / 5개 이상: 가로 스크롤 ───────── */}
        <section
          className="overflow-x-auto pb-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d4d4d4] [&::-webkit-scrollbar-track]:bg-transparent"
        >
          <div
            className="grid gap-3 [--cols:1] md:[--cols:3] lg:[--cols:4]"
            style={{
              /* 화면별 visible 코트 수:
                 · mobile (< md):   1코트 (꽉 채움)  → 2개+ 부터 가로 스크롤
                 · tablet (md~lg):  3코트            → 4개+ 부터 가로 스크롤
                 · desktop (lg+):   4코트            → 5개+ 부터 가로 스크롤
                 카드 너비 = (100% - (cols-1) × 12px) / cols. */
              gridTemplateColumns: `repeat(${Math.max(courts.length, 1)}, calc((100% - (var(--cols) - 1) * 0.75rem) / var(--cols)))`,
            }}
          >
            {courts.map((court) => (
              <CourtCard
                key={court.courtIndex}
                court={court}
                now={now}
                playerMap={playerMap}
                isPending={isPending}
                waitingCount={waitingPlayers.length}
                matchPointTarget={matchPointTarget}
                onAssignCourt={onAssignCourt}
                onScoreChange={onScoreChange}
                onEndCourt={onEndCourt}
                onCancelCourt={onCancelCourt}
              />
            ))}
          </div>
        </section>

        {/* ── 3. 메인 3-패널 ──────────────────────────────────── */}
        <section className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {/* ◀ LEFT: 플레이어 풀 ───────────────────────────────── */}
          <div className="flex-1 rounded-xl border border-[var(--color-brand-border)] bg-white p-4">
            {/* 필터 1행 — flex-wrap: 좁아지면 자동 줄바꿈 (grid 강제 분할 X).
                넓은 화면: 성별 / 상태 / 정렬 한 줄 (정렬은 우측 push)
                좁은 화면: 자연스럽게 wrap → 2~3행 stack */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {/* 성별 필터 */}
              <div className="inline-flex rounded-lg bg-[var(--color-surface-muted)] p-0.5 text-sm">
                {GENDER_FILTER_OPTS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGenderFilter(value)}
                    className={cn(
                      'rounded-md px-2.5 py-1 font-semibold transition-colors',
                      genderFilter === value
                        ? 'bg-white text-[var(--color-text-strong)] shadow-sm'
                        : 'text-[var(--color-brand-text-sub)] hover:text-[var(--color-text-body)]',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 상태 필터 */}
              <div className="inline-flex rounded-lg bg-[var(--color-surface-muted)] p-0.5 text-sm">
                {STATUS_FILTER_OPTS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={cn(
                      'rounded-md px-2.5 py-1 font-semibold transition-colors',
                      statusFilter === value
                        ? 'bg-white text-[var(--color-text-strong)] shadow-sm'
                        : 'text-[var(--color-brand-text-sub)] hover:text-[var(--color-text-body)]',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 정렬 탭 — 가능하면 우측 끝으로 push */}
              <div className="inline-flex rounded-lg bg-[var(--color-surface-muted)] p-0.5 text-sm md:ml-auto">
                {(
                  [
                    ['name', '가나다'],
                    ['wait', '대기시간'],
                    ['games', '게임수'],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSortBy(k)}
                    className={cn(
                      'rounded-md px-2 py-1 font-semibold transition-colors',
                      sortBy === k
                        ? 'bg-white text-[var(--color-text-strong)] shadow-sm'
                        : 'text-[var(--color-brand-text-sub)] hover:text-[var(--color-text-body)]',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 필터 2행: 급수 segmented (좌) + 참석인원 (우) */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex max-w-full overflow-x-auto rounded-lg bg-[var(--color-surface-muted)] p-0.5 text-sm">
                {GRADE_CHIPS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGradeFilter(g)}
                    className={cn(
                      'whitespace-nowrap rounded-md px-2.5 py-1 font-semibold transition-colors',
                      gradeFilter === g
                        ? 'bg-white text-[var(--color-text-strong)] shadow-sm'
                        : 'text-[var(--color-brand-text-sub)] hover:text-[var(--color-text-body)]',
                    )}
                  >
                    {GRADE_LABEL_MAP[g]}
                  </button>
                ))}
              </div>
              <span className="shrink-0 text-base font-semibold text-[var(--color-text-body)]">
                참석인원{' '}
                <span className="tabular-nums text-[var(--color-brand-ink)]">
                  {allPlayers.length}
                </span>
                명
              </span>
            </div>

            {/* 플레이어 그리드 — 인원 늘어도 패널 내부에서만 세로 스크롤 (필터·헤더·코트는 고정) */}
            {visiblePlayers.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--color-brand-text-muted)]">
                {genderFilter !== 'all'
                  ? '성별 정보가 아직 없어요'
                  : '조건에 맞는 참가자가 없어요'}
              </p>
            ) : (
              <div
                className="max-h-[calc(100vh-480px)] min-h-[200px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d4d4d4] [&::-webkit-scrollbar-track]:bg-transparent"
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {visiblePlayers.map((p) => (
                    <PlayerCard
                      key={p.memberId}
                      player={p}
                      now={now}
                      isInMatchingBoard={matchingBoardIds.has(p.memberId)}
                      onClick={() => handlePoolPlayerClick(p.memberId)}
                      onLongPress={
                        onTogglePlayerStatus
                          ? (x, y) => handleOpenPlayerMenu(x, y, p)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ▣ MIDDLE: 매칭보드 ─────────────────────────────────── */}
          <div className="w-full shrink-0 space-y-3 lg:w-72">
            {/* 광고 배너 — 추후 클럽 운영자가 sponsor 등록 가능 (Phase 6 backend) */}
            <div className="rounded-xl border border-dashed border-[var(--color-brand-border)] bg-[var(--color-surface-sub)] p-4 text-center text-xs text-[var(--color-brand-text-muted)]">
              광고 배너 영역 (스폰서)
            </div>

            <div className="rounded-xl border border-[var(--color-brand-border)] bg-white p-4">
              <h3 className="mb-3 text-lg font-bold text-[var(--color-text-strong)]">매칭보드</h3>

              {/* 슬롯 — 좌=Team A (A1+A2 묶음), 우=Team B (B1+B2 묶음).
                  vs + 세로 divider 가운데. */}
              <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
                {/* 좌측: Team A — 1단1열 + 2단1열 */}
                <div className="grid grid-rows-2 gap-2">
                  <MiniSlotCard player={matchingBoardEntries?.[0][0] ?? null} />
                  <MiniSlotCard player={matchingBoardEntries?.[0][1] ?? null} />
                </div>
                {/* 가운데: 세로 divider + vs */}
                <div className="flex flex-col items-center justify-center gap-1 px-1">
                  <div className="w-px flex-1 bg-[#d4d4d4]" />
                  <span className={cn(
                    'text-xs font-bold uppercase tracking-widest',
                    matchingBoard ? 'text-[var(--color-brand-text-muted)]' : 'text-[var(--color-brand-text-muted)]',
                  )}>vs</span>
                  <div className="w-px flex-1 bg-[#d4d4d4]" />
                </div>
                {/* 우측: Team B — 1단2열 + 2단2열 */}
                <div className="grid grid-rows-2 gap-2">
                  <MiniSlotCard player={matchingBoardEntries?.[1][0] ?? null} />
                  <MiniSlotCard player={matchingBoardEntries?.[1][1] ?? null} />
                </div>
              </div>

              {/* 액션 버튼: 초기화 / 등록
                  등록 = 1순위 빈 코트 / 2순위 대기순서 큐 맨뒤 (둘 다 가능) */}
              {(() => {
                const isFull =
                  (matchingBoard?.teamA.length ?? 0) >= 2 &&
                  (matchingBoard?.teamB.length ?? 0) >= 2
                return (
                  <div className="mb-4 grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={handleClearMatchingBoard}
                      disabled={isPending || !matchingBoard}
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-[var(--color-surface-muted)] py-2 text-xs font-bold text-[var(--color-text-body)] hover:bg-[var(--color-brand-bg-muted)] active:scale-95 disabled:opacity-40 transition-all"
                    >
                      <RefreshCw size={12} strokeWidth={2.4} /> 초기화
                    </button>
                    <button
                      type="button"
                      onClick={handleRegisterMatch}
                      disabled={isPending || !isFull}
                      title={firstEmptyCourtIdx < 0 ? '빈 코트가 없어 대기순서로 보냅니다' : undefined}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--color-brand-border)] bg-white py-2 text-xs font-bold text-[var(--color-text-body)] hover:bg-[var(--color-surface-sub)] active:scale-95 disabled:opacity-40 transition-all"
                    >
                      <Check size={12} strokeWidth={2.6} /> 등록
                    </button>
                  </div>
                )
              })()}

              {/* 배정 방식 — 라벨 h3 (헤더와 동일 크기) + 2x2 grid 버튼.
                  active 판단 = autoMode === mode (수동 모드 = 모든 버튼 비활성). */}
              <div className="border-t border-[var(--color-brand-border-sub)] pt-3">
                <h3 className="mb-2 text-lg font-bold text-[var(--color-text-strong)]">배정 방식</h3>
                <div className="grid grid-cols-2 gap-2">
                  {ASSIGN_MODE_OPTS.map((opt, idx) => {
                    const active = autoMode === opt.value
                    /* 3번째 (신입 친화) — 양쪽 차지 */
                    const isFullRow = idx === 2
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleAssignModeToggle(opt.value)}
                        className={cn(
                          'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                          isFullRow && 'col-span-2',
                          active
                            ? 'bg-[var(--color-brand-ink)] text-white outline outline-2 outline-offset-2 outline-[var(--color-brand-lime)]'
                            : 'border border-[var(--color-brand-border)] text-[var(--color-brand-text-sub)] hover:border-[var(--color-brand-border)]',
                        )}
                      >
                        <opt.Icon size={13} strokeWidth={2.2} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ▶ RIGHT: 대기순서 ────────────────────────────────── */}
          <div className="w-full shrink-0 lg:w-72">
            <div className="rounded-xl border border-[var(--color-brand-border)] bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--color-text-strong)]">
                  대기순서({queueMatches.length})
                </h3>
                <button
                  type="button"
                  onClick={() => typeof window !== 'undefined' && window.print()}
                  className="rounded-md p-1.5 text-[var(--color-brand-text-sub)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-body)] transition-colors"
                  aria-label="대기열 인쇄"
                >
                  <Printer size={14} strokeWidth={2.2} />
                </button>
              </div>

              {queueMatches.length === 0 ? (
                <p className="py-8 text-center text-xs text-[var(--color-brand-text-muted)]">
                  대기 인원이 부족해요
                </p>
              ) : (
                <ol className="max-h-[calc(100vh-480px)] min-h-[200px] space-y-2.5 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d4d4d4] [&::-webkit-scrollbar-track]:bg-transparent">
                  {queueMatches.map((match, qIdx) => (
                    <QueueListItem
                      key={match.id}
                      qIdx={qIdx}
                      match={match}
                      onOpenMenu={handleOpenQueueMenu}
                    />
                  ))}
                </ol>
              )}
            </div>
          </div>
        </section>
      </main>

      {dialog && (
        <ConfirmDialog
          open
          title={dialog.title}
          description={dialog.description}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          variant={dialog.variant}
          onConfirm={dialog.onConfirm}
          onCancel={onDialogCancel}
        />
      )}

      {/* 직접 배정 오버레이 — 진입점은 폐기됐지만 호환 보존 */}
      {customPickCourt != null && onCustomAssign && onCancelCustomPick && (
        <CustomPickOverlay
          courtIndex={customPickCourt}
          waitingPlayers={waitingPlayers}
          membershipId={membershipId}
          onConfirm={onCustomAssign}
          onCancel={onCancelCustomPick}
        />
      )}

      {/* 컨텍스트 메뉴 (휴식 토글) */}
      {ctxMenu && onTogglePlayerStatus && (
        <PlayerContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          player={ctxMenu.player}
          onTogglePlayerStatus={onTogglePlayerStatus}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {/* 대기순서 컨텍스트 메뉴 (시작하기/되돌리기/맨위/맨아래/삭제) */}
      {queueCtxMenu && (
        <QueueItemContextMenu
          x={queueCtxMenu.x}
          y={queueCtxMenu.y}
          qIdx={queueCtxMenu.qIdx}
          total={queueMatches.length}
          canStart={firstEmptyCourtIdx >= 0}
          canRevert={!matchingBoard}
          onStart={() => handleQueueStart(queueCtxMenu.qIdx)}
          onRevert={() => handleQueueRevert(queueCtxMenu.qIdx)}
          onMoveTop={() => handleQueueMoveTop(queueCtxMenu.qIdx)}
          onMoveBottom={() => handleQueueMoveBottom(queueCtxMenu.qIdx)}
          onDelete={() => handleQueueDelete(queueCtxMenu.qIdx)}
          onClose={() => setQueueCtxMenu(null)}
        />
      )}

      {/* 회원/게스트 추가 모달 (진행 중 세션 인입) */}
      {canAddPlayers && members && onAddPlayers && (
        <>
          <MemberPickerModal
            open={memberPickerOpen}
            members={members}
            alreadySelectedIds={memberIdsAlreadyIn}
            onClose={() => setMemberPickerOpen(false)}
            onConfirm={async (ids) => {
              setMemberPickerOpen(false)
              if (ids.length === 0) return
              await onAddPlayers({ memberIds: ids })
            }}
          />
          <GuestAddModal
            open={guestAddOpen}
            onClose={() => setGuestAddOpen(false)}
            onConfirm={async (guests) => {
              setGuestAddOpen(false)
              if (guests.length === 0) return
              await onAddPlayers({ guests })
            }}
          />
        </>
      )}
    </div>
  )
}

/* ── 코트 카드 ─────────────────────────────────────────────────
 * 흰 배경 + zinc 보더. 2x2 슬롯 (꽉 찬 색상 카드 / 빈 = 회색 placeholder).
 * 점수 +/- (좌:파랑 / 우:빨강), 가운데 vs / 듀스 / 승리.
 */
function CourtCard({
  court,
  now,
  playerMap,
  isPending,
  waitingCount,
  matchPointTarget,
  onAssignCourt,
  onScoreChange,
  onEndCourt,
  onCancelCourt,
}: {
  court: CourtEntry
  now: number
  playerMap: Map<string, PlayerEntry>
  isPending: boolean
  waitingCount: number
  matchPointTarget: 21 | 25
  onAssignCourt: (courtIndex: number) => void
  onScoreChange: (courtIndex: number, team: 'A' | 'B', delta: number) => void
  onEndCourt: (courtIndex: number) => void
  onCancelCourt: (courtIndex: number) => void
}) {
  const isEmpty = court.teamA.length === 0
  const winState = isEmpty ? null : getWinState(court.scoreA, court.scoreB, matchPointTarget)
  const hasWinner = winState === 'A' || winState === 'B'
  const courtElapsed = court.startedAt > 0 ? now - court.startedAt : 0
  const [scoreModalOpen, setScoreModalOpen] = useState(false)

  /* 슬롯 렌더 헬퍼 — 코트 카드는 위치 기반 (좌 A / 우 B), 성별과 무관.
     좌 = #00804C (deep green) + 흰 텍스트 / 우 = #EBE64C (lime) + 다크 텍스트 */
  const renderSlot = (slotIdx: number) => {
    const ids = isEmpty ? [] : [...court.teamA, ...court.teamB]
    const id = ids[slotIdx]
    if (!id) {
      return (
        <div className="flex h-12 items-center justify-center rounded-md border border-dashed border-[var(--color-brand-border)] bg-[var(--color-surface-sub)] text-xs font-medium text-[var(--color-brand-text-muted)] md:h-12 md:text-[11px]">
          대기
        </div>
      )
    }
    const player = playerMap.get(id)
    const isATeam = slotIdx < 2  // 0,1 = team A (좌) / 2,3 = team B (우)
    const grade = player ? scoreToGrade(player.skillScore) : null
    return (
      <div
        className={cn(
          'flex h-14 items-center justify-center gap-1.5 rounded-md px-2 md:h-12',
          isATeam
            ? 'bg-[var(--color-brand-court-team-a)] text-white'
            : 'bg-[var(--color-brand-court-team-b)] text-[#0a0a0a]',
        )}
      >
        <span
          className={cn(
            'rounded px-1 font-mono text-xs font-bold leading-none md:text-[10px]',
            isATeam ? 'bg-white/20' : 'bg-black/15',
          )}
        >
          {grade}
        </span>
        <span className="truncate text-base font-bold md:text-sm">
          {player?.name ?? '?'}
        </span>
      </div>
    )
  }

  /* 우측 액션 버튼 — 경기 없음(isEmpty 또는 hasWinner) = 완료 / 경기중(active) = 취소 */
  const showCompleteState = isEmpty || hasWinner
  const completeAction = hasWinner
    ? () => onEndCourt(court.courtIndex)
    : undefined  // isEmpty 면 disabled

  return (
    <article className="relative flex flex-col rounded-xl border border-[var(--color-brand-border)] bg-white p-3 min-h-[170px]">
      {/* 헤더: 좌(코트) / 중(상태·시간) / 우(완료 또는 취소) */}
      <header className="mb-2 grid grid-cols-3 items-center">
        {/* 좌 */}
        <div className="justify-self-start">
          <span className="rounded-full border border-[var(--color-brand-border)] bg-white px-2.5 py-0.5 text-xs font-extrabold text-[var(--color-text-body)]">
            {court.courtIndex + 1}코트
          </span>
        </div>
        {/* 중앙: 상태 + 시간 (승자 표시는 점수 영역에서만 노출 — 중복 제거).
            진행중 = 검정 텍스트 + Mantis green 라이브 점 (펄스 애니메이션). */}
        <div className="justify-self-center text-center">
          {isEmpty ? (
            <span className="text-[11px] font-bold text-[var(--color-brand-text-muted)]">대기</span>
          ) : hasWinner ? (
            <span className="text-[11px] font-bold text-[var(--color-brand-text-sub)] tabular-nums">
              {formatDuration(courtElapsed)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold tabular-nums text-[var(--color-brand-ink)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-court-soft)] animate-pulse" aria-hidden />
              진행중 · {formatDuration(courtElapsed)}
            </span>
          )}
        </div>
        {/* 우: 완료 / 취소 */}
        <div className="justify-self-end">
          {showCompleteState ? (
            <button
              type="button"
              onClick={completeAction}
              disabled={isEmpty || court.isSaving || isPending}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-all active:scale-95 disabled:cursor-not-allowed',
                hasWinner
                  ? 'bg-[var(--color-brand-ink)] text-[var(--color-brand-lime)] hover:brightness-110 disabled:opacity-50'
                  : 'border border-[var(--color-brand-border)] bg-white text-[var(--color-brand-text-muted)] disabled:opacity-50',
              )}
            >
              {court.isSaving ? '저장중' : '완료'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onCancelCourt(court.courtIndex)}
              disabled={court.isSaving || isPending}
              className="rounded-full border border-[var(--color-brand-border)] bg-white px-2.5 py-1 text-[11px] font-bold text-[var(--color-brand-text-sub)] hover:bg-[var(--color-surface-sub)] active:scale-95 disabled:opacity-40 transition-all"
            >
              취소
            </button>
          )}
        </div>
      </header>

      {/* 슬롯 — 좌=Team A (A1+A2 묶음) / 우=Team B (B1+B2 묶음) / vs 세로 divider.
          ids = [...teamA, ...teamB] → 0=A1, 1=A2, 2=B1, 3=B2 */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        <div className="grid grid-rows-2 gap-2">
          {renderSlot(0)} {/* A1 */}
          {renderSlot(1)} {/* A2 */}
        </div>
        <div className="flex flex-col items-center justify-center gap-1 px-1">
          <div className="w-px flex-1 bg-[#d4d4d4]" />
          <span className={cn(
            'text-xs font-bold uppercase tracking-widest',
            isEmpty ? 'text-[var(--color-brand-text-muted)]' : 'text-[var(--color-brand-text-muted)]',
          )}>vs</span>
          <div className="w-px flex-1 bg-[#d4d4d4]" />
        </div>
        <div className="grid grid-rows-2 gap-2">
          {renderSlot(2)} {/* B1 */}
          {renderSlot(3)} {/* B2 */}
        </div>
      </div>

      {/* 점수 영역 — 클릭 시 키패드 모달 열림 (D안: 직접 입력) */}
      {(() => {
        const winnerNames = hasWinner
          ? (winState === 'A' ? court.teamA : court.teamB)
              .map((id) => playerMap.get(id)?.name)
              .filter(Boolean)
              .join(' · ')
          : null

        return (
          <button
            type="button"
            onClick={() => !isEmpty && setScoreModalOpen(true)}
            disabled={isEmpty || court.isSaving || isPending}
            className={cn(
              'mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg p-2 transition-all',
              isEmpty
                ? 'cursor-not-allowed opacity-40'
                : 'cursor-pointer hover:bg-[var(--color-surface-sub)] active:scale-[0.99]',
            )}
            aria-label="점수 입력"
          >
            <span className="text-4xl font-extrabold tabular-nums text-[var(--color-brand-court-team-a)] md:text-3xl">
              {court.scoreA}
            </span>
            {winState === 'deuce' ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-extrabold text-orange-600 md:text-[10px]">
                <Flame size={11} strokeWidth={2.4} /> 듀스
              </span>
            ) : hasWinner ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1 truncate rounded-lg px-2.5 py-1 text-xs font-extrabold whitespace-nowrap md:px-3 md:py-1.5 md:text-sm',
                  winState === 'A'
                    ? 'bg-[var(--color-brand-court-team-a)] text-white'
                    : 'bg-[var(--color-brand-court-team-b)] text-[#0a0a0a]',
                )}
              >
                <Trophy size={13} strokeWidth={2.6} />
                {winnerNames}
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-text-muted)]">
                vs
              </span>
            )}
            <span className="text-4xl font-extrabold tabular-nums text-[#7C7C00] md:text-3xl">
              {court.scoreB}
            </span>
          </button>
        )
      })()}

      {/* 점수 입력 모달 */}
      <ScoreInputModal
        open={scoreModalOpen}
        initialScoreA={court.scoreA}
        initialScoreB={court.scoreB}
        matchPointTarget={matchPointTarget}
        onClose={() => setScoreModalOpen(false)}
        onSave={(newA, newB) => {
          const deltaA = newA - court.scoreA
          const deltaB = newB - court.scoreB
          if (deltaA !== 0) onScoreChange(court.courtIndex, 'A', deltaA)
          if (deltaB !== 0) onScoreChange(court.courtIndex, 'B', deltaB)
          setScoreModalOpen(false)
        }}
      />
    </article>
  )
}
