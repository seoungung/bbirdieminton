'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import {
  ArrowLeft, ChevronDown, AlertCircle, Check, Minus, Plus,
  Sparkles, PenLine, AlertTriangle, Zap, Lightbulb, UserPlus,
  RotateCw, Crown,
} from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { cn } from '@/lib/utils'
import { GradeBadge } from '@/components/club/GradeBadge'
import { buildRankMap, scoreToGrade, type Grade } from '@/lib/club/grade'
import type { ClubMemberWithUser } from '@/types/club'
import type { SetupSource, AssignMode, GameMode, RecentSessionData, InProgressData } from './types'

type GradeFilter = 'all' | Grade

/** 급수 필터 옵션 — 우동배의 급수 필터 패턴 차용. 30명+ 클럽에서 출석자 빠르게 골라내기 */
const GRADE_FILTER_OPTS: { value: GradeFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'S',   label: 'S' },
  { value: 'A',   label: 'A' },
  { value: 'B',   label: 'B' },
  { value: 'C',   label: 'C' },
  { value: 'D',   label: 'D' },
  { value: 'E',   label: 'E' },
  { value: 'F',   label: 'F' },
]

type IconComp = React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>

interface Props {
  members: ClubMemberWithUser[]
  /** 클럽 ID — 멤버 0명 빈 상태에서 회원 추가 페이지 링크 */
  clubId?: string
  recentSessions: RecentSessionData[]
  selectedPlayers: Set<string>
  tempPlayers: Array<{ id: string; name: string }>
  setupSource: SetupSource
  selectedSessionIdx: number
  assignMode: AssignMode
  gameMode: GameMode
  courtCount: number
  activeCourts: number
  maxCourts: number
  sessionDate: string
  inProgressData?: InProgressData | null
  isPending: boolean
  error: string | null
  /** 체험 모드 — 빈 상태/멤버 0명 처리 분기 */
  isDemo?: boolean
  onBack: () => void
  onSourceChange: (src: SetupSource) => void
  onSessionSelect: (idx: number) => void
  onTogglePlayer: (id: string) => void
  onAddTempPlayer: (name: string) => void
  onRemoveTempPlayer: (id: string) => void
  onAssignModeChange: (v: AssignMode) => void
  onGameModeChange: (v: GameMode) => void
  onActiveCourtsChange: (n: number) => void
  onSessionDateChange: (date: string) => void
  onStartGame: () => void
  onResume?: () => void
}

/**
 * v2 단순화: 모드 4개 → 2개로 축소.
 * - `auto` (UI 라벨, 내부적으로 'freshness') — 대기 우선순위 + 파트너 중복 방지.
 *   배드민턴 동호회 90% 케이스. 가장 안정적인 자동 알고리즘.
 * - `custom` (직접 배정) — 운영진이 4명 직접 선택.
 *
 * 숨긴 모드: random / skill_balance — 코드는 살아있고 UI만 미노출.
 * skill_score 가이드 정비 후 재오픈 예정.
 */
const ASSIGN_OPTS: { value: AssignMode; label: string; Icon: IconComp; desc: string }[] = [
  { value: 'freshness', label: '자동 매칭', Icon: Sparkles, desc: '대기 인원 우선 + 파트너 중복 방지' },
  { value: 'custom',    label: '직접 배정', Icon: PenLine,  desc: '운영진이 4명 직접 선택' },
]

