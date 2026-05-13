'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { updateRating, type Rating } from '@/lib/club/glicko2'
import {
  getResultFromScores,
  teamAResultFromWinningTeam,
  type MatchResult,
} from '@/lib/club/match-result'

// MatchResult 는 type-only re-export 없이 직접 사용 (server action 파일은 type export 금지).
// 외부에서 MatchResult 필요 시 '@/lib/club/match-result' 직접 import.

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
    // W2 호환: matches 테이블에 winning_team 컬럼이 아직 없으므로 dummy score 페어를
    // MatchResult 로 디코드해 Glicko 갱신에 전달. T0-3-3 마이그 이후엔 호출자가
    // winning_team 컬럼 값을 applyGlickoForMatch 로 직접 전달하도록 GameBoardClient
    // 와 함께 일거에 전환 (현재 applyGlickoForMatch 는 winning_team 직독 진입점).
    const winningTeam = getResultFromScores(newScoreA, newScoreB)
    await applyGlickoForMatch(matchId, winningTeam)
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
 * 한 경기의 모든 멤버 Glicko-2 레이팅을 갱신 — winning_team 직독 진입점.
 *
 * plan v2 §7.4 T0-2-2: 점수 부등호 비교(`newScoreA > newScoreB`) 대신 winning_team
 * semantic mapping(teamAResultFromWinningTeam) 으로 전환. Glicko-2 알고리즘 자체는
 * 동일 (src/lib/club/glicko2.ts:updateRating — score: 0|0.5|1 입력 받음, Critic C3),
 * 데이터 소스 / 진입 시그니처만 score 페어 → MatchResult 로 변경.
 *
 * 흐름:
 * 1. glicko2_prepare_match RPC → 양 팀 레이팅 fetch + 누락은 seed (서버측 처리)
 * 2. skip 신호면 즉시 반환 (excluded_from_ranking, 임시 참가자, 빈 팀)
 * 3. TS에서 각자 새 mu/phi/sigma 계산 (상대팀 전체를 opponents로)
 * 4. upsert_member_rating RPC를 4명(또는 N명) 병렬 호출
 *
 * 실패해도 경기 점수 자체는 이미 저장되었으니 throw 하지 않고 로깅만.
 *
 * @param matchId      matches.id
 * @param winningTeam  매치 결과 ('A' | 'B' | 'DRAW') — T0-3-3 마이그 이후엔
 *                     matches.winning_team 컬럼에서 직접 읽음.
 */
async function applyGlickoForMatch(
  matchId: string,
  winningTeam: MatchResult,
): Promise<void> {
  const teamAResult = teamAResultFromWinningTeam(winningTeam)
  await applyGlickoForMatchByTeamAResult(matchId, teamAResult)
}

/**
 * 내부 헬퍼 — Glicko-2 numeric score 를 직접 받아 갱신.
 *
 * `applyGlickoForMatch` 가 MatchResult → numeric 변환 후 호출하는 단일 진입점.
 * 외부에 노출하지 않음 — semantic 입력(MatchResult)만 호출자에 제공해 데이터 흐름
 * 일관성 유지.
 */
async function applyGlickoForMatchByTeamAResult(
  matchId: string,
  teamAResult: 0 | 0.5 | 1,
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
