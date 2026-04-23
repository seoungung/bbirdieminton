# 버디민턴 플랫폼 하드닝 · 6주+Phase0 로드맵 (FINAL)

**작성일**: 2026-04-17 · **합의**: Planner + Architect + Critic
**범위**: 모임 · 운영 · 관리 · 게임보드 · 설정
**환경**: Next.js **16.1.6** + React 19 + Supabase (로컬 dev) + TypeScript
**배포 정책**: 사업자등록(2026-06) 이전까지 프로덕션 배포 없음. 로컬 dev 기준으로 완성도 확보.

---

## 0. 변경 요약 (초안 대비)

| 항목 | 초안 | 최종 |
|------|------|------|
| 기간 | 4주 | 6주 + Phase 0 (3일) |
| RLS 전면 | Phase 1 | **Phase 6 (배포 준비 블록)** |
| Dead code 정리 | Phase 4 | **Phase 0에서 선제** |
| DB trigger | 랭킹 집계 기본값 | **Server Action 기본, trigger는 옵션 후순위** |
| 네이밍 | `auth_user_id`/`skill` | **현 코드 기준 `birdieminton_user_id`/`skill_score` 유지** |
| Next 버전 | 15 | **16.1.6** |
| `supabase db push` | 원격 전제 | **`supabase init`→`start`→`migration up` 로컬 전제** |
| 정기모임 이름 | `regular_sessions` | **`club_events`** (일회성 이벤트, 반복 규칙 없음) |
| 알림 DB 영속화 | Phase 2 | **Non-Goal** (발송 없이 저장은 가치 0) |
| 멤버 차단 테이블 | 신설 | **제거** (초대코드 재발급으로 대체) |
| CI 파이프라인 | Phase 4 | **Phase 6** (배포 직전) |
| E2E Playwright | Phase 4 | **옵션 · 스키마 안정 후 Phase 6** |
| 플로우 2개 유지 | 결정 | **결정 유지, 단 "대회 모드"는 `/events/*`로 리네이밍** |

---

## Phase 0 — 의사결정 · Dead code · 로컬 환경 초기화 (Day 1~3)

**목표**: 이후 Phase가 흔들리지 않도록 선행 결정과 정리.

### 0.1 열린 질문 6개 확정 (Day 1)
사용자 확인 필요 — 이 플랜 승인 시 함께 답변하거나 Phase 0 착수 전 인터뷰:

| # | 질문 | 기본 제안 |
|---|------|-----------|
| Q1 | 정기모임 참석 상태 | **2단계(참석/미참석)** — UI 단순 |
| Q2 | `player_stats` 기존 데이터 백필 | **초기값 0 유지** — 백필 SQL 생략 |
| Q3 | 강퇴된 멤버의 과거 경기 기록 | **유지(member_id nullable + `removed_at`)** |
| Q4 | 정기모임 참석자 수 집계 | **실시간 COUNT** (소규모라 부담 無) |
| Q5 | 뒤로가기 경로 | **브라우저 히스토리 우선, 없으면 `/club/home`** |
| Q6 | `users`↔`auth.users` FK | **`birdieminton_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`** + 마이그레이션에 `CREATE TABLE` 포함 |

### 0.2 Dead code 선제 제거 (Day 1~2)
- `src/components/club/ClubCard.tsx` 삭제
- `src/components/club/ClubLoginForm.tsx` 삭제
- `src/components/club/BottomTabBar.tsx` 삭제
- `src/components/club/RecentViewTracker.tsx` — **삭제** (연결 안 하면 관리 부담만). "최근 본 모임" 탭도 Phase 5에서 재결정
- `grep -rn "import.*ClubCard\|BottomTabBar\|ClubLoginForm\|RecentViewTracker" src/` 결과 0건 확인

### 0.3 로컬 Supabase 초기화 (Day 2)
- `supabase/config.toml` 부재 확인 → `supabase init`
- `.env.local` 템플릿 정비 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY 분리)
- `npm run db:reset` 스크립트 추가 (`supabase db reset` wrapper)
- **기존 로컬 데이터 백업 스크립트**: `npm run db:backup` (pg_dump → `.backup/` 디렉토리)
- README에 "로컬 DB 재생성 절차" 섹션 추가

