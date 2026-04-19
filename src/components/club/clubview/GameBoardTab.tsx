'use client'

import Link from 'next/link'
import type { UserStatus, GameSessionItem } from './types'

interface Props {
  userStatus: UserStatus
  clubId: string
  gameSessions: GameSessionItem[]
}

const FEATURES = [
  { icon: '🏸', label: '대진표 자동 생성' },
  { icon: '📊', label: '실시간 점수 기록' },
  { icon: '🏆', label: '랭킹 자동 집계' },
  { icon: '👥', label: '팀 매칭 최적화' },
]

function statusLabel(status: GameSessionItem['status']) {
  if (status === 'open') return '진행 중'
  if (status === 'in_progress') return '경기 중'
  return '완료'
}

function statusClass(status: GameSessionItem['status']) {
  if (status === 'open') return 'bg-[#beff00]/20 text-[#5a7a00]'
  if (status === 'in_progress') return 'bg-blue-50 text-blue-600'
  return 'bg-[#f0f0f0] text-[#999]'
}

export function GameBoardTab({ userStatus, clubId, gameSessions }: Props) {
  const isMember = userStatus === 'member' || userStatus === 'demo'

  // 게임 기록이 있을 때 — 세션 히스토리만 표시 (입장 버튼은 상단 헤더에 있음)
  if (gameSessions.length > 0) {
    return (
      <section className="space-y-3">
        <p className="text-xs font-bold text-[#999] mb-1">게임 기록 {gameSessions.length}개</p>
        {gameSessions.map(s => (
          <div
            key={s.id}
            className="bg-white border border-[#e5e5e5] rounded-2xl px-4 py-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-[#111]">
                {new Date(s.sessionDate).toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                })}
              </p>
              {s.notes && (
                <p className="text-xs text-[#999] mt-0.5 line-clamp-1">{s.notes}</p>
              )}
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusClass(s.status)}`}>
              {statusLabel(s.status)}
            </span>
          </div>
        ))}
      </section>
    )
  }

  // 게임 기록 없음 — 기능 소개 카드
  return (
    <section className="bg-white border border-[#e5e5e5] rounded-2xl p-6">
      <div className="text-center mb-6">
        <p className="text-5xl mb-3">🎮</p>
        <h2 className="text-xl font-bold text-[#111] mb-2">게임보드</h2>
        <p className="text-base text-[#666]">실시간 대진, 점수, 랭킹을 한 곳에서 관리해요</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {FEATURES.map(f => (
          <div key={f.label} className="bg-[#f8f8f8] rounded-xl p-3.5 flex items-center gap-2.5">
            <span className="text-xl">{f.icon}</span>
            <span className="text-sm font-semibold text-[#555]">{f.label}</span>
          </div>
        ))}
      </div>

      {/* 멤버·체험 유저: 위 헤더 버튼으로 입장 안내 */}
      {isMember && (
        <p className="text-center text-sm text-[#bbb]">
          위 <span className="font-semibold text-[#111]">게임보드 입장</span> 버튼을 눌러 시작하세요
        </p>
      )}

      {/* 비멤버 유저: 참여 유도 */}
      {!isMember && (
        <Link
          href="/club/join"
          className="flex items-center justify-center w-full bg-[#beff00] text-[#111] font-extrabold text-base py-3.5 rounded-2xl hover:brightness-95 transition-all"
        >
          초대코드로 참여하기
        </Link>
      )}
    </section>
  )
}
