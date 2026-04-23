# 버디민턴 플랫폼 하드닝 · 4주 로드맵 (DRAFT)

**작성일**: 2026-04-17
**범위**: 모임 · 운영 · 관리 · 게임보드 · 설정
**진단 기반**: Architect 리포트 (P0 8건 / P1 9건 / P2 5건)
**합의 기반**: 3차 인터뷰 (12개 결정)
**상태**: 초안 — Architect + Critic 리뷰 대기

---

## 1. 최종 목표 (Definition of Done)

- [ ] 모든 Club 관련 테이블/함수/trigger가 `supabase/migrations/` 안에 재현 가능
- [ ] P0 8건 · P1 9건 · P2 5건 전부 해소
- [ ] `createAdminClient` 사용 0건, 모든 테이블에 세밀한 RLS
- [ ] 랭킹/스탯이 경기 결과 UPDATE 시 자동 집계
- [ ] 정기모임 생성·참석 DB 연동 (반복 규칙은 별도 Phase)
- [ ] 편집 UI 단일화 (ClubViewClient SettingsTab)
- [ ] TypeScript strict 통과 + 핵심 Action 단위 테스트 + Playwright E2E 3개 + 마이그레이션 CI

## 2. 비기능 요구사항

- **성능**: 모바일 375px 기준 LCP 2.5s 이내, 모든 리스트 50개 이하 페이지네이션
- **보안**: RLS 전면, Service Role Key는 server-side migration/seed 전용
- **호환성**: Pretendard 유지, 기본 화이트 테마, #beff00은 CTA 5~10% 이내
- **데이터 무결성**: 다중 INSERT는 RPC(stored function) 트랜잭션으로 래핑

---

## Phase 1 — 인프라 기반 재정비 (Week 1)

**목표**: 배포 가능한 DB 상태, 치명 버그 제거, RLS 방어선 확립.

### 1.1 Supabase 마이그레이션 복원 (P0 #1)
- `supabase/migrations/20260417000000_core_schema.sql` 신설
  - `users` (id, auth_user_id, name, created_at)
  - `clubs` (id, owner_id, name, description, location, activity_place, category, court_count, thumbnail_color, thumbnail_url, invite_code UNIQUE, plan, max_members, created_at, updated_at)
  - `club_members` (id, club_id, user_id, role, skill, joined_at, UNIQUE(club_id, user_id))
  - `sessions` (id, club_id, session_date, status, match_mode, notes, created_by, created_at)
  - `matches` (id, session_id, court_number, team_a_score, team_b_score, match_mode, started_at, ended_at, created_at)
  - `match_players` (id, match_id, member_id, team, UNIQUE(match_id, member_id))
  - `attendances` (id, session_id, member_id, status, UNIQUE(session_id, member_id))
  - `player_stats` (id, club_id, member_id, wins, losses, games_played, win_rate, updated_at, UNIQUE(club_id, member_id))
- `20260417000001_rls_policies.sql` — 모든 테이블 RLS ENABLE + 세밀 정책
- `20260417000002_triggers.sql` — `invite_code` 자동 생성, `player_stats` 집계 trigger
- **DoD**: 새 Supabase 프로젝트에 `supabase db push`만으로 전체 구성 성공

### 1.2 치명 버그 6종 즉시 수정 (P0 #3~#8)
- `view/page.tsx:116,128` — `auth.uid`를 `getClubUserId()`로 변환 후 비교
- `finance/actions.ts:57-69` — 금액 변경 시 "이월부터 적용" 옵션화. `paid:false` 덮어쓰기 제거. RPC `update_dues_amount(p_club_id, p_amount, p_apply_from)` 신설
- `create/actions.ts` — `invite_code` 컬럼 DB trigger `generate_invite_code()`로 자동 생성 (NanoID 8자)
- `layout.tsx:17-18` — middleware에서 `request.headers.set('x-pathname')`으로 변경
- 모임 삭제 — `delete_club_cascade(p_club_id)` RPC 함수로 트랜잭션 래핑, Service Role 제거
- 게임보드 시작 — `start_game_session(p_club_id, p_session_data, p_courts)` RPC로 세션+출석+매치+플레이어 단일 트랜잭션

