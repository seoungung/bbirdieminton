# Birdminton 4-Stage Roadmap (2026-05-09)

> 베타 시작 직전 ~ Phase 3 (Team 출시) 까지의 단계별 작업 계획
> 1인 팀 / 베타 5~10명 / Vercel Hobby + Supabase Free / "막히면 즉시 처방" 원칙

---

## Context

### Original Request
버디민턴(배드민턴 동호회 SaaS) 베타 출시 전후 4단계 로드맵 수립. 보안 리뷰 P1~P3 + 코드 리뷰 CRITICAL/HIGH/MEDIUM + 가격 전략 (2026-04-29 확정) + 현재 상태(Toss 봉인, Glicko-2/통계/정모/대기/Push/게임보드 코드 완성, `users.phone` 없음)을 입력으로 받음.

### Interview Summary
- **Stage A 시간 박스**: "유연하게 — P1 마치면 즉시 베타 시작, 핫스팟은 best-effort" 가정 (1인 팀 + dogfooding 우선 원칙과 부합)
- 그 외 모든 입력 컨텍스트는 명확하므로 추가 인터뷰 없이 진행

### Key Constraints
| 항목 | 값 |
|------|-----|
| 팀 | 1인 (사용자 본인) |
| 베타 사용자 | 5~10명 (본인 모임 + 친구 1~2 모임) |
| 인프라 | Vercel Hobby + Supabase Free |
| 예산 | 알림톡 비용 균형 — 베타 중 카카오 비즈 연동은 선택 |
| 결제 | **PDF 1회 결제 모델 폐기 → Pro ₩9,900/월 정기결제(Toss 빌링)로 통일.** 베타 동안 결제 비활성, Stage C에서 빌링 가동 |
| 엔지니어링 톤 | 과도한 추상화 금지 — Phase 1은 "검증" 단계, Phase 2 진입 시점에 정리 |

---

## Roadmap Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Stage A    Stage B (Week 1~12)                  Stage C            Stage D      │
│  D-2 ~ D0   ───── 베타 진행 ─────                  3 개월 후         6 개월 후     │
│  보안 P1    피드백 흡수 + P2/HIGH 정리            빌링 라이브        Team + B2B   │
│  PDF결제    데이터 수집 + 빌링 SDK 백엔드          grandfather        멀티 클럽    │
│  코드 제거  (12 주)                                Pro ₩9,900/월      (옵션)       │
│  핫스팟 3   ┌─────────────────────────┐           (3~4 주)                       │
│  (3~5일)   │ 외부: 토스 가맹 빌링 재심사 │                                          │
│            │ Week 8 신청 → 1~3주 심사  │ ─────► 라이브 전환 의존성                 │
│            └─────────────────────────┘                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 단계 간 게이트
- **A → B**: P1 8건 모두 done + 핵심 시나리오(클럽 생성/세션 진행/통계 표시) smoke test 통과 + **PDF 1회 결제 코드 제거 완료**
- **B → C**: PMF 시그널(아래 측정 지표 충족) + PLF 자산 80% 완성 + **빌링 SDK 백엔드 + DB 스키마 완성 (테스트 모드)** + **토스 빌링 가맹 신청 접수**
- **C → D**: Pro MRR ≥ ₩200k + 운영 안정 (월 P0 이슈 0건 3개월 연속) + 자생적 가입 모임 ≥ 5개

### 외부 의존성 — 토스 빌링 재심사
| 항목 | 내용 |
|------|------|
| 사유 | 기존 가맹 신청은 "기본결제패키지(1회성)" — 빌링(정기결제)은 별도 패키지 재신청 필요 |
| 절차 | 홈페이지에 정기결제 상품 진열 → 토스 채팅 문의 → 계약부서 재검토 |
| 소요 | **1~3주 (예측 불가, 평균 2주 가정)** |
| 신청 시점 | Stage B Week 8 (PMF 시그널 윤곽 + `/pricing` 페이지 진열 완료 후) |
| 라이브 전환 | Stage C 시작 ≈ Week 12, 심사 통과 후 봉인 해제 |
| 리스크 헷지 | 심사 지연 시 grandfather 기간 자동 연장 (코드에 ENV 한 곳에서 변경 가능) |

---

## Stage A — 베타 시작 전 D-2 Sprint (3~5일)

### Core Objective
**"베타 사용자에게 보여줘도 부끄럽지 않을 보안 베이스라인 + 즉시 보이는 dead code/중복 정리"**

### Deliverables
1. P1 8건 모두 머지
2. 코드 핫스팟 3건 정리 (best-effort, 안 끝나면 Stage B로 이월)
3. **PDF 1회 결제 코드 7개 파일 제거** (피벗 결정 — 베타 사용자 혼란 방지)
4. Smoke test 체크리스트 통과 후 베타 invite 송출

### Definition of Done
- [ ] `npm audit` high/critical 0건
- [ ] 모든 RPC `auth.uid() IS NOT NULL` 가드 또는 `SECURITY INVOKER` + RLS 통과
- [ ] `/club/create?demo=1` 익명 차단 검증
- [ ] `delete_club_cascade` 단일 정의 + 마이그레이션 정합성 확인
- [ ] **PDF 1회 결제 코드 7개 파일 삭제 + 빌드 통과 + dead route 검증 (`/shop/starter-guide`, `/pdf/success`, `/pdf/fail` 모두 404)**
- [ ] 본인 모임 1회 + 친구 모임 1회 dogfood smoke test (모임 생성→정모 등록→게임 1세트→통계 확인)