### 0.4 개발 기반 명령어 정비 (Day 3)
- `package.json` scripts 추가: `typecheck` (`tsc --noEmit`), `lint`, `db:reset`, `db:push`, `db:types` (gen typescript)
- eslint-plugin-next 16 규칙 적용 (async params/headers/cookies 체크)
- `.cursorrules` 또는 `AGENTS.md` 갱신 — 이번 하드닝 중 참고할 원칙 기재

**Phase 0 Exit Criteria**: Q1~Q6 답변 확정 · Dead code 0건 · `supabase start` 정상 · `npm run typecheck` 기준점 측정 (에러 개수 기록)

---

## Phase 1 — 코어 스키마 & 치명 버그 (Week 1)

**목표**: 재현 가능한 DB + P0 치명 6건 해소.

### 1.1 Core Schema 마이그레이션 (Day 1~2)
- 파일: `supabase/migrations/20260410000000_core_schema.sql`
  - **주의**: 기존 `20260412000000_survey_responses`, `20260412000001_create_dues` 보다 **앞선 날짜**로 배치 (FK 순서 보장)
  - 기존 2개 마이그레이션을 `20260418000000_`, `20260418000001_`로 리넘버 or 그대로 두고 core만 앞으로
- 생성 테이블:
  ```
  users (id UUID PK, birdieminton_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, name TEXT, created_at)
  clubs (id, owner_id→users.id, name, description, location, activity_place, category, court_count, thumbnail_color, thumbnail_url, invite_code UNIQUE, plan, max_members, created_at, updated_at)
  club_members (id, club_id, user_id→users.id, role, skill_score INT, joined_at, UNIQUE(club_id, user_id))
  club_events (id, club_id, title, event_date, start_time, end_time, place, fee, max_attend, created_by, created_at)
  club_event_attendances (id, event_id, member_id, status, UNIQUE(event_id, member_id))
  sessions (id, club_id, session_date, status, match_mode, notes, created_by, created_at)
  matches (id, session_id, court_number, team_a_score, team_b_score, match_mode, started_at, ended_at, excluded_from_ranking BOOL DEFAULT false, created_at, updated_at)
  match_players (id, match_id, member_id, team, UNIQUE(match_id, member_id))
  attendances (id, session_id, member_id, status, UNIQUE(session_id, member_id))
  player_stats (id, club_id, member_id, wins, losses, games_played, win_rate, updated_at, UNIQUE(club_id, member_id))
  notification_preferences (제거 — Non-Goal)
  ```
- **네이밍 원칙**: 기존 코드가 쓰는 `birdieminton_user_id`, `skill_score`, `invite_code`, `thumbnail_color` **그대로 유지**
- `20260410000001_triggers.sql`
  - `generate_invite_code()` — NanoID 8자 LOOP 재시도 (UNIQUE 충돌 대비)
  - `clubs.invite_code` BEFORE INSERT trigger
- **이 단계에서는 RLS 미적용** (Phase 6에서 전면 도입)

### 1.2 타입 정합성 (Day 2)
- `supabase gen types typescript --local > src/types/database.types.ts`
- `src/types/club.ts` 기존 수동 타입은 유지하되 DB 타입을 import해서 의존
- `Club`에 누락 필드 6개(`location`, `activity_place`, `category`, `thumbnail_color`, `thumbnail_url`, `invite_code`) 추가
- `Session.notes`, `Match.match_mode`, `ClubMember.skill_score` 추가
- 레벨 상수 통합 `src/lib/club/skillLevels.ts` — 왕초보 0-25 / 초심자 26-45 / D조 46-65 / C조 66-85 / B조+ 86-100
- `npm run typecheck` → 0 에러

### 1.3 치명 버그 6건 수정 (Day 3~5)

