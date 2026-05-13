# 버디민턴 PRD 정합화 대수술 로드맵 v2 (Stage 0 ~ E)

> **Plan ID**: `birdieminton-prd-alignment-roadmap-2026-05-11-v2`
> **작성일**: 2026-05-13
> **작성자**: Prometheus (oh-my-claudecode planner)
> **개정 사유**: Critic 비평 C+ 등급 → 5개 Critical + 5개 High + 3개 Medium 지적 반영 + 사용자 결정 4건 추가
> **선행 문서**: `.omc/plans/birdieminton-prd-alignment-roadmap-2026-05-11.md` (v1, 보존)
> **PRD 원본**: `C:\Users\skyyo\Downloads\birdieminton_prd.md`
> **레포 루트**: `C:\Users\skyyo\Projects\Birdminton\birdminton`
> **비전 한 줄**: PRD 명세 100% 정합으로 코드베이스를 재정렬하고, Free/Basic/Pro 누적 인원 종량제 SaaS 로 정상 출항한다.

---

## 0. 메타

| 항목 | 값 |
|------|-----|
| 플랜 종류 | 대수술 (PRD 우선 강제 정합) |
| 총 Stage | Stage 0 ~ E (필수 5단계 + 선택 1단계) |
| Stage 길이 | **Stage 0 = 3주** (v1 의 2주 → 확장), Stage A~D = 2주, Stage E = 0~2주 가변 |
| 총 예상 기간 | **11~13주** (v1 의 10~12주 → 1주 추가, 5월 중순 ~ 8월 초) |
| 실행 모델 | 직렬 (Stage 단위로 dogfooding 통과 후 다음 진입) |
| 핸드오프 | 각 Stage 끝에 사용자 dogfooding 체크포인트 의무 |
| **PoC 게이트** | Stage 0 진입 전 반나절 PoC 의무 (작업량 calibration) |

### 0.1 사전 완료 (Stage -1 격, 이미 끝남)
- RLS 캐스팅 회귀 복구: `supabase/migrations/20260511000000_fix_rls_regressions.sql`
- 마스터 어드민 시스템: `/admin` + `src/lib/auth/master.ts` (캐싱 적용 완료)
- PDF 1회결제 코드 잔재 제거 완료
- 체험용(데모) 모드 전면 제거 완료 (58 files, +176/-3147)

### 0.2 알려진 부채 (Plan 진행 중 반드시 정리할 것)

#### 0.2.1 PRD §4 신규 도입 컬럼 (v1 의 "드리프트" 진단 정정 — 실제는 신규 도입)
v1 은 이 항목을 "드리프트"로 분류했지만, 실제 마이그레이션 트리(`supabase/migrations/` 전수 조사) 결과 **PRD §4 의 핵심 컬럼들은 한 번도 적용된 적이 없는 신규 스키마**다.

| PRD §4 항목 | 현재 상태 | 도입 task |
|-------------|-----------|-----------|
| `users.kakao_id` | 없음 | T0-3-2 |
| `users.bp_score` | 없음 (앱 코드 어디에도 없음) | T0-3-2 |
| `users.grade` (S~F) | 없음 (Glicko mu 만 존재) | T0-3-2 |
| `users.manner_temp` | 없음 | T0-3-2 |
| `clubs.custom_url_id` | 없음 (현재 UUID 라우팅만) | T0-3-1 |
| `clubs.plan_type` | 없음 (`feature_flags` 만 존재) | T0-3-1 |
| `session_guests.invited_by` | 없음 | T0-3-4 |
| `matches.winning_team` | 없음 (현재 `scoreA/scoreB` 만) | T0-3-3 |

#### 0.2.2 실제 드리프트 (마이그 vs 실DB 불일치 — Stage 0 W3 정합)
- `users` 마이그-실DB 불일치 컬럼: `phone`, `is_placeholder`, `quiz_level`, `profile_img` 일부
- `birdieminton_user_id` 타입 — **사용자 결정: UUID 정합 (Supabase `auth.uid` 통일)** ← T0-3-5

#### 0.2.3 PRD 미명세 부가 라우트 9개 (Critic C4 보강 → 총 14개)
v1 은 9개만 식별했지만, 실제 `src/app/club/[clubId]/` 전수 조사 결과 **14개 라우트** 가 존재.

| 라우트 | v1 처리 | v2 결정 | 근거 |
|--------|---------|---------|------|
| `finance/` | `/manage` 흡수 | **유지** | T0-1-1 |
| `notices/` | `/manage` 흡수 | **유지** | T0-1-1 |
| `join-requests/` | `/manage` 흡수 | **유지** | T0-1-1 |
| `stats/` | `/stats` 통합 | **유지** | T0-1-2 |
| `report/` | `/stats` 흡수 | **유지** | T0-1-2 |
| `ranking/` | `/stats` 흡수 | **유지** | T0-1-2 |
| `shuttle/` | Stage C 정산소 통합 | **유지** | Stage C TC-1-5 |
| `me/` | `/mypage` 흡수 | **수정: Stage 0 W2 까지 살려둠** | Critic M1 반영 → Glicko 전환 검증에 사용, Stage A 에서만 `/mypage` 로 흡수 |
| `import/` | "준비 중" 안내 | **유지** | T0-1-3 |
| **`settlements/`** | v1 누락 | **Stage C 전 architect 결정** | Critic C4 / 현재 `/club/[clubId]/settlements` 가 PRD §3.4 `/session/{id}/summary` 와 충돌 → Stage C 진입 시 통합 또는 폐기 결정 |
| **`settings/`** | v1 누락 | **Stage 0 W1 결정** | Critic C4 / PRD §2.2 `[관리]` 와 겹침 — `/manage` 로 흡수 또는 유지를 architect 와 W1 시작 시 결정 |
| **`events/`** | v1 누락 | **유지** | Critic C4 / PRD §2.2 `[일정]` 의 리스트 형태 — 활용 |
| **`gameboard/`** | 처리 명시 | **유지** | 핵심 화면 |
| **`members/`** | v1 누락 | **유지** | Critic C4 / PRD §2.2 `[멤버]` 자리 — 활용 |

---

## 1. v1 → v2 변경 요약 (Critic 지적 매핑)

| Critic 지적 | 분류 | v2 반영 위치 | 한 줄 요약 |
|-------------|------|--------------|-----------|
| **C1** PRD §4 컬럼 신규 도입을 "드리프트"로 오진 + T0-2-3 단일 마이그 거대화 | Critical | §0.2.1, T0-3-1~T0-3-5 (5개 마이그 분할) | 마이그를 5개 파일로 쪼개고 각 파일에 `down.sql` + row count 비교 |
| **C2** Stage 0 W2 작업량 폭주 (PlayingPhase 1900+줄) | Critical | Stage 0 를 3주(W1+W2+W3) 로 확장, 게임보드는 W2 단독 작업 | Stage 0 = 14일 → 21일, 위험 task 분리 |
| **C3** Glicko-2 "W/L 재설계" 오진 (이미 `0|0.5|1` 받음) | Critical | T0-2-2 재정의 (재설계 → 데이터 흐름 재배선) | 작업의 본질이 "winning_team single source 화"임을 명시 |
| **C4** 9개 외 5개 라우트 (`settlements`,`settings`,`events`,`gameboard`,`members`) v1 누락 | Critical | §0.2.3 라우트 정리 표 14개 전수, T0-1-0 신설 | 모든 라우트의 운명 명시 |
| **C5** 백업/롤백 전략 부재 | Critical | §10 백업/롤백 전략 (신규 섹션) + T0-3-* 출력에 `down.sql` 의무 | staging 24h + `pg_dump` + 마이그-개별 down + row count 비교 |
| **H1** dogfooding 체크포인트 모호 | High | §11 측정 가능 체크포인트 (모든 Stage 갱신) | "5경기 후 승자 mu 증가/패자 mu 감소/phi 단조 감소" 처럼 측정 가능 |
| **H2** PRD §3.1 BP 카피 single source 불명 | High | T0-3-6 (BP 카피 미러링) + Stage B TB-2-1 의 검증 갱신 | **PRD md 가 source of truth**, 코드 상수 `src/lib/bp/copy.ts` 가 미러링, 단위 테스트가 md 파싱 검증 |
| **H3** 핸들 마이그레이션 SEO/외부링크 영구성 모호 | High | TA-2-2 갱신 | **사용자 결정: UUID URL 영구 보존** (301 redirect 아님, 양쪽 200, canonical 만 handle) |
| **H4** Toss 빌링 가맹 심사 리드타임 | High | **T0-0-1 신설** (Stage 0 Day 1) | 가맹 신청을 plan v2 첫 task 로 즉시 제출 |
| **H5** 자동화 회귀 테스트 부재 | High | 각 Stage 검증 섹션 + §11 dogfooding 갱신 | Glicko mu/phi 시뮬, 정산 N빵 단위 테스트, 누적 인원 가드 통합 테스트 |
| **M1** `/me` Glicko 전환 검증용 보존 | Medium | §0.2.3 라우트 표 (`me/` 처리 갱신) + T0-2-2 검증 | Stage 0 W2 종료까지 살려둠, Stage A W4 에서 `/mypage` 로 흡수 |
| **M2** 마케팅/공개 페이지 갱신 누락 | Medium | §11 각 Stage dogfooding 마지막 항목 신설 | `/manual`, `/blog`, `/pricing`, 랜딩 카피 — PRD 변경 일관성 |
| **M3** PRD §3.3 게스트 [+추가] 출석부 측 누락 | Medium | T0-1-5 갱신 + Stage C TC-1-1 의 검증 | 게임보드 좌측 하단 + 출석부 페이지 양쪽 픽스 |