### Tasks

#### A-1. 보안 P1 — RPC 인증 가드 (1일)
| ID | 작업 | 파일 / RPC | 검증 |
|----|------|-----------|------|
| A-1a | `start_pending_session`, `create_pending_session`, `cancel_pending_session` 인증 가드 | `supabase/migrations/*pending_session*.sql` | psql `SET ROLE anon` 호출 → `permission denied` |
| A-1b | `start_game_session`, `update_player_stats_for_match` 인증 가드 + `host_id = auth.uid()` 체크 | 게임 세션 RPC 마이그레이션 | 동일 |
| A-1c | `glicko2_prepare_match` 인증 가드 | Glicko-2 마이그레이션 | 동일 |

**완화**: RPC 본문 첫 줄에 `IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;` 일괄 추가.

**선행 의존성**: 없음. 즉시 시작 가능.

#### A-2. 보안 P1 — 익명/스푸핑 차단 (0.5일)
| ID | 작업 | 검증 |
|----|------|------|
| A-2a | `/club/create?demo=1` `is_anonymous` 가드 추가 | 익명 세션으로 접근 → 401 redirect |
| A-2b | `createNoticeAction` `author_id`를 server-side `session.user.id`로 강제 | author 스푸핑 시도 → 무시 |

#### A-3. 보안 P1 — 스키마 정합성 (0.5일)
| ID | 작업 | 검증 |
|----|------|------|
| A-3a | `notices` / `notifications` / `import_logs` 누락 마이그레이션 작성 | `supabase db diff` 빈 출력 |
| A-3b | `delete_club_cascade` 두 정의 중 신규(cascade 포함)만 남기고 구버전 삭제 | `\df delete_club_cascade` 단일 결과 |

#### A-4. 보안 P1 — 의존성 (0.5일)
- `npm audit fix` (Next.js DoS) → 변경된 lockfile + 1회 빌드 + 핵심 페이지 1회 수동 sanity check
- 의존성 메이저 점프 발생 시 → Stage B로 이월

#### A-5. 코드 핫스팟 — 즉시 처방 (0.5일, best-effort)
| ID | 작업 | 효과 |
|----|------|------|
| A-5a | `ClubPreviewKpiGrid.tsx` dead code 삭제 | 빌드 사이즈/혼란 감소 |
| A-5b | `inputCls` 3중복 → `lib/forms/styles.ts` 1곳으로 통합 | DRY |
| A-5c | `notifyRecentlyPromoted` Kakao stub 가드 — 환경변수 미설정 시 1회 warn 후 skip, race window 막기 위해 promotion 직후 transaction 내 ledger insert | 의도치 않은 N번 호출 방지 |

**이월 규칙**: A-5 미완료분은 Stage B 우선순위 큐 최상단으로.

#### A-6. 결제 모델 피벗 — PDF 1회 결제 코드 제거 (1일)
> **결정 근거**: 2026-05-09 토스 상담 + 빌링 피벗 결정. PDF 가입비 ₩330,000 1회 결제 모델 폐기 → Pro ₩9,900/월 정기결제로 통일. 베타 사용자가 `/shop/starter-guide` 진입 시 혼란 방지를 위해 베타 시작 전 제거.

| ID | 작업 | 파일 / 영역 | 검증 |
|----|------|-----------|------|
| A-6a | LP / 주문 페이지 제거 | `src/app/shop/starter-guide/page.tsx`, `src/app/shop/starter-guide/order/page.tsx` | 라우트 404 확인 |
| A-6b | 결제 위젯 제거 | `src/components/shop/OrderForm.tsx` (`@tosspayments/tosspayments-sdk` widgets API 사용 부분) | 컴포넌트 import 0건 grep |
| A-6c | 1회 결제 confirm API 제거 | `src/app/api/payments/toss/confirm/route.ts` | 라우트 404 |
| A-6d | 결제 결과 랜딩 제거 | `src/app/pdf/success/page.tsx`, `src/app/pdf/fail/page.tsx` | 라우트 404 |
| A-6e | `LAUNCH_ENABLED` 봉인 토글 제거 | `OrderForm.tsx` 내부 + 관련 ENV (있다면 `.env*` 정리) | grep 0건 |
| A-6f | navigation / link / sitemap 정리 | 메인 메뉴, footer, sitemap 등에서 `/shop/starter-guide` 링크 제거 | 빌드 후 broken link 0건 |
| A-6g | 의존성 점검 | `@tosspayments/tosspayments-sdk` 는 **유지** (Stage B 빌링 SDK가 동일 패키지 사용) | `package.json` 변경 X |

**완화**:
- 삭제 전 `git grep -l "starter-guide\|LAUNCH_ENABLED\|/pdf/success\|/pdf/fail"` 1회로 미사용 참조까지 색출
- 마이그레이션 (`payment_orders` 테이블 등 1회 결제 전용 테이블이 있다면) 은 Stage B 초반에 별도 처리 — 베타 데이터 충돌 방지 위해 Stage A 에서는 코드만 제거

