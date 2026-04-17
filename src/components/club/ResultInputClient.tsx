'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updatePlayerStatsForMatch } from '@/app/club/[clubId]/ranking/actions'

interface MatchPlayer {
  id: string
  team: 'A' | 'B'
  member: {
    id: string
    user: { name: string; profile_img: string | null }
  }
}

interface MatchRow {
  id: string
  court_number: number
  team_a_score: number | null
  team_b_score: number | null
  match_players: MatchPlayer[]
}

interface Props {
  sessionId: string
  clubId: string
  matches: MatchRow[]
  isManager: boolean
}

export function ResultInputClient({ sessionId, clubId, matches, isManager }: Props) {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, { a: string; b: string }>>(() => {
    const init: Record<string, { a: string; b: string }> = {}
    for (const m of matches) {
      init[m.id] = {
        a: m.team_a_score != null ? String(m.team_a_score) : '',
        b: m.team_b_score != null ? String(m.team_b_score) : '',
      }
    }
    return init
  })
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const setScore = (matchId: string, side: 'a' | 'b', val: string) => {
    if (!isManager) return
    setScores((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [side]: val } }))
  }

  const hasExistingScores = matches.some(m => m.team_a_score !== null || m.team_b_score !== null)

  // 저장 전 DB 점수 (재수정 시 역집계용)
  const originalScores: Record<string, { a: number | null; b: number | null }> = Object.fromEntries(
    matches.map((m) => [m.id, { a: m.team_a_score, b: m.team_b_score }])
  )

  const handleSave = () => {
    startTransition(async () => {
      const supabase = createClient()
      for (const [matchId, score] of Object.entries(scores)) {
        const a = parseInt(score.a, 10)
        const b = parseInt(score.b, 10)
        if (!isNaN(a) && !isNaN(b)) {
          await supabase
            .from('matches')
            .update({ team_a_score: a, team_b_score: b })
            .eq('id', matchId)
          // 스탯 업데이트 (fire-and-forget)
          updatePlayerStatsForMatch(
            matchId,
            clubId,
            originalScores[matchId]?.a ?? null,
            originalScores[matchId]?.b ?? null,
            a,
            b,
          ).catch(console.error)
        }
      }

      // 세션 상태 closed로 변경
      await supabase
        .from('sessions')
        .update({ status: 'closed' })
        .eq('id', sessionId)

      setSaved(true)
      if (!hasExistingScores) {
        router.push(`/club/${clubId}/ranking`)
      } else {
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🏸</p>
        <p className="font-bold text-[#111]">배정된 경기가 없어요</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-[#999] underline underline-offset-2"
        >
          경기 배정으로
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const teamA = match.match_players.filter((p) => p.team === 'A')
        const teamB = match.match_players.filter((p) => p.team === 'B')
        const score = scores[match.id] ?? { a: '', b: '' }
        const aWin =
          score.a !== '' && score.b !== '' && parseInt(score.a) > parseInt(score.b)
        const bWin =
          score.a !== '' && score.b !== '' && parseInt(score.b) > parseInt(score.a)

        return (
          <div
            key={match.id}
            className="bg-white border border-[#e5e5e5] rounded-2xl p-4"
          >
            <p className="text-xs font-bold text-[#999] mb-3">코트 {match.court_number}</p>

            <div className="flex items-center gap-3">
              {/* 팀 A */}
              <div className={`flex-1 rounded-xl p-3 text-center ${aWin ? 'bg-[#beff00]/15 border border-[#beff00]' : 'bg-[#f8f8f8]'}`}>
                <p className="text-xs font-bold text-blue-500 mb-2">팀 A</p>
                {teamA.map((p) => (
                  <p key={p.id} className="text-xs text-[#555] truncate">
                    {p.member.user.name}
                  </p>
                ))}
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={score.a}
                  onChange={(e) => setScore(match.id, 'a', e.target.value)}
                  disabled={!isManager}
                  placeholder="0"
                  className="mt-2 w-full text-center text-2xl font-bold text-[#111] bg-transparent border-b-2 border-[#e5e5e5] focus:border-[#beff00] focus:outline-none transition-colors py-1 disabled:text-[#bbb]"
                />
              </div>

              <span className="text-sm font-bold text-[#bbb]">vs</span>

              {/* 팀 B */}
              <div className={`flex-1 rounded-xl p-3 text-center ${bWin ? 'bg-[#beff00]/15 border border-[#beff00]' : 'bg-[#f8f8f8]'}`}>
                <p className="text-xs font-bold text-orange-500 mb-2">팀 B</p>
                {teamB.map((p) => (
                  <p key={p.id} className="text-xs text-[#555] truncate">
                    {p.member.user.name}
                  </p>
                ))}
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={score.b}
                  onChange={(e) => setScore(match.id, 'b', e.target.value)}
                  disabled={!isManager}
                  placeholder="0"
                  className="mt-2 w-full text-center text-2xl font-bold text-[#111] bg-transparent border-b-2 border-[#e5e5e5] focus:border-[#beff00] focus:outline-none transition-colors py-1 disabled:text-[#bbb]"
                />
              </div>
            </div>
          </div>
        )
      })}

      {isManager && (
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full py-4 bg-[#beff00] text-[#111] font-bold rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
        >
          {isPending ? '저장 중...' : saved ? '저장 완료 ✓' : hasExistingScores ? '점수 수정 저장' : '결과 저장 · 랭킹 확인'}
        </button>
      )}
    </div>
  )
}