**사용자 결정 4건 (Critic 비평 답변)**:

| # | 결정 | v2 반영 |
|---|------|---------|
| **D1** | Toss 빌링 가맹: 아직 안 함, plan v2 첫 task 로 즉시 신청 | T0-0-1 (Stage 0 Day 1) |
| **D2** | `birdieminton_user_id` 타입: UUID 정합 (auth.uid 통일) | T0-3-5 |
| **D3** | 기존 UUID 클럽 URL: **영구 보존** (양쪽 200, canonical 만 handle) | TA-2-2 (301 redirect 폐기) |
| **D4** | PRD 카피 single source: **PRD md** (코드 미러링, 단위 테스트가 md 파싱) | T0-3-6, Stage B 검증 |

---

## 2. 결정 요약 표 (v1 표 + 사용자 결정 4건 추가)

| 영역 | 결정 |
|------|------|
| **전체 방향** | PRD 우선 대수술. PRD 미명세 추가 기능은 제거 또는 격하. |
| **플랜 구조** | Free 50명 / Basic 100명 ₩9,900/월 / Pro 무제한 ₩29,900/월 (누적 인원) |
| **결제 수단** | Toss 빌링 정기결제 — **D1: Stage 0 Day 1 가맹 재신청 즉시 제출** |
| **게임보드 점수** | 점수 입력 UI 완전 제거 → 3버튼 ([A팀 승]/[B팀 승]/[무승부]) |
| **글로벌 네비** | PRD §2.1 4탭 풀도입: `/dashboard`, `/my-clubs`, `/explore`, `/mypage` |
| **클럽 탭** | PRD §2.2 4탭만 유지: `[일정]`, `[멤버]`, `[스탯]`, `[관리]` (운영자만) |
| **Glicko-2** | **이미 0\|0.5\|1 입력 수용 — 재설계 아닌 winning_team 데이터 흐름 재배선** |
| **BP 테스트 MVP** | 17문항 + S~F 등급 + 결과 공유 카드 (GIF·28문항은 점진적) |
| **BP 카피 source** | **D4: PRD md 가 single source — 코드는 미러, 단위 테스트가 md 파싱** |
| **정산소 MVP** | 장소료/콕값 토글 + N빵 계산기 + 카톡 고유 링크 생성 |
| **알림톡 실발송** | Basic 플랜 기능으로 분리 (Stage D) |
| **임포트** | 라우트 비활성화 + "준비 중" 안내, 코드 자체는 보존 (Stage E 재논의) |
| **실행 순서** | Stage 0 완전히 끝내고 Stage A 진입 (안전 우선) |
| **Stage 길이** | **Stage 0 = 3주**, 이후 2주/Stage 표준, 매주 dogfooding 한 번 |
| **PoC** | Stage 0 진입 전 반나절 — winning_team 단일 컬럼 + getWinState 1곳 + ranking actions 1곳 전환 → 5경기 시뮬 |
| **UUID 라우트** | **D3: 영구 보존, 양쪽 다 200, canonical 만 handle** |
| **birdieminton_user_id** | **D2: UUID 정합화 (auth.uid 통일)** |
| **PRD 추가 정렬** | 모임 가입 신청 누적 인원 차단, 게스트 합산 결제, 매너온도 평가 팝업 |

---

## 3. 로드맵 한눈에 (v2 — Stage 0 = 3주)

| Stage | 주차 | 핵심 목표 | 산출물 (대표) |
|-------|------|-----------|---------------|
| **PoC** | Day 0~1 (반나절) | winning_team 단일 컬럼 + 1곳 전환 + 5경기 시뮬 | 작업량 calibration 보고 |
| **0** | W1 | 추가 라우트 14개 운명 결정 + 9개 정리 (관리/스탯 흡수, import 비활성화, me/shuttle/settlements/settings 보류 결정) | 라우트 결정 매트릭스, 흡수 PR 1 |
| **0** | W2 | 게임보드 3버튼 + Glicko-2 데이터 흐름 재배선 (winning_team single source) | 점수 입력 제거, ranking actions winning_team 읽기 |
| **0** | W3 | PRD §4 신규 스키마 5개 마이그 분할 + 백업/롤백 전략 + drift 정합 | 5개 마이그 파일 + 5개 down.sql + row count 비교 스크립트 |
| **A** | W4 | 글로벌 네비 4탭 신설 (`/dashboard`, `/my-clubs`, `/explore`, `/mypage`) | GNB 라우트 + 빈 페이지 |
| **A** | W5 | 마이페이지 컨텐츠 + 핸들(`/club/{handle}`) 라우팅 + UUID 영구 병행 + 푸시 미들웨어 통합 | BP/등급/매너 뱃지, custom_url_id 도입 |
| **B** | W6 | `/test` 17문항 페이징 + 가중치 알고리즘 | 스카우터 진행률 + S~F 계산 |
| **B** | W7 | 결과 페이지 + 공유 카드 + users 테이블 저장 + PRD md 카피 단위테스트 | 레이더 차트 + SNS 공유 이미지 |
| **C** | W8 | 정산소 MVP (`/session/{id}/summary`) + 게스트 합산 청구 | 모듈형 정산 폼 + 카톡 링크 |
| **C** | W9 | 매너온도 평가 팝업 + 초대 랜딩 페이지 + `/settlements` 운명 결정 | `/review`, `/club/{handle}/invite` |
| **D** | W10 | 누적 인원 가드 + Toss 빌링 SDK (가맹 승인 후) + `/pricing` | 결제 흐름 + 통합 회귀 테스트 |
| **D** | W11 | 공동관리자, 알림톡, Excel/PDF 차등 기능 | Basic/Pro 차등 동작 |
| **E** | W12~13 (선택) | 안정화 + 베타 모집 + import/체험하기 재결정 + 마케팅 페이지 PRD 일관성 | 회귀 테스트 + 90일 grandfather + `/manual` 갱신 |

---

## 4. PoC 절차 — Stage 0 진입 전 (반나절)

**목적**: Critic 이 지적한 "PlayingPhase 1900+줄에 점수 로직이 7곳 박혀있다"는 작업량을 실측 검증. PoC 통과 후 Stage 0 본격 진입, 실패 시 Stage 0 W2 분할 재논의.

### 4.1 PoC 범위

- [ ] **PoC-1**: `matches` 에 `winning_team TEXT NULL CHECK (winning_team IN ('A','B'))` 컬럼 1개 ALTER (rollback 가능한 단일 ALTER)
- [ ] **PoC-2**: `src/components/club/gameboard/PlayingPhase.tsx:37` 의 `getWinState` 호출 1곳을 winning_team INSERT 로 전환
  - 대상: line 1667 또는 1840~1855 중 한 곳 (가장 격리도 높은 곳)
  - 다른 6곳(line 37, 423, 449, 1816, 1848-1855)은 PoC 단계에서 손대지 않음 (Stage 0 W2 본작업)
- [ ] **PoC-3**: `src/app/club/[clubId]/ranking/actions.ts:109` 의 `newScoreA > newScoreB` 비교를 `winning_team` 읽기로 전환 (단일 함수 격리)
- [ ] **PoC-4**: 5경기 시뮬레이션 — 동일 4명, A팀 5연승 시나리오 실행 후 mu/phi 변화 측정
- [ ] **PoC-5**: 작업량 calibration 보고서 작성 (`.omc/notepads/birdieminton-prd-alignment-roadmap-2026-05-11-v2/poc-report.md`)

### 4.2 PoC 통과 기준 (측정 가능)
- 5경기 후 A팀 2명 mu **단조 증가** (5경기 차이 ≥ 80, phi 단조 감소)
- 5경기 후 B팀 2명 mu **단조 감소** (5경기 차이 ≥ -80)
- typecheck 0 error / lint 0 error
- 기존 매치 데이터 1건 이상 회귀 없음 (selectAll 후 row count 동일)

### 4.3 PoC 실패 시
- PlayingPhase 7곳 변경에 예상보다 시간이 더 든다고 판단되면 **Stage 0 W2 를 2주(W2a + W2b)로 분할** 재논의 → architect 와 의논 후 plan v3 작성

---

## 5. 의존성 그래프

