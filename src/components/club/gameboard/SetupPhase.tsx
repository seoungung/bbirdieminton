'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowLeft, AlertCircle, Minus, Plus, Check,
  AlertTriangle, Zap, Lightbulb, UserPlus,
  RotateCw, Trophy, Users, UserPlus2, X,
  CalendarPlus, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClubMemberWithUser } from '@/types/club'
import { scoreToGrade, type Grade } from '@/lib/club/grade'
import type { AssignMode, GameMode, InProgressData, GameboardEvent } from './types'
import { MemberPickerModal } from './setup/MemberPickerModal'
import { GuestAddModal } from './setup/GuestAddModal'

interface Props {
  members: ClubMemberWithUser[]
  /** 클럽 ID — 멤버 0명 빈 상태에서 회원 추가 페이지 링크 */
  clubId?: string
  selectedPlayers: Set<string>
  tempPlayers: Array<{ id: string; name: string; gender?: 'M' | 'F' | null; grade?: Grade | null }>
  assignMode: AssignMode
  gameMode: GameMode
  courtCount: number
  activeCourts: number
  maxCourts: number
  sessionDate: string
  inProgressData?: InProgressData | null
  isPending: boolean
  error: string | null
  /** 정기 모임 목록 */
  events?: GameboardEvent[]
  /** 선택된 정기 모임 ID */
  selectedEventId?: string | null
  onBack: () => void
  onTogglePlayer: (id: string) => void
  onAddTempPlayer: (guest: { name: string; gender?: 'M' | 'F' | null; grade?: Grade | null }) => void
  onRemoveTempPlayer: (id: string) => void
  onAssignModeChange: (v: AssignMode) => void
  onGameModeChange: (v: GameMode) => void
  onActiveCourtsChange: (n: number) => void
  onSessionDateChange: (date: string) => void
  /** 게임 시작 — 세션 생성 + 매치 배정 → playing 페이즈 진입 */
  onStartGame?: () => void
  onEventSelect?: (eventId: string | null) => void
  onResume?: () => void
}

/**
 * 급수 letter → 텍스트 색상 매핑.
 * 디자인 가이드: 카드 내 letter는 컬러, 배경은 zinc-100 회색.
 *
 * - A: red-600 (team-b 토큰)
 * - B: amber-500 (streak 토큰)
 * - C: orange-600 (B와 미세 구분)
 * - D: violet-500 (elite 토큰)
 * - E: emerald-500 (court 토큰)
 * - S: violet-500 bold (자강 — elite 톤)
 * - F (왕초보): zinc-500 중립
 * - 그 외: zinc-500 중립
 */
const GRADE_LETTER_COLOR: Record<Grade, string> = {
  S: 'text-[var(--color-brand-elite)]',
  A: 'text-[var(--color-brand-team-b)]',
  B: 'text-[var(--color-brand-streak)]',
  C: 'text-[#ea580c]',
  D: 'text-[var(--color-brand-elite)]',
  E: 'text-[var(--color-brand-court)]',
  F: 'text-[var(--color-brand-text-sub)]',
}

/** 카드 내 사용할 등급 letter — S/A/B/C/D/E/F 모두 알파벳 그대로 */
function gradeDisplayLetter(grade: Grade): string {
  return grade
}