**선행 의존성**: 없음. A-1~A-5 와 병렬 가능.

### Risks & Mitigation
| 리스크 | 영향 | 완화 |
|-------|------|------|
| RPC 가드 추가 후 기존 client 호출 깨짐 | 베타 직전 회귀 | 각 RPC 수정 후 즉시 client 호출 경로 1번 수동 호출 (Postman/SQL UI) |
| `npm audit fix` 메이저 점프 | 빌드 깨짐 | `--force` 금지, patch/minor만 적용. major는 별도 PR로 Stage B |
| 마이그레이션 누락 보충 시 production 데이터 충돌 | 베타 사용자 데이터 손실 | Supabase staging branch 만들어 dry-run, `db diff` 확인 후 prod apply |
| PDF 결제 코드 제거 후 잔존 import / 라우트 깨짐 | 빌드 실패 | 삭제 전 `git grep` 으로 참조 색출, 삭제 후 `npm run build` + 핵심 페이지 1회 수동 click-through |
| PDF 1회 결제 마이그레이션 (`payment_orders` 등) 즉시 drop 시 베타 직전 DB 사고 | 데이터 손실 | A-6 단계에서는 **코드만 제거**, 테이블 drop 은 Stage B 초반에 별도 마이그레이션 |

### Success Metrics
- P1 8건 머지 + smoke test PASS = Stage A 완료
- D+0 (베타 시작 당일): 본인 모임에서 정모 1회 정상 종료
- D+3: 친구 모임 1개 onboarding 완료 (회원 ≥ 5명, 정모 ≥ 1회)

---

## Stage B — 베타 진행 중 (Week 1 ~ 12)

### Core Objective
**"실제 사용자 행동으로 PMF 시그널을 수집하고, 그 사이 P2/HIGH 부채를 점진적으로 정리"**

### Operating Cadence (주간 리듬)
```
월:  주간 KPI 확인 (DAU, 매칭 수, 정산 횟수) + 사용자 피드백 트리아지
화~목: dogfooding + 즉시 처방 (P0/P1 발생 시) + 부채 정리 1~2건
금:  주간 회고 — "막혔던 부분 리스트" → 다음 주 백로그
주말: 본인 모임 정모(=가장 진한 dogfood) + 정성 관찰
```

### Deliverables
1. P2 7건 + 코드 HIGH 7건 처리 (Week 12까지 80% 이상)
2. 사용자 피드백 → backlog → 처방 사이클 ≥ 10회
3. PMF 측정 지표 dashboard 구성 (자체 통계 페이지 또는 PostHog Free)
4. **빌링 SDK 백엔드 + DB 스키마 (테스트 모드, 실 결제 미발생)** — Stage C 즉시 가동을 위한 사전 작업
5. **`/pricing` 페이지 진열 + 토스 빌링 가맹 재신청 접수** (Week 8 트리거)
6. PLF 자산은 빌링 모델로 통일 — PDF 시즌 리포트는 **Pro 유지 incentive (월간 자동 발송)** 로 재포지션

### Workstreams (병렬 가능)

#### B-W1. 피드백 흡수 사이클 (지속)
- **수집 채널**: 카톡 단톡(친구 모임 운영진) + `/contact` form + 본인 dogfood 노트
- **트리아지 SLA**:
  - P0 (사용 불가): 24h 이내 처방 또는 워크어라운드
  - P1 (작동하지만 짜증): 72h 이내
  - P2 (개선 제안): 다음 스프린트
- **기록**: `.omc/notepads/birdminton-roadmap-2026-05-09/issues.md` (P0/P1) + `learnings.md` (정성 인사이트)

#### B-W2. 보안 P2 정리 (병렬, ~Week 8)
| ID | 작업 | 추정 | 묶음 |
|----|------|------|------|
| B-2a | `session_guests` 'admin' 오타 수정 + 마이그레이션 | 0.5일 | 단독 |
| B-2b | finance IDOR 가드 (server action에서 club ownership 재확인) | 1일 | server action 묶음 |
| B-2c | push admin client 권한 분리 (anon key 노출 X) | 0.5일 | 단독 |
| B-2d | server action 익명 가드 추가 (모든 mutation) | 1일 | server action 묶음 |
| B-2e | 의존성 patch 사이클 (월 1회) | 0.5일 × 3 | 매월 |
| B-2f | contact form rate limit (Upstash Redis Free 또는 Supabase row count + interval) | 1일 | 단독 |
| B-2g | JSONB 길이/depth 제한 (모임 설명/공지 본문) | 0.5일 | DB constraint |

**묶음**: B-2b + B-2d 같이 — server action 순회하며 한 번에. ≈ 1.5일.

