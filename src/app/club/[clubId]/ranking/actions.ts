'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 경기 결과 저장 후 player_stats 업데이트
 * DB RPC(update_player_stats_for_match)를 호출하여 트랜잭션 + FOR UPDATE 잠금으로
 * race condition 없이 원자적으로 처리.
 *
 * - prevScoreA/B: 이전 점수 (처음 저장이면 null)
 * - newScoreA/B: 새 점수
 * - 무승부(동점)는 draws++ / games_played++로 정상 집계됨
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

  const { error } = await supabase.rpc('update_player_stats_for_match', {
    p_match_id:     matchId,
    p_club_id:      clubId,
    p_prev_score_a: prevScoreA,
    p_prev_score_b: prevScoreB,
    p_new_score_a:  newScoreA,
    p_new_score_b:  newScoreB,
  })

  if (error) {
    console.error('update_player_stats_for_match RPC error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/club/${clubId}/ranking`)
  revalidatePath(`/club/${clubId}`)
  return { success: true }
}