export function SetupPhase({
  members,
  clubId,
  recentSessions,
  selectedPlayers,
  tempPlayers,
  setupSource,
  selectedSessionIdx,
  assignMode,
  gameMode,
  activeCourts,
  maxCourts,
  sessionDate,
  inProgressData,
  isPending,
  error,
  isDemo,
  onBack,
  onSourceChange,
  onSessionSelect,
  onTogglePlayer,
  onAddTempPlayer,
  onRemoveTempPlayer,
  onAssignModeChange,
  onGameModeChange,
  onActiveCourtsChange,
  onSessionDateChange,
  onStartGame,
  onResume,
}: Props) {
  const [tempInput, setTempInput] = useState('')
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all')
  const rankMap = useMemo(() => buildRankMap(members), [members])

  const selectedCount = selectedPlayers.size
  const canStart = selectedCount >= 4

  /** 급수별 회원 수 (필터 칩에 N 표시용) */
  const gradeCounts = useMemo(() => {
    const counts: Record<GradeFilter, number> = {
      all: members.length, S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0,
    }
    for (const m of members) {
      counts[scoreToGrade(m.skill_score)]++
    }
    return counts
  }, [members])

  /** 필터 적용된 회원 목록 */
  const visibleMembers = useMemo(() => {
    if (gradeFilter === 'all') return members
    return members.filter(m => scoreToGrade(m.skill_score) === gradeFilter)
  }, [members, gradeFilter])

  const handleAddTemp = () => {
    const name = tempInput.trim()
    if (!name) return
    onAddTempPlayer(name)
    setTempInput('')
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="lg:hidden flex items-center gap-1.5 text-[#555] hover:text-[#111] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">모임으로</span>
          </button>
          <span className="text-base font-bold text-[#111]">게임 설정</span>
          <div className="lg:hidden w-20" />
        </div>
      </div>

      <div className="max-w-[1088px] mx-auto px-4 py-5 space-y-5">
        {/* 첫 진입 가이드 — 진행 중 게임 없고 아직 아무도 선택 안 한 상태 */}
        {!inProgressData && members.length > 0 && selectedCount === 0 && (
          <div className="bg-[#0a0a0a] text-white rounded-2xl p-5 sm:p-6">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#beff00] mb-3">
              <Lightbulb size={12} strokeWidth={2.5} />
              오늘 게임 만들기
            </p>
            <h2 className="text-lg sm:text-xl font-extrabold leading-snug mb-4">
              출석한 회원 4명 이상을 선택하면<br />
              자동으로 팀이 짜집니다.
            </h2>
            <div className="grid sm:grid-cols-3 gap-3 text-[12px]">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="font-bold text-[#beff00] mb-1">1단계</p>
                <p className="text-white/80 leading-relaxed">아래에서 오늘 출석한 회원을 탭으로 선택</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="font-bold text-[#beff00] mb-1">2단계</p>
                <p className="text-white/80 leading-relaxed">코트 수와 배정 방식 확인 (기본값 OK)</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="font-bold text-[#beff00] mb-1">3단계</p>
                <p className="text-white/80 leading-relaxed">하단 &ldquo;게임 시작&rdquo; → 자동 배정 결과 확인</p>
              </div>
            </div>
          </div>
        )}

        {/* 진행 중인 게임 재개 배너 */}
        {inProgressData && onResume && (
          <div className="bg-[#fff8e1] border border-[#ffe082] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#b8860b] inline-flex items-center gap-1.5">
                <Zap size={14} strokeWidth={2.2} />
                진행 중인 게임 있음
              </p>
              <p className="text-xs text-[#b8860b]/80 mt-0.5">
                {new Date(inProgressData.sessionDate).toLocaleDateString('ko-KR', {
                  month: 'long', day: 'numeric', weekday: 'short',
                })}{' '}
                · {inProgressData.attendeeMemberIds.length}명 참여
              </p>
            </div>
            <button
              onClick={onResume}
              className="px-4 py-2 bg-[#b8860b] text-white text-sm font-bold rounded-xl hover:bg-[#9a7209] transition-colors shrink-0 ml-3"
            >
              계속하기
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* 날짜 설정 */}
        <div>
          <p className="text-xs font-semibold text-[#999] mb-2">게임 날짜</p>
          <input
            type="date"
            value={sessionDate}
            onChange={e => onSessionDateChange(e.target.value)}
            className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors"
          />
        </div>

        {/* 코트 수 조정 */}
        <div>
          <p className="text-xs font-semibold text-[#999] mb-2">사용 코트 수</p>
          <div className="bg-white rounded-xl border border-[#e5e5e5] px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-[#555]">코트 수</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onActiveCourtsChange(Math.max(1, activeCourts - 1))}
                disabled={activeCourts <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5e5e5] text-[#555] hover:border-[#beff00] disabled:opacity-30 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-base font-bold text-[#111] w-6 text-center">{activeCourts}</span>
              <button
                onClick={() => onActiveCourtsChange(Math.min(maxCourts, activeCourts + 1))}
                disabled={activeCourts >= maxCourts}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5e5e5] text-[#555] hover:border-[#beff00] disabled:opacity-30 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          {maxCourts > 1 && (
            <p className="text-[11px] text-[#bbb] mt-1.5 pl-1">최대 {maxCourts}면 사용 가능</p>
          )}
        </div>

        {/* 참가자 설정 방식 */}
        <div>
          <p className="text-xs font-semibold text-[#999] mb-2">참가자 설정</p>
          <div className="flex gap-2">
            <button
              onClick={() => onSourceChange('manual')}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-colors',
                setupSource === 'manual'
                  ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                  : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#beff00]'
              )}
            >
              직접 선택
            </button>
            <button
              onClick={() => onSourceChange('session')}
              disabled={recentSessions.length === 0}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-colors disabled:opacity-40',
                setupSource === 'session'
                  ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                  : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#beff00]'
              )}
            >
              지난 세션 불러오기
            </button>
          </div>
        </div>

        {/* 지난 세션 선택 드롭다운 */}
        {setupSource === 'session' && recentSessions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#999] mb-2">세션 선택</p>
            <div className="relative">
              <select
                value={selectedSessionIdx}
                onChange={(e) => onSessionSelect(Number(e.target.value))}
                className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] appearance-none focus:outline-none focus:border-[#beff00] transition-colors"
              >
                {recentSessions.map(({ session, attendeeCount }, idx) => (
                  <option key={session.id} value={idx}>
                    {new Date(session.session_date).toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}{' '}
                    ({attendeeCount}명)
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* 멤버 선택 그리드 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#999]">참가자 선택</p>
            <p className="text-xs text-[#999]">
              <span className={cn('font-bold', canStart ? 'text-[#111]' : 'text-[#bbb]')}>
                {selectedCount}
              </span>
              /{members.length}명
            </p>
          </div>

          {/* 급수 필터 칩 — 회원 8명 이상일 때만 노출 */}
          {members.length >= 8 && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-2 mb-2">
              {GRADE_FILTER_OPTS.map(opt => {
                const count = gradeCounts[opt.value]
                if (opt.value !== 'all' && count === 0) return null
                const isActive = gradeFilter === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setGradeFilter(opt.value)}
                    className={cn(
                      'shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold transition-colors',
                      isActive
                        ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                        : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#beff00]'
                    )}
                  >
                    {opt.label}
                    <span className={cn('text-[10px] tabular-nums', isActive ? 'text-white/60' : 'text-[#bbb]')}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {members.length === 0 ? (
            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 text-center">
              <UserPlus size={28} className="text-[#bbb] mx-auto mb-3" strokeWidth={1.6} />
              <p className="text-sm font-bold text-[#111] mb-1.5">아직 회원이 없어요</p>
              <p className="text-xs text-[#999] mb-4 leading-relaxed">
                게임을 시작하려면 먼저 회원을 등록해 주세요.<br />
                초대코드 또는 엑셀 임포트로 한 번에 추가할 수 있어요.
              </p>
              {!isDemo && clubId && (
                <div className="flex gap-2 justify-center">
                  <Link
                    href={`/club/${clubId}/settings`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0a0a0a] text-white text-xs font-bold rounded-full hover:bg-[#222] transition-colors"
                  >
                    초대코드 보기
                  </Link>
                  <Link
                    href={`/club/${clubId}/import`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#0a0a0a] border border-[#e5e5e5] text-xs font-bold rounded-full hover:border-[#0a0a0a] transition-colors"
                  >
                    엑셀로 일괄 등록
                  </Link>
                </div>
              )}
              {isDemo && (
                <p className="text-[11px] text-[#bbb]">체험 모드에서는 임시 참가자를 추가해 보세요.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {visibleMembers.length === 0 ? (
                <p className="col-span-full text-xs text-[#bbb] text-center py-4">
                  이 급수에 해당하는 회원이 없어요
                </p>
              ) : null}
              {visibleMembers.map((member) => {
                const isOn = selectedPlayers.has(member.id)
                const rank = rankMap.get(member.id)
                return (
                  <button
                    key={member.id}
                    onClick={() => onTogglePlayer(member.id)}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-colors',
                      isOn
                        ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                        : 'bg-white border-[#e5e5e5] text-[#111] hover:border-[#beff00]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                        isOn ? 'bg-[#beff00] border-[#beff00]' : 'border-[#ccc]'
                      )}
                    >
                      {isOn && <Check size={9} className="text-[#111]" strokeWidth={3} />}
                    </div>
                    <GradeBadge score={member.skill_score} size="sm" />
                    <div className="flex-1 min-w-0 flex items-center gap-1">
                      <span className="text-sm font-semibold truncate">
                        {member.user?.name ?? '?'}
                      </span>
                      {rank && (
                        <span
                          className={cn(
                            'text-[10px] font-bold tabular-nums shrink-0',
                            isOn ? 'text-white/50' : 'text-[#aaa]'
                          )}
                        >
                          {rank}위
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {!canStart && selectedCount > 0 && (
            <p className="text-xs text-[#aaa] mt-2 text-center">최소 4명 이상 선택해주세요</p>
          )}
        </div>

        {/* 임시 참가자 추가 */}
        <div>
          <p className="text-xs font-semibold text-[#999] mb-2">
            임시 참가자 <span className="text-[#bbb] font-normal">(클럽 외 인원)</span>
          </p>
          <div className="flex gap-2 mb-2">
            <input
              value={tempInput}
              onChange={e => setTempInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTemp()}
              placeholder="이름 입력 후 추가"
              maxLength={10}
              className="flex-1 border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors"
            />
            <button
              onClick={handleAddTemp}
              disabled={!tempInput.trim()}
              className="px-4 py-2.5 bg-[#0a0a0a] text-white text-sm font-semibold rounded-xl hover:bg-[#1a1a1a] disabled:opacity-40 transition-colors"
            >
              추가
            </button>
          </div>
          {tempPlayers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tempPlayers.map(p => (
                <div
                  key={p.id}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors cursor-pointer select-none ${
                    selectedPlayers.has(p.id)
                      ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                      : 'bg-white border-[#e5e5e5] text-[#555]'
                  }`}
                  onClick={() => onTogglePlayer(p.id)}
                >
                  {p.name}
                  <button
                    onClick={e => { e.stopPropagation(); onRemoveTempPlayer(p.id) }}
                    className="text-current opacity-50 hover:opacity-100 ml-0.5"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 게임 모드 — 일반 로테이션 vs 킹 오브 코트 */}
        <div>
          <p className="text-xs font-semibold text-[#999] mb-2">게임 모드</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'normal',        Icon: RotateCw, label: '일반 로테이션', desc: '모든 플레이어 순환 참여' },
              { value: 'king_of_court', Icon: Crown,    label: '킹 오브 코트',  desc: '승자 유지, 도전자 교체' },
            ] as { value: GameMode; Icon: IconComp; label: string; desc: string }[]).map(opt => (
              <button
                key={opt.value}
                onClick={() => onGameModeChange(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-colors',
                  gameMode === opt.value
                    ? 'bg-[#beff00] border-[#beff00] text-[#111]'
                    : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#beff00]'
                )}
              >
                <opt.Icon size={20} strokeWidth={1.9} />
                <span className="text-[11px] font-bold leading-none">{opt.label}</span>
                <span className="text-[10px] text-[#999] leading-tight">{opt.desc}</span>
              </button>
            ))}
          </div>
          {gameMode === 'king_of_court' && (
            <p className="text-xs text-[#999] mt-2 pl-1 flex items-start gap-1.5">
              <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" strokeWidth={2} />
              승리 팀이 코트를 지키고, 패배 팀과 대기 도전자가 교체됩니다. (실험 기능)
            </p>
          )}
        </div>

        {/* 팀 배정 방식 — v2 단순화: 자동 매칭 / 직접 배정 2개만 노출 */}
        <div>
          <p className="text-xs font-semibold text-[#999] mb-2">팀 배정 방식</p>
          <div className="grid grid-cols-2 gap-2">
            {ASSIGN_OPTS.map(({ value, label, Icon, desc }) => (
              <button
                key={value}
                onClick={() => onAssignModeChange(value)}
                className={cn(
                  'flex flex-col items-center gap-1 py-3.5 px-2 rounded-xl border text-center transition-colors',
                  assignMode === value
                    ? 'bg-[#beff00] border-[#beff00] text-[#111]'
                    : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#beff00]'
                )}
              >
                <Icon size={22} strokeWidth={1.9} />
                <span className="text-[12px] font-bold leading-none">{label}</span>
                <span className="text-[10px] text-[#999] leading-tight px-1">{desc}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#bbb] mt-2 pl-1 flex items-start gap-1.5">
            <AlertTriangle size={11} className="text-[#999] mt-0.5 shrink-0" strokeWidth={2} />
            잘 모르겠으면 <strong className="text-[#666] font-semibold">자동 매칭</strong> 그대로 두세요.
          </p>
        </div>

        {/* 게임 시작 버튼 */}
        <button
          onClick={onStartGame}
          disabled={!canStart || isPending}
          className="w-full py-4 bg-[#beff00] text-[#111] font-extrabold text-base rounded-2xl hover:brightness-95 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
              게임 시작 중...
            </span>
          ) : !canStart ? (
            `4명 이상 선택 필요 (현재 ${selectedCount}명)`
          ) : (
            <span className="inline-flex items-center gap-2">
              <ShuttlecockIcon size={18} strokeWidth={1.8} aria-label="게임 시작" />
              {selectedCount}명으로 게임 시작
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