#### B-W3. 코드 HIGH 정리 (병렬, ~Week 10)
| ID | 작업 | 추정 | 묶음 |
|----|------|------|------|
| B-3a | `inputCls` 3중복 (Stage A 미완료분) | 0.25일 | A-5b 이월 |
| B-3b | `isNewClub` 3중복 → `lib/club/state.ts` 단일 hook | 0.5일 | 단독 |
| B-3c | demo 분기 110줄 → `components/club/demo/` 폴더 분리 + `if (demo)` 1곳 게이트 | 1.5일 | GameBoard 묶음 |
| B-3d | EventDetailClient `alert` 4중반복 → `useToast` 1회 호출 | 0.5일 | 단독 |
| B-3e | PlayingPhase 26 props → context 또는 reducer | 1일 | GameBoard 묶음 |
| B-3f | GameBoardClient 데모/실서비스 mirror 70줄 → 단일 source + demo prop | 1.5일 | GameBoard 묶음 |
| B-3g | `notifyRecentlyPromoted` 안정화 (A-5c 미완료분 + 정식 처리) | 1일 | 단독 |

**묶음**: B-3c + B-3e + B-3f → "데모 통합 + GameBoard 슬림화" 1개 PR로 ≈ 4일.

#### B-W4. PMF 측정 (Week 1부터 즉시)
- **자체 통계 페이지** (`/admin/metrics`, 본인만 접근):
  - DAU / WAU / 활성 모임 수
  - 모임당 주간 매칭 횟수 / 정모 진행 횟수
  - 회비 정산 실행 횟수 / 회당 평균 인원
  - 정착률 (가입 후 7일/14일 재방문)
- **정성 지표**:
  - "이 앱 없었으면 어떻게?" 인터뷰 (운영진 1:1, Week 4 / Week 8)
  - 카톡 단톡 언급 빈도 (직접 카운트)

#### B-W5. Pro 가치 자산 사전 준비 (Week 6 ~ Week 12)
> **포지셔닝 변경**: 기존 PLF "한방 PDF 판매 → 정기 발송 + Pro 유지 incentive" 로 재해석. 자산 자체는 동일하지만 단발 vs 정기라는 사용 맥락이 다름.

- **시즌 리포트 PDF** — 매월 1일 자동 생성 / Pro 사용자만 다운로드 가능 (이탈 억제)
- **개인 진척 리포트** — Glicko-2 변화 그래프, 월간 매칭 통계 (Pro 가치 차별화)
- **`/pricing` 페이지** — Pro ₩9,900/월 정기결제 명시 + "월 단위 자동결제, 언제든 해지 가능" 안내
- **`/upgrade` 또는 `/pro/subscribe` 카드 등록 페이지** — UI 완성, SDK는 B-W6 에서 연동

#### B-W6. 빌링 SDK 백엔드 (Week 6 ~ Week 11, 테스트 모드만)
> **목표**: Stage C 시작 시 토스 심사만 통과하면 즉시 라이브 가동 가능한 상태. Week 11까지 테스트 모드에서 end-to-end 검증 완료.

| ID | 작업 | 추정 | 비고 |
|----|------|------|------|
| B-6a | DB 스키마: `billing_keys` 테이블 (1user 1key, masked card 정보) | 0.5일 | 마이그레이션 + RLS |
| B-6b | DB 스키마: `subscription_payments` 테이블 (월별 이력, status enum) | 0.5일 | 마이그레이션 + RLS |
| B-6c | DB 스키마: `users.plan` / `plan_renewal_date` / `plan_grandfather_until` 컬럼 추가 | 0.5일 | 마이그레이션 |
| B-6d | `/upgrade` 카드 등록 페이지 — Toss 빌링 SDK (`@tosspayments/tosspayments-sdk` 빌링 모드) 연동 | 1.5일 | UI는 B-W5 완성분 활용 |
| B-6e | POST `/api/payments/toss/billing/issue` — 빌링 키 발급 응답 → DB 저장 | 1일 | 멱등성 보장, 동일 user 재요청 시 기존 key revoke |
| B-6f | Vercel Cron `/api/cron/billing/charge-monthly` — `vercel.json` 에 `0 9 1 * *` 등록 | 1일 | `users.plan = 'pro' AND plan_renewal_date <= today` 대상 |
| B-6g | POST `/api/payments/toss/webhook` — 결과 수신 + retry 정책 (3회) + 실패 시 다운그레이드 | 1.5일 | 서명 검증 필수 |
| B-6h | `requireProActive()` server util — Pro 게이팅 미들웨어 | 0.5일 | grandfather + plan='pro' 둘 다 active |
| B-6i | `subscriptions` view 또는 helper — grandfather + 정기결제 통합 조회 | 0.5일 | C-2 에서 사용 |
| B-6j | 1회 결제 잔존 마이그레이션 정리 (`payment_orders` 등 테이블 drop) — A-6 이월분 | 0.5일 | Week 6 안에 처리, 베타 데이터에 영향 없음 확인 |
| B-6k | end-to-end 테스트 시나리오 — Toss 테스트 모드로 카드 등록 → cron 수동 트리거 → webhook 수신 → 결과 검증 | 1일 | 본인 테스트 카드로 수행 |

**총 추정**: ≈ 9.5일 (Week 6~11 사이 분산, 다른 워크스트림과 병렬)

**선행 의존성**:
- A-6 완료 (PDF 결제 코드 제거)
- B-6a~c (DB) → B-6d 이후

#### B-W7. 토스 빌링 가맹 재신청 (Week 8, 1일 + 대기)
> **외부 의존성** — 코드 작업으로 단축 불가. Week 8 에 신청 접수, Stage C 시작 전까지 심사 통과 목표.