### 1.3 RLS 전면 도입 + Service Role 제거 (P0 #8)
- 기존 `createAdminClient` 6개 호출부 분석 → RLS 정책으로 대체
- `dues` 정책 재작성: `USING (club_id IN (SELECT club_id FROM club_members WHERE user_id = auth_club_user_id()))`
- RLS 헬퍼 함수 `auth_club_user_id()` — auth.uid → users.id 변환
- **DoD**: `grep -r "createAdminClient" src/ | wc -l == 0`

### 1.4 타입 정합성 (P0 inf)
- `src/types/club.ts` — `Club`에 location, activity_place, category, thumbnail_color, thumbnail_url 추가
- `Session`에 notes, `Match`에 match_mode, started_at, ended_at 추가
- `supabase gen types typescript`로 자동 생성한 `database.types.ts`를 별도 관리, 애플리케이션 타입은 그 위에 빌드

**Week 1 Exit Criteria**: 새 환경에서 `supabase db push` → 로컬 dev 서버 기동 → 모임 생성/입장/게임보드 1회 완주

---

## Phase 2 — 모임 · 설정 도메인 하드닝 (Week 2)

**목표**: 모임·설정·운영 도메인의 UX 통일과 기능 완성.

### 2.1 편집 UI 단일화 (P1 #10, P2 #18)
- `ClubViewClient.SettingsTab`을 단일 편집 표면으로 확정
- `/manage/profile` 페이지 → SettingsTab 섹션으로 리다이렉트 또는 embed
- `/settings` 페이지의 "모임 정보 수정" 아코디언 제거
- 공통 validation 상수 `src/lib/club/validation.ts`에서 단일 정의 (모임명 2~30자, 소개 ~500자, 코트 1~20)

### 2.2 썸네일 이미지 표시 (P1 #10)
- `ClubListClient.ClubThumbnail`과 `ClubViewClient` 히어로에 `thumbnail_url` 우선 렌더
- `thumbnail_url`이 있으면 `<Image>`, 없으면 emoji + `thumbnail_color` fallback
- Storage 정책 재검토: 크기 검증 (5MB 서버 체크), 경로 `${user_id}/${uuid}.${ext}`로 격리

### 2.3 초대/가입 기능 강화 (2차 합의 #7)
- 초대코드 재발급 버튼 → SettingsTab 아코디언 "고급" 안에
- 멤버 강퇴 → MembersClient에 "내보내기" 옵션 (owner 전용, 2단계 confirm)
- 멤버 차단 → `club_blocks` 테이블 신설, 동일 코드로 재가입 불가
- QR/만료일은 다음 Phase

### 2.4 정기모임 기능 구현 (P1 #11)
- `regular_sessions` 테이블: id, club_id, title, date, start_time, end_time, place, fee, max_attend, created_by, created_at
- `regular_session_attendances` 테이블: session_id, member_id, status(going/maybe/no), updated_at
- `CreateSessionModal`의 TODO 제거, 실제 INSERT 연동
- ClubViewClient RegularSessionTab 참석 토글 기능 추가
- **비포함**: 반복 규칙, 자동 롤오버 (Phase 3)

### 2.5 알림 설정 DB 영속화 (P1)
- `notification_preferences` 테이블: user_id, club_id, mode(push/silent/off), updated_at
- localStorage 코드 제거, `ClubViewClient.SettingsTab`에서 서버 저장
- **비포함**: 실제 발송 로직

**Week 2 Exit Criteria**: 운영자가 모임 생성 → 편집(색/이름/소개) → 초대코드 재발급 → 멤버 1명 강퇴 → 정기모임 생성 → 참석 체크까지 완주

---

## Phase 3 — 게임보드 · 세션 도메인 정리 (Week 3)

**목표**: 구/신 플로우 진입 분리, 게임보드 안정화, 랭킹 자동 집계.

