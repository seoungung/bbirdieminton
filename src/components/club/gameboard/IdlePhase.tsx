'use client'

import { useState } from 'react'
import { Settings, X, Plus, AlertCircle } from 'lucide-react'
import type { InProgressData, RecentSessionData, AssignMode } from './types'

interface Props {
  inProgressData?: InProgressData | null
  recentSessions: RecentSessionData[]
  error: string | null
  courtCount: number
  defaultAssignMode: AssignMode
  onDefaultAssignModeChange: (v: AssignMode) => void
  onNewGame: () => void
  onResume: () => void
}

const ASSIGN_OPTIONS: { value: AssignMode; label: string; desc: string }[] = [
  { value: 'random', label: '랜덤', desc: '완전 무작위로 팀을 구성해요' },
  { value: 'skill_balance', label: '실력 균형', desc: '실력 점수 기반 스네이크 분배' },
  { value: 'game_count', label: '게임수 균등', desc: '게임 적게 한 플레이어 우선 배정' },
  { value: 'smart', label: '🧠 스마트', desc: '게임수 균등 + 파트너 중복 회피' },
]

export function IdlePhase({
  inProgressData,
  recentSessions,
  error,
  courtCount,
  defaultAssignMode,
  onDefaultAssignModeChange,
  onNewGame,
  onResume,
}: Props) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
      <div className="max-w-[1088px] mx-auto px-4 pt-6 pb-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-extrabold text-[#111]">게임보드</h1>
            <p className="text-sm text-[#999]">실시간으로 코트를 관리하고 경기를 진행하세요</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#e5e5e5] bg-white text-[#555] hover:border-[#beff00] hover:text-[#111] transition-colors"
          >
            <Settings size={17} />
          </button>
        </div>

        {/* 에러 */}
        {error && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* 새 게임 만들기 */}
        <button
          onClick={onNewGame}
          className="w-full bg-[#0a0a0a] text-white rounded-2xl p-6 flex items-center justify-between hover:bg-[#1a1a1a] active:scale-[0.99] transition-all mb-5"
        >
          <div className="text-left">
            <p className="text-lg font-extrabold mb-1">🏸 새 게임 만들기</p>
            <p className="text-sm text-white/50">참가자를 선택하고 바로 시작</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#beff00] flex items-center justify-center shrink-0">
            <Plus size={20} className="text-[#111]" />
          </div>
        </button>

        {/* 진행 중인 게임 재개 */}
        {inProgressData && (
          <div className="mb-5 bg-[#fff8e1] border border-[#ffe082] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#b8860b]">⚡ 진행 중인 게임 있음</p>
              <p className="text-xs text-[#b8860b]/80 mt-0.5">
                {new Date(inProgressData.sessionDate).toLocaleDateString('ko-KR', {
                  month: 'long', day: 'numeric', weekday: 'short',
                })} · {inProgressData.attendeeMemberIds.length}명 참여
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

        {/* 최근 게임 기록 */}
        {recentSessions.length > 0 ? (
          <div>
            <p className="text-xs font-semibold text-[#999] mb-3">최근 게임 기록</p>
            <div className="space-y-2">
              {recentSessions.map(({ session, attendeeCount }) => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl border border-[#e5e5e5] px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#111]">
                      {new Date(session.session_date).toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </p>
                    <p className="text-xs text-[#999] mt-0.5">{attendeeCount}명 참여</p>
                  </div>
                  <span className="text-xs text-[#ccc]">종료됨</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-14 text-[#ccc]">
            <p className="text-5xl mb-3">🏸</p>
            <p className="text-sm font-semibold">아직 게임 기록이 없어요</p>
            <p className="text-xs mt-1.5">새 게임을 만들어 시작해보세요!</p>
          </div>
        )}

        {/* 설정 패널 */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
            <div className="bg-white rounded-t-3xl w-full max-w-lg pb-safe">
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#f0f0f0]">
                <h3 className="font-bold text-[#111] text-base">게임보드 설정</h3>
                <button onClick={() => setShowSettings(false)} className="text-[#bbb] hover:text-[#555]">
                  <X size={20} />
                </button>
              </div>
              <div className="px-5 py-5 space-y-5">
                {/* 기본 팀 배정 방식 */}
                <div>
                  <p className="text-xs font-bold text-[#999] mb-2">기본 팀 배정 방식</p>
                  <p className="text-xs text-[#bbb] mb-3">새 게임 시작 시 자동으로 선택돼요</p>
                  <div className="space-y-2">
                    {ASSIGN_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => onDefaultAssignModeChange(opt.value)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                          defaultAssignMode === opt.value
                            ? 'border-[#111] bg-[#f8f8f8]'
                            : 'border-[#e5e5e5] hover:border-[#ccc]'
                        }`}
                      >
                        <div className="text-left">
                          <p className={`text-sm font-semibold ${defaultAssignMode === opt.value ? 'text-[#111]' : 'text-[#555]'}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-[#999] mt-0.5">{opt.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          defaultAssignMode === opt.value ? 'border-[#111] bg-[#111]' : 'border-[#ddd]'
                        }`}>
                          {defaultAssignMode === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 코트 정보 */}
                <div>
                  <p className="text-xs font-bold text-[#999] mb-2">코트 정보</p>
                  <div className="bg-[#f8f8f8] rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-[#555]">등록된 코트 수</span>
                    <span className="text-sm font-bold text-[#111]">{courtCount}면</span>
                  </div>
                  <p className="text-xs text-[#bbb] mt-2">코트 수는 모임 설정에서 변경할 수 있어요</p>
                </div>

                {/* 임시 참가자 안내 */}
                <div>
                  <p className="text-xs font-bold text-[#999] mb-2">임시 참가자</p>
                  <div className="bg-[#f8f8f8] rounded-xl px-4 py-3">
                    <p className="text-sm text-[#555]">게임 설정 화면에서 이름을 입력해</p>
                    <p className="text-sm text-[#555]">클럽 외 인원도 참여시킬 수 있어요</p>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3.5 bg-[#0a0a0a] text-white font-bold text-sm rounded-xl hover:bg-[#1a1a1a] transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
