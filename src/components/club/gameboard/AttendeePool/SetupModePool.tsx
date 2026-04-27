'use client'

import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GradeBadge } from '@/components/club/GradeBadge'
import { buildRankMap, scoreToGrade } from '@/lib/club/grade'
import type { ClubMemberWithUser } from '@/types/club'
import { FilterChips } from './FilterChips'
import type { GradeFilter } from './shared'

/**
 * Setup 모드 회원 풀 — 토글 그리드 (출석자 선택, lime 강조).
 *
 * 8명 이상일 때 등급 필터 칩이 자동 노출됩니다.
 */
export function SetupModePool({
  members,
  selectedPlayers,
  onTogglePlayer,
}: {
  members: ClubMemberWithUser[]
  selectedPlayers: Set<string>
  onTogglePlayer: (memberId: string) => void
}) {
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all')
  const rankMap = useMemo(() => buildRankMap(members), [members])

  const gradeCounts = useMemo(() => {
    const counts: Record<GradeFilter, number> = {
      all: members.length, S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0,
    }
    for (const m of members) counts[scoreToGrade(m.skill_score)]++
    return counts
  }, [members])

  const visibleMembers = useMemo(() => {
    if (gradeFilter === 'all') return members
    return members.filter(m => scoreToGrade(m.skill_score) === gradeFilter)
  }, [members, gradeFilter])

  return (
    <>
      {members.length >= 8 && (
        <FilterChips counts={gradeCounts} value={gradeFilter} onChange={setGradeFilter} />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {visibleMembers.length === 0 && (
          <p className="col-span-full text-xs text-[#bbb] text-center py-4">
            이 급수에 해당하는 회원이 없어요
          </p>
        )}
        {visibleMembers.map(member => {
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
    </>
  )
}