### 3.1 플로우 진입 명확화 (P1 #15)
- **신 플로우 (/gameboard)** — 실시간 자유 게임. 진입: 홈 게임보드 탭 CTA
- **구 플로우 (/session/new)** — 공식 대회·대진표형. 진입: 새 메뉴 "대회 만들기" 또는 `/view` 정기모임 탭에서 "대진표 열기"
- 라벨 통일: 신=**실시간 게임보드**, 구=**대회 모드**
- 각 플로우 시작 시 안내 배너 1회

### 3.2 랭킹/스탯 자동 집계 (P0 #2)
- `player_stats` trigger `on_match_score_update`
  - `AFTER UPDATE ON matches WHEN (OLD.team_a_score != NEW.team_a_score OR ...)`
  - team_a/b_score 확정 시 해당 match_players에 대해 wins/losses UPSERT
  - `games_played` 증가, `win_rate = wins / games_played`
- 취소(`DELETE FROM matches`) 시 역집계 trigger `on_match_delete`
- RankingTable 빈 상태 메시지 수정 — "아직 경기 기록이 없어요"
- 기존 데이터 백필 스크립트 1회 실행

### 3.3 게임보드 임시 참가자 명시 (2차 합의 #6)
- 현재 동작 유지: DB 미저장, `temp-` prefix로 filter
- UI 추가: 임시 참가자 이름 옆에 "기록 안됨" 배지
- 모달 안내: "임시 참가자의 경기 결과는 랭킹에 반영되지 않아요"

### 3.4 배정 로직 버그 수정 (P1 #13, #14)
- `src/lib/club/matching.ts` `skillBalanceMatch` 함수 스네이크 방식으로 수정 ([1,4] vs [2,3])
- `MatchAssignClient.customDrag` 실 구현 또는 'custom' 모드 UI 제거 + 타입에서 삭제
- `MATCH_MODES` 라벨 `src/lib/club/matchMode.ts` 상수로 통합

### 3.5 세션 재개 / court_count 존중 (P1 #17)
- `/gameboard` 진입 시 `status='in_progress'` 세션 있으면 playing phase로 복원
- 코트 수: `clubs.court_count` 기본값, 세션 시작 시 조정 가능
- GameBoardLanding FormData에 `court_count` 실제 반영되도록 actions 수정

### 3.6 결과 수정 UI (P1)
- ResultInputClient 저장 후 재방문 시 기존 점수 표시 + 재수정 허용
- 수정 이력은 matches.updated_at으로 트래킹 (별도 감사 로그 없음)

**Week 3 Exit Criteria**: 게임 배정→점수→마감 한 사이클 + 새로고침해도 상태 복원 + 랭킹 테이블 실제 숫자로 채워짐

---

## Phase 4 — UX 통일 · QA · Dead Code 정리 (Week 4)

**목표**: 품질 · 안정성 · 배포 준비.

### 4.1 Dead code 제거 (P2 #19)
- `ClubCard.tsx`, `ClubLoginForm.tsx`, `BottomTabBar.tsx` 삭제
- `RecentViewTracker.tsx` → `ClubViewClient` 또는 layout에 실제 연결, localStorage `recentClubs` 기반 "최근 본 모임" 탭 활성화

### 4.2 모바일 375px 깨지는 화면 수정 (P1 모바일)
- `ClubListClient` 상단 액션행 `flex-wrap`
- `GameBoardClient` playing 헤더 2줄 허용
- ClubViewClient 헤더 `max-w` 30자 기준으로 조정
- FinanceClient 요약 카드 폰트 사이즈 clamp

### 4.3 모바일 confirm() → 커스텀 모달 (P2 #21)
- `src/components/ui/ConfirmDialog.tsx` 공통 컴포넌트
- `window.confirm` 모두 치환 (SettingsClient 삭제, GameBoard 취소/삭제 등)

### 4.4 에러/로딩/빈 상태 보강
- `ErrorBoundary` 전역 + 도메인별 빈 상태 컴포넌트
- 낙관적 업데이트 실패 시 rollback + 토스트 (FinanceClient, AttendanceClient)

