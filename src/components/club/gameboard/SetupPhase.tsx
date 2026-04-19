'use client'

import { useState } from 'react'
import { ArrowLeft, ChevronDown, AlertCircle, Check, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClubMemberWithUser } from '@/types/club'
import type { SetupSource, AssignMode, GameMode, RecentSessionData, InProgressData } from './types'

interface Props {
  members: ClubMemberWithUser[]
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

const ASSIGN_OPTS: { value: AssignMode; label: string; emoji: string; desc: string }[] = [
  { value: 'random',        label: '랜덤',      emoji: '🎲', desc: '무작위 배정' },
  { value: 'skill_balance', label: '실력 균등', emoji: '⚖️', desc: '실력 점수 기반' },
  { value: 'game_count',    label: '게임수 균등', emoji: '🔢', desc: '최소 게임수 우선' },
  { value: 'smart',         label: '스마트',    emoji: '🧠', desc: '파트너 중복 회피' },
]

export function SetupPhase({
  members,
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

  const selectedCount = selectedPlayers.size
  const canStart = selectedCount >= 4

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
            className="flex items-center gap-1.5 text-[#555] hover:text-[#111] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">모임으로</span>
          </button>
          <span className="text-base font-bold text-[#111]">게임 설정</span>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-[1088px] mx-auto px-4 py-5 space-y-5">
        {/* 진행 중인 게임 재개 배너 */}
        {inProgressData && onResume && (
          <div className="bg-[#fff8e1] border border-[#ffe082] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#b8860b]">⚡ 진행 중인 게임 있음</p>
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

          {members.length === 0 ? (
            <p className="text-sm text-[#bbb] text-center py-6">모임에 멤버가 없어요</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {members.map((member) => {
                const isOn = selectedPlayers.has(member.id)
                return (
                  <button
                    key={member.id}
                    onClick={() => onTogglePlayer(member.id)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors',
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
                    <span className="text-sm font-semibold truncate">
                      {member.user?.name ?? '?'}
                    </span>
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

        {/* 게임 모드 */}
        <div>
          <p className="text-xs font-semibold text-[#999] mb-2">게임 모드</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'normal',        emoji: '🔄', label: '일반 로테이션', desc: '모든 플레이어 순환 참여' },
              { value: 'king_of_court', emoji: '👑', label: '킹 오브 코트',  desc: '승자 유지, 도전자 교체' },
            ] as { value: GameMode; emoji: string; label: string; desc: string }[]).map(opt => (
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
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-[11px] font-bold leading-none">{opt.label}</span>
                <span className="text-[10px] text-[#999] leading-tight">{opt.desc}</span>
              </button>
            ))}
          </div>
          {gameMode === 'king_of_court' && (
            <p className="text-xs text-[#999] mt-2 pl-1">
              ⚠️ 킹 오브 코트 모드에서는 승리 팀이 코트를 지키고, 패배 팀과 대기 중인 도전자가 교체됩니다.
            </p>
          )}
        </div>

        {/* 팀 배정 방식 */}
        <div>
          <p className="text-xs font-semibold text-[#999] mb-2">팀 배정 방식</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ASSIGN_OPTS.map(({ value, label, emoji, desc }) => (
              <button
                key={value}
                onClick={() => onAssignModeChange(value)}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-colors',
                  assignMode === value
                    ? 'bg-[#beff00] border-[#beff00] text-[#111]'
                    : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#beff00]'
                )}
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-[11px] font-bold leading-none">{label}</span>
                <span className="text-[10px] text-[#999] leading-tight">{desc}</span>
              </button>
            ))}
          </div>
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
            `🏸 ${selectedCount}명으로 게임 시작`
          )}
        </button>
      </div>
    </div>
  )
}