| ID | 작업 |
|----|------|
| B-7a | `/pricing` 페이지 진열 완료 확인 (B-W5 deliverable) |
| B-7b | 토스 결제 채팅 상담 — 빌링(정기결제) 패키지 신청 의사 전달 |
| B-7c | 사업자등록증 (2026-04-08 발급), 약관, 환불 정책 등 서류 준비 |
| B-7d | 신청서 제출 — "기본결제패키지(1회성)" 가 아닌 **"빌링(정기결제)"** 선택 |
| B-7e | 심사 진행 상황 weekly 추적 (notepad `decisions.md` 에 기록) |

**리스크 헷지**: 심사 1주 단위로 추적, 3주 초과 시 grandfather 기간 자동 연장 (ENV `GRANDFATHER_EXTENSION_DAYS` 활용)

### Definition of Done (Stage B)
- [ ] P2 7건 중 6건 이상 머지 (1건은 Stage C로 이월 가능)
- [ ] 코드 HIGH 7건 중 5건 이상 정리
- [ ] 피드백 → 처방 사이클 ≥ 10회
- [ ] PMF dashboard 운영 중 (Week 4부터)
- [ ] Pro 가치 자산 (시즌 리포트 / 진척 리포트 / `/pricing` / `/upgrade` UI) 완성
- [ ] **빌링 SDK 백엔드 — 테스트 모드 end-to-end 1회 PASS** (카드 등록 → 빌링 키 → cron → webhook → DB 갱신)
- [ ] **DB 스키마 (`billing_keys`, `subscription_payments`, `users.plan/plan_renewal_date/plan_grandfather_until`) 마이그레이션 prod 적용 완료**
- [ ] **토스 빌링 가맹 신청 접수 (Week 8 트리거, 심사 진행 중 또는 통과)**

### Success Metrics (PMF 시그널 — Stage C 진입 게이트)
| 지표 | 12주 차 목표 | Why |
|------|------------|-----|
| 활성 모임 | ≥ 3개 (본인 + 친구 2) | 검증 베이스라인 |
| 모임당 주간 매칭 횟수 | ≥ 평균 8회 | 정모가 실제로 굴러간다는 증거 |
| 7일 재방문률 | ≥ 50% | 단발성 호기심 vs 진짜 사용 구분 |
| 회비 정산 실행 | ≥ 모임당 1회 | 운영진 가치 확인 |
| Pro 의향 표현 | ≥ 운영진 2명 인터뷰 응답 | 결제 의향 정성 시그널 |

> **이 중 3개 이상 미충족 시 Stage C 연기 + 제품 방향 재검토.**

### Risks & Mitigation
| 리스크 | 완화 |
|-------|------|
| 피드백이 너무 많아서 부채 정리가 막힘 | "주 3일 부채, 2일 dogfood" 시간 박스 강제 |
| 친구 모임 운영진 이탈 (앱 쓰기 귀찮아함) | onboarding을 본인이 직접 (Week 1 운영진 미팅 1회) |
| Supabase Free 한도 초과 | Week 6부터 row count / egress 모니터링, 70% 도달 시 Pro 검토 |
| 월별 의존성 patch 누적 (Next.js/Supabase JS) | 매월 첫 주 금요일 patch day 고정 |
| Glicko-2 결과 신뢰도 낮다는 피드백 | 사용자 가시성에서 잠시 숨기는 옵션 (toggle), 데이터는 수집 |
| 토스 빌링 심사 3주 초과 지연 | grandfather 기간 자동 연장 (ENV 한 곳 변경) + Stage C 시작 시점 1~2주 슬립 |
| 빌링 SDK 테스트 모드에서 webhook 서명 검증 누락 | 라이브 가동 시 위변조 위험 | B-6g 단계에서 서명 검증 unit test 1건 + 비정상 payload 거부 시나리오 검증 |
| `payment_orders` 등 1회 결제 테이블 drop 시 베타 사용자 데이터 손상 | A-6에서 코드만 제거, B-6j 에서 staging branch dry-run 후 prod apply |

---

## Stage C — 베타 종료 + Phase 2 진입 (Week 12 ~ Week 15, 3~4주)

> **재작성 (2026-05-09 빌링 피벗)**: 기존 "Toss 정기결제 SDK 통합" 항목이 Stage B 로 선이동됨 (B-W6 테스트 모드). Stage C 는 **심사 통과 → grandfather 마이그레이션 → 라이브 전환** 에 집중.

### Core Objective
**"베타 사용자에게 90일 무료 Pro grandfather 부여 + 토스 빌링 라이브 전환 + 신규 사용자 결제 가능 상태"**

### Pre-conditions (Stage B에서 완료되어야 시작)
- PMF 시그널 충족 (B의 5개 지표 중 3개 이상)
- 빌링 SDK 백엔드 테스트 모드 PASS (B-W6 완료)
- 토스 빌링 가맹 신청 접수 (B-W7 완료) — **심사 통과는 Stage C 진입 전 또는 진행 중 가능**
- P2 6건 이상 / HIGH 5건 이상 정리
- `/pricing` 페이지 + `/upgrade` UI 진열 완료

