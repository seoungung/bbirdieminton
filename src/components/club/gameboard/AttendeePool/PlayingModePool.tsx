'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { GradeBadge } from '@/components/club/GradeBadge'
import { scoreToGrade } from '@/lib/club/grade'
import type { PlayerEntry } from '../types'
import { FilterChips } from './FilterChips'
import type { GradeFilter } from './shared'

/**
 * Playing 모드 회원 풀 — 읽기 전용 칩 strip.
 * 칩 색은 status 기반: 경기 중(court green) / 대기 중(neutral).
 *
 * 8명 이상일 때 등급 필터 칩이 자동 노출됩니다.
 */
export function PlayingModePool({ players }: { players: PlayerEntry[] }) {
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all')

  const gradeCounts = useMemo(() => {
    const counts: Record<GradeFilter, number> = {
      all: players.length, S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0,
    }
    for (const p of players) counts[scoreToGrade(p.skillScore)]++
    return counts
  }, [players])

  const visiblePlayers = useMemo(() => {
    if (gradeFilter === 'all') return players
    return players.filter(p => scoreToGrade(p.skillScore) === gradeFilter)
  }, [players, gradeFilter])

  const playingCount = players.filter(p => p.status === 'playing').length
  const waitingCount = players.length - playingCount

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
            <span className="w-1.5 h-1.5 rounded-full bg-brand-court" />
            <span className="text-brand-court-deep font-bold">{playingCount}</span>
          </span>
          <span className="text-[#ccc]">·</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bbb]" />
            <span className="text-[#555] font-bold">{waitingCount}</span>
          </span>
        </div>
      </div>

      {players.length >= 8 && (
        <FilterChips counts={gradeCounts} value={gradeFilter} onChange={setGradeFilter} />
      )}

      <div className="flex flex-wrap gap-2">
        {visiblePlayers.length === 0 ? (
          <p className="w-full text-xs text-[#bbb] text-center py-3">
            이 급수에 해당하는 참가자가 없어요
          </p>
        ) : (
          visiblePlayers.map(p => {
            const isPlaying = p.status === 'playing'
            const isTemp = p.memberId.startsWith('temp-')
            return (
              <span
                key={p.memberId}
                aria-label={`${p.name} ${isPlaying ? '경기 중' : '대기 중'}`}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold',
                  isPlaying
                    ? 'bg-brand-court-bg border-brand-court-soft text-brand-court-deep'
                    : 'bg-[#f8f8f8] border-[#e5e5e5] text-[#555]'
                )}
              >
                {isTemp ? (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-gray-100 text-gray-400 text-[9px] font-extrabold shrink-0">
                    ?
                  </span>
                ) : (
                  <GradeBadge score={p.skillScore} size="xs" />
                )}
                <span className="truncate max-w-[8rem]">{p.name}</span>
                <span
                  className={cn(
                    'text-[9px] tabular-nums',
                    isPlaying ? 'text-brand-court-deep/70' : 'text-[#aaa]'
                  )}
                >
                  {p.todayGames}
                </span>
              </span>
            )
          })
        )}
      </div>
    </div>
  )
}
