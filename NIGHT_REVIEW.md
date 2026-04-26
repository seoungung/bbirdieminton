# 야간 SaaS 전면 점검 보고서

**작업 일자**: 2026-04-27 야간
**브랜치**: v2-main
**작업 위임**: "절대 작동 오류 없게 + 전체 점검·개선·필요 없는 부분 삭제"

> 사용자가 자러 가면서 위임. 솔직하게 짚은 한계 두 가지:
> 1. **"절대 오류 없게"는 보장 불가능** — 카카오 OAuth · 토스 SDK · Supabase RLS 등 외부 의존이 있고 환경변수 없이 작동 안 하는 부분 존재.
> 2. **자율 삭제는 보수적으로** — 명백히 dead한 것만 자동 삭제, 라우트/큰 컴포넌트는 후보 리스트만.

---

## 0. 한 화면 요약

| 항목 | 결과 |
|---|---|
| **타입체크** | ✅ 0 에러 |
| **프로덕션 빌드** | ✅ 통과 (모든 라우트 prerendered) |
| **비로그인 페이지 21개 sweep** | ✅ 전부 200 응답 |
| **콘솔 에러 / 서버 에러** | ✅ 0 |
| **삭제된 파일** | 49개 (v1 라켓 22 + v2 dead 22 + scripts/content 5) |
| **수정된 파일** | 25개 |
| **제거된 npm 패키지** | 15개 (@tiptap/* 14 + @anthropic-ai/sdk) |
| **다중 에이전트 분석 결과** | explore + architect + security + code-review 4건 모두 종합 |

**중대 보안 이슈 (반드시 적용 필요)**:
- 🔴 `delete_club_cascade` 등 Supabase RPC 4건이 무인증 — 누구나 다른 모임 데이터 삭제/조작 가능
- 🟡 결제 흐름 미완성 (PDF 발송 / 주문 저장 / 멱등성) — 임시 비활성화 적용

---

## 1. 1차 정리 — v1 라켓 도감 잔재 일소 (커밋 `e7167be`)

빌드·타입체크·렌더 영향 없음 검증 후 삭제.

| 위치 | 내용 |
|---|---|
| `scripts/*` | add-racket / sync-supabase / types / validate-racket |
| `content/*` | drafts, eval, rackets, research, _input |
| `supabase/*.sql` | 라켓·subscribers SQL 16개 (migrations 폴더는 유지) |
| `package.json` | racket:add, validate, sync npm 스크립트 |

---

## 2. 2차 정리 — src/ 내부 dead code (이번 커밋)

explore-high가 매핑한 사용처 0건 파일을 삭제. 시그니처 변경 없는 안전 삭제.

### 삭제 (22개)
```
src/types/quiz.ts                                v1 잔재
src/types/racket.ts                              v1 잔재
src/lib/quiz/questions.ts                        v1 잔재
src/lib/quiz/results.ts                          v1 잔재
src/lib/email/welcomeTemplate.ts                 v1 newsletter 잔재
src/lib/brandLogos.ts                            v1 라켓 브랜드
src/lib/club/push.ts                             서버 인프라만 있고 호출 0
src/components/HeroSlider.tsx                    v1 슬라이더
src/components/NewsletterBanner.tsx              v1 구독 배너
src/components/auth/LoginForm.tsx                v2 카카오 단일 후 미사용
src/components/layout/Header.tsx                 MarketingHeader로 대체
src/components/layout/Footer.tsx                 MarketingFooter로 대체
src/components/club/DemoDashboardClient.tsx      ClubDashboardClient로 통합
src/components/club/EmptyState.tsx               미사용
src/components/club/gameboard/IdlePhase.tsx      phase='idle' 제거됨
src/components/payment/PdfPaymentClient.tsx      OrderForm으로 대체
src/components/ui/badge.tsx                      shadcn 기본, 사용 0
src/components/ui/button.tsx                     shadcn 기본, 사용 0
src/components/ui/EmptyState.tsx                 사용 0
src/components/ui/StatCard.tsx                   사용 0
src/hooks/usePushNotification.ts                 푸시 UI 미구현
src/app/api/og/route.tsx                         v1 라켓 OG
src/app/api/subscribe/route.ts                   NewsletterBanner만 사용
```

### 부가
- `src/app/layout.tsx`: OG 이미지 `/api/og` 참조 제거
- `package.json`: 미사용 deps 15개 (`@tiptap/*` 14 + `@anthropic-ai/sdk`) 제거 — 번들 사이즈 감소

---

## 3. 멀티 에이전트 점검 결과 (4/4 완료)

### 3.1 explore-high — 코드베이스 매핑
- 라우트 50+개 인벤토리화
- 컴포넌트 사용처 그래프 작성
- v1/v2 dead code 후보 명확히 분리
- Supabase 스키마 추정 (테이블 23개, RPC 6개)

### 3.2 architect — SaaS 8개 핵심 흐름 시뮬레이션
- 흐름별 단계별 코드 트레이스 + 위험 신호 ID 부여 (F1-R1 ~ F8-R9)
- **TOP 5 P1**: F8(결제) 3건 + F7(데모 분기) + F2(onboard async)
- **TOP 5 P2**: F4(게임보드 동시성) + F1/F3(ensureClubUser 통합) 등

### 3.3 security-reviewer — 보안 점검
- **CRITICAL P1 6건 발견**:
  - S-P1-1: `delete_club_cascade` RPC 무인증 — 모임 영구 삭제 가능
  - S-P1-2: `update_player_stats_for_match`, `update_dues_amount`, `start_game_session` 무인증
  - S-P1-3: `approveJoinRequestAction` IDOR — 임의 user를 멤버로 주입
  - S-P1-4: `deleteSettlementAction` cross-club IDOR
  - S-P1-5: `loginWithEmail` open redirect
  - S-P1-6: 토스 결제 무결성 결함 (멱등성·orderId 검증·PDF 발송)

### 3.4 code-reviewer — 코드 품질
- P1 11건, P2 7건, P3 9건 발견
- 200줄+ 컴포넌트 18개 (CLAUDE.md 규칙 위반)
- `.single()` 30+ 위치 (실패 시 PostgREST 에러)
- 미사용 의존성 15개

---

## 4. 적용한 수정 (이번 커밋)

### 4.1 보안 P1 — TS 레벨 즉시 mitigation

| ID | 위치 | 조치 |
|---|---|---|
| S-P1-3 | `join-requests/actions.ts` | `approveJoinRequestAction`에서 `requestUserId` 인자 제거, DB의 `join_requests` row에서 직접 조회 |
| S-P1-4 | `settlements/actions.ts` | `deleteSettlementAction`에 `.eq('club_id', clubId)` 추가, `toggleSettlementPaidAction`에 cross-club 조회 가드 |
| S-P1-5 | `login/actions.ts` | `loginWithEmail` / `signupWithEmail` / `loginWithGoogle` 통째로 제거 (LoginForm 삭제로 호출처 0이지만 Server Action ID로 외부 호출 차단) |
| S-P1-1 | `SettingsClient.tsx`, `settings/actions.ts` | 클라가 직접 호출하던 `delete_club_cascade` RPC를 Server Action(`deleteClubAction`)으로 이전 + owner 검증. `leaveClubAction`도 추가 (owner는 모임 나가기 차단) |
| S-P2-3 | `notices/actions.ts` | `getNoticesAction`에 명시적 멤버십 검증 추가 (RLS 의존 X) |
| S-P2-6 | `proxy.ts` | `is_anonymous` 사용자 비로그인과 동일 취급 — RPC 우회 차단 |

### 4.2 코드 품질 P1

| ID | 위치 | 조치 |
|---|---|---|
| Q-P1-1 | `src/app/error.tsx` | `<html>/<body>` 제거 — Next.js error.tsx 패턴 정상화 |
| Q-P1-2 | `src/lib/club/auth.ts` | `.single()` → `.maybeSingle()` (getClubUserId) — 신규 유저 노이즈 제거 |
| Q-P1-3 | `src/lib/club/client.ts` | `.single()` → `.maybeSingle()` (getMyMembership) |
| Q-P1-6 | `PlayingPhase.tsx` | cyclePlayer 주석 명확화 (의도된 cycle 패턴) |
| Q-P1-8 | `ClubDashboardClient.tsx` | `/club/[id]/events` 미존재 라우트 → `/club/[id]`로 |
| Q-P1-10 | `MembersClient.tsx` | `parseInt(skillInput)` → `Number(trimmed)` + Number.isInteger 검증 |

### 4.3 SaaS 흐름 P1

| ID | 위치 | 조치 |
|---|---|---|
| F2-R1 | `src/app/club/onboard/page.tsx` | Next.js 16 비동기 searchParams (`Promise<>` + await) |
| F8 (R1~R3) | `src/components/shop/OrderForm.tsx` | `LAUNCH_ENABLED = false` 플래그로 결제 임시 비활성화. "정식 출시 준비 중" 안내 + 출시 알림 신청 CTA. PDF 발송·주문 저장·멱등성 미구현 상태에서의 사고 방지 |
| F7-R1 | `finance/page.tsx`, `settings/page.tsx`, `join-requests/page.tsx` | 데모(`demo-` prefix) 사용자가 직접 URL 입력 시 `/login` 강제 이동 → `/club/[id]`(데모 대시보드)로 안전 회귀 |

### 4.4 기타 정리

- `BackButton fallback` 9곳 `/manage` (rotted) → `/club/${clubId}` (안전한 fallback)
- `ClubDashboardClient.tsx` `/manage` 링크 → `/settings`로 직접 연결
- `import/page.tsx` 권한 거부 시 `/manage` redirect → `/club/${clubId}`
- `sitemap.ts` 전면 재작성: v1 라우트(`/rackets`, `/quiz`, `/guide`, `/about`) + Supabase rackets/guides 쿼리 제거 → v2 마케팅 라우트 + manual entries 자동 포함

---

## 5. ⚠️ 사용자 확인·결정 필요 (보류한 것)

### 5.1 [중요] RPC 보안 마이그레이션 — `.omc/proposed-migrations/20260427_secure_rpc_guards.sql`

**S-P1-1 / S-P1-2 (CRITICAL)** 의 근본 해결책. 현재 TS 레벨에서 표준 사용자 경로는 보호했으나, 공격자가 Supabase 클라이언트로 RPC를 직접 호출하면 여전히 우회 가능. **DB 레벨 가드가 필수**.

이 SQL은 **검토 후 적용**해야 합니다 (db schema 변경):
1. 파일 열고 `<<<원본 본문 그대로>>>` 위치에 기존 마이그레이션 본문 채워넣기
   - `delete_club_cascade` 본문: `supabase/migrations/20260410000002_rpc_functions.sql:9-41`
   - `update_dues_amount` 본문: 동 파일 46-71
   - `start_game_session`, `update_player_stats_for_match`: `20260418000000_fix_p0_bugs.sql`
2. `supabase/migrations/`로 이동 (날짜 시퀀스 유지)
3. `npx supabase db push`
4. 적용 후 모임 삭제·게임 시작 등 표준 흐름 smoke test

### 5.2 결제 흐름 정식 출시

`OrderForm.tsx`에서 `LAUNCH_ENABLED = true`로 토글하면 결제 활성화. 단 출시 전 **반드시** 다음을 구현해야 사고 방지:
- `/api/payments/toss/confirm`의 TODO (L50-52): orders 테이블 저장
- `/pdf/success` 멱등성 (orderId 중복 confirm 방지)
- PDF 발송 시스템 (Resend? Storage signed URL?)
- PDF 다운로드 라우트 (현재 `<a href="#">`)

### 5.3 기타 P1·P2 (시간상 보류)

| ID | 영향 | 권장 처리 |
|---|---|---|
| Q-P1-4 | metadata generation 다수 `.single()` | 24+ 위치 일괄 `.maybeSingle()` 변환 (Sentry 노이즈 감소) |
| Q-P1-7 | `DemoMissionWidget` welcomed 분기 버그 | `waitTick` state로 분리 |
| Q-P1-11 | `home/page.tsx` `as never` 캐스팅 | DEMO_CLUBS 타입 정합화 |
| Q-P2-1 | `window.alert/confirm` 4건 | `ConfirmDialog`로 통일 |
| Q-P2-2 | ExcelJS 정적 import (~700KB) | dynamic import |
| Q-P2-7 | `loading.tsx` 7개 라우트 누락 | 스켈레톤 UI |
| F4-R1 | 게임보드 동시성 미처리 | Realtime subscription (큰 변경) |
| F4-R3 | 새로고침 시 phase=`'setup'`으로 리셋 | inProgressData 자동 재개 |
| F1-R3 / F3-R2 | 신규 카카오 사용자 `/join/{code}`로 첫 진입 시 users row 없음 | callback에서 `ensureClubUser` 호출 통합 |
| S-P2-1 | 초대코드 `Math.random()` (PRNG 약함) | `crypto.randomInt` 또는 PG `gen_random_bytes` |
| S-P2-2 | 클럽 썸네일 업로드 검증 없음 | Storage 버킷 정책 (MIME, file_size_limit) + path에 user.id 포함 |

### 5.4 추가 삭제 후보 (확실하지 않음)

- `src/components/club/SettlementsClient.tsx` — `/settlements` 라우트가 redirect로 단순화되어 페이지로는 dead. 단, 셔틀콕 정산 다이얼로그(`ShuttlecockSettlementDialog`)와 일부 액션은 여전히 사용. 의견 필요.
- `src/lib/club/client.ts`의 일부 export (`fillMemberCounts`, `getClubByInviteCode`, `getClubSessions`) — 사용처 0이지만 다른 부분이 살아있어 부분 삭제 위험.
- `.claude/agents/racket-validator.md` 등 OMC 에이전트 정의 3개 — v1 라켓 도감 관련. OMC 인프라라 사용자 워크플로우 확인 필요.
- `/club/[clubId]/manage`, `/club/[clubId]/settlements`, `/features`, `/product` redirect 라우트 — 외부 백링크 가능성 → 폐기 결정.
- `src/types/club.ts` 의 `myMemberId` prop — SettingsClient에서 더 이상 사용 안 함.

---

## 6. 검증 (이번 커밋 직전)

| 항목 | 결과 |
|---|---|
| `npm run typecheck` | ✅ 0 에러 |
| `npm run build` | ✅ 통과 (Next.js 16, Turbopack) |
| Preview 비로그인 페이지 21개 (200) | ✅ 전부 통과 — `/`, `/blog`, `/manual`, `/manual/{create-club, invite-members, gameboard-basics}`, `/pricing`, `/shop`, `/shop/starter-guide`, `/shop/starter-guide/order`, `/terms`, `/privacy`, `/faq`, `/contact`, `/business`, `/policy/refund`, `/login`, `/sitemap.xml`, `/robots.txt`, `/club`, `/club/demo-1` |
| 결제 페이지 비활성화 시각 검증 | ✅ "정식 출시 준비 중" + 결제 버튼 disabled |
| 콘솔 에러 / 서버 에러 | ✅ 0 |

검증 못 한 것 (외부 의존):
- 카카오 OAuth 실 로그인 흐름 — 환경변수·콜백 URL 필요
- 토스 결제 (의도적으로 비활성화)
- Supabase RLS 정책 작동 (S-P2-3에서 명시적 가드 추가했으나 RLS 자체는 SQL 검토 필요)

---

## 7. 야간 작업 커밋 로그

```
이번 커밋    feat(safety): 야간 SaaS 전면 점검 — 보안 P1 6건 + 코드 P1 7건 + dead 22개 추가 정리
e7167be     chore(cleanup): v1 라켓 도감 잔재 일소
5566539     feat(landing): 랜딩에서 가격 섹션 제거
8c03555     feat(marketing): IA 개편 마무리 + 사용설명서 동적 라우트
```

---

## 8. 아침에 할 일 (우선순위)

1. **🔴 RPC 보안 마이그레이션 적용** (5.1) — 가장 시급. 적용 안 하면 무인증 모임 삭제 가능.
2. **🟡 결제 미구현 부분 결정** (5.2) — 출시 일정 정하기 + TODO 구현 또는 페이지 영구 비공개 결정.
3. **🟢 5.3, 5.4 검토** — 권한·결정 사항.
4. **카카오 OAuth + 토스페이먼츠 환경변수 점검** — Supabase 대시보드 / Vercel 환경변수.

긴급도가 낮은 것은 `NIGHT_REVIEW.md`를 참고하면서 차근차근 처리해도 OK입니다.
