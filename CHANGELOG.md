# Changelog

## [Unreleased] — 버디모아 플랫폼 하드닝

### Phase 5 — QA · 접근성 · 성능 (2026-04-17)
- 전역 에러 경계 추가 (`src/app/error.tsx`, `src/app/club/error.tsx`)
- Empty 상태 컴포넌트 4종 추가 (EmptyMembers, EmptyDues, EmptyRanking, EmptyEvents)
- Sonner 토스트 라이브러리 통합
- 모든 클럽 페이지 SEO 메타데이터 완비 (title + description + dynamic generateMetadata)
- Tailwind v4 브랜드 디자인 토큰 10종 추가 (`globals.css @theme`)
- Vitest 단위 테스트 7개 (매칭 로직 3, 스탯 집계 4)
- Sentry SDK 설정 (프로덕션 전용 `enabled`)
- 번들 분석기 설정 (`npm run analyze`)
- README, AGENTS.md, CHANGELOG.md 문서화

### Phase 4 — 랭킹/스탯 집계 (2026-04-17)
- `updatePlayerStatsForMatch` Server Action 구현 (OLD score 역집계 + NEW score 재집계)
- 경기 취소 시 player_stats 자동 역집계
- 결과 수정 시 기존 점수 역집계 후 재집계
- `getClubRanking` 정렬: wins DESC → win_rate DESC
- RankingTable UI: 승률 소수점 1자리, 경기수 표시, 승률→승률 오타 수정

### Phase 3 — 게임보드 · 세션 플로우 (2026-04-17)
- 세션 재개 기능 (in_progress 세션 복원)
- 임시 참가자 "기록 안됨" 배지 표시
- `excluded_from_ranking` 플래그 자동 설정
- 결과 수정 UI (기존 점수 prefill + 재수정)
- `buildCourts` 스네이크 페어링 적용

### Phase 2 — 모임 · 설정 도메인 (2026-04-17)
- `ConfirmDialog` 공통 컴포넌트 (window.confirm 전면 교체)
- club_events 참석 토글 기능
- 멤버 강퇴 (2단계 확인, owner 전용)
- 썸네일 이미지 표시 (Next.js Image 컴포넌트)
- 모바일 375px 레이아웃 수정

### Phase 1 — 코어 버그 수정 (2026-04-17)
- `getClubUserId()` auth.uid 직접 비교 버그 수정
- `update_dues_amount` RPC 신설 (기존 paid 보존)
- `delete_club_cascade` RPC (단일 트랜잭션 CASCADE)
- `start_game_session` RPC (세션+출석+매치 원자적 생성)
- 초대코드 자동 생성 trigger