| # | 파일:라인 | 수정 |
|---|-----------|------|
| 3 | `src/app/club/[clubId]/view/page.tsx:116,128` | `auth.uid` → `getClubUserId()` 변환 후 비교 |
| 4 | `src/app/club/[clubId]/finance/actions.ts:57-69` | `update_dues_amount(p_club_id, p_amount, p_apply_from)` RPC 신설. 기존 `paid:true` 보존 |
| 5 | `src/app/club/create/actions.ts:32` | trigger 자동 생성이므로 INSERT에서 제거. 실패 시 재시도 불필요 |
| 6 | `src/app/club/[clubId]/settings/*`, `ClubViewClient.tsx:877-896` | `delete_club_cascade(p_club_id)` RPC — 내부에서 단일 트랜잭션 CASCADE |
| 7 | `src/components/club/GameBoardClient.tsx:215-337` | `start_game_session(p_club_id, p_session_json, p_courts_json)` RPC로 세션+출석+매치+플레이어 단일 트랜잭션 |
| 8(부분) | `supabase/migrations/20260412000001_create_dues.sql:27-30` | RLS `USING (true)` 제거 — 다만 **Phase 6까지는 RLS OFF**. 대신 **server action에서 `club_id` owner 검증 필수**로 임시 대응 |

### 1.4 middleware 재확인 (Day 5)
- Architect 지적: `middleware.ts:36`은 이미 `supabaseResponse.headers.set('x-pathname', ...)` 구현
- 실제 버그는 `layout.tsx:16-17`이 **response 헤더를 읽을 수 없다**는 점
- 수정: middleware에서 `request.headers.set('x-pathname', pathname)`으로 변경하고 response 헤더는 유지 (양쪽 다 set)
- 또는 `headers().get('x-pathname')` 대신 `params`로 경로 분기 처리

**Phase 1 Exit Criteria**: 새 환경에서 `supabase start && supabase migration up` → `npm run dev` → 모임 생성/입장/게임보드 1회 완주 · typecheck 0 에러 · P0 #3,4,5,6,7 해소

---

## Phase 2 — 모임 · 설정 도메인 통일 (Week 2)

**목표**: 편집 UI 단일화 + 초대 강화 + 이벤트 기능.

### 2.1 편집 UI + Action 단일화 (Day 1~2)
- `ClubViewClient.SettingsTab`이 유일 편집 표면
- `src/app/club/[clubId]/manage/profile/` 디렉토리 삭제, `/manage`에서 "설정 탭으로 이동" 링크
- `SettingsClient.tsx`의 "모임 정보 수정" 아코디언 제거
- **Action 통합 (Architect 권고)**:
  - `SettingsClient.tsx:50-56` 의 클라이언트 직접 `club_members.update({role})` → 서버 action `updateMemberRoleAction` (이미 `members/actions.ts`에 존재) 재사용
  - `ClubViewClient.tsx:855-875` 의 `handleSaveProfile` → `updateClubProfileAction` 신설 후 위임
  - 공통 validation `src/lib/club/validation.ts` — 모임명 2~30자, 소개 500자, 코트 1~20

### 2.2 썸네일 이미지 실제 표시 (Day 2)
- `ClubListClient.ClubThumbnail` + `ClubViewClient` 히어로에 `thumbnail_url` 우선
- `<Image>` 컴포넌트 (Next 16), placeholder=blur
- Storage 업로드 경로 변경: `${user_id}/${uuid}.${ext}`
- 5MB 초과 업로드 서버 Action에서 거부
- Supabase Storage `club-thumbnails` bucket 정책 문서화 (Phase 6에서 RLS 적용)

### 2.3 모바일 375px 깨짐 수정 (Day 3) — Critic 권고로 이동
- `ClubListClient` 상단 액션행 `flex-wrap`
- `GameBoardClient.tsx:985-1012` playing 헤더 2줄 허용
- `ClubViewClient.tsx:1163-1178` 헤더 `max-w` 30자 기준
- `FinanceClient.tsx:70-82` 숫자 clamp
- `ClubViewClient.tsx:523-578` 정기모임 카드 썸네일 반응형 축소