### Deliverables
1. **베타 grandfather 마이그레이션 — 90일 무료 Pro 자동 부여**
2. **토스 빌링 가맹 라이브 전환** (심사 통과 후)
3. Pro 게이팅 활성화 — Free 50명 limit, 시즌 리포트, 진척 리포트 게이팅 ON
4. grandfather 만료 알림 시스템 (D-14 / D-7 / D-1 in-app + 카톡)
5. Vercel Cron 라이브 — 매월 1일 9시 정기 차징
6. 카카오 알림톡 비즈 연동 GO/NO-GO 결정 (Pro 핵심 차별화 일환)

### Tasks

#### C-1. 베타 grandfather 마이그레이션 (Week 12, **첫 작업**, 1.5일)
> **Stage C 의 첫 작업** — 라이브 전환 전 grandfather 데이터부터 안전하게 처리해야 베타 사용자 paywall 사고를 막을 수 있음.

| ID | 작업 | 비고 |
|----|------|------|
| C-1a | 베타 사용자 식별 쿼리 (`auth.users.created_at < 베타 종료 시점`) + 본인 검토 | dry-run 결과 본인이 직접 명단 확인 |
| C-1b | 마이그레이션 SQL: 대상 사용자에게 `users.plan = 'pro'` + `plan_grandfather_until = today + 90d` 일괄 set | idempotent (중복 실행 시 update X) |
| C-1c | `requireProActive()` 가 grandfather 기간을 active 로 인식하는지 통합 테스트 | B-6h 활용 |
| C-1d | grandfather 안내 in-app banner (`/club/[id]`, `/dashboard` 상단) — "베타 감사: Pro 90일 무료, ~YYYY-MM-DD 까지" | 동적 만료일 표시 |
| C-1e | 카톡 공지 템플릿 작성 + 운영진 단톡 1회 발송 | 사용자 안내 |

**선행 의존성**: B-W6 완료 (DB 스키마 + `requireProActive()`)

#### C-2. 토스 빌링 라이브 전환 (Week 12 ~ 13, 심사 통과 후 1일)
> **외부 의존성**: B-W7 가맹 심사 통과 후 진행. 미통과 시 Week 14~15 로 슬립.

| ID | 작업 | 비고 |
|----|------|------|
| C-2a | Toss 라이브 키 발급 받음 → ENV 교체 (`TOSS_BILLING_CLIENT_KEY`, `TOSS_BILLING_SECRET_KEY`) | Vercel Production env 만 |
| C-2b | webhook 엔드포인트 라이브 URL 등록 (Toss 콘솔에 `/api/payments/toss/webhook` 등록) | 서명 시크릿 설정 |
| C-2c | Vercel Cron 활성화 (`vercel.json` 의 `0 9 1 * *`) | grandfather 사용자는 cron 대상에서 자동 제외 — `plan_grandfather_until > today` 조건 |
| C-2d | 본인 카드로 라이브 1회 등록 + 즉시 차징 1건 검증 + 환불 처리까지 end-to-end smoke test | 본인 ₩9,900 자비 부담 1회 |
| C-2e | feature flag로 단계적 해제 — 베타 운영진 → 전체 (24h 텀) | percent rollout |

#### C-3. Pro 게이팅 활성화 (Week 13, 2일)
| ID | 작업 |
|----|------|
| C-3a | Free 50명 limit middleware ON (모임 회원 추가 시 plan check) |
| C-3b | 시즌 리포트 PDF 생성 활성화 (puppeteer or react-pdf) — 매월 1일 자동 발송 cron |
| C-3c | 개인 진척 리포트 (Glicko-2 변화 그래프 + 매칭 통계) Pro-only 게이팅 |
| C-3d | Pro 전용 dashboard 섹션 게이팅 + Free 사용자 시 paywall CTA |

#### C-4. grandfather 만료 알림 시스템 (Week 13~14, 1.5일)
| ID | 작업 |
|----|------|
| C-4a | D-14 / D-7 / D-1 알림 발송 cron (`plan_grandfather_until - now()` 기준 daily check) |
| C-4b | in-app banner 변형 — D-14부터 "곧 만료, 카드 등록하면 그대로 Pro 유지" CTA |
| C-4c | 카톡 알림 템플릿 (B-W7 토스 알림톡과 별개로 그라파더 알림용) — D-7 / D-1 발송 |
| C-4d | D-0 만료 시점에 자동 다운그레이드 cron (`plan = 'free'`) + 알림 발송 |
| C-4e | 카드 미등록 사용자 추적 dashboard (본인 운영 모니터링) |

#### C-5. 카카오 알림톡 비즈 GO/NO-GO 결정 (Week 14, 1일 결정 + 결정 시 5일 구현)
- **GO 조건**: 베타 운영진 인터뷰에서 "푸시 알림 부족" 피드백 ≥ 2건 + 월 ₩30k 이내 cost 추정 + Pro 결제 의향과 직결
- **GO 시 작업** (5일):
  - C-5a: `users.phone` 컬럼 + 인증 플로우 추가
  - C-5b: 카카오 비즈 채널 + 템플릿 등록 (1회)
  - C-5c: 정모 알림 / 회비 알림 / grandfather 만료 알림 — 알림톡 채널 우선, 실패 시 SMS 폴백