```
[Stage -1 완료]
       │
       ▼
[T0-0-1 Toss 가맹 신청] (병행, Day 1)
       │
       ▼
[PoC (반나절)] ──fail──► plan v3 재논의
       │ pass
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 0: 정리·기반 (3주)                                     │
│  W1 14개 라우트 결정 + 9개 정리 ──► W2 게임보드 3버튼 +      │
│                                      winning_team 재배선     │
│                                  ──► W3 5개 마이그 분할 +    │
│                                      백업/롤백 검증           │
└─────────────────────────────────────────────────────────────┘
       │ dogfooding 통과 (측정 가능 체크포인트)
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage A: 글로벌 네비 + 마이페이지 + 핸들 (UUID 영구 병행)     │
│  W4 GNB 4탭 ──► W5 마이페이지 + handle/{uuid} 듀얼 라우팅   │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage B: BP 테스트 (PRD md single source 카피)               │
│  W6 17문항 ──► W7 결과·공유 카드 + md 파싱 단위테스트        │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage C: 정산소 + 매너온도 + 초대 랜딩                       │
│  W8 정산소 ──► W9 매너온도 + 초대 + /settlements 결정        │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage D: Basic/Pro + Toss 빌링 (가맹 승인 가정)              │
│  W10 가드 + SDK ──► W11 차등 기능 (회귀 통합 테스트)         │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage E (선택): 안정화 + 베타 + 마케팅 PRD 일관성              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 위험 매트릭스 (v2 — Top 7, Critic 보강)

| # | 위험 | 발생 Stage | 영향 | 완화책 |
|---|------|------------|------|--------|
| **R1** | PRD §4 5개 마이그 중 운영 DB 무결성 손상 | Stage 0 W3 | 치명 | §10 백업/롤백 전략 — staging clone 24h + `pg_dump` + 마이그별 `down.sql` + row count 비교 스크립트 |
| **R2** | Glicko 데이터 흐름 재배선 시 player_stats 집계 회귀 | Stage 0 W2 | 큼 | Critic C3 반영 → 점수 의존 곳 4개 격리(`actions.ts:109`, `update_player_stats_for_match` RPC, `PlayingPhase.tsx` 7곳, `me/` 페이지) + 마이그 후 회귀 simulate replay |
| **R3** | 9~14개 라우트 흡수 시 권한 체크 누락 → RLS 우회 | Stage 0 W1 | 큼 | 흡수 후 `security-reviewer` agent 1회 통과 의무 |
| **R4** | 17문항 가중치 알고리즘이 PRD §3.1 BP 범위 불일치 | Stage B | 중 | Critic H2 → PRD md 파싱 단위 테스트 잠금, 모든 등급 boundary 커버 |
| **R5** | OG 이미지 생성 성능 | Stage B W7 | 중 | Vercel Edge OG, 첫 렌더 ≤ 1.5s, fail 시 정적 폴백 |
| **R6** | Toss 빌링 가맹 재신청 승인 지연 (2~4주 소요) | Stage D | 중 | Critic H4 → **T0-0-1 (Stage 0 Day 1) 즉시 제출**, 진행 시트로 트래킹 |
| **R7** | UUID URL 영구 보존 시 SEO duplicate content | Stage A W5 | 작 | D3 결정 — 양쪽 200, **canonical link tag 는 handle URL 만**, sitemap.xml 은 handle 만 |
| **R8 (신규)** | PlayingPhase 7곳 변경이 예상 2일을 초과 | Stage 0 W2 | 중 | PoC 통과 기준이 작업량 calibration 역할 — 실패 시 W2 분할 재논의 |

---

## 7. Stage 0 상세 (3주) — 정리·덜어내기·기반 완성

### 7.1 목적
PRD §2.2 4탭 구조로 정렬하고, 점수 데이터 흐름·스키마를 일괄 대수술하여 이후 모든 Stage 의 기반을 만든다. v1 의 W1+W2 압축에서 **W1+W2+W3 분리**로 위험 축소.

### 7.2 Day 0 — Toss 빌링 가맹 재신청

#### 작업 단위

- [ ] **T0-0-1**: Toss 페이먼츠 빌링 가맹 신청 제출
  - Agent: 사용자 직접 (researcher 보조)
  - 예상 시간: 0.5일 (제출), 2~4주 (심사 — 병행 진행)
  - 입력: 사업자등록증 (2026-04-08), Toss 이전 가맹 정보, 약관, 결제수단 등
  - 출력:
    1. Toss 빌링 신청 양식 제출 완료
    2. `.omc/notepads/birdieminton-prd-alignment-roadmap-2026-05-11-v2/toss-billing-tracker.md` — 심사 진행 상태 트래킹 시트 (제출일, 심사 시작일, 보완 요청, 승인 예정일)
  - 위험: R6 (승인 지연)
  - 검증: Toss 콘솔에 가맹 신청 상태 "심사 중" 확인, 트래커 1차 기록

### 7.3 Week 1 — 14개 라우트 운명 결정 + 9개 정리

#### 작업 단위

- [ ] **T0-1-0**: 14개 라우트 운명 결정 매트릭스 (신규, Critic C4)
  - Agent: architect (Opus) — 1회 검토
  - 예상 시간: 0.5일
  - 입력: §0.2.3 라우트 표
  - 출력: `/club/[clubId]/{finance,notices,join-requests,stats,report,ranking,shuttle,me,import,settlements,settings,events,gameboard,members}` 14개의 최종 결정 매트릭스 문서 (`.omc/notepads/{plan}/route-decision-matrix.md`)
  - 결정 사항: `settlements` (Stage C 정산소와 통합 OR 폐기), `settings` (`/manage` 흡수 OR 유지), `events` (PRD §2.2 일정 탭 활용), `members` (PRD §2.2 멤버 탭 활용)
  - 검증: 매트릭스에 14개 모두 결정 사유 + 후속 task ID 매핑

- [ ] **T0-1-1**: `/finance`, `/notices`, `/join-requests` 를 `/manage` 탭 하위 섹션으로 흡수
  - Agent: executor-high (Opus)
  - 예상 시간: 1.5일
  - 입력: 3개 page.tsx
  - 출력: `/club/[clubId]/manage/page.tsx` 안에 3개 섹션 (탭 또는 accordion)
  - 위험: RLS 정책 범위 차이
  - 검증: `npm run typecheck` + `/manage` 진입 후 3섹션 모두 운영자만 보임 + 일반회원 403, security-reviewer 1회 패스

- [ ] **T0-1-2**: `/stats`, `/report`, `/ranking` 을 새 `/stats` 통합 탭으로 흡수
  - Agent: executor-high (Opus)
  - 예상 시간: 1.5일
  - 입력: 3개 page.tsx, `RankingTable.tsx` 등
  - 출력: `/club/[clubId]/stats/page.tsx` 단일 페이지에 3섹션 (탭형)
  - 위험: ranking actions 의 winning_team 전환 (T0-2-2) 과 결합도 — T0-2-2 후행 필수
  - 검증: 기존 데이터 동일하게 표시, security-reviewer 1회 패스

- [ ] **T0-1-3**: `/import` 라우트 비활성화
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: 라우트 200 + "준비 중" 카드, 코드 자체는 보존 (주석 추가)
  - 검증: `/import` 진입 시 200 + 안내 메시지

- [ ] **T0-1-4**: `/shuttle` 보류 (Stage C 흡수 예정 명시) + `/settlements`/`/settings` 보류 결정 적용
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: 클럽 탭 네비에서 노출 제거, 페이지는 임시 유지 + 향후 처리 주석
  - 검증: 클럽 탭 UI 에 3탭 더 이상 노출되지 않음

- [ ] **T0-1-5**: 게스트 [+추가] 버튼 출석부 측 추가 (Critic M3)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 입력: PRD §3.3 (게임보드 좌측 하단 + 출석부 양쪽 픽스 명시)
  - 출력: 출석부 페이지 (`/club/[clubId]/events/[eventId]/...` 또는 attendance 진입점) 에 [+ 게스트 추가] 버튼 픽스 추가
  - 검증: 두 화면 모두에서 게스트 추가 동작 일관

- [ ] **T0-1-6**: `/me` 보류 (Stage 0 W2 종료까지 유지, M1 반영)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: 클럽 탭 네비에서 노출 제거하되 라우트 자체는 살려둠 — Stage 0 W2 의 Glicko mu/phi 전환 검증에 사용, Stage A W5 에서 `/mypage` 흡수 시 redirect 처리
  - 검증: `/me` 직접 진입 200 + mu/phi 표시 정상

- [ ] **T0-1-7**: 클럽 탭 네비 정렬 (`src/app/club/[clubId]/layout.tsx`)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: 회원 뷰 3탭(`[일정]`, `[멤버]`, `[스탯]`), 운영자 뷰는 + `[관리]` 1탭 추가
  - 검증: 두 권한 진입 시 탭 개수·라벨 PRD §2.2 일치

### 7.4 Week 2 — 게임보드 3버튼 + Glicko 데이터 흐름 재배선 (Critic C3)

> **Critic C3 핵심**: Glicko-2 코드는 이미 `score: 0|0.5|1` 을 받음 (`src/lib/club/glicko2.ts:57-72`). 진짜 작업은 "matches.winning_team 을 single source 로 만들고, ranking/actions.ts:109 와 player_stats 집계 RPC 가 점수 대신 winning_team 을 읽도록 데이터 흐름 재배선".

#### 점수 의존 코드 위치 (Critic 인용 + 추가 검증)
- `src/components/club/gameboard/PlayingPhase.tsx` 의 점수 의존 7곳: line 37(getWinState 정의), 423(onSave), 449(activeTeam derive), 1667(winState derive), 1816(scoreA 표시), 1840(scoreModalOpen), 1848~1855(deltaA derive)
- `src/app/club/[clubId]/ranking/actions.ts:109`: `newScoreA > newScoreB ? 1 : newScoreA < newScoreB ? 0 : 0.5` ← winning_team 읽기로 전환
- `update_player_stats_for_match` RPC (`supabase/migrations/20260510000002_glicko2_ratings.sql` 부근): prev/new score 4개 파라미터 → winning_team 1개 파라미터 변경 (또는 호환 보존하며 winning_team 부가)

#### 작업 단위

- [ ] **T0-2-1**: 게임보드 점수 입력 UI 제거 → 3버튼 (PRD §3.3)
  - Agent: executor-high (Opus) + designer 사전 와이어
  - 예상 시간: 2.5일 (v1 의 2일에서 +0.5일 — PlayingPhase 7곳 변경 안전 마진)
  - 입력: `src/components/club/gameboard/PlayingPhase.tsx` (1900+줄), `src/components/club/gameboard/playing/*`, `src/components/club/GameBoardClient.tsx`
  - 출력:
    1. `- 0 +` 점수 위젯 제거 (line 1816 영역)
    2. 종료 액션을 `[A팀 승]/[B팀 승]/[무승부]` 3버튼으로 교체
    3. `scoreA`/`scoreB` state 제거 또는 deprecation
    4. `scoreModalOpen` 단순화 (3버튼 confirm 으로 대체)
    5. 매치 결과 저장 시 `winning_team` 만 기록
  - 위험: R2, R8 (작업량 초과) — PoC 결과로 calibration
  - 검증: 한 매치 종료 시 `matches.winning_team` 이 'A'|'B'|null 로 저장, `matches.score_a/score_b` NULL 허용 확인, e2e 게임보드 한 사이클 통과

- [ ] **T0-2-2**: Glicko-2 데이터 흐름 재배선 (Critic C3 재정의)
  - Agent: executor-high (Opus) + architect 사전 1회 분석 (점수 의존 코드 grep 결과 검토)
  - 예상 시간: 2일
  - 입력: `src/lib/club/glicko2.ts`(이미 0|0.5|1 수용), `src/app/club/[clubId]/ranking/actions.ts:109`, `update_player_stats_for_match` RPC
  - 출력:
    1. `ranking/actions.ts:109` 의 점수 비교를 `winning_team` 읽기로 전환 (`teamAResult = winning_team === 'A' ? 1 : winning_team === 'B' ? 0 : 0.5`)
    2. `applyGlickoForMatch` 의 prev/new score 시그니처를 winning_team 으로 전환 (호출자도 함께)
    3. `update_player_stats_for_match` RPC 도 winning_team 입력 받도록 변경 (T0-3-3 마이그와 같은 SQL 묶음)
    4. PoC 가 끝낸 1곳 외 나머지 6곳도 모두 winning_team source 로 전환
  - 위험: R2 — 마이그 후 simulate replay 로 검증
  - 검증:
    - 단위 테스트 전부 통과 (`src/lib/club/__tests__/glicko2.test.ts`)
    - **측정 가능 회귀 테스트 (Critic H1, H5)**: 동일 4명 A팀 5연승 시뮬 → A팀 mu 5경기 차이 ≥ 80 단조증가, phi 단조감소, B팀 mu 5경기 차이 ≤ -80 단조감소
    - 기존 시즌 matches 를 새 알고리즘으로 replay 했을 때 상위 10명 랭킹 순서 80% 이상 일치

- [ ] **T0-2-3**: `/me` 페이지로 Glicko 전환 dogfooding (M1 반영)
  - Agent: qa-tester (Sonnet)
  - 예상 시간: 0.5일
  - 입력: T0-2-2 적용된 `/club/[clubId]/me`
  - 출력: 본인 mu/phi 실측 비교 리포트 (T0-2-2 전후) — `.omc/notepads/{plan}/glicko-rewire-validation.md`
  - 검증: mu/phi 값이 PoC 시뮬과 일관, `/me` 페이지가 winning_team 만으로 정상 렌더

### 7.5 Week 3 — PRD §4 5개 마이그 분할 + 백업/롤백 + drift 정합 (Critic C1, C5)

> **Critic C1 핵심**: v1 T0-2-3 단일 마이그가 너무 거대 + 5개 컬럼군이 PRD §4 신규 도입임. 5개 독립 파일로 분할 + 각 down.sql + row count 비교 의무.

#### 작업 단위

- [ ] **T0-3-0**: 마이그 전 백업 (Critic C5)
  - Agent: 사용자 직접 + executor (Sonnet) 보조
  - 예상 시간: 0.5일
  - 입력: 운영 DB
  - 출력:
    1. Supabase 콘솔에서 `pg_dump --schema=public > backup-2026-{date}.sql` 다운로드 → Supabase Storage 백업 버킷 업로드
    2. staging clone DB 1개 생성 (Supabase 의 branch 또는 별도 프로젝트)
    3. 백업 파일 hash 기록 (`.omc/notepads/{plan}/backup-manifest.md`)
  - 검증: 백업 파일 ≥ 10MB (현재 DB 크기 기준), 복원 테스트 1회 통과

- [ ] **T0-3-1**: `clubs.custom_url_id` + `clubs.plan_type` 추가 (C1 분할 a)
  - Agent: executor-high (Opus) + architect 마이그 SQL 사전 리뷰
  - 예상 시간: 0.5일
  - 입력: PRD §4 (`custom_url_id Unique`, `plan_type Free/Basic/Pro`)
  - 출력:
    1. `supabase/migrations/20260518000001_add_clubs_custom_url_and_plan.sql`
       - `ALTER TABLE clubs ADD COLUMN custom_url_id TEXT UNIQUE`
       - `ALTER TABLE clubs ADD COLUMN plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free','basic','pro'))`
    2. `supabase/migrations/20260518000001_add_clubs_custom_url_and_plan.down.sql` (역방향)
    3. 마이그 전후 `clubs` row count 비교 스크립트 (`.omc/scripts/verify-migration-rowcount.ts` 신규)
  - 검증: row count 동일, 모든 기존 클럽 `plan_type='free'` 디폴트, custom_url_id NULL (Stage A 의 TA-2-3 에서 채움)

- [ ] **T0-3-2**: `users.{kakao_id, bp_score, grade, manner_temp}` 추가 (C1 분할 b)
  - Agent: executor-high (Opus) + architect 마이그 SQL 사전 리뷰
  - 예상 시간: 0.5일
  - 입력: PRD §4
  - 출력:
    1. `supabase/migrations/20260518000002_add_users_prd_columns.sql`
       - `ALTER TABLE users ADD COLUMN kakao_id TEXT`
       - `ALTER TABLE users ADD COLUMN bp_score INTEGER DEFAULT 0`
       - `ALTER TABLE users ADD COLUMN grade TEXT CHECK (grade IN ('S','A','B','C','D','E','F'))`
       - `ALTER TABLE users ADD COLUMN manner_temp NUMERIC(4,1) DEFAULT 36.5`
    2. 대응 `.down.sql`
    3. row count 비교
  - 검증: row count 동일, 기존 user 모두 manner_temp=36.5 디폴트

- [ ] **T0-3-3**: `matches.winning_team` 추가 + 점수 컬럼 NULL 허용 (C1 분할 c, T0-2-2 와 SQL 묶음)
  - Agent: executor-high (Opus) + architect
  - 예상 시간: 0.5일
  - 입력: PRD §4 (`winning_team A|B|Null`), T0-2-1/T0-2-2 의 코드 전환
  - 출력:
    1. `supabase/migrations/20260518000003_matches_winning_team.sql`
       - `ALTER TABLE matches ADD COLUMN winning_team TEXT CHECK (winning_team IN ('A','B'))`
       - `ALTER TABLE matches ALTER COLUMN score_a DROP NOT NULL`
       - `ALTER TABLE matches ALTER COLUMN score_b DROP NOT NULL`
       - 기존 row 백필: `UPDATE matches SET winning_team = CASE WHEN score_a > score_b THEN 'A' WHEN score_a < score_b THEN 'B' ELSE NULL END` (점수가 NULL 이 아닌 row 만)
       - `update_player_stats_for_match` RPC 시그니처 변경 (또는 신규 wrapper)
    2. 대응 `.down.sql` (winning_team 컬럼 drop)
    3. 백필 후 row count + winning_team 분포 비교 (예: A승 N건, B승 M건, draw L건)
  - 위험: R1 — staging 24h 검증 필수
  - 검증: 백필 후 점수와 winning_team 정합, ranking 회귀 simulate replay 통과

- [ ] **T0-3-4**: `session_guests.invited_by` 추가 (C1 분할 d)
  - Agent: executor-high (Opus)
  - 예상 시간: 0.5일
  - 입력: PRD §4
  - 출력:
    1. `supabase/migrations/20260518000004_session_guests_invited_by.sql`
       - `ALTER TABLE session_guests ADD COLUMN invited_by UUID REFERENCES users(id) ON DELETE SET NULL`
    2. 대응 `.down.sql`
    3. row count 비교
  - 검증: 기존 게스트 모두 invited_by NULL (Stage C 정산소에서 백필)

- [ ] **T0-3-5**: `birdieminton_user_id` 타입 정합 (D2 결정, C1 분할 e)
  - Agent: executor-high (Opus) + architect 사전 리뷰 **필수** (RLS 정책 모두 캐스팅 영향)
  - 예상 시간: 1일
  - 입력: D2 결정 (**UUID 정합화, auth.uid 통일**), 기존 text 컬럼들
  - 출력:
    1. `supabase/migrations/20260518000005_birdieminton_user_id_uuid.sql`
       - 영향 받는 모든 테이블/RPC/RLS 정책 식별 (grep `birdieminton_user_id` 전수 결과 첨부)
       - `ALTER COLUMN ... TYPE UUID USING ...::uuid`
       - 모든 RLS 정책의 `auth.uid()::text` 캐스팅 정리
       - 데이터 마이그레이션: text 값이 valid UUID 면 캐스팅, 아니면 NULL 처리 + 사전 alert
    2. 대응 `.down.sql` (TEXT 로 ALTER 역방향)
    3. row count 비교 + UUID 캐스팅 실패 row 리스트
  - 위험: R1, R3 (RLS 우회) — security-reviewer 1회 통과 필수
  - 검증: 모든 RPC 호출 200, RLS 정책 전수 회귀 (master admin / owner / member / guest 4역할 × 핵심 5경로 = 20 케이스)

- [ ] **T0-3-6**: BP 카피 코드 미러링 (Critic H2, D4)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 입력: PRD §3.1 등급/칭호 라인 (F: "실력이 아F다..." ~ S: "S윽 쳐도 득점")
  - 출력:
    1. `src/lib/bp/copy.ts` 신규 — PRD §3.1 의 7개 등급별 (등급, BP 범위 min/max, 한국어 카피) 상수
    2. `src/lib/bp/__tests__/copy.test.ts` 신규 — PRD md 파일을 `fs.readFileSync` 로 읽어 §3.1 영역 파싱 후 `copy.ts` 와 비교, 한 글자라도 다르면 fail
  - 검증: 단위 테스트 통과, PRD md 한 줄 수정 후 테스트 fail → 수동으로 코드 동기화 검증

- [ ] **T0-3-7**: drift 정합 (실DB-마이그 불일치 컬럼 정리)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 입력: `users` 의 `phone`, `is_placeholder`, `quiz_level`, `profile_img` (실DB 만 존재)
  - 출력: `supabase/migrations/20260518000006_drift_alignment.sql` — 실DB 에만 있는 컬럼들을 마이그 트리에 정식 등록 (멱등 IF NOT EXISTS 패턴)
  - 검증: 마이그 트리와 staging clone 가 schema diff 0

- [ ] **T0-3-8**: 마이그레이션 후 통합 회귀 (Critic H5)
  - Agent: qa-tester-high (Opus)
  - 예상 시간: 0.5일
  - 입력: 5개 마이그가 staging clone 에 24h 적용된 상태
  - 출력: 통합 회귀 리포트
    - 8개 핵심 시나리오 (게임보드 한 사이클, 랭킹 갱신, 정산 시작, 가입 신청, master admin, RLS 4역할 등) 모두 200
    - row count 5개 마이그 모두 0 변동 (백필 제외)
    - winning_team 백필 분포 리포트
  - 검증: 8개 시나리오 모두 pass, security-reviewer 1회 통과

### 7.6 Stage 0 dogfooding 체크포인트 (측정 가능, Critic H1)

- [ ] 클럽 탭에 `[일정]/[멤버]/[스탯]` (+ 운영자 `[관리]`) **딱 3~4개만** 보이는가 (T0-1-7 검증)
- [ ] 14개 라우트 매트릭스 결정 사항이 모두 적용되어 있는가 (T0-1-0 산출물 확인)
- [ ] 게임보드 한 사이클 완주: 셋업 → 자동 배정 → 진행 → 3버튼 종료 → 다음 매치, 클릭 ≤ 15회 (UX 기준)
- [ ] **Glicko 측정 가능 검증**: 동일 4명 A팀 5연승 시뮬 시 — A팀 mu 단조증가(차이 ≥ 80), B팀 mu 단조감소(차이 ≤ -80), 모든 player의 phi 단조감소
- [ ] 새 스키마 5개 마이그가 staging 24h 통과 + 통합 회귀 8개 시나리오 pass
- [ ] `pg_dump` 백업 파일 hash 가 `backup-manifest.md` 에 기록되어 있음
- [ ] T0-3-6 BP 카피 단위테스트 pass (PRD md 와 코드 일치)
- [ ] `tsc` 0 error, `npm run lint` 0 error, e2e 핵심 5시나리오 pass
- [ ] 게스트 [+추가] 버튼이 게임보드 + 출석부 양쪽에 노출 (Critic M3)
- [ ] **마케팅 페이지 일관성** (Critic M2): `/manual`, `/blog`, `/pricing`, 랜딩 — Stage 0 변경(게임보드 3버튼, custom_url_id) 에 대한 카피 충돌 0건

---

## 8. Stage A 상세 (2주) — 글로벌 네비 + 마이페이지 + 핸들 (UUID 영구 병행)

### 8.1 목적
PRD §2.1 GNB 4탭 풀도입, 마이페이지 컨텐츠 완성, `/club/{handle}` 핸들 라우팅 도입하되 **D3 결정에 따라 기존 UUID URL 도 영구 보존 (양쪽 200)**.

### 8.2 Week 4 — GNB 4탭 신설

- [ ] **TA-1-1**: `/dashboard` 신설 — 다가오는 내 일정 투표 카드 + 미납 회비 배너 (+ 운영자 요약)
  - Agent: executor-high (Opus) + designer-high (Opus) 사전 와이어
  - 예상 시간: 2일
  - 출력: `src/app/dashboard/page.tsx` + 카드 컴포넌트
  - 검증: 비로그인 → 로그인 redirect, 로그인 → 카드 정상 로드

- [ ] **TA-1-2**: `/my-clubs` 신설 — 내가 소속된 모임 아카이브
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: `src/app/my-clubs/page.tsx`
  - 검증: 클럽 카드 3개 이상 노출, 클릭 시 핸들 또는 UUID 라우트 양쪽 진입 가능 (D3)

- [ ] **TA-1-3**: `/explore` 신설 — "매칭 기능 준비 중" 배너 + 공개 클럽 디스커버리
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: `src/app/explore/page.tsx`
  - 검증: 공개 클럽 RPC 정상

- [ ] **TA-1-4**: `/mypage` 신설 (껍데기)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: 스켈레톤 (Week 5 에서 컨텐츠 채움)

- [ ] **TA-1-5**: 전역 GNB 컴포넌트 통합
  - Agent: designer (Sonnet)
  - 예상 시간: 1일
  - 출력: 모바일/데스크톱 GNB 4탭 통합, 현재 페이지 highlight
  - 검증: 4탭 왕복 클릭 정상

### 8.3 Week 5 — 마이페이지 컨텐츠 + 핸들 듀얼 라우팅 (D3) + 푸시

- [ ] **TA-2-1**: 마이페이지 컨텐츠 (카톡 프사 + BP/등급 뱃지 + 매너 온도)
  - Agent: designer-high (Opus)
  - 예상 시간: 2일
  - 입력: T0-3-2 의 `users.{kakao_id, bp_score, grade, manner_temp}`
  - 출력: 프사 카드, BP/등급 뱃지, 매너 온도 게이지
  - 검증: BP=0 / grade=null / manner=36.5 디폴트 정상

- [ ] **TA-2-2**: 핸들 + UUID 듀얼 라우팅 (Critic H3, D3)
  - Agent: executor-high (Opus)
  - 예상 시간: 2일
  - 입력: T0-3-1 `clubs.custom_url_id UNIQUE`
  - 출력:
    1. `src/app/club/[handleOrId]/page.tsx` 가 handle 또는 UUID 모두 수용 (Server Component 에서 UUID v4 정규식 검증 → DB 조회 분기)
    2. **양쪽 모두 200** (301 redirect 폐기 — v1 R7 의 redirect 방침 정정)
    3. `<head>` 의 canonical link tag 는 항상 handle URL 만 지정 → SEO
    4. `sitemap.xml` 도 handle URL 만 포함
    5. UUID URL 은 영구 작동 (외부 링크 보호)
  - 위험: R7 (SEO duplicate content) — canonical 로 mitigate
  - 검증:
    - handle 진입 200, UUID 진입 200, 둘 다 동일 페이지 렌더
    - `view-source` 의 canonical 이 handle URL
    - sitemap.xml 에 handle URL 만 존재

- [ ] **TA-2-3**: 기존 클럽 자동 슬러그 마이그레이션
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 입력: T0-3-1 의 빈 custom_url_id
  - 출력: 마이그레이션 스크립트 — 한글 이름 → 슬러그 생성, 충돌 시 `-2`, `-3` 접미
  - 검증: 모든 클럽이 custom_url_id 보유

- [ ] **TA-2-4**: 운영자 핸들 수정 UI (`/club/{handle}/manage`)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: 핸들 입력 폼 + 실시간 중복 체크

- [ ] **TA-2-5**: 푸시 알림 미들웨어 통합
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 입력: `supabase/migrations/20260510000006_push_subscriptions.sql`
  - 출력: GNB 어디서든 푸시 권한 요청
  - 검증: 알림 권한 허용 → 토큰 저장

- [ ] **TA-2-6**: `/club/[clubId]/me` 를 `/mypage` 로 흡수 (Critic M1, Stage 0 W2 보존했던 라우트 정리)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: `/me` 라우트는 `/mypage?club={handle}` 으로 redirect (mu/phi 상세 표시는 마이페이지에 절제된 형태로 통합)
  - 검증: 기존 `/me` 링크 진입 시 마이페이지에서 동일 데이터 표시

### 8.4 Stage A dogfooding 체크포인트 (측정 가능)

- [ ] GNB 4탭 모두 왕복 가능, 각 탭 로드 시간 ≤ 2.5s (LCP)
- [ ] 마이페이지에 BP/등급/매너 영역 표시, 각 값이 DB 와 일치
- [ ] `/club/{handle}` 진입 200 + `/club/{uuid}` 진입 200 + canonical = handle URL 확인
- [ ] sitemap.xml 에 handle URL 만, UUID URL 0건
- [ ] 푸시 권한 요청 → 토큰 저장 검증
- [ ] **마케팅 페이지 일관성**: `/manual`, `/blog`, `/pricing` — handle 라우팅 도입 카피 충돌 0건

---

## 9. Stage B 상세 (2주) — BP 테스트 (PRD md single source 카피)

### 9.1 목적
PRD §3.1 의 17문항 빠른 스캔 + 결과 공유 카드를 MVP 수준으로 출시. **D4 결정에 따라 PRD md 가 single source, 코드는 미러, 단위 테스트가 md 파싱 검증**.

### 9.2 Week 6 — 17문항 UI + 알고리즘

- [ ] **TB-1-1**: 17문항 데이터 정의 + 가중치 매핑
  - Agent: researcher (Sonnet) + executor (Sonnet)
  - 예상 시간: 1.5일
  - 출력: `src/lib/bp-test/questions.ts` (17문항 + 카테고리·가중치 메타)
  - 카테고리: 기술 45%, 경험/이력 25%, 전술 15%, 체력 10%, 멘탈 5%
  - 검증: 17문항 합산 0~7.0 점 범위 보장 단위 테스트

- [ ] **TB-1-2**: `/test` 페이징 UI (MBTI 방식)
  - Agent: designer-high (Opus)
  - 예상 시간: 2일
  - 출력: `src/app/test/page.tsx` + 스카우터 진행률 바 + 좌우 스와이프
  - 검증: 17문항 한 사이클 매끄러움, 뒤로가기 시 진행률 유지

- [ ] **TB-1-3**: 알고리즘 구현 + boundary 단위 테스트
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: `src/lib/bp-test/score.ts` (총점 → grade + BP)
  - 검증: 모든 등급 boundary (0.8, 1.7, 2.7, 3.7, 4.7, 5.7) 정확히 매핑

- [ ] **TB-1-4**: BP/grade users 테이블 저장
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: server action + Supabase update RLS 통과
  - 검증: 비로그인 → 결과만 보이고 저장 안 됨, 로그인 시 즉시 저장

### 9.3 Week 7 — 결과 페이지 + 공유 카드 + md 파싱 단위테스트

- [ ] **TB-2-1**: 결과 페이지 (S~F 등급 + 칭호 + BP)
  - Agent: designer-high (Opus)
  - 예상 시간: 1.5일
  - 입력: T0-3-6 의 `src/lib/bp/copy.ts`
  - 출력: `src/app/test/result/page.tsx` — copy.ts 의 칭호 100% 사용
  - 검증: **PRD md 파싱 단위 테스트 통과 (T0-3-6 와 동일)**, copy.ts 와 PRD md 한 글자도 다르지 않음

- [ ] **TB-2-2**: 레이더 차트 (5개 카테고리)
  - Agent: designer (Sonnet)
  - 예상 시간: 1일
  - 출력: Chart.js 또는 SVG 기반 레이더
  - 검증: 5축 라벨 + 정상 폴리곤

- [ ] **TB-2-3**: 약점 1개 피드백 텍스트
  - Agent: writer (Haiku)
  - 예상 시간: 0.5일
  - 출력: 가장 낮은 카테고리 1개 자동 식별 → 카피 매핑

- [ ] **TB-2-4**: 공유 카드 이미지 생성 (Vercel OG)
  - Agent: executor-high (Opus)
  - 예상 시간: 2일
  - 출력: `src/app/api/og/bp/route.ts`
  - 위험: R5 (성능)
  - 검증: 첫 호출 ≤ 1.5s, 카카오톡 공유 미리보기 정상

- [ ] **TB-2-5**: 마이페이지 연동
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: TA-2-1 자리에 BP 결과 반영

### 9.4 Stage B dogfooding 체크포인트 (측정 가능)

- [ ] 17문항 한 사이클 평균 완료 시간 ≤ 4분 (PRD 의 "약 3분" 기준 +33% 여유)
- [ ] 등급/BP/칭호 카피 — **PRD md 단위 테스트 fail 없이 통과** (T0-3-6 의 테스트가 결과 페이지 카피와도 일관)
- [ ] 공유 카드 이미지 생성 ≤ 1.5s, 카카오톡 공유 1회 미리보기 정상
- [ ] 마이페이지에 BP/등급 반영
- [ ] **마케팅 페이지 일관성**: `/manual`, `/blog`, 랜딩 — BP 테스트 출시 후 카피 일관

---

## 10. Stage C 상세 (2주) — 정산소 + 매너온도 + 초대 랜딩

### 10.1 목적
PRD §3.4, §3.5 의 정산 사이클 완성. 게임보드 → 정산 → 매너평가 풀 사이클 dogfooding 가능. **`/settlements` 운명 결정** 도 이 Stage 진입 시 architect 와 1차 회의.

### 10.2 Week 8 — 정산소 MVP (`/session/{id}/summary`)

- [ ] **TC-1-0**: `/club/[clubId]/settlements` 운명 결정 (Critic C4)
  - Agent: architect (Opus) — 0.5일 검토
  - 결정: (a) `/session/{id}/summary` 와 통합 — 클럽 단위 정산 history 만 settlements 에 남김 / (b) settlements 폐기 — summary 가 일정 단위 정산을 전담 / (c) settlements 가 cross-session 통합 정산 — Stage 진입 시 architect 와 결정
  - 출력: `.omc/notepads/{plan}/settlements-decision.md`

- [ ] **TC-1-1**: 정산 페이지 라우트 + 모듈형 입력 폼
  - Agent: designer-high (Opus) + executor-high (Opus)
  - 예상 시간: 2일
  - 출력: `src/app/session/[sessionId]/summary/page.tsx` — 장소료/콕값 토글
  - 검증: 토글 OFF 항목 합산 제외, **N빵 단위 테스트 (Critic H5)** — 회원 10 + 게스트 2 + 가중치 +2000원 케이스 / 고정 회비제 / 실비 분담제 3가지 모두 ±0원 정확

- [ ] **TC-1-2**: N빵 계산기 (고정 회비제 / 실비 분담제 / 게스트 가중치) + 단위 테스트 (H5)
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: 회원/게스트 차액 자동 계산 + 가중치 적용, `src/lib/settlement/__tests__/split.test.ts` 신규
  - 검증: 6개 시나리오 단위 테스트 (회원 4명만 / 회원+게스트1 / 회원+게스트3 / 가중치 +0 / 가중치 +2000 / 토글 일부 OFF) 모두 ±0원

- [ ] **TC-1-3**: 게스트 결제 합산 (invited_by, T0-3-4)
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: 게스트 명단 옆 [결제자 선택] 드롭다운, 선택 시 해당 user 총합에 합산
  - 검증: 게스트 1명 → 초대 회원의 결제액에 게스트 회비 합산, 단위 테스트 1건 추가

- [ ] **TC-1-4**: 카톡 정산 알림 — 고유 링크 생성 (실발송은 Stage D)
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: 정산 결과 토큰 기반 공개 URL (`/session/{id}/summary/share/[token]`)
  - 검증: 토큰 URL 정산 영수증 정상 렌더

- [ ] **TC-1-5**: 기존 `/shuttle` 코드 흡수
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: shuttle 의 콕 비용 로직을 정산 페이지로 이전, `/shuttle` 라우트는 redirect

### 10.3 Week 9 — 매너온도 + 초대 랜딩

- [ ] **TC-2-1**: 매너온도 평가 팝업 (`/session/{id}/review`)
  - Agent: designer (Sonnet)
  - 예상 시간: 1.5일
  - 출력: 정산 완료 후 자동 팝업 — 같이 뛴 파트너 프사 + 👍/😐/👎
  - 검증: 평가 1회 후 manner_temp 변화 (수치는 Stage C 진입 시 architect 와 결정 — 예: 👍 +0.1, 😐 0, 👎 -0.2)

- [ ] **TC-2-2**: 비매너 리포트 → Admin
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: 👎 3회 누적 → `/admin` 리포트 큐

- [ ] **TC-2-3**: 초대 랜딩 페이지 (`/club/{handle}/invite`)
  - Agent: designer-high (Opus)
  - 예상 시간: 1.5일
  - 출력: 커버 이미지 랜딩 + "[홍길동]님이 초대했습니다" + [카카오 1초 로그인]
  - 위험: 초대 토큰 위변조 → 단방향 hash
  - 검증: 토큰 24h 만료, 만료 토큰 안내 페이지

- [ ] **TC-2-4**: 초대 → 가입 자동화
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: 카카오 로그인 콜백 → 자동 가입 신청 (Free 한도 통과 시 승인 큐, 아니면 차단)
  - 검증: 비로그인 → 초대 링크 → 카카오 → 가입 신청 자동

### 10.4 Stage C dogfooding 체크포인트 (측정 가능, Critic H1)

- [ ] **풀 사이클 완주 (측정 가능)**: 회원 2명 + 게스트 1명, 코트 1개, 매치 3회, 정산 6000원 N빵 → **±0원 정확** (회원 2000 / 게스트 2000)
- [ ] 게스트 [결제자 선택] → 초대 회원 합산 6000원 표시
- [ ] 초대 링크 → 가입 자동화 동작 (1회 라이브 검증)
- [ ] 알림톡 발송 미연결이지만 토큰 URL 까지 정상 렌더 + 카톡 공유 미리보기 OK
- [ ] `/settlements` 운명 결정 문서 (`settlements-decision.md`) 존재
- [ ] N빵 6개 시나리오 단위 테스트 모두 pass
- [ ] **마케팅 페이지 일관성**: `/manual`, `/pricing` — 정산소 출시 카피 일관

---

## 11. Stage D 상세 (2주) — Basic/Pro + Toss 빌링 (가맹 승인 가정)

### 11.1 목적
PRD §5 의 누적 인원 종량제 SaaS 화. Toss 빌링 정기결제로 정상 매출. **T0-0-1 의 가맹 신청 승인이 Stage D 시작 전까지 도착해 있어야 함 (R6, 2~4주 리드타임 확보됨)**.

### 11.2 Week 10 — 인원 가드 + Toss SDK

- [ ] **TD-1-0**: Toss 가맹 승인 확인 (T0-0-1 후속)
  - Agent: 사용자 직접
  - 출력: 가맹 승인 완료 또는 보완 요청 응답
  - 차단: 가맹 미승인 시 Stage D 진입 보류 → Stage E 로 swap 검토

- [ ] **TD-1-1**: 가입 신청 시 누적 인원 차단 + **통합 테스트 (H5)**
  - Agent: executor-high (Opus)
  - 예상 시간: 1.5일
  - 입력: `clubs.plan_type`, `club_members` 카운트
  - 출력: 가입 신청 RPC 에서 plan 한도 검사 → 초과 시 업그레이드 응답, e2e 통합 테스트 신규 (Free 50명, Basic 100명, Pro 무제한 boundary 각 1건)
  - 검증: Free 50명 클럽에 51번째 신청 → 차단 + 업그레이드 팝업, 통합 테스트 3건 pass

- [ ] **TD-1-2**: Toss 빌링 SDK 백엔드 (테스트 모드)
  - Agent: researcher (Sonnet) + executor-high (Opus)
  - 예상 시간: 2일
  - 출력: `/api/billing/*` (auth, charge, webhook), `.env` 키 분리
  - 검증: 테스트 카드 9,900원/29,900원 결제 성공, webhook 정상 수신

- [ ] **TD-1-3**: `/pricing` 페이지 + 결제 흐름
  - Agent: designer-high (Opus)
  - 예상 시간: 1.5일
  - 출력: 3티어 비교 표 + Basic/Pro CTA → Toss 결제 위젯
  - 검증: 결제 완료 후 clubs.plan_type 자동 업데이트

### 11.3 Week 11 — 차등 기능 + 결제 흐름 통합 테스트

- [ ] **TD-2-1**: 공동관리자 권한
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: `/manage/co-admins` — Basic 최대 3, Pro 무제한
  - 검증: Free 추가 비활성, Basic 4번째 차단

- [ ] **TD-2-2**: 미납 알림톡 (Basic 부터)
  - Agent: researcher (Sonnet) + executor-high (Opus)
  - 예상 시간: 1.5일
  - 출력: 카카오 알림톡 템플릿 등록 + 정산 24h 후 발송 RPC
  - 위험: 알림톡 템플릿 사전 승인 1~3일
  - 검증: Basic 클럽 운영자 → 미납자 1명 → 알림톡 발송 성공

- [ ] **TD-2-3**: Excel 추출 (Pro 부터)
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: 정산/출석/재무 xlsx endpoint
  - 검증: Pro 클럽 다운로드 시 시트 3개 정상

- [ ] **TD-2-4**: PDF 보고서 (Pro 부터)
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: 연말/총회용 PDF
  - 검증: 1년치 데이터 PDF 생성 ≤ 5s

- [ ] **TD-2-5**: 데이터 보존 정책 (downgrade)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: 결제 만료 → plan_type=free, 기존 데이터 유지, 50명 초과 신규 일정 차단

- [ ] **TD-2-6**: 결제 흐름 통합 테스트 (H5)
  - Agent: qa-tester-high (Opus)
  - 예상 시간: 0.5일
  - 출력: Free → Basic 업그레이드 → 100명 초과 → Pro 업그레이드 → 결제 만료 → downgrade → 신규 일정 차단 의 1회 풀 시나리오
  - 검증: 모든 단계에서 RLS / 결제 / 차단 / 데이터 보존 정합

### 11.4 Stage D dogfooding 체크포인트 (측정 가능)

- [ ] Free 50명 → 51번째 가입 신청 → 차단 + 업그레이드 팝업 (boundary 측정)
- [ ] 테스트 결제로 Basic/Pro 업그레이드 성공 (≤ 30초 with webhook)
- [ ] 알림톡 / Excel / PDF 1회씩 검증
- [ ] Downgrade 시 데이터 유지 + 신규 일정 차단 검증
- [ ] **결제 흐름 통합 시나리오 1회 풀 통과** (TD-2-6)
- [ ] **마케팅 페이지 일관성**: `/pricing` 가 실제 결제 흐름과 100% 일치

---

## 12. Stage E 상세 (선택, 2주 가변) — 안정화 + 베타 + 잔재 + 마케팅 일관성

### 12.1 목적
대수술 직후 회귀 정리, `import`/체험하기 운명 결정, 베타 오픈, **PRD 변경 사항을 마케팅 페이지에 최종 반영 (Critic M2)**.

### 12.2 작업 단위

- [ ] **TE-1**: 종합 dogfooding 라운드 (운영자 5 + 회원 5 시나리오)
  - Agent: qa-tester-high (Opus) — 2일

- [ ] **TE-2**: 버그 핫스팟 정리 (우선순위 매김)
  - Agent: executor / executor-high — 가변

- [ ] **TE-3**: 성능 회귀 점검
  - Agent: scientist (Sonnet) + executor — 1일
  - 검증: LCP ≤ 2.5s on `/dashboard`, `/club/{handle}`, `/test`, `/summary`

- [ ] **TE-4**: Import 운명 결정
  - 사용자 결정: (a) 폐기 / (b) PRD 정합 재구현 / (c) 보류 연장
  - 산출물: 결정 문서 + 후속 plan 또는 코드 제거 PR

- [ ] **TE-5**: 체험하기 페이지 재도입 결정

- [ ] **TE-6**: 베타 사용자 모집 + 90일 grandfather
  - Agent: writer (Haiku) + executor
  - 출력: 가입 안내 메일, grandfather 표시 (`users.beta_until`)

- [ ] **TE-7**: 마케팅 페이지 최종 일관성 (Critic M2)
  - Agent: writer (Haiku) + designer (Sonnet)
  - 예상 시간: 1.5일
  - 입력: 모든 Stage 의 dogfooding 마지막 항목에서 누적된 카피 차이
  - 출력:
    1. `/manual` (가이드북 30개 콘텐츠) — Stage 0~D 변경 사항 반영 (게임보드 3버튼, 핸들 URL, BP 테스트, 정산소, 누적 인원 종량제)
    2. `/blog` — PRD 정합화 발표 글
    3. `/pricing` — 실제 결제 흐름과 100% 일치 (TD-2-6 와 cross-check)
    4. 랜딩 카피 — Free 50명/Basic 100명/Pro 무제한 명시
  - 검증: 4개 영역 모두 PRD §5 / §3 의 수치/문구와 word-by-word 일치

### 12.3 Stage E dogfooding 체크포인트 (측정 가능)

- [ ] 10개 통합 시나리오 모두 pass
- [ ] LCP ≤ 2.5s 4개 페이지 모두 달성
- [ ] Import/체험하기 결정 문서화
- [ ] 베타 사용자 10명 이상 grandfather 적용
- [ ] **마케팅 페이지 PRD 일치도 100%** (TE-7 검증, word-by-word)

---

## 13. 백업/롤백 전략 (신규 섹션, Critic C5)

### 13.1 원칙
모든 마이그(Stage 0 W3) 는 다음 4단계를 거치지 않으면 master merge 불가.

### 13.2 단계

1. **staging clone 24h 검증**
   - Supabase 의 branch 기능 또는 별도 staging 프로젝트에 마이그 적용
   - 24시간 동안 핵심 RPC 호출 모니터링 (Sentry / 로그 분석)
   - 실패 시 staging clone 만 폐기, 운영 영향 0

2. **`pg_dump` 백업**
   - 운영 마이그 직전 `pg_dump --schema=public --data-only > backup-{date}.sql`
   - Supabase Storage 의 백업 버킷에 업로드 + hash 기록
   - `.omc/notepads/{plan}/backup-manifest.md` 에 timestamp / hash / 파일 크기 기록

3. **마이그별 `down.sql`**
   - T0-3-1 ~ T0-3-5 의 5개 마이그 각각에 `*.down.sql` 동봉
   - `down.sql` 은 멱등 (`IF EXISTS`/`DROP COLUMN IF EXISTS` 패턴)
   - 단, T0-3-3 의 `winning_team` 백필은 비가역 (down.sql 에서 score_a/score_b 가 NULL 인 row 만 winning_team 도 drop)

4. **row count 비교 스크립트**
   - `.omc/scripts/verify-migration-rowcount.ts` 신규
   - 마이그 전 row count 캡쳐 → 마이그 후 비교 → diff 출력
   - 0 diff 가 아니면 자동 alert (CI 또는 수동 검증)

### 13.3 롤백 의사결정 트리

```
마이그 후 회귀 발견
       │
       ▼
T0-3-8 통합 회귀 8개 시나리오 fail?
       │
   ┌───┴───┐
  Yes      No
   │        │
   ▼        ▼
즉시 down.sql  비즈니스 로직 수정
실행 →        (마이그 유지, 후속 PR)
백업으로 복원
```

### 13.4 백업 보존
- 운영 백업: Stage 0 W3 마이그 1회당 1개 → 최소 7일 보존
- Stage A~D 의 마이그 추가 분이 있으면 그때마다 1개씩

---

## 14. 커밋 전략 (모든 Stage 공통)

- Stage 별 브랜치: `stage-0/cleanup`, `stage-a/global-nav`, ...
- 작업 단위(T*) 별 atomic commit
- 마이그레이션 적용 commit 은 단독 PR (롤백 가능성 확보) + 대응 down.sql 같은 PR 에 동봉
- 각 PR description 에 dogfooding 체크리스트 복사·체크 + **측정 가능 검증 항목 수치 기록**
- master merge 는 dogfooding 통과 + architect 검증 + (T0-3-* 인 경우) security-reviewer 통과 후

---

## 15. 성공 기준 (Definition of Done — 전체 플랜)

- [ ] PRD §1~7 의 모든 명세가 코드와 1:1 매핑됨 (격하/제거 항목은 결정 문서에 명시)
- [ ] PRD 미명세 부가 기능 0개 (또는 명시적 격하 후 보존)
- [ ] Free/Basic/Pro 누적 인원 차단 정상 동작 + Toss 결제 흐름 라이브
- [ ] 게임보드 → 정산 → 매너평가 풀 사이클 dogfooding 통과 (Stage C 의 회원 2 + 게스트 1 6000원 시나리오)
- [ ] BP 테스트 결과 카드 SNS 공유 1회 이상 검증 + **PRD md 카피 단위 테스트 통과**
- [ ] **Glicko-2 winning_team single source** 전환 완료, 5경기 시뮬 통과
- [ ] **5개 마이그 모두 down.sql 동봉 + row count 0 diff**
- [ ] **Toss 빌링 가맹 승인** + 9,900원/29,900원 라이브 결제 1건 이상
- [ ] **마케팅 페이지 4개 영역 PRD 일치도 100%**
- [ ] tsc 0 error, lint 0 error, e2e 핵심 시나리오 pass, Sentry 신규 critical 0건
- [ ] 베타 사용자 10명 이상 grandfather 처리

---

## 16. 다음 행동 (사용자가 결정할 것)

이 plan v2 는 critic 비평 + 사용자 결정 4건을 정밀 반영한 산출물이다. 다음 중 선택:

1. **PoC 실행** — `.omc/plans/birdieminton-prd-alignment-roadmap-2026-05-11-v2.md` 의 §4 PoC 절차 (반나절) 부터 시작. 통과 시 Stage 0 본격 진입.
2. **architect 재검토** — v2 plan 을 architect 가 1회 깊게 리뷰 (T0-3-5 birdieminton_user_id 캐스팅, T0-2-2 데이터 흐름 재배선 두 곳 위주)
3. **`start-work` 즉시 진입** — `/oh-my-claudecode:start-work birdieminton-prd-alignment-roadmap-2026-05-11-v2` (PoC 없이 곧장 T0-0-1 부터)
4. **추가 조정** — 특정 task/위험 매트릭스/dogfooding 조정 요청

**권장 순서**: 1 (PoC) → 통과 시 3 (start-work) / 실패 시 2 (architect 재검토 후 plan v3).

---

## 17. 부록 — 핵심 코드 위치 참조 (v1 + Critic 인용)

| 영역 | 경로 / 라인 |
|------|------|
| 게임보드 점수 로직 | `src/components/club/gameboard/PlayingPhase.tsx:37, 423, 449, 1667, 1816, 1840, 1848-1855` |
| 게임보드 컨테이너 | `src/components/club/GameBoardClient.tsx` |
| Glicko-2 라이브러리 | `src/lib/club/glicko2.ts` (이미 0\|0.5\|1 수용, line 57-72) |
| Glicko 단위 테스트 | `src/lib/club/__tests__/glicko2.test.ts` |
| 랭킹 actions (재배선 대상) | `src/app/club/[clubId]/ranking/actions.ts:109` |
| update_player_stats_for_match RPC | `supabase/migrations/20260510000002_glicko2_ratings.sql` 부근 |
| 마이그레이션 트리 | `supabase/migrations/` (최신: `20260511000000_fix_rls_regressions.sql`) |
| 마스터 어드민 | `src/app/admin/`, `src/lib/auth/master.ts` |
| 알림 | `src/lib/notifications/`, `supabase/migrations/20260510000006_push_subscriptions.sql` |
| 등급 라이브러리 | `src/lib/club/grade.ts`, `src/components/club/GradeBadge.tsx` |
| BP 카피 (신규) | `src/lib/bp/copy.ts`, `src/lib/bp/__tests__/copy.test.ts` (T0-3-6) |
| 정산 N빵 (신규) | `src/lib/settlement/__tests__/split.test.ts` (TC-1-2) |
| 마이그 검증 스크립트 (신규) | `.omc/scripts/verify-migration-rowcount.ts` |
| Plan 노트패드 | `.omc/notepads/birdieminton-prd-alignment-roadmap-2026-05-11-v2/` |
| 14개 라우트 매트릭스 (신규) | `.omc/notepads/{plan}/route-decision-matrix.md` (T0-1-0) |
| Toss 트래커 (신규) | `.omc/notepads/{plan}/toss-billing-tracker.md` (T0-0-1) |
| 백업 매니페스트 (신규) | `.omc/notepads/{plan}/backup-manifest.md` (T0-3-0) |
| PoC 보고 (신규) | `.omc/notepads/{plan}/poc-report.md` (§4) |
| Settlements 결정 (신규) | `.omc/notepads/{plan}/settlements-decision.md` (TC-1-0) |