/** YYYY-MM-DD → 'M월 D일 (요일)' */
function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`
}

export function SetupPhase({
  members,
  clubId,
  selectedPlayers,
  tempPlayers,
  gameMode,
  activeCourts,
  sessionDate,
  inProgressData,
  isPending,
  error,
  events = [],
  selectedEventId,
  onBack,
  onTogglePlayer,
  onAddTempPlayer,
  onRemoveTempPlayer,
  onGameModeChange,
  onActiveCourtsChange,
  onSessionDateChange,
  onEventSelect,
  onStartGame,
  onResume,
}: Props) {
  /** 레벨 필터 — 'all' | Grade. 카드 그리드 필터링용 */
  const [gradeFilter, setGradeFilter] = useState<'all' | Grade>('all')

  /** 모달 열림 상태 */
  const [memberPickerOpen, setMemberPickerOpen] = useState(false)
  const [guestAddOpen, setGuestAddOpen] = useState(false)

  /** 이벤트 드롭다운 열림 상태 */
  const [eventPickerOpen, setEventPickerOpen] = useState(false)

  /** 현재 선택된 이벤트 객체 */
  const selectedEvent = events.find(e => e.id === selectedEventId) ?? null

  /** 이벤트 없음 → 빈 상태 가드 */
  const showEmptyEventGuard = events.length === 0

  /** "오늘 게임 만들기" 가이드 배너 dismissal — localStorage 영구 저장.
   *  기본 false (= 안 닫힘 = 보임). 닫기 누르면 true 로 영구 저장. */
  const [guideDismissed, setGuideDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('gameboard-guide-dismissed') === '1'
  })
  const dismissGuide = () => {
    setGuideDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('gameboard-guide-dismissed', '1')
    }
  }

  const selectedCount = selectedPlayers.size
  const totalEligible = members.length + tempPlayers.length
  const canStart = selectedCount >= 4
  /** 게임 시작 가능 조건: 정기 모임 선택 + 4명 이상 + 코트 1개 이상 */
  const canStartGame = !!selectedEventId && selectedCount >= 4 && activeCourts >= 1

  /**
   * 레벨 필터 칩에 표시할 등급 버킷.
   * 실제 members 배열에서 등장하는 grade 만 자동 노출 (count > 0).
   * S → A → B → C → D → E → F 표준 정렬.
   */
  const gradeBuckets = useMemo(() => {
    const counts: Record<Grade, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
    for (const m of members) counts[scoreToGrade(m.skill_score)]++
    const order: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F']
    return order
      .filter(g => counts[g] > 0)
      .map(g => ({ grade: g, count: counts[g] }))
  }, [members])

  /**
   * 카드 그리드에 노출할 항목들 — 필터 + 정렬 + tempPlayer 결합.
   * - 'all' 필터: 회원 전체 + 게스트 전체
   * - 특정 grade: 해당 grade 회원만 (게스트 제외 — 등급 없음)
   * 회원은 skill_score 내림차순 (강한 순), 게스트는 끝에 이름순.
   */
  const visibleEntries = useMemo(() => {
    const memberEntries = members
      .filter(m => gradeFilter === 'all' || scoreToGrade(m.skill_score) === gradeFilter)
      .sort((a, b) => b.skill_score - a.skill_score)
      .map(m => ({
        kind: 'member' as const,
        id: m.id,
        name: m.user?.name ?? '?',
        grade: scoreToGrade(m.skill_score),
      }))

    if (gradeFilter !== 'all') return memberEntries

    const guestEntries = tempPlayers
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(t => ({
        kind: 'guest' as const,
        id: t.id,
        name: t.name,
        grade: (t.grade ?? null) as Grade | null,
      }))
    return [...memberEntries, ...guestEntries]
  }, [members, tempPlayers, gradeFilter])

  const handleOpenMemberPicker = () => setMemberPickerOpen(true)
  const handleOpenGuestAdd = () => setGuestAddOpen(true)

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between">
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

      <div className="max-w-[1280px] mx-auto px-4 py-5 space-y-5">
        {/* 첫 진입 가이드 — 진행 중 게임 없고 아직 아무도 선택 안 한 상태 + 사용자가 닫지 않은 상태 */}
        {!inProgressData && members.length > 0 && selectedCount === 0 && !guideDismissed && (
          <div className="relative bg-[#0a0a0a] text-white rounded-2xl p-5 sm:p-6">
            <button
              onClick={dismissGuide}
              aria-label="가이드 닫기"
              className="absolute top-3 right-3 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} strokeWidth={2.2} />
            </button>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-brand-lime)] mb-3">
              <Lightbulb size={12} strokeWidth={2.5} />
              오늘 게임 만들기
            </p>
            <h2 className="text-lg sm:text-xl font-extrabold leading-snug mb-4 pr-8">
              출석한 회원 4명 이상을 선택하면<br />
              자동으로 팀이 짜집니다.
            </h2>
            <div className="grid sm:grid-cols-3 gap-3 text-[12px]">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="font-bold text-[var(--color-brand-lime)] mb-1">1단계</p>
                <p className="text-white/80 leading-relaxed">오른쪽에서 오늘 출석한 회원을 탭으로 선택</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="font-bold text-[var(--color-brand-lime)] mb-1">2단계</p>
                <p className="text-white/80 leading-relaxed">왼쪽에서 코트 수와 게임 모드 확인</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="font-bold text-[var(--color-brand-lime)] mb-1">3단계</p>
                <p className="text-white/80 leading-relaxed">하단 &ldquo;게임 시작&rdquo; → 자동 배정 결과 확인</p>
              </div>
            </div>
          </div>
        )}

        {/* 진행 중인 게임 재개 배너 */}
        {inProgressData && onResume && (
          <div className="bg-[var(--color-brand-streak-bg)] border border-[var(--color-brand-streak-soft)]/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--color-brand-streak)] inline-flex items-center gap-1.5">
                <Zap size={14} strokeWidth={2.2} />
                진행 중인 게임 있음
              </p>
              <p className="text-xs text-[var(--color-brand-streak)]/80 mt-0.5">
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
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--color-brand-streak-bg)] text-[var(--color-brand-streak)] text-xs rounded-xl">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── 2-Column 본문 (lg+) / 모바일 스택 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-5">
          {/* ════════════════════════════════════════
              LEFT COLUMN — 게임 설정
          ════════════════════════════════════════ */}
          <div className="space-y-5">
            <h2 className="text-lg font-extrabold text-[#111] hidden lg:block">게임 설정</h2>

            {/* 이벤트 없음 가드: 비데모 + events 0개 */}
            {showEmptyEventGuard ? (
              <div className="flex flex-col items-center justify-center bg-white border border-[#e5e5e5] rounded-2xl p-8 text-center gap-4">
                <CalendarPlus size={36} className="text-[#bbb]" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-bold text-[#111] mb-1">정기 모임이 없습니다</p>
                  <p className="text-xs text-[#999] leading-relaxed">
                    게임보드를 만들려면 먼저 정기 모임을 등록해주세요.
                  </p>
                </div>
                {clubId && (
                  <Link
                    href={`/club/${clubId}/events`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[var(--color-brand-lime)] text-[var(--color-brand-ink)] text-sm font-bold rounded-xl hover:brightness-95 transition-all"
                  >
                    정기 모임 만들기
                  </Link>
                )}
              </div>
            ) : (
              <>
            {/* 정기 모임 선택 */}
            <div>
              <p className="text-xs font-semibold text-[#999] mb-2">정기 모임</p>

              {/* 이벤트 피커 버튼 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setEventPickerOpen(v => !v)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-white text-sm transition-colors text-left',
                    selectedEvent
                      ? 'border-[var(--color-brand-lime)] text-[#111]'
                      : 'border-[#e5e5e5] text-[#999] hover:border-[var(--color-brand-lime)]'
                  )}
                >
                  <span className="truncate">
                    {selectedEvent
                      ? `${formatEventDate(selectedEvent.event_date)} · ${selectedEvent.title}`
                      : '정기 모임을 선택해주세요'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn('shrink-0 ml-2 transition-transform text-[#999]', eventPickerOpen && 'rotate-180')}
                  />
                </button>

                {/* 드롭다운 */}
                {eventPickerOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-[#e5e5e5] rounded-xl shadow-lg overflow-hidden">
                    {events.map(ev => {
                      const isSelected = ev.id === selectedEventId
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => {
                            onEventSelect?.(ev.id)
                            setEventPickerOpen(false)
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--color-surface-sub)] transition-colors text-left',
                            isSelected && 'bg-[#f6ffe0]'
                          )}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#111] truncate">{ev.title}</p>
                            {ev.place && (
                              <p className="text-xs text-[#999] truncate">{ev.place}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-3 shrink-0">
                            <span className="text-xs text-[#555] whitespace-nowrap">
                              {formatEventDate(ev.event_date)}
                            </span>
                            <span className="text-xs bg-[var(--color-surface-muted)] text-[var(--color-brand-text-sub)] px-1.5 py-0.5 rounded">
                              {ev.goingMemberIds.length}명
                            </span>
                            {isSelected && (
                              <Check size={14} className="text-[var(--color-brand-lime)]" strokeWidth={3} />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 선택된 이벤트 RSVP 요약 */}
              {selectedEvent && (
                <p className="text-xs text-[#555] mt-2 pl-1">
                  이 정기 모임에{' '}
                  <span className="font-bold text-[#111]">{selectedEvent.goingMemberIds.length}명</span> 참석 예정
                </p>
              )}
            </div>
            </>
            )}

            {/* 코트 수 — 상한 없음 (clubs.court_count cap 제거) */}
            <div>
              <p className="text-xs font-semibold text-[#999] mb-2">그날 사용할 코트 수</p>
              <div className="bg-white rounded-xl border border-[#e5e5e5] px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-[#555]">코트 수</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onActiveCourtsChange(Math.max(1, activeCourts - 1))}
                    disabled={activeCourts <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5e5e5] text-[#555] hover:border-[var(--color-brand-lime)] disabled:opacity-30 transition-colors"
                    aria-label="코트 수 감소"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-base font-bold text-[#111] w-6 text-center">{activeCourts}</span>
                  <button
                    onClick={() => onActiveCourtsChange(activeCourts + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5e5e5] text-[#555] hover:border-[var(--color-brand-lime)] transition-colors"
                    aria-label="코트 수 증가"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* 게임 모드 — 일반 (active) / 대회 (disabled, 준비중) */}
            <div>
              <p className="text-xs font-semibold text-[#999] mb-2">게임 모드</p>
              <div className="grid grid-cols-2 gap-2">
                {/* 일반 모드 — 항상 active default (gameMode === 'normal') */}
                <button
                  onClick={() => onGameModeChange('normal')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-sm font-bold transition-colors',
                    gameMode === 'normal'
                      ? 'bg-[var(--color-brand-lime)] border-[var(--color-brand-lime)] text-[var(--color-brand-ink)]'
                      : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[var(--color-brand-lime)]'
                  )}
                >
                  <RotateCw size={16} strokeWidth={2.2} />
                  일반 모드
                </button>
                {/* 대회 모드 — 비활성 placeholder ('준비 중') */}
                <button
                  type="button"
                  disabled
                  title="준비 중"
                  aria-disabled="true"
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-[#e5e5e5] bg-white text-muted-foreground text-sm font-bold opacity-60 pointer-events-none cursor-not-allowed"
                >
                  <Trophy size={16} strokeWidth={2.2} className="text-[#999]" />
                  <span className="text-[#999]">대회 모드</span>
                  <span className="text-[10px] font-medium text-[#bbb] ml-1">준비 중</span>
                </button>
              </div>
              {gameMode !== 'normal' && (
                <p className="text-xs text-[#999] mt-2 pl-1 flex items-start gap-1.5">
                  <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" strokeWidth={2} />
                  현재는 일반 모드만 지원됩니다.
                </p>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════
              RIGHT COLUMN — 참가자 설정
          ════════════════════════════════════════ */}
          <div className="space-y-4">
            {/* 참가자 설정 — 회원 불러오기 / 게스트 추가하기 */}
            <div>
              <p className="text-xs font-semibold text-[#999] mb-2">참가자 설정</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleOpenMemberPicker}
                  disabled={members.length === 0}
                  className="flex items-center justify-center gap-2 py-3.5 px-3 rounded-xl bg-[var(--color-brand-ink)] text-white text-sm font-bold hover:bg-[#222] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Users size={16} strokeWidth={2.1} />
                  회원 불러오기
                </button>
                <button
                  onClick={handleOpenGuestAdd}
                  className="flex items-center justify-center gap-2 py-3.5 px-3 rounded-xl border border-[#e5e5e5] bg-white text-[#111] text-sm font-bold hover:border-[var(--color-brand-ink)] transition-colors"
                >
                  <UserPlus2 size={16} strokeWidth={2.1} />
                  게스트 추가하기
                </button>
              </div>
            </div>

            {/* 참가자 선택 헤더 — 라벨 + 카운트 배지 */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#999]">참가자 선택</p>
              <p className="text-xs text-[#999]">
                <span className={cn('font-bold tabular-nums', canStart ? 'text-[#111]' : 'text-[#bbb]')}>
                  {selectedCount}
                </span>
                /{totalEligible}명
              </p>
            </div>

            {/* 빈 상태 — 회원 0명 */}
            {members.length === 0 && tempPlayers.length === 0 ? (
              <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 text-center">
                <UserPlus size={28} className="text-[#bbb] mx-auto mb-3" strokeWidth={1.6} />
                <p className="text-sm font-bold text-[#111] mb-1.5">아직 회원이 없어요</p>
                <p className="text-xs text-[#999] mb-4 leading-relaxed">
                  게임을 시작하려면 먼저 회원을 등록해 주세요.<br />
                  초대코드 또는 엑셀 임포트로 한 번에 추가할 수 있어요.
                </p>
                {clubId && (
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Link
                      href={`/club/${clubId}/settings`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0a0a0a] text-white text-xs font-bold rounded-full hover:bg-[#222] transition-colors"
                    >
                      초대코드 보기
                    </Link>
                    {/* T0-1-3: Stage 0 동안 엑셀 임포트 링크 hide. Stage E 에서 부활. */}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* 레벨 필터 칩 — DATA-DRIVEN: members 에서 등장하는 grade 만 노출 */}
                {gradeBuckets.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {/* 전체 (leftmost, default active) */}
                    <button
                      onClick={() => setGradeFilter('all')}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-sm font-semibold transition-colors',
                        gradeFilter === 'all'
                          ? 'bg-[var(--color-brand-ink)] text-white'
                          : 'bg-white border border-[var(--color-brand-border)] text-[var(--color-text-body)] hover:border-[var(--color-brand-text-muted)]'
                      )}
                    >
                      전체 {members.length + tempPlayers.length}
                    </button>
                    {gradeBuckets.map(({ grade, count }) => {
                      const active = gradeFilter === grade
                      return (
                        <button
                          key={grade}
                          onClick={() => setGradeFilter(grade)}
                          className={cn(
                            'px-3 py-1.5 rounded-md text-sm font-semibold transition-colors inline-flex items-center gap-1.5',
                            active
                              ? 'bg-[var(--color-brand-ink)] text-white'
                              : 'bg-white border border-[var(--color-brand-border)] text-[var(--color-text-body)] hover:border-[var(--color-brand-text-muted)]'
                          )}
                        >
                          <span className={cn('font-extrabold', active ? 'text-white' : GRADE_LETTER_COLOR[grade])}>
                            {gradeDisplayLetter(grade)}
                          </span>
                          <span className={cn('tabular-nums', active ? 'text-white/80' : 'text-[var(--color-brand-text-sub)]')}>
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* 카드 그리드 — 2-column, scrollable */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-1">
                  {visibleEntries.length === 0 ? (
                    <p className="col-span-full text-xs text-[#bbb] text-center py-6">
                      이 급수에 해당하는 참가자가 없어요
                    </p>
                  ) : (
                    visibleEntries.map(entry => {
                      const isOn = selectedPlayers.has(entry.id)
                      const isGuest = entry.kind === 'guest'
                      const grade = entry.grade
                      return (
                        <div
                          key={entry.id}
                          onClick={() => onTogglePlayer(entry.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onTogglePlayer(entry.id)
                            }
                          }}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl border bg-white transition-colors cursor-pointer select-none',
                            isOn
                              ? 'border-[var(--color-brand-lime)] bg-[#fafffa]'
                              : 'border-[var(--color-brand-border)] hover:border-[var(--color-brand-text-muted)]'
                          )}
                        >
                          {/* 라디오 (체크) */}
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors',
                              isOn
                                ? 'bg-[var(--color-brand-lime)] border-[var(--color-brand-lime)]'
                                : 'border-[var(--color-brand-border)] bg-white'
                            )}
                          >
                            {isOn && <Check size={12} className="text-[var(--color-brand-ink)]" strokeWidth={3.5} />}
                          </div>

                          {/* 등급 letter 배지 (회원만) — zinc-100 배경 + 컬러 letter */}
                          {grade ? (
                            <div className="w-7 h-7 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center shrink-0">
                              <span className={cn('text-[12px] font-extrabold leading-none', GRADE_LETTER_COLOR[grade])}>
                                {gradeDisplayLetter(grade)}
                              </span>
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-[var(--color-brand-text-muted)] leading-none">G</span>
                            </div>
                          )}

                          {/* 이름 */}
                          <span className="flex-1 text-base font-semibold text-[#111] truncate">
                            {entry.name}
                          </span>

                          {/* 역할 배지 */}
                          <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface-muted)] text-[var(--color-brand-text-sub)] shrink-0">
                            {isGuest ? '게스트' : '회원'}
                          </span>

                          {/* 게스트 제거 버튼 (게스트만, 우측 끝) */}
                          {isGuest && (
                            <button
                              onClick={e => { e.stopPropagation(); onRemoveTempPlayer(entry.id) }}
                              className="text-[var(--color-brand-text-muted)] hover:text-[var(--color-text-body)] transition-colors -mr-1 px-1"
                              aria-label={`${entry.name} 제거`}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                {!canStart && selectedCount > 0 && (
                  <p className="text-xs text-[#aaa] text-center">최소 4명 이상 선택해주세요</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* 게임 시작 버튼 — 풀폭 하단 (셋업 → 게임 시작 → 플레이) */}
        <button
          onClick={onStartGame}
          disabled={!canStartGame || isPending}
          className="w-full py-4 bg-[var(--color-brand-lime)] text-[var(--color-brand-ink)] font-extrabold text-base rounded-2xl hover:brightness-95 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[var(--color-brand-ink)] border-t-transparent rounded-full animate-spin" />
              시작 중...
            </span>
          ) : !selectedEventId ? (
            '정기 모임을 선택해주세요'
          ) : !canStart ? (
            `4명 이상 선택 필요 (현재 ${selectedCount}명)`
          ) : (
            <span className="inline-flex items-center gap-2">
              <CalendarPlus size={18} strokeWidth={2} />
              게임 시작
            </span>
          )}
        </button>
      </div>

      {/* 모달 */}
      <MemberPickerModal
        open={memberPickerOpen}
        members={members}
        alreadySelectedIds={selectedPlayers}
        onClose={() => setMemberPickerOpen(false)}
        onConfirm={(ids) => {
          ids.forEach(onTogglePlayer)
          setMemberPickerOpen(false)
        }}
      />
      <GuestAddModal
        open={guestAddOpen}
        onClose={() => setGuestAddOpen(false)}
        onConfirm={(guests) => {
          guests.forEach(g => onAddTempPlayer(g))
          setGuestAddOpen(false)
        }}
      />
    </div>
  )
}