- **NO-GO 시 대체**: Web Push + 이메일 다이제스트 강화. `users.phone` 추가는 Stage D 로 이월
- 결정 기록: `.omc/notepads/birdminton-roadmap-2026-05-09/decisions.md`

#### C-6. 라이브 모니터링 + 헷지 (Week 14~15, 지속)
| ID | 작업 |
|----|------|
| C-6a | 결제 webhook 실패율 dashboard (자체 통계 페이지에 추가) |
| C-6b | cron 차징 결과 daily 모니터링 — 첫 사이클 (Stage C 후 첫 1일) 본인이 직접 검수 |
| C-6c | `plan_grandfather_until` 만료 직전 사용자 명단 weekly 점검 |
| C-6d | retry 3회 실패 후 다운그레이드된 사용자 — "결제 실패, 카드 재등록" 알림 발송 |

### Definition of Done
- [ ] 베타 사용자 grandfather 100% 적용 (마이그레이션 후 누락 0명 확인)
- [ ] 토스 빌링 가맹 라이브 전환 완료 + 본인 카드 1회 차징 → 환불 end-to-end PASS
- [ ] Vercel Cron 매월 1일 9시 등록 완료 + dry-run (수동 트리거 1회) PASS
- [ ] grandfather D-14 / D-7 / D-1 알림 1건 이상 실제 발송 (테스트 사용자 대상)
- [ ] 신규 가입자 → `/upgrade` → 카드 등록 → DB `billing_keys` 저장 라이브 검증 1건
- [ ] 카카오 알림톡 GO/NO-GO 결정 문서화

### Success Metrics
| 지표 | 목표 (Week 18 = Stage C 종료 + 3개월 grandfather 중간) |
|------|------|
| grandfather 전환율 (베타 사용자 중 카드 등록) | ≥ 30% (만료 D-30 시점 측정) |
| 베타 → Pro 전환 (grandfather 만료 후 30일) | ≥ 5% |
| 신규 모임 가입 (지인 추천 외) | ≥ 1개 |
| Free → Pro 자발적 결제 (grandfather 외) | ≥ 1건 |
| 결제 webhook 실패율 | < 1% |
| cron 차징 성공률 | > 95% (실패 시 retry 포함) |

### Risks & Mitigation
| 리스크 | 완화 |
|-------|------|
| 토스 빌링 심사가 Stage C 시작 시점까지 미통과 | C-1 (grandfather) 는 심사와 무관하게 진행 가능 — 우선 처리. 심사 지연 시 Stage C 종료 1~2주 슬립, grandfather 90→100일 자동 연장 |
| grandfather 마이그레이션 누락자 발생 | C-1a 에서 본인이 명단 직접 검토 + C-1b idempotent 설계로 재실행 가능 |
| 라이브 전환 직후 webhook 서명 검증 실패 → 결제 누락 | C-2d 본인 카드 smoke test 단계에서 정상/비정상 payload 둘 다 검증 |
| cron 첫 사이클에서 대량 결제 실패 (ex: 카드 재발급으로 다 막힘) | C-6b daily 모니터링 + retry 3회 + 그래도 실패 시 사용자 직접 안내 |
| grandfather 만료 알림 못 본 사용자가 "왜 갑자기 paywall?" 클레임 | D-14 / D-7 / D-1 / D-0 4단 알림 + in-app banner 상시 표시 |
| Pro 전환 0% — PMF 가짜 시그널이었음 | Phase 2 진입 자체를 4주 연기, Stage B로 복귀해서 가치 가설 재검증 |
| 알림톡 GO 결정 후 비용 폭증 | 월 cost 한도 (₩30k) 도달 시 자동 알림톡 → SMS 다운그레이드 로직 |

---

## Stage D — 장기 로드맵 (6개월 ~ 12개월)

### Core Objective
**"단일 클럽 SaaS를 넘어 멀티클럽·B2B 채널로 확장"**

### Pre-conditions (Stage C 완료 + 운영 안정)
- Pro MRR ≥ ₩200k (≈ 20개 활성 Pro 모임)
- 월 P0 이슈 0건 3개월 연속
- 본인 모임 외 자생적 가입 모임 ≥ 5개

### Deliverables
1. Team plan ₩29,900 출시
2. 멀티 클럽 운영 (한 owner 5개 한도)
3. 클럽 간 통합 통계 / 비교
4. B2B 영업 채널 (체육관·연맹 1~2곳 파일럿)

### Workstreams (6~8주)

#### D-1. Team plan 인프라 (3주)
- `subscriptions.plan_tier` enum 확장 (`free` / `pro` / `team`)
- 멀티 클럽 ownership 모델 (owner → N clubs)
- 클럽 간 권한 분리 + 회원 통합 view
- Team 가격 페이지 + Toss 연계

#### D-2. 통합 통계 (2주)
- 다중 클럽 dashboard
- 클럽 간 비교 KPI (매칭 수 / 정착률)
- 연맹용 export (CSV / PDF)

#### D-3. B2B 영업 (병렬, 지속)
- 1차 타겟: 본인 모임이 정기 사용하는 체육관 1곳
- 2차: 친구 운영진 인맥 통한 연맹 미팅 1건
- 영업 자료: 1-pager + 라이브 데모 시나리오
- 가격은 협상 가능 (안내 가격 ≠ 실제 계약)

