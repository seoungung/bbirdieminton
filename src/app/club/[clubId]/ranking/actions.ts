'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 경기 결과 저장 후 player_stats 업데이트
 * - prevScoreA/B: 이전 점수 (처음 저장이면 null)
 * - newScoreA/B: 새 점수
 * - draw는 승/패 모두 카운트 안 함
 */
export async function updatePlayerStatsForMatch(
  matchId: string,
  clubId: string,
  prevScoreA: number | null,
  prevScoreB: number | null,
  newScoreA: number,
  newScoreB: number,
) {
  const supabase = await createClient()

  // 제외 플래그 + 선수 목록 조회
  const { data: match } = await supabase
    .from('matches')
    .select('excluded_from_ranking')
    .eq('id', matchId)
    .single()

  if (!match || match.excluded_from_ranking) return { success: true }

  const { data: matchPlayers } = await supabase
    .from('match_players')
    .select('member_id, team')
    .eq('match_id', matchId)

  if (!matchPlayers?.length) return { success: true }

  for (const player of matchPlayers) {
    // 현재 스탯 조회
    const { data: existing } = await supabase
      .from('player_stats')
      .select('wins, losses, games_played')
      .eq('club_id', clubId)
      .eq('member_id', player.member_id)
      .maybeSingle()

    let wins  = existing?.wins  ?? 0
    let losses = existing?.losses ?? 0

    // 이전 기여 역집계 (재수정 시)
    if (prevScoreA !== null && prevScoreB !== null) {
      const oldWon  = player.team === 'A' ? prevScoreA > prevScoreB : prevScoreB > prevScoreA
      const oldLost = player.team === 'A' ? prevScoreB > prevScoreA : prevScoreA > prevScoreB
      if (oldWon)  wins   = Math.max(0, wins  - 1)
      if (oldLost) losses = Math.max(0, losses - 1)
    }

    // 새 기여 집계
    const newWon  = player.team === 'A' ? newScoreA > newScoreB : newScoreB > newScoreA
    const newLost = player.team === 'A' ? newScoreB > newScoreA : newScoreA > newScoreB
    if (newWon)  wins++
    if (newLost) losses++

    const games_played = wins + losses
    const win_rate = games_played > 0 ? wins / games_played : 0

    await supabase
      .from('player_stats')
      .upsert(
        {
          club_id:     clubId,
          member_id:   player.member_id,
          wins,
          losses,
          games_played,
          win_rate,
          updated_at:  new Date().toISOString(),
        },
        { onConflict: 'club_id,member_id' }
      )
  }

  revalidatePath(`/club/${clubId}/ranking`)
  return { success: true }
}
