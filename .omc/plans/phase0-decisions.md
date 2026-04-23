# Phase 0 확정 결정 사항

**확정일**: 2026-04-17

## Q1~Q6 최종 답변 (기본값으로 확정)

| # | 질문 | 결정 |
|---|------|------|
| Q1 | 이벤트 참석 상태 | **2단계** — `going` / `not_going` |
| Q2 | `player_stats` 기존 백필 | **생략** — 초기값 0, 이후 발생 경기만 집계 |
| Q3 | 강퇴 멤버 과거 경기 기록 | **유지** — `member_id` nullable + `removed_at TIMESTAMPTZ` 컬럼 추가 |
| Q4 | 참석자 수 집계 방식 | **실시간 COUNT** — 소규모라 부담 없음, 캐시 컬럼 불필요 |
| Q5 | 뒤로가기 경로 원칙 | **브라우저 히스토리 우선** — 없으면 `/club/home` fallback |
| Q6 | `users`↔`auth.users` FK | **`REFERENCES auth.users(id) ON DELETE CASCADE`** |

## Phase 0 작업 완료 목록

- [x] Dead code 4개 삭제: `ClubCard.tsx`, `ClubLoginForm.tsx`, `BottomTabBar.tsx`, `RecentViewTracker.tsx`
- [x] import 잔여 0건 확인
- [x] `supabase init` → `supabase/config.toml` 생성
- [x] `.env.example` 템플릿 신설 (값 제외, 키만)
- [x] `package.json` scripts 추가: `typecheck`, `db:reset`, `db:push`, `db:types`, `db:backup`
- [x] `npm run typecheck` 기준점: **0 에러**

## 네이밍 원칙 (Phase 1+ 전체 적용)

| 항목 | 사용 명칭 |
|------|----------|
| users.auth 연결 컬럼 | `birdieminton_user_id` |
| 멤버 실력 점수 컬럼 | `skill_score` |
| 정기모임 테이블 | `club_events` |
| 정기모임 참석 테이블 | `club_event_attendances` |
| Next.js 버전 | 16.1.6 |
| 로컬 Supabase 명령 | `supabase start` → `supabase migration up` |