#### D-4. 인프라 업그레이드 (필요 시)
- Vercel Hobby → Pro (₩20/mo) — bandwidth 한도 도달 시
- Supabase Free → Pro (₩25/mo) — 프로젝트 size 도달 시
- 트리거 시점: Stage C 완료 시점 사용량 점검

### Definition of Done
- [ ] Team plan 결제 1건 이상 (B2B 또는 큰 모임)
- [ ] 멀티 클럽 운영 사용자 ≥ 1명 검증
- [ ] B2B 파일럿 1건 진행 중

### Success Metrics
- Team MRR ≥ ₩60k (2개 계약)
- 자생적 모임 가입 ≥ 월 5개
- 운영진 NPS ≥ 30

### Risks & Mitigation
| 리스크 | 완화 |
|-------|------|
| Team plan 차별화 부족 (Pro로 충분) | Team만의 가치 명확화 (멀티 클럽 + 통합 통계 + 우선 지원) |
| B2B 영업 사이클 길어서 1인 부담 | Stage D는 "옵션" — Pro만으로 LTV 충분하면 D-1만 출시하고 D-3 후순위 |
| 멀티클럽 모델로 코드베이스 복잡도 폭증 | D-1 진입 전 Stage B에서 정리한 부채 + 추가 1주 리팩토링 버퍼 |

---

## Cross-Stage Guardrails

### Must Have
- 매 단계 진입 시 Definition of Done 체크 후에만 다음 단계
- 사용자 피드백 트리아지 SLA 준수 (P0 24h / P1 72h)
- Architect 검증: Stage 종료 시점마다 1회

### Must NOT Have
- Stage A에서 P2/P3 작업 손대지 않기
- Stage B에서 신규 대형 기능 추가하지 않기 (PMF 검증 단계)
- Stage B 빌링 SDK 작업은 **테스트 모드 전용** — 라이브 키 절대 사용 금지
- Stage C 라이브 전환 전에 grandfather 마이그레이션 미검증 출시 금지 (C-1 이 C-2 보다 항상 먼저)
- Phase 1 (Stage A~B) 동안 50명 limit 활성화 금지
- 토스 빌링 심사 통과 전에 라이브 cron 활성화 금지 (`vercel.json` cron 등록은 심사 통과 후)

### Commit Strategy
- 보안 P1: 1 PR 1 RPC (작은 단위로 리스크 격리)
- 코드 핫스팟: 묶음 단위 PR (B-3c+B-3e+B-3f처럼 같은 영역)
- 부채 정리: weekly batch (금요일 1 PR)
- **PDF 결제 코드 제거 (A-6)**: 단일 PR, 7개 파일 일괄 — 부분 제거로 인한 빌드 깨짐 방지
- **빌링 SDK 백엔드 (B-W6)**: 마이그레이션은 단독 PR, SDK / API / cron / webhook 은 기능별 4개 PR (각 독립 검증)
- **Stage C 라이브 전환 (C-2)**: ENV 교체는 main 직접 push (PR X, 즉시 확인), 그 외는 PR 단위

### Notepad Wisdom (생성 위치)
`.omc/notepads/birdminton-roadmap-2026-05-09/`
- `learnings.md` — 사용자 행동 인사이트
- `decisions.md` — 알림톡 GO/NO-GO 등 분기 결정
- `issues.md` — P0/P1 처방 기록
- `problems.md` — 막혔던 부분 + 해결 패턴

---

## Plan Summary

**Plan saved to:** `.omc/plans/birdminton-roadmap-2026-05-09.md`

**Scope:**
- 4 Stage / 약 ~25주 로드맵 (피벗으로 Stage C 가 1주 늘어남)
- Stage A (3~5일) + Stage B (12주) + Stage C (3~4주) + Stage D (6~8주, 옵션)
- 외부 의존성: 토스 빌링 가맹 재심사 (1~3주, Stage B Week 8 신청)
- 추정 복잡도: HIGH (다단계 + 결제 모델 피벗 + B2B 옵션)

**Key Deliverables:**
1. Stage A: 보안 P1 8건 + 코드 핫스팟 3건 + **PDF 1회 결제 코드 7개 파일 제거** + 베타 시작
2. Stage B: PMF 시그널 수집 dashboard + P2/HIGH 부채 80% 정리 + Pro 가치 자산 + **빌링 SDK 백엔드 (테스트 모드)** + **토스 가맹 재신청 (Week 8)**
3. Stage C: **베타 grandfather (90일 무료 Pro)** + **토스 빌링 라이브 전환** + Pro 게이팅 활성화 + grandfather 만료 4단 알림 + 카카오 알림톡 GO/NO-GO
4. Stage D: Team plan + 멀티 클럽 + B2B 파일럿 (옵션)

**Key Gates:**
- A→B: P1 8건 + smoke test + **PDF 결제 코드 제거 완료**
- B→C: PMF 5개 지표 중 3개 이상 충족 + **빌링 SDK 테스트 모드 PASS** + **토스 가맹 신청 접수**
- C→D: Pro MRR ≥ ₩200k + P0 안정 3개월
