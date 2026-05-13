/**
 * PoC §4 — Glicko-2 winning_team 재배선 시뮬레이션
 *
 * 시나리오:
 *   4명 가상 플레이어 (A1, A2, B1, B2). 모두 초기 mu=1500, phi=350, sigma=0.06.
 *   5경기 시퀀스: 모두 winning_team='A' (A 팀 5연승).
 *
 * 기존 ranking/actions.ts:108-110 의 점수 비교:
 *   teamAResult = newScoreA > newScoreB ? 1 : newScoreA < newScoreB ? 0 : 0.5
 * 를 winning_team 직독 매핑으로 전환:
 *   teamAResult = winning_team === 'A' ? 1 : winning_team === 'B' ? 0 : 0.5
 *
 * 본 시뮬은 src/lib/club/glicko2.ts 의 updateRating / applyDoublesMatchUpdate 와
 * 동일 알고리즘 (glicko2-lite rate()) 으로 4명 mu/phi 를 5회 갱신, plan v2 §4.2 의
 * 통과 기준을 자동 검증한다.
 *
 * 실행: node scripts/poc-glicko-winning-team-simulation.mjs
 *
 * 통과 기준 (plan v2 §4.2):
 *   - A팀 mu 증가폭 ≥ +80, 5경기 단조증가
 *   - B팀 mu 감소폭 ≤ -80, 5경기 단조감소
 *   - 4명 모두 phi 단조감소 (확신도 단조증가)
 */

import rate from 'glicko2-lite'

/* ── src/lib/club/glicko2.ts 의 DEFAULT_RATING 과 동치 ── */
const DEFAULT_RATING = { mu: 1500, phi: 350, sigma: 0.06 }

/**
 * src/lib/club/glicko2.ts:57-72 의 updateRating() 함수 그대로 재현.
 * (glicko2-lite 의 rate(mu, rd, vol, opponents, options) 호출)
 */
function updateRating(player, opponents, score, tau = 0.5) {
  const result = rate(
    player.mu,
    player.phi,
    player.sigma,
    opponents.map((o) => [o.mu, o.phi, score]),
    { tau },
  )
  return { mu: result.rating, phi: result.rd, sigma: result.vol }
}

/**
 * src/lib/club/glicko2.ts:82-98 의 applyDoublesMatchUpdate() 함수 그대로 재현.
 */
function applyDoublesMatchUpdate(teamA, teamB, teamAResult) {
  const teamBResult = 1 - teamAResult
  return {
    teamA: [
      updateRating(teamA[0], teamB, teamAResult),
      updateRating(teamA[1], teamB, teamAResult),
    ],
    teamB: [
      updateRating(teamB[0], teamA, teamBResult),
      updateRating(teamB[1], teamA, teamBResult),
    ],
  }
}

/**
 * winning_team 매핑 — ranking/actions.ts:108-110 의 점수 비교 대체.
 *   'A'    → A팀 시점 1.0 (승)
 *   'B'    → A팀 시점 0.0 (패)
 *   'DRAW' → A팀 시점 0.5 (무)
 *   NULL   → 호출 자체가 일어나면 안 됨 (결과 미입력 매치)
 */
function teamAResultFromWinningTeam(winningTeam) {
  if (winningTeam === 'A') return 1
  if (winningTeam === 'B') return 0
  if (winningTeam === 'DRAW') return 0.5
  throw new Error(`winning_team must be 'A' | 'B' | 'DRAW', got: ${winningTeam}`)
}

/* ── 초기 상태 ── */
const initial = {
  A1: { ...DEFAULT_RATING },
  A2: { ...DEFAULT_RATING },
  B1: { ...DEFAULT_RATING },
  B2: { ...DEFAULT_RATING },
}

/* ── 5경기 시퀀스 — 모두 A승 ── */
const matches = [
  { winning_team: 'A' },
  { winning_team: 'A' },
  { winning_team: 'A' },
  { winning_team: 'A' },
  { winning_team: 'A' },
]

/* ── 표 헤더 출력 ── */
console.log('PoC §4 — Glicko-2 winning_team 재배선 시뮬레이션')
console.log('='.repeat(78))
console.log('시나리오: A1+A2 vs B1+B2, 5경기 모두 winning_team=A')
console.log('초기: mu=1500, phi=350, sigma=0.06 (DEFAULT_RATING)')
console.log('='.repeat(78))

const fmt = (n, w = 7) => n.toFixed(2).padStart(w)

function printRow(label, state) {
  console.log(
    `${label.padEnd(8)} ` +
      `A1(mu=${fmt(state.A1.mu)} phi=${fmt(state.A1.phi)})  ` +
      `A2(mu=${fmt(state.A2.mu)} phi=${fmt(state.A2.phi)})  ` +
      `B1(mu=${fmt(state.B1.mu)} phi=${fmt(state.B1.phi)})  ` +
      `B2(mu=${fmt(state.B2.mu)} phi=${fmt(state.B2.phi)})`,
  )
}

printRow('초기', initial)

/* ── 시뮬레이션 실행 ── */
let state = initial
const history = [{ ...initial, A1: { ...initial.A1 }, A2: { ...initial.A2 }, B1: { ...initial.B1 }, B2: { ...initial.B2 } }]

