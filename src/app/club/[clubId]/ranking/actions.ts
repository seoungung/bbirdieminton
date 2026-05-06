'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { updateRating, type Rating } from '@/lib/club/glicko2'

/**
 * 경기 결과 저장 후 player_stats 업데이트
 * DB RPC(update_player_stats_for_match)를 호출하여 트랜잭션 + FOR UPDATE 잠금으로
 * race condition 없이 원자적으로 처리.
 *
 * - prevScoreA/B: 이전 점수 (처음 저장이면 null)
 * - newScoreA/B: 새 점수
 * - 무승부(동점)는 draws++ / games_played++로 정상 집계됨
 *
 * 첫 점수 저장(prevScoreA === null)에 한해 Glicko-2 레이팅도 동시 갱신.
 * 재편집은 player_stats만 정정하고 레이팅은 손대지 않음(이중 적용 방지).
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

  if (prevScoreA === null && prevScoreB === null) {
    await applyGlickoForMatch(matchId, newScoreA, newScoreB)
  }

  // 매치 결과는 여러 페이지에 영향 — Glicko 갱신이 본인 카드/통계/리포트/게임보드에 반영
  revalidatePath(`/club/${clubId}`)
  revalidatePath(`/club/${clubId}/ranking`)
  revalidatePath(`/club/${clubId}/me`)
  revalidatePath(`/club/${clubId}/stats`)
  revalidatePath(`/club/${clubId}/report`)
  revalidatePath(`/club/${clubId}/gameboard`)
  return { success: true }
}

/**
 * 한 경기의 모든 멤버 Glicko-2 레이팅을 갱신.
 *
 * 흐름:
 * 1. glicko2_prepare_match RPC → 양 팀 레이팅 fetch + 누락은 seed (서버측 처리)
 * 2. skip 신호면 즉시 반환 (excluded_from_ranking, 임시 참가자, 빈 팀)
 * 3. TS에서 각자 새 mu/phi/sigma 계산 (상대팀 전체를 opponents로)
 * 4. upsert_member_rating RPC를 4명(또는 N명) 병렬 호출
 *
 * 실패해도 경기 점수 자체는 이미 저장되었으니 throw 하지 않고 로깅만.
 */
async function applyGlickoForMatch(
  matchId: string,
  newScoreA: number,
  newScoreB: number,
): Promise<void> {
  const supabase = await createClient()

  const { data: prep, error: prepErr } = await supabase.rpc(
    'glicko2_prepare_match',
    { p_match_id: matchId },
  )

  if (prepErr) {
    console.error('glicko2_prepare_match error:', prepErr)
    return
  }

  type PrepRow = { member_id: string; mu: number; phi: number; sigma: number }
  type Prep =
    | { skip: true; reason?: string }
    | { skip: false; team_a: PrepRow[]; team_b: PrepRow[] }

  const result = prep as Prep | null
  if (!result || result.skip) return

  const teamA = result.team_a
  const teamB = result.team_b

  const teamARatings: Rating[] = teamA.map((p) => ({
    mu: p.mu,
    phi: p.phi,
    sigma: p.sigma,
  }))
  const teamBRatings: Rating[] = teamB.map((p) => ({
    mu: p.mu,
    phi: p.phi,
    sigma: p.sigma,
  }))

  const teamAResult: 0 | 0.5 | 1 =
    newScoreA > newScoreB ? 1 : newScoreA < newScoreB ? 0 : 0.5
  const teamBResult = (1 - teamAResult) as 0 | 0.5 | 1

  // 모든 갱신은 원본 레이팅 기준 — 계산 단계에서는 결과를 즉시 반영하지 않음.
  const updates: Array<{ memberId: string; rating: Rating }> = []
  for (let i = 0; i < teamA.length; i++) {
    const next = updateRating(teamARatings[i], teamBRatings, teamAResult)
    updates.push({ memberId: teamA[i].member_id, rating: next })
  }
  for (let i = 0; i < teamB.length; i++) {
    const next = updateRating(teamBRatings[i], teamARatings, teamBResult)
    updates.push({ memberId: teamB[i].member_id, rating: next })
  }

  const writes = await Promise.all(
    updates.map((u) =>
      supabase.rpc('upsert_member_rating', {
        p_club_member_id: u.memberId,
        p_match_id:       matchId,
        p_mu:             u.rating.mu,
        p_phi:            u.rating.phi,
        p_sigma:          u.rating.sigma,
      }),
    ),
  )

  for (const w of writes) {
    if (w.error) {
      console.error('upsert_member_rating error:', w.error)
    }
  }
}
