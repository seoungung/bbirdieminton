'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, Play } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  skillBalanceMatch,
  gameCountMatch,
  randomMatch,
} from '@/lib/club/matching'
import type {
  ClubMember,
  ClubMemberWithUser,
  CourtAssignment,
  MatchMode,
  PlayerStats,
} from '@/types/club'

interface Props {
  sessionId: string
  clubId: string
  matchMode: MatchMode
  courtCount: number
  attendedMembers: ClubMemberWithUser[]
  existingMatches: unknown[]
  stats: PlayerStats[]
}

export function MatchAssignClient({
  sessionId,
  clubId,
  matchMode,
  courtCount,
  attendedMembers,
  stats,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [courts, setCourts] = useState<CourtAssignment[]>(() =>
    generateCourts(matchMode, attendedMembers, stats, courtCount)
  )
  const [customDrag, setCustomDrag] = useState<string | null>(null)

  function regenerate() {
    setCourts(generateCourts(matchMode, attendedMembers, stats, courtCount))
  }

  function handleSave() {
    startTransition(async () => {
      const supabase = createClient()

      for (const court of courts) {
        // 경기 행 생성
        const { data: match, error } = await supabase
          .from('matches')
          .insert({ session_id: sessionId, court_number: court.courtNumber })
          .select('id')
          .single()

        if (error || !match) continue

        // 선수 배정
        const players = [
          ...court.teamA.map((m) => ({ match_id: match.id, member_id: m.id, team: 'A' })),
          ...court.teamB.map((m) => ({ match_id: match.id, member_id: m.id, team: 'B' })),
        ]
        await supabase.from('match_players').insert(players)
      }

      router.push(`/club/${clubId}/session/${sessionId}/result`)
    })
  }

  if (attendedMembers.length < 4) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">😅</p>
        <p className="font-bold text-[#111]">출석 인원이 부족해요</p>
        <p className="text-sm text-[#999] mt-1">경기 배정에는 최소 4명이 필요합니다</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-[#999] underline underline-offset-2"
        >
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* 재배정 버튼 */}
      {matchMode !== 'custom' && (
        <button
          onClick={regenerate}
          className="flex items-center gap-2 text-sm font-semibold text-[#555] border border-[#e5e5e5] px-4 py-2 rounded-xl hover:bg-[#f8f8f8] transition-colors"
        >
          <RotateCcw size={14} />
          다시 배정
        </button>
      )}

      {/* 코트별 배정 결과 */}
      {courts.map((court) => (
        <div key={court.courtNumber} className="bg-white border border-[#e5e5e5] rounded-2xl p-4">
          <p className="text-xs font-bold text-[#999] mb-3">코트 {court.courtNumber}</p>
          <div className="grid grid-cols-2 gap-3">
            <TeamColumn label="팀 A" members={court.teamA} color="bg-blue-50 text-blue-600" />
            <TeamColumn label="팀 B" members={court.teamB} color="bg-orange-50 text-orange-600" />
          </div>
        </div>
      ))}

      {/* 대기 인원 */}
      {attendedMembers.length > courtCount * 4 && (
        <div className="bg-[#f8f8f8] border border-dashed border-[#bbb] rounded-2xl p-4">
          <p className="text-xs font-bold text-[#999] mb-2">
            대기 ({attendedMembers.length - courtCount * 4}명)
          </p>
          <div className="flex flex-wrap gap-2">
            {attendedMembers.slice(courtCount * 4).map((m) => (
              <span
                key={m.id}
                className="text-xs bg-white border border-[#e5e5e5] px-2.5 py-1 rounded-full text-[#555]"
              >
                {m.user.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isPending || courts.length === 0}
        className="w-full flex items-center justify-center gap-2 py-4 bg-[#beff00] text-[#111] font-bold rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
      >
        <Play size={16} />
        {isPending ? '저장 중...' : '경기 시작'}
      </button>
    </div>
  )
}

function TeamColumn({
  label,
  members,
  color,
}: {
  label: string
  members: ClubMemberWithUser[] | ClubMember[]
  color: string
}) {
  return (
    <div>
      <p className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block mb-2 ${color}`}>
        {label}
      </p>
      <div className="space-y-1.5">
        {members.map((m) => {
          const withUser = m as ClubMemberWithUser
          const name = withUser.user?.name ?? m.id.slice(0, 6)
          const img = withUser.user?.profile_img ?? null
          return (
            <div
              key={m.id}
              className="flex items-center gap-2 bg-[#f8f8f8] rounded-xl px-2.5 py-2"
            >
              <div className="w-6 h-6 rounded-full bg-[#e5e5e5] flex items-center justify-center text-xs font-bold text-[#555] shrink-0 overflow-hidden">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="w-full h-full object-cover" />
                ) : (
                  name.slice(0, 1)
                )}
              </div>
              <span className="text-xs font-semibold text-[#111] truncate">{name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function generateCourts(
  mode: MatchMode,
  members: ClubMemberWithUser[],
  stats: PlayerStats[],
  courtCount: number
): CourtAssignment[] {
  if (mode === 'skill_balance') return skillBalanceMatch(members, courtCount)
  if (mode === 'game_count') return gameCountMatch(members, stats, courtCount)
  if (mode === 'random') return randomMatch(members, courtCount)
  // custom: 기본값으로 랜덤 배정 후 수동 조정
  return randomMatch(members, courtCount)
}