### 2.4 초대 기능 강화 (Day 4)
- **초대코드 재발급**: `ClubViewClient.SettingsTab` 고급 아코디언에 버튼 → `regenerateInviteCodeAction(clubId)` Action. `clubs.invite_code` UPDATE + trigger로 재생성
- **멤버 강퇴**: `MembersClient`에 "내보내기" 옵션 (owner 전용, 2단계 confirm 커스텀 모달). `removeMemberAction(clubId, memberId)` Action
- `club_blocks` 테이블 신설 **제거** (Critic 권고). 강퇴 후 초대코드 재발급으로 실질 차단

### 2.5 club_events 기능 구현 (Day 5)
- `CreateSessionModal` TODO 제거, `createClubEventAction(clubId, data)` Action 연결
- `ClubViewClient.RegularSessionTab`에 참석 토글: `toggleEventAttendanceAction(eventId, status)`
- Q1 답변 기준 참석 상태 처리 (2단계 권장: `going` / `not_going`)
- **반복 규칙/롤오버 Non-Goal 확정**

### 2.6 confirm() → ConfirmDialog (Day 5) — Critic 권고로 이동
- `src/components/ui/ConfirmDialog.tsx` 공통 컴포넌트 (shadcn/ui AlertDialog 기반)
- `window.confirm` 모든 호출 치환 (SettingsClient 삭제, GameBoard 취소/삭제, 멤버 강퇴)

**Phase 2 Exit Criteria**: 운영자 플로우 1회 완주 (모임 생성 → 편집 → 초대코드 재발급 → 멤버 강퇴 → 이벤트 생성 → 참석 체크) · 모바일 375px 깨짐 0 · typecheck 0 에러

---

## Phase 3 — 게임보드 · 세션 플로우 정리 (Week 3)

**목표**: 구/신 플로우 분리, 배정 로직 고정, 세션 재개, court_count 존중.

### 3.1 플로우 라벨/진입점 분리 (Day 1)
- **신 (`/gameboard`)** — "실시간 게임보드" (자유 게임)
- **구 (`/session/*`)** — `/club/[clubId]/events/[eventId]/match` 로 리네이밍 + "대회 모드" 라벨
  - 진입: `ClubViewClient.RegularSessionTab`의 이벤트 카드에서 "대진표 열기"
  - `/club/[clubId]/session/new` Link는 어디에도 없음(grep 확인) — 숨김 처리
- 각 플로우 첫 진입 시 안내 배너 (localStorage dismiss)

### 3.2 배정 로직 버그 수정 (Day 2)
- `src/lib/club/matching.ts` 에 `buildCourtsSnake()` 신설 — [1,4]vs[2,3] 스네이크
- `skillBalanceMatch`는 `buildCourtsSnake` 사용하도록 수정
- 기존 `buildCourts` (1,2 vs 3,4) 는 "앞뒤반" 모드 유지 또는 제거
- `MATCH_MODES` 라벨 `src/lib/club/matchMode.ts` 상수로 통합 (라벨 충돌 해소)
- `custom` 모드: UI 구현 여부 결정 — 이번 스코프에선 `MatchMode` 타입에서 `custom` 제거, UI도 제거 (Q7 신규 결정)

### 3.3 세션 재개 (Day 3)
- `/gameboard` 진입 시 `sessions.status='in_progress'` 조회 → 있으면 playing phase로 상태 복원
- 복원 대상: 세션 ID, 코트별 매치 ID/점수/팀/시작시각, 대기 인원
- 새로고침 후 점수 유실 방지: 점수 변경 시 `debounce(300ms)` 후 `update_match_score` RPC 호출

### 3.4 court_count 존중 (Day 3)
- `GameBoardLanding.tsx:36-44` FormData에 `court_count` 반영
- `src/app/club/create/actions.ts:38` 하드코딩 `court_count:2` 제거, FormData에서 읽기
- setup phase에서 `clubs.court_count` 기본값 + 슬라이더/셀렉트로 조정