### 4.5 QA 파이프라인 구축 (합의 #11)
- `tsconfig.json` strict 옵션 점검 및 any 잔존 제거 (`grep -rn ": any" src/`)
- Vitest 도입
  - 단위 테스트 타겟: `finance/actions.ts`, `delete_club_cascade` RPC, `player_stats` trigger, `matching.ts` skillBalance
- Playwright E2E 3개
  - 회원가입 → 모임 가입 → 입장
  - 게임 생성 → 경기 → 마감 → 랭킹 반영 확인
  - 모임 삭제 (owner)
- GitHub Actions
  - `tsc --noEmit`
  - Vitest
  - Playwright (headless)
  - `supabase db push` dry-run against temporary DB

### 4.6 레벨 시스템 통합 (P1 #16)
- 퀴즈 시스템 점수 범위와 `MembersClient.SKILL_LEVELS` 통일
- 공통 정의 `src/lib/club/skillLevels.ts`
  - 왕초보 0-25, 초심자 26-45, D조 46-65, C조 66-85, B조+ 86-100
- 퀴즈 결과 → club_members.skill로 자동 반영하는 훅(옵션) 남겨둠

**Week 4 Exit Criteria**: 모든 P0/P1/P2 해소 확인, CI green, E2E 3개 pass, TS strict 통과

---

## 3. 리스크 & 완화

| 리스크 | 영향 | 완화 |
|-------|------|------|
| RLS 정책 누락 → 데이터 유출 | 치명 | Phase 1 종료 시 각 테이블마다 SELECT/INSERT/UPDATE/DELETE 4회씩 음성 테스트 |
| 마이그레이션 실행 중 기존 데이터 손실 | 치명 | 로컬 한정이므로 dev 데이터 무시. 프로덕션 도입 전 별도 backup/restore 가이드 |
| `player_stats` trigger 무한 루프 | 중 | RAISE NOTICE로 로깅, 초기엔 일부 경기에만 enable |
| Next 15 headers() API 변경 | 저 | 이미 `await headers()` 사용 중 |
| Supabase 로컬 CLI 버전 차이 | 저 | `supabase --version` 고정, README 명시 |

## 4. 테스트 플랜

| 레벨 | 대상 | 도구 |
|------|------|------|
| 타입 | 전체 | `tsc --noEmit` |
| 단위 | 서버 Action, RPC, trigger, matching 로직 | Vitest + Supabase local |
| 통합 | 도메인별 flow (create→edit→delete) | Vitest with MSW |
| E2E | 핵심 3 플로우 | Playwright |
| 마이그레이션 | 각 PR | Supabase dry-run CI |

## 5. 릴리스 정책 (합의 #12)

- **이번 스코프 내 배포 없음** — 모두 로컬 dev
- feature branch `hardening/phase-{1~4}` 운영, main에 순차 머지
- staging 배포는 사업자등록(2026-06) 이후 Phase 별도

## 6. 명확한 Non-Goals

아래는 이번 스코프에서 **다루지 않음**:
- 정기모임 반복 규칙, 자동 롤오버
- 실제 푸시/이메일 발송
- Web Push API / PWA 설치
- QR 코드 초대, 만료일 설정
- 회계 감사 로그 / 이력 관리
- 모임 공지 기능 ("준비 중" 유지)
- 멤버 간 메시지/채팅
- 랭킹 시즌제, 월간 MVP

---

## 7. 열린 질문 (Planner→다음 리뷰어에게)

1. **정기모임 참석**: "going/maybe/no" 3단계 vs "참석/미참석" 2단계? UI 복잡도 차이.
2. **player_stats 백필**: 기존 경기 데이터를 trigger 없이 일회성 SQL로 집계할지, 아니면 초기값 0으로만 둘지?
3. **강퇴된 멤버의 기존 경기 기록**: 유지(null 처리) vs 삭제(CASCADE)?
4. **정기모임 참석자 수 집계**: 실시간 COUNT vs 캐시 컬럼 `current_attend`?
5. **뒤로가기 경로 원칙**: view에서 뒤로 → home 고정 vs 브라우저 히스토리?
6. **`users` 테이블 스키마**: `auth.users`와 1:1 FK를 migration에서 어떻게 보장?
