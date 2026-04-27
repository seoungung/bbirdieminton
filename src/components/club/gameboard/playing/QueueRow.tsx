'use client'

import { Crown } from 'lucide-react'
import { GradeBadge } from '@/components/club/GradeBadge'
import type { PlayerEntry, GameMode } from '../types'

/** 대기열 단일 행 컴포넌트 */
export function QueueRow({
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