### 3.5 임시 참가자 명시 + 랭킹 제외 플래그 (Day 4)
- UI: 임시 참가자 이름 옆 "기록 안됨" 작은 배지
- 설정 모달 안내 1줄: "임시 참가자 결과는 랭킹에 반영되지 않아요"
- 매치에 임시 참가자 포함 시 `matches.excluded_from_ranking = true` 자동 설정
- (Phase 4 랭킹 집계 시 이 플래그 WHERE에 반영)

### 3.6 결과 수정 UI (Day 5)
- `ResultInputClient` 저장 후 재방문 시 기존 점수 prefill + 재수정 허용
- 수정 시 `matches.updated_at` 갱신

**Phase 3 Exit Criteria**: 게임 1사이클 + 새로고침 후 상태 복원 + court_count 사용자 선택 반영 + skillBalance 실제 균등

---

## Phase 4 — 랭킹/스탯 집계 (Week 4)

**목표**: 경기 결과가 랭킹에 반영되도록.

### 4.1 집계 전략 채택 — Server Action First (Critic 권고 반영)
- **Phase 4 기본**: 경기 마감(`handleEndCourt`, `ResultInputClient` 저장) 시 Server Action `updatePlayerStatsForMatch(matchId)` 호출
- Action 내부: OLD score 역집계 → NEW score 재집계 → player_stats UPSERT
- 디버깅/테스트 용이, Vitest 단위 테스트 1개 작성
- **trigger 기반은 후순위**: Phase 6에서 "RLS/배포 준비"와 함께 도입 검토 (DB 수준 안전망)

### 4.2 player_stats 계산 로직
- `wins`: 팀이 상대팀 점수 초과한 경기 수 (팀 구분은 match_players.team)
- `losses`: 반대
- `games_played = wins + losses`
- `win_rate = wins::FLOAT / GREATEST(games_played, 1)`
- **제외 조건**: `matches.excluded_from_ranking = true` 제외

### 4.3 경기 취소/결과 수정 케이스
- 경기 취소 (`handleCancelCourt`): `updatePlayerStatsForMatch`를 OLD score로 역집계 후 0-0 처리
- 결과 수정: OLD score로 역집계 → NEW score로 재집계 (이미 4.1에 포함)
- match_players 변경: Phase 5 이월 (이번엔 배정 후 변경 없음 전제)

### 4.4 RankingTable UI 보강
- 빈 상태 메시지: "아직 경기 기록이 없어요"
- 본인 행 강조는 유지
- 승률 소수점 둘째 자리 고정
- 최근 5경기 결과 badge (Phase 5 이월)

### 4.5 백필 생략 (Q2 기본)
- 기존 데이터 백필 SQL 작성하지 않음
- `player_stats`는 이번 Phase 이후 발생 경기만 집계
- 필요 시 사용자 요청으로 Phase 5에서 추가

**Phase 4 Exit Criteria**: 경기 1회 진행 → 랭킹 반영 → 취소 시 역집계 → Vitest 단위 테스트 PASS

---

## Phase 5 — QA · 누락 영역 · 문서 (Week 5)

**목표**: 품질 보강 + Critic 지적 누락 항목 보강.

### 5.1 에러/로딩/빈 상태 보강 (Day 1~2)
- `src/app/error.tsx` 전역 error boundary
- 도메인별 Empty 컴포넌트 (`EmptyMembers`, `EmptyDues`, `EmptyRanking`, `EmptyEvents`)
- 낙관적 업데이트 rollback: `FinanceClient`, `AttendanceClient`, `MembersClient`
- 실패 시 `sonner` 토스트 (에러 메시지 표준화)