for (let i = 0; i < matches.length; i++) {
  const match = matches[i]
  const teamAResult = teamAResultFromWinningTeam(match.winning_team)

  const updated = applyDoublesMatchUpdate(
    [state.A1, state.A2],
    [state.B1, state.B2],
    teamAResult,
  )

  state = {
    A1: updated.teamA[0],
    A2: updated.teamA[1],
    B1: updated.teamB[0],
    B2: updated.teamB[1],
  }
  history.push(state)

  printRow(`경기${i + 1}`, state)
}

console.log('='.repeat(78))

/* ── 통과 기준 검증 ── */
const finalState = history[history.length - 1]

const muDeltaA1 = finalState.A1.mu - initial.A1.mu
const muDeltaA2 = finalState.A2.mu - initial.A2.mu
const muDeltaB1 = finalState.B1.mu - initial.B1.mu
const muDeltaB2 = finalState.B2.mu - initial.B2.mu

console.log('')
console.log('통과 기준 검증 (plan v2 §4.2)')
console.log('-'.repeat(78))
console.log(`A팀 mu 변화: A1=${muDeltaA1.toFixed(2)} A2=${muDeltaA2.toFixed(2)}`)
console.log(`B팀 mu 변화: B1=${muDeltaB1.toFixed(2)} B2=${muDeltaB2.toFixed(2)}`)

const checks = []

/* 기준 1: A팀 mu 증가폭 ≥ +80 */
const passA1Delta = muDeltaA1 >= 80
const passA2Delta = muDeltaA2 >= 80
checks.push({
  name: 'A팀 mu 증가폭 ≥ +80',
  pass: passA1Delta && passA2Delta,
  detail: `A1=${muDeltaA1.toFixed(2)} (${passA1Delta ? 'OK' : 'FAIL'}), A2=${muDeltaA2.toFixed(2)} (${passA2Delta ? 'OK' : 'FAIL'})`,
})

/* 기준 2: B팀 mu 감소폭 ≤ -80 */
const passB1Delta = muDeltaB1 <= -80
const passB2Delta = muDeltaB2 <= -80
checks.push({
  name: 'B팀 mu 감소폭 ≤ -80',
  pass: passB1Delta && passB2Delta,
  detail: `B1=${muDeltaB1.toFixed(2)} (${passB1Delta ? 'OK' : 'FAIL'}), B2=${muDeltaB2.toFixed(2)} (${passB2Delta ? 'OK' : 'FAIL'})`,
})

/* 기준 3: A팀 mu 단조증가 */
function isMonotonic(values, ascending) {
  for (let i = 1; i < values.length; i++) {
    if (ascending ? values[i] <= values[i - 1] : values[i] >= values[i - 1]) {
      return false
    }
  }
  return true
}

const a1Mus = history.map((s) => s.A1.mu)
const a2Mus = history.map((s) => s.A2.mu)
const b1Mus = history.map((s) => s.B1.mu)
const b2Mus = history.map((s) => s.B2.mu)

checks.push({
  name: 'A팀 mu 단조증가',
  pass: isMonotonic(a1Mus, true) && isMonotonic(a2Mus, true),
  detail: `A1: ${a1Mus.map((v) => v.toFixed(1)).join(' → ')}`,
})

checks.push({
  name: 'B팀 mu 단조감소',
  pass: isMonotonic(b1Mus, false) && isMonotonic(b2Mus, false),
  detail: `B1: ${b1Mus.map((v) => v.toFixed(1)).join(' → ')}`,
})

/* 기준 4: 4명 모두 phi 단조감소 */
const a1Phis = history.map((s) => s.A1.phi)
const a2Phis = history.map((s) => s.A2.phi)
const b1Phis = history.map((s) => s.B1.phi)
const b2Phis = history.map((s) => s.B2.phi)

const allPhiMonotonicDecreasing =
  isMonotonic(a1Phis, false) &&
  isMonotonic(a2Phis, false) &&
  isMonotonic(b1Phis, false) &&
  isMonotonic(b2Phis, false)

checks.push({
  name: '4명 모두 phi 단조감소 (확신도 단조증가)',
  pass: allPhiMonotonicDecreasing,
  detail: `A1 phi: ${a1Phis.map((v) => v.toFixed(1)).join(' → ')}`,
})

console.log('')
for (const c of checks) {
  const mark = c.pass ? '✓ PASS' : '✗ FAIL'
  console.log(`  ${mark}  ${c.name}`)
  console.log(`         ${c.detail}`)
}

const allPass = checks.every((c) => c.pass)
console.log('')
console.log('='.repeat(78))
if (allPass) {
  console.log('✓ PASS — winning_team 직독 매핑으로 Glicko-2 갱신 정상 작동 확인.')
  console.log('         plan v2 §4.2 통과 기준 모두 만족. Stage 0 W2 본작업 진입 OK.')
} else {
  console.log('✗ FAIL — 통과 기준 미달. Stage 0 W2 진입 전 재검토 필요.')
}
console.log('='.repeat(78))

process.exit(allPass ? 0 : 1)
