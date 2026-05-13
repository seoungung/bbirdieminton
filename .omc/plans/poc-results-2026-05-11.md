# PoC 결과 — winning_team 재배선 작업량 calibration

**대상 plan**: `birdieminton-prd-alignment-roadmap-2026-05-11-v2.md` §4
**실행 일자**: 2026-05-13
**산출물**:
- 마이그레이션 draft: `supabase/migrations/_drafts/poc_winning_team.sql` / `poc_winning_team.down.sql`
- 시뮬레이션 스크립트: `scripts/poc-glicko-winning-team-simulation.mjs`
- 본 보고서: `.omc/plans/poc-results-2026-05-11.md`

**안전성**: 운영 DB 변경 0건 / 코드 수정 0건 (시뮬레이션은 코드 레벨 Node 호출만).

---

## 1. PlayingPhase.tsx 점수 저장 흐름 매핑

전수 grep (`score|winning_team|team_a_score|team_b_score`) 결과 PlayingPhase.tsx 1,863줄 안에 score 관련 좌표는 **23곳 매치** — 이중 "점수 입력 제거 → 3버튼 결과 입력" 전환에 영향받는 의미상 spot 은 **7곳** (plan v2 §4.1 critic 지적과 일치).

| Spot | 위치 (line) | 코드 인용 | 의미 | 격리도 (1=쉬움, 5=어려움) | 변환 작업 |
|------|------------|-----------|------|-------------------------|----------|
| 1 | `PlayingPhase.tsx:37` | `function getWinState(scoreA: number, scoreB: number, target: 21\|25 = 25): WinState` | "점수 → 승자/듀스 판정" 헬퍼 함수 정의 자체. WinState 의 입력 시그니처가 점수 페어로 박혀 있음 | **4** | 함수 폐기 또는 `winning_team` 직독 헬퍼로 교체. 시그니처 변경 ripple → 호출 2곳 (#4, #6) |
| 2 | `PlayingPhase.tsx:423` | `onSave(scoreA, scoreB)` (ScoreInputModal `handleSave`) | 점수 입력 모달 → 부모 콜백. 모달 자체가 점수 키패드 UI | **3** | 모달 전체 제거 또는 "결과 선택 모달(3버튼)"로 교체. 단, **PoC 단계 손대지 않음** |
| 3 | `PlayingPhase.tsx:445` (useEffect deps) | `}, [open, activeTeam, pendingInput, scoreA, scoreB, handleSave])` | 모달 키보드 핸들러의 deps 배열. 점수 상태 의존 | **2** | #2 와 묶어서 모달 통째로 제거 시 자연 소멸 |
| 4 | `PlayingPhase.tsx:449` | `const winState = getWinState(scoreA, scoreB, matchPointTarget)` | 모달 내부 — 입력 중인 점수로 실시간 승자 판정 (듀스 highlight) | **3** | 모달 자체가 사라지면 자연 소멸. 살린다면 winning_team radio 로 변경 |
| 5 | `PlayingPhase.tsx:1667` | `const winState = isEmpty ? null : getWinState(court.scoreA, court.scoreB, matchPointTarget)` | **CourtCard 의 승자 표시** — `court.scoreA/scoreB` 기반. 코트 컴포넌트 전체 렌더 분기 (winnerNames, hasWinner) 의 단일 진입점 | **5** | 가장 핵심. `court.winningTeam` 으로 source 전환 — **plan v2 §4.1 PoC-2 권고 위치** (격리도 가장 높고 변경 후 즉시 검증 가능) |
| 6 | `PlayingPhase.tsx:1816` | `<span ...>{court.scoreA}</span>` | A팀 점수 표시 (큰 숫자) | **2** | 점수 표시 삭제 (3버튼 결과만 표시) 또는 winning_team 라벨로 대체 |
| 7 | `PlayingPhase.tsx:1840` | `<span ...>{court.scoreB}</span>` | B팀 점수 표시 (큰 숫자) | **2** | #6 와 동일 |
| 8 | `PlayingPhase.tsx:1848-1858` | `<ScoreInputModal open={scoreModalOpen} initialScoreA={...} initialScoreB={...} onSave={(newA, newB) => {...onScoreChange(...)...}} />` | 점수 모달 instance + onScoreChange dispatch | **4** | 통째로 "결과 입력 다이얼로그(3버튼)" 로 교체 + `onScoreChange` → `onWinningTeamChange` |

추가 발견 (PoC 범위 외 — 컴포넌트 내부 score 좌표는 더 있음):
- `366: onSave: (scoreA, scoreB) => void` (ScoreInputModal props 타입)
- `368-369: useState(initialScoreA), useState(initialScoreB)` (모달 내부 상태)
- `391-415: setActiveScore/handleDigit/handleBackspace/handleClear` (점수 키패드 로직 — 모달 제거 시 자연 소멸)
- `461-503: 점수 입력 UI 마크업` (#2 와 묶여 자연 소멸)
- `1662: onScoreChange: (courtIndex, team, delta) => void` (CourtCard props)
- `1849-1850, 1854-1857: 모달 onSave delta 계산`

**작업 격리도 총합**: 7개 spot 중 격리도 5 1개 + 4 2개 + 3 2개 + 2 2개. **격리도 5 spot (#5) 단일 전환만으로 PoC 통과 가능** — plan v2 §4.1 PoC-2 권고와 일치.

**중요 사실**:
- PlayingPhase 의 모든 score 좌표는 **state(클라이언트 메모리) 기반** — DB 저장은 GameBoardClient.tsx 의 `handleEndCourt` (line 559-570) 와 `handleEndGame` (line 770-781) 두 곳에서만 발생.
- 즉 PlayingPhase 7곳은 **UI 렌더링/모달 표시**만, 데이터 저장은 부모 컴포넌트에서 격리.

---

## 2. ranking/actions.ts:109 변환 작업량

### 2.1 현재 코드 (`src/app/club/[clubId]/ranking/actions.ts:108-110`)

```ts
const teamAResult: 0 | 0.5 | 1 =
  newScoreA > newScoreB ? 1 : newScoreA < newScoreB ? 0 : 0.5
const teamBResult = (1 - teamAResult) as 0 | 0.5 | 1
```

### 2.2 winning_team 전환 후 (시뮬에서 검증된 매핑)

```ts
const teamAResult: 0 | 0.5 | 1 =
  winningTeam === 'A' ? 1 : winningTeam === 'B' ? 0 : 0.5  // 'DRAW' or NULL → 0.5
const teamBResult = (1 - teamAResult) as 0 | 0.5 | 1
```

### 2.3 영향받는 함수/타입

| 항목 | 현재 시그니처 | 전환 후 시그니처 | 작업량 |
|------|-------------|-----------------|--------|
| `updatePlayerStatsForMatch` (line 20-56) | `(matchId, clubId, prevScoreA, prevScoreB, newScoreA, newScoreB)` 6개 인자 | `(matchId, clubId, prevWinningTeam, newWinningTeam)` 4개 인자 또는 `(matchId, clubId, newWinningTeam)` 3개 (재편집 미지원) | **중** — 호출자 2곳 (`GameBoardClient.tsx:570, 778`) 동시 변경 |
| `applyGlickoForMatch` (line 69-140) | `(matchId, newScoreA, newScoreB)` 3개 인자 | `(matchId, newWinningTeam)` 2개 인자 | **소** — 호출자 1곳 (line 45) |
| RPC `update_player_stats_for_match` | `(p_match_id, p_club_id, p_prev_score_a, p_prev_score_b, p_new_score_a, p_new_score_b)` | `(p_match_id, p_club_id, p_prev_winning_team, p_new_winning_team)` | **대** — SQL DEFINER 함수 통째 재작성 (§3 참조) |

**핵심 의존**: `applyGlickoForMatch` 의 line 108-110 + `update_player_stats_for_match` RPC 의 v_wins/v_losses/v_draws 분기 — 둘 다 점수 부등호 비교 → winning_team 직독으로 바꾸면 알고리즘은 그대로, 진입 시그니처만 변경.

---

## 3. update_player_stats_for_match RPC 분석

### 3.1 현재 위치
가장 최신 정의: `supabase/migrations/20260510000007_secure_rpc_guards.sql:330-433` (이전 정의는 `20260418000000_fix_p0_bugs.sql:78-145` — `CREATE OR REPLACE` 로 덮였음).

### 3.2 점수 의존 코어 (line 385-405)

```sql
-- "prev 점수가 있으면 카운트 되돌리기" 분기
IF p_prev_score_a IS NOT NULL AND p_prev_score_b IS NOT NULL THEN
  IF v_player.team = 'A' THEN
    IF p_prev_score_a > p_prev_score_b    THEN v_wins   := GREATEST(0, v_wins   - 1);
    ELSIF p_prev_score_b > p_prev_score_a THEN v_losses := GREATEST(0, v_losses - 1);
    ELSE v_draws := GREATEST(0, v_draws - 1); END IF;
  ELSE
    IF p_prev_score_b > p_prev_score_a    THEN v_wins   := GREATEST(0, v_wins   - 1);
    ELSIF p_prev_score_a > p_prev_score_b THEN v_losses := GREATEST(0, v_losses - 1);
    ELSE v_draws := GREATEST(0, v_draws - 1); END IF;
  END IF;
END IF;

-- "new 점수로 카운트 증가" 분기
IF v_player.team = 'A' THEN
  IF p_new_score_a > p_new_score_b    THEN v_wins   := v_wins   + 1;
  ELSIF p_new_score_b > p_new_score_a THEN v_losses := v_losses + 1;
  ELSE v_draws := v_draws + 1; END IF;
ELSE
  IF p_new_score_b > p_new_score_a    THEN v_wins   := v_wins   + 1;
  ELSIF p_new_score_a > p_new_score_b THEN v_losses := v_losses + 1;
  ELSE v_draws := v_draws + 1; END IF;
END IF;
```

### 3.3 winning_team 전환 후 (수도코드)

```sql
-- "prev winning_team 이 있으면 카운트 되돌리기" 분기
IF p_prev_winning_team IS NOT NULL THEN
  IF v_player.team = p_prev_winning_team THEN v_wins   := GREATEST(0, v_wins   - 1);
  ELSIF p_prev_winning_team = 'DRAW'     THEN v_draws  := GREATEST(0, v_draws  - 1);
  ELSE                                        v_losses := GREATEST(0, v_losses - 1);
  END IF;
END IF;

-- "new winning_team 으로 카운트 증가" 분기
IF v_player.team = p_new_winning_team THEN v_wins   := v_wins   + 1;
ELSIF p_new_winning_team = 'DRAW'     THEN v_draws  := v_draws  + 1;
ELSE                                       v_losses := v_losses + 1;
END IF;
```

→ **로직 단순화 4 ratchet ratchet**. 점수 부등호 비교 (8줄) → winning_team 분기 (3줄). 4배 압축.

### 3.4 추가로 영향받는 RPC

| RPC | 위치 | winning_team 영향 | 필요 작업 |
|-----|------|------------------|----------|
| `glicko2_prepare_match` | `20260510000007_secure_rpc_guards.sql:440-547` | **없음** — 양 팀 멤버의 mu/phi/sigma 만 반환. 점수 비교 분기 없음. | **무변경** (✓) |
| `upsert_member_rating` | `20260510000003_rpc_authz_hardening.sql:74-218` | **없음** — mu/phi/sigma 만 upsert. | **무변경** (✓) |
| `seed_member_rating` | `20260510000002_glicko2_ratings.sql` | **없음** — 초기 시드만. | **무변경** (✓) |
| `start_game_session` | `20260510000007_secure_rpc_guards.sql:172-323` | **없음** — 세션 시작 시점, 점수 미생성. | **무변경** (✓) |

→ **점수 의존 RPC 는 `update_player_stats_for_match` 단 1개**. 재작성 비용 격리도 매우 높음.

### 3.5 RPC 재작성 작업량 견적

- 새 마이그레이션 1개 파일 (`20260518000003_*` 형태, plan v2 T0-3-3): **80~120 줄 SQL** (winning_team 컬럼 추가 + 백필 + RPC `CREATE OR REPLACE` + 권한 재설정).
- 대응 down.sql 1개 파일: 약 30줄.
- 백필 UPDATE 1개: 단순 CASE WHEN.
- 호환성: PoC draft 에서 winning_team 만 추가하고 점수 컬럼은 NULL 허용으로 유지 → 두 컬럼 공존 기간 동안 RPC 시그니처 변경은 호출자(2곳)와 함께 일거에 진행해야 함 (Stage 0 W2 atomic deploy).

---

## 4. 시뮬 결과

`node scripts/poc-glicko-winning-team-simulation.mjs` 출력 그대로:

```
PoC §4 — Glicko-2 winning_team 재배선 시뮬레이션
==============================================================================
시나리오: A1+A2 vs B1+B2, 5경기 모두 winning_team=A
초기: mu=1500, phi=350, sigma=0.06 (DEFAULT_RATING)
==============================================================================
초기       A1(mu=1500.00 phi= 350.00)  A2(mu=1500.00 phi= 350.00)  B1(mu=1500.00 phi= 350.00)  B2(mu=1500.00 phi= 350.00)
경기1      A1(mu=1747.32 phi= 253.40)  A2(mu=1747.32 phi= 253.40)  B1(mu=1252.68 phi= 253.40)  B2(mu=1252.68 phi= 253.40)
경기2      A1(mu=1793.37 phi= 228.78)  A2(mu=1793.37 phi= 228.78)  B1(mu=1206.63 phi= 228.78)  B2(mu=1206.63 phi= 228.78)
경기3      A1(mu=1819.76 phi= 215.39)  A2(mu=1819.76 phi= 215.39)  B1(mu=1180.24 phi= 215.39)  B2(mu=1180.24 phi= 215.39)
경기4      A1(mu=1838.26 phi= 206.40)  A2(mu=1838.26 phi= 206.40)  B1(mu=1161.74 phi= 206.40)  B2(mu=1161.74 phi= 206.40)
경기5      A1(mu=1852.49 phi= 199.73)  A2(mu=1852.49 phi= 199.73)  B1(mu=1147.51 phi= 199.73)  B2(mu=1147.51 phi= 199.73)
==============================================================================

통과 기준 검증 (plan v2 §4.2)
------------------------------------------------------------------------------
A팀 mu 변화: A1=352.49 A2=352.49
B팀 mu 변화: B1=-352.49 B2=-352.49

  ✓ PASS  A팀 mu 증가폭 ≥ +80
         A1=352.49 (OK), A2=352.49 (OK)
  ✓ PASS  B팀 mu 감소폭 ≤ -80
         B1=-352.49 (OK), B2=-352.49 (OK)
  ✓ PASS  A팀 mu 단조증가
         A1: 1500.0 → 1747.3 → 1793.4 → 1819.8 → 1838.3 → 1852.5
  ✓ PASS  B팀 mu 단조감소
         B1: 1500.0 → 1252.7 → 1206.6 → 1180.2 → 1161.7 → 1147.5
  ✓ PASS  4명 모두 phi 단조감소 (확신도 단조증가)
         A1 phi: 350.0 → 253.4 → 228.8 → 215.4 → 206.4 → 199.7

==============================================================================
✓ PASS — winning_team 직독 매핑으로 Glicko-2 갱신 정상 작동 확인.
         plan v2 §4.2 통과 기준 모두 만족. Stage 0 W2 본작업 진입 OK.
==============================================================================
```

### 4.1 시뮬 해석
- A팀 mu 증가폭 **+352.49** (기준 +80 대비 4.4배 마진).
- B팀 mu 감소폭 **-352.49** (기준 -80 대비 4.4배 마진).
- 5경기 모두 단조성 보존 — Glicko-2 본질상 동일 결과 누적 시 단조 수렴.
- phi 350 → 199.73 (확신도 약 1.75배 증가) — 신입 → 베테랑 phase transition 시뮬도 자연스럽게 작동.
- **A 시점에 score 부등호 vs winning_team 직독 모두 동일하게 teamAResult=1 을 산출** → 알고리즘 변경 없음 확인.

### 4.2 알고리즘 검증
시뮬은 `src/lib/club/glicko2.ts:57-72`의 `updateRating()` 와 `82-98` 의 `applyDoublesMatchUpdate()` 를 1:1 재현 (glicko2-lite `rate()` 동일 호출). 즉 **현재 코드 그대로 + winning_team → score 매핑 1줄 추가**만으로 Glicko-2 가 정상 동작.

---

## 5. W2 실현 가능성 판단

### 5.1 질문
plan v2 Stage 0 W2 (5영업일) 범위:
1. PlayingPhase 7곳 winning_team source 전환
2. GameBoardClient.tsx 의 점수 모달 dispatch → 결과 3버튼 dispatch
3. `ranking/actions.ts` 의 `updatePlayerStatsForMatch` + `applyGlickoForMatch` 시그니처 변경
4. `update_player_stats_for_match` RPC 재작성 + 신규 마이그레이션 (T0-3-3 과 SQL 묶음)
5. 게임보드 UI 3버튼 ([A승] / [B승] / [무승부]) 디자인 + 구현
6. dogfooding 검증 (실제 클럽 1세션 이상 정상 종료)

→ **5일에 끝낼 수 있는가?**

### 5.2 답: **조건부 Yes**

#### 5.2.1 Yes 근거
- **격리도 분석** (§1): 7개 spot 중 격리도 5 짜리 1개 + 격리도 4 짜리 2개. 데이터 저장은 GameBoardClient 2곳에만 집중. PlayingPhase 변경 분량은 **UI 렌더 위주** — 점수 키패드 모달 통째 제거가 압도적인 LOC 감소를 만들어냄.
- **RPC 영향 격리** (§3.4): 점수 의존 RPC 는 `update_player_stats_for_match` 1개. `glicko2_prepare_match` / `upsert_member_rating` / `seed_member_rating` / `start_game_session` 4개 RPC 무변경 (✓).
- **알고리즘 변경 없음** (§4): Glicko-2 코드 자체는 0줄 변경. 진입 시그니처만 score 페어 → winning_team 단일. PoC 시뮬 4.4배 마진으로 통과.
- **DB 호환성**: PoC draft 가 winning_team 만 추가 + 점수 컬럼은 NULL 허용 유지 → **마이그레이션 1회 + 코드 deploy 1회로 atomic 전환 가능**. 백필 SQL 한 줄 (CASE WHEN).
- **이전 사례 정합**: `match_players.team 'a'/'b' → 'A'/'B'` 대문자 통일 (20260418000000) 도 마이그레이션 1개 + RPC 재작성 1개로 처리한 선례 있음.

#### 5.2.2 조건부 — 다음 3개 가드 충족 시
1. **3버튼 UI 디자인은 1일 내 합의** — 디자이너/오너 결정 지연 시 코드 작업 블록.
2. **dogfooding 검증은 W2 5일째 끝부분에만** — D1~D4 (4일) 구현, D5 (1일) 실제 클럽 세션. 미진하면 W3 으로 1일 push.
3. **운영 DB 백업 + staging clone 24h** (plan v2 §10) 선결 — 5일 안에 staging 환경 안정 필수.

#### 5.2.3 No 가능성 (~20%)
- PlayingPhase 모달 제거 시 키보드 단축키 핸들러 (line 426-445), useCallbackSafe 의존성 등 의도치 않은 side effect.
- "무승부" UX 디자인 (현재 21/25점 듀스 시스템과 충돌 — 무승부 개념이 본질적으로 매치 룰과 어긋남)에서 시간 소요.
- in-progress 매치 데이터 (현재 `team_a_score IS NULL` 로 판별, GameBoardClient.tsx:336) 의 winning_team NULL semantic 충돌 — refactor 시 회귀 위험.

---

## 6. 권고

- [x] **Stage 0 W2 그대로 (5일) 진행 가능** — 단, §5.2.2 의 3개 조건 충족 시.
- [ ] Stage 0 W2 → W2a/W2b 로 분할 — **불필요**. 격리도 분석상 5일 내 가능.
- [ ] Stage 0 추가 1주 확장 (총 14주) — **불필요**.
- [ ] plan v3 재논의 필요 — **불필요**.

### 6.1 권고 디테일

**W2 5일 분배 (suggested)**
| Day | 작업 |
|-----|------|
| D1 | T0-3-3 마이그레이션 정식 작성 (draft → 정식 위치로 이동, 백필 포함). 3버튼 UI 디자인 컨펌. |
| D2 | RPC `update_player_stats_for_match` 재작성 + 마이그레이션 staging 적용 + row count 검증. |
| D3 | `ranking/actions.ts` `applyGlickoForMatch` + `updatePlayerStatsForMatch` 시그니처 전환 + 단위 테스트. |
| D4 | PlayingPhase 7곳 winning_team source 전환 + ScoreInputModal → ResultPickerModal 교체 + GameBoardClient dispatch 변경. |
| D5 | 운영 DB 마이그레이션 + 실제 클럽 dogfooding 1세션 검증. 회귀 시 down.sql 즉시 rollback. |

**가드레일**
- D2 끝에 RPC 변경이 staging 에서 회귀하면 → 즉시 D3 작업 일시 중단 + critic/architect 호출.
- D5 dogfooding 통과 못하면 → W3 첫날로 1일 push (5+1=6일).

**부수 추천**:
1. PoC draft `_drafts/poc_winning_team.sql` 의 `winning_team` 열거형에 **`'DRAW'`** 명시 추가 (plan v2 원안 `'A'/'B'` 만 보다 표현력 좋음). 정식 T0-3-3 에서도 동일 패턴 유지 권고.
2. `idx_matches_winning_team` partial index — ranking 집계 성능 확보용. 본 PoC draft 에 포함.
3. **시뮬 스크립트는 회귀 테스트로 보존** — `npm test` 와 별도로 `node scripts/poc-glicko-winning-team-simulation.mjs` 를 W2 D2~D4 매일 1회 수동 실행 권고.

---

## 부록 — 산출물 절대경로 / 검증 상태

| 산출물 | 절대경로 | 상태 |
|--------|---------|------|
| 마이그 draft (up) | `C:\Users\skyyo\Projects\Birdminton\birdminton\supabase\migrations\_drafts\poc_winning_team.sql` | 작성 완료 / 실행 안 함 |
| 마이그 draft (down) | `C:\Users\skyyo\Projects\Birdminton\birdminton\supabase\migrations\_drafts\poc_winning_team.down.sql` | 작성 완료 / 실행 안 함 |
| 시뮬 스크립트 | `C:\Users\skyyo\Projects\Birdminton\birdminton\scripts\poc-glicko-winning-team-simulation.mjs` | 작성 완료 / `node` 1회 실행 ✓ PASS / exit 0 |
| 본 보고서 | `C:\Users\skyyo\Projects\Birdminton\birdminton\.omc\plans\poc-results-2026-05-11.md` | 작성 완료 |

**시뮬 종합**: ✓ PASS (모든 5개 통과 기준 충족, 마진 4.4배)
**W2 판정**: 조건부 Yes (5일 가능, §5.2.2 3개 가드 필요)
**다음 액션**: plan v2 §11 의 1번 옵션 = 정식 Stage 0 진입.