### 5.2 접근성 (a11y) (Day 2)
- `ConfirmDialog`, 아코디언, 게임보드에 ARIA 속성
- 키보드 탭 순서 점검 (Tab/Enter/Escape)
- 색 대비 WCAG AA 기준 (특히 #beff00 CTA)
- `@axe-core/react` 개발 모드 도입

### 5.3 성능 예산 측정 (Day 3)
- `next build` 번들 분석 (`@next/bundle-analyzer`)
- `/club/home`, `/club/[id]/view`, `/gameboard` Lighthouse 측정
- LCP 2.5s 미달이면 이미지 최적화 (`<Image priority>`, `sizes` prop)
- 페이지네이션 50개 적용 (모임 목록, 멤버 목록)

### 5.4 SEO / 메타데이터 (Day 3)
- CLAUDE.md "모든 페이지 metadata 필수" 규칙 이행
- 각 page.tsx에 `generateMetadata` (title, description, OG)
- `/api/og/route.tsx` 존재 여부 확인 후 미사용 페이지 연결

### 5.5 디자인 토큰화 (Day 4)
- `tailwind.config.ts`에 CLAUDE.md 컬러 변수 등록 (`--color-bg`, `--color-lime` 등)
- CSS 변수 → Tailwind theme.extend
- shadcn/ui 테마 통합

### 5.6 Vitest 단위 테스트 확장 (Day 4~5)
- 필수 3개:
  - `updatePlayerStatsForMatch` Action
  - `buildCourtsSnake` 매칭 로직
  - `update_dues_amount` RPC (Supabase local에서 SQL 테스트)
- `package.json`에 `npm run test` 추가

### 5.7 에러 모니터링 준비 (Day 5)
- Sentry SDK 설치 + `sentry.client.config.ts` / `sentry.server.config.ts`
- DSN은 `.env.local` 주석 처리 (프로덕션 배포 시 enable)
- 로컬 dev는 `enabled: false`

### 5.8 문서 업데이트 (Day 5)
- `README.md`: 로컬 개발 셋업, DB 마이그레이션 절차, 테스트 실행
- `AGENTS.md` 또는 `.cursorrules`: 이번 하드닝 원칙, 네이밍 규칙, validation 공통 상수
- `CHANGELOG.md` 신설 (Phase별 변경 기록)

**Phase 5 Exit Criteria**: a11y 기본 pass · Lighthouse LCP<2.5s · 단위 테스트 3개 PASS · Sentry 설치 완료 · README 최신화

---

## Phase 6 — RLS · Service Role 제거 · CI (Week 6, 배포 준비 블록)

**목표**: 프로덕션 배포 전 보안 방어선 + 자동화.

### 6.1 RLS 헬퍼 & 정책 (Day 1~2)
- `supabase/migrations/20260510000000_rls_helpers.sql`
  - `auth_club_user_id()` SQL 함수 — `SECURITY DEFINER`, `STABLE`, `SET search_path = public`
  - 재귀 차단: `users` 테이블은 `USING (birdieminton_user_id = auth.uid())` 직접 비교
- `20260510000001_rls_policies.sql` — 모든 테이블:
  - `users`: 본인 row만 SELECT/UPDATE
  - `clubs`: 멤버만 SELECT, owner만 UPDATE/DELETE
  - `club_members`: 같은 클럽 멤버 SELECT, owner/manager만 INSERT/UPDATE/DELETE
  - `sessions`/`matches`/`match_players`/`attendances`: 같은 클럽 멤버만 CRUD
  - `dues`: 기존 `USING (true)` → 같은 클럽 멤버 + owner/manager만 write
  - `player_stats`: 같은 클럽 멤버 SELECT, write는 Server Action 전용 (SECURITY DEFINER 함수)

### 6.2 Service Role 제거 (Day 2~3)
- `src/lib/supabase/admin.ts` 호출처 전체 grep
- 각 호출부를 `createClient()` (anon/세션) + RLS 의존으로 전환
- 정말 필요한 곳(cron API 등)만 `admin` 남기고 `CRON_SECRET` 헤더 인증
- 최종: `grep -r "createAdminClient" src/ | wc -l == 0` 목표, 불가 시 API 라우트 1~2개로 제한

### 6.3 trigger 기반 player_stats (옵션, 선택적 적용)
- Phase 4의 Server Action을 계속 유지하되, DB 수준 안전망으로 trigger 추가:
  - `on_match_score_update`: `AFTER UPDATE ON matches WHEN (OLD.team_a_score IS DISTINCT FROM NEW.team_a_score OR OLD.team_b_score IS DISTINCT FROM NEW.team_b_score) AND NEW.excluded_from_ranking = false`
  - OLD score 역집계 → NEW score 재집계 내부 PL/pgSQL
  - `on_match_delete`: `BEFORE DELETE` 역집계
  - `on_match_players_change`: `AFTER INSERT/UPDATE/DELETE ON match_players` 경기 완료 상태면 재집계
- Server Action과 이중 집계 충돌 방지: Action은 trigger가 없을 때만 UPSERT하도록 분기 or trigger 도입 시 Action 제거

### 6.4 CI 파이프라인 (Day 4~5)
- GitHub Actions `.github/workflows/ci.yml`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test` (Vitest)
  - `supabase db reset && supabase migration up` (임시 DB)
- Playwright E2E는 **옵션** — Supabase local setup 완료 후 도입 결정
  - 선택 시 3개 시나리오: 가입→가입→입장 / 게임 진행→마감→랭킹 / 모임 삭제

### 6.5 환경변수/시크릿 분리
- `.env.example` 정비
- `SUPABASE_SERVICE_ROLE_KEY` 사용처 명시 (주석으로)
- `CRON_SECRET` 등 시크릿 로테이션 절차 README 기재

**Phase 6 Exit Criteria**: `createAdminClient` 최소화 · 모든 테이블 RLS + 음성 테스트(권한 없는 유저가 접근 실패 확인) · CI green · 배포 가능 상태

---

## 4. 리스크 & 완화 (최종)

| 리스크 | 영향 | 완화 |
|-------|------|------|
| 스키마 변경 중 로컬 데이터 손실 | 중 | `db:backup` 스크립트 Phase 0 |
| `generate_invite_code` UNIQUE 충돌 무한루프 | 저 | LOOP 5회 재시도 + RAISE |
| trigger vs Server Action 이중 집계 | 중 | Phase 6에서 한쪽 비활성화 플래그 |
| Next 16 async API 누락 | 중 | eslint-plugin-next 16 규칙 |
| RLS 순환 참조 | 중 | `SECURITY DEFINER` + 직접 비교 |
| 1인 개발자 번아웃 | 고 | Phase마다 Exit Criteria 후 1일 버퍼 |
| 반복 실수 (이전 세션 이슈) | 중 | 각 Phase 시작 시 직전 Phase 회고 10분 |

## 5. 명확한 Non-Goals (이번 스코프 제외)

- 알림 DB 영속화 + 발송 (UI만 localStorage 유지)
- 정기모임 반복 규칙 / 롤오버
- Web Push / PWA / 이메일 발송
- QR 코드 초대
- 멤버 차단 테이블 (초대코드 재발급으로 대체)
- 회계 감사 로그
- 모임 공지 기능
- 멤버 채팅
- 랭킹 시즌제 / MVP
- Playwright E2E (Phase 6 옵션)
- 퀴즈 → club_members.skill 자동 연동 (별도 퀴즈 Phase에서)
- RecentViewTracker 되살리기
- player_stats 기존 데이터 백필

## 6. 승인 상태

- ✅ Planner: 초안 작성
- ✅ Architect: 치명 4건 지적 → 전부 반영 (네이밍/순서/Next16/재귀/trigger 공백/supabase init)
- ✅ Critic: 근본 반박 7건 지적 → 전부 반영 (6주+Phase0/RLS이연/trigger후순위/Dead code 선제/열린질문 Phase0/ eventsリネーム/CI이연)

## 7. 다음 단계

1. 이 플랜을 사용자가 승인
2. Q1~Q6 답변 확정 (Phase 0 Day 1)
3. Phase 0 착수 (Dead code 제거부터)

---

**파일 경로**: `.omc/plans/2026-04-17-platform-hardening-final.md`
