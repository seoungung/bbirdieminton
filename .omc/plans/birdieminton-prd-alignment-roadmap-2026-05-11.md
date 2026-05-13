# 버디민턴 PRD 정합화 대수술 로드맵 (Stage 0 ~ E)

> **Plan ID**: `birdieminton-prd-alignment-roadmap-2026-05-11`
> **작성일**: 2026-05-12
> **작성자**: Prometheus (oh-my-claudecode planner)
> **PRD 원본**: `C:\Users\skyyo\Downloads\birdieminton_prd.md`
> **레포 루트**: `C:\Users\skyyo\Projects\Birdminton\birdminton`
> **비전 한 줄**: PRD 명세 100% 정합으로 코드베이스를 재정렬하고, Free/Basic/Pro 누적 인원 종량제 SaaS 로 정상 출항한다.

---

## 0. 메타

| 항목 | 값 |
|------|-----|
| 플랜 종류 | 대수술 (PRD 우선 강제 정합) |
| 총 Stage | Stage 0 ~ E (필수 5단계 + 선택 1단계) |
| Stage 길이 | 2주 / Stage (Stage E 만 0~2주 가변) |
| 총 예상 기간 | 10~12주 (5월 중순 ~ 7월 말) |
| 실행 모델 | 직렬 (Stage 단위로 dogfooding 통과 후 다음 진입) |
| 핸드오프 | 각 Stage 끝에 사용자 dogfooding 체크포인트 의무 |

### 0.1 사전 완료 (Stage -1 격, 이미 끝남)
- RLS 캐스팅 회귀 복구: `supabase/migrations/20260511000000_fix_rls_regressions.sql`
- 마스터 어드민 시스템: `/admin` + `src/lib/auth/master.ts` (캐싱 적용 완료)
- PDF 1회결제 코드 잔재 제거 완료
- 체험용(데모) 모드 전면 제거 완료 (58 files, +176/-3147)

### 0.2 알려진 부채 (Plan 진행 중 반드시 정리할 것)
1. **스키마 드리프트**: `users` 테이블 실제 DB 와 마이그레이션 불일치
   - 실제 DB 에는 있으나 마이그레이션에 없는 컬럼: `phone`, `is_placeholder`, `quiz_level`, `profile_img` 일부
   - Stage 0 Week 2 일괄 마이그레이션 시점에 모두 한 줄로 정렬
2. **birdieminton_user_id 타입 드리프트**: 마이그레이션은 UUID, 실제 DB 는 text → 정합화 필요
3. **인터뷰 결과 PRD 미명세 부가 기능 격하 대상**:
   - `/club/{clubId}/finance` → `/admin` 흡수
   - `/club/{clubId}/notices` → `/admin` 흡수
   - `/club/{clubId}/join-requests` → `/admin` 흡수
   - `/club/{clubId}/stats` → 새 `/stats` 통합 탭으로 흡수
   - `/club/{clubId}/report` → `/stats` 흡수
   - `/club/{clubId}/ranking` → `/stats` 흡수
   - `/club/{clubId}/shuttle` → 정산소 `/session/{id}/summary` 통합 (Stage C)
   - `/club/{clubId}/me` → 글로벌 `/mypage` 흡수 (Stage A)
   - `/club/{clubId}/import` → 준비 중 안내, 코드 보존 (Stage E 에서 재논의)

---

## 1. 결정 요약 표 (인터뷰 결과 한 페이지 압축)

| 영역 | 결정 |
|------|------|
| **전체 방향** | PRD 우선 대수술. PRD 미명세 추가 기능은 제거 또는 격하. |
| **플랜 구조** | Free 50명 / Basic 100명 ₩9,900/월 / Pro 무제한 ₩29,900/월 (누적 인원) |
| **결제 수단** | Toss 빌링 정기결제 (가맹 재신청 필요, Stage D) |
| **게임보드 점수** | 점수 입력 UI 완전 제거 → 3버튼 ([A팀 승]/[B팀 승]/[무승부]) |
| **글로벌 네비** | PRD §2.1 4탭 풀도입: `/dashboard`, `/my-clubs`, `/explore`, `/mypage` |
| **클럽 탭** | PRD §2.2 4탭만 유지: `[일정]`, `[멤버]`, `[스탯]`, `[관리]` (운영자만) |
| **Glicko-2** | mu/phi 유지하되 W/L 기반 재설계 (점수 의존 제거) |
| **BP 테스트 MVP** | 17문항 + S~F 등급 + 결과 공유 카드 (GIF·28문항은 점진적) |
| **정산소 MVP** | 장소료/콕값 토글 + N빵 계산기 + 카톡 고유 링크 생성 |
| **알림톡 실발송** | Basic 플랜 기능으로 분리 (Stage D) |
| **임포트** | 라우트 비활성화 + "준비 중" 안내, 코드 자체는 보존 (Stage E 재논의) |
| **실행 순서** | Stage 0 완전히 끝내고 Stage A 진입 (안전 우선) |
| **Stage 길이** | 2주/Stage 표준, 매주 dogfooding 한 번 |
| **PRD 추가 정렬** | 모임 가입 신청 누적 인원 차단, 게스트 합산 결제, 매너온도 평가 팝업 |

---

## 2. 로드맵 한눈에 (Gantt 마크다운)

| Stage | 주차 | 핵심 목표 | 산출물 (대표) |
|-------|------|-----------|---------------|
| **0** | W1 | 추가 탭 9개 정리 (관리/스탯 흡수, import 비활성화, me/shuttle 보류) | 4탭 클럽 라우트, 흡수된 섹션 |
| **0** | W2 | 게임보드 3버튼 + Glicko-2 W/L 재설계 + PRD §4 스키마 일괄 마이그레이션 | 점수 입력 제거 / 새 스키마 |
| **A** | W3 | 글로벌 네비 4탭 신설 (`/dashboard`, `/my-clubs`, `/explore`, `/mypage`) | GNB 라우트 + 빈 페이지 |
| **A** | W4 | 마이페이지 컨텐츠 + 핸들(`/club/{handle}`) 라우팅 + 푸시 미들웨어 통합 | BP/등급/매너 뱃지, custom_url_id |
| **B** | W5 | `/test` 17문항 페이징 + 가중치 알고리즘 | 스카우터 진행률 + S~F 계산 |
| **B** | W6 | 결과 페이지 + 공유 카드 + users 테이블 저장 | 레이더 차트 + SNS 공유 이미지 |
| **C** | W7 | 정산소 MVP (`/session/{id}/summary`) + 게스트 합산 청구 | 모듈형 정산 폼 + 카톡 링크 |
| **C** | W8 | 매너온도 평가 팝업 + 초대 랜딩 페이지 | `/review`, `/club/{handle}/invite` |
| **D** | W9 | 누적 인원 가드 + Toss 빌링 SDK (테스트) + `/pricing` | 결제 흐름 + 가맹 재신청 |
| **D** | W10 | 공동관리자, 알림톡, Excel/PDF 차등 기능 | Basic/Pro 차등 동작 |
| **E** | W11~12 (선택) | 안정화 + 베타 모집 + import/체험하기 재결정 | 회귀 테스트 + 90일 grandfather |

---

## 3. 의존성 그래프

```
[Stage -1 완료]
       │
       ▼
┌──────────────────────────────────────────────┐
│ Stage 0: 정리·기반                            │
│  W1 추가 탭 9개 정리 ──► W2 게임보드 3버튼   │
│                          + Glicko-2 W/L      │
│                          + 스키마 마이그레이션│
└──────────────────────────────────────────────┘
       │ (dogfooding 통과 필수)
       ▼
┌──────────────────────────────────────────────┐
│ Stage A: 글로벌 네비 + 마이페이지              │
│  W3 GNB 4탭 ──► W4 마이페이지 + 핸들 라우팅   │
└──────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ Stage B: BP 테스트 (바이럴 엔진)               │
│  W5 17문항 ──► W6 결과·공유 카드              │
│  (의존: Stage 0 users 스키마, Stage A 마이페이지)│
└──────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ Stage C: 정산소 + 매너온도 + 초대 랜딩          │
│  W7 정산소 ──► W8 매너온도 + 초대 랜딩         │
│  (의존: Stage 0 winning_team, invited_by)     │
└──────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ Stage D: Basic/Pro + Toss 빌링                 │
│  W9 가드 + SDK ──► W10 차등 기능              │
│  (의존: Stage C 정산소 + 알림톡 진입점)        │
└──────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ Stage E (선택): 안정화 + 베타                  │
│  Import/체험하기 운명 결정                     │
└──────────────────────────────────────────────┘
```

---

## 4. 위험 매트릭스 (Top 7)

| # | 위험 | 발생 Stage | 영향 | 완화책 |
|---|------|------------|------|--------|
| R1 | PRD §4 스키마 일괄 마이그레이션 중 기존 데이터 손실 | Stage 0 W2 | 치명 | 마이그레이션 전 전체 dump + 단계적 ALTER + 롤백 스크립트 필수 |
| R2 | Glicko-2 W/L 재설계로 기존 레이팅 분포가 무너짐 | Stage 0 W2 | 큼 | 기존 rho/sigma 보존 + 한 번 W/L 만 갖고 simulate replay 검증 |
| R3 | 9개 탭 흡수 시 권한 체크 누락 → RLS 우회 | Stage 0 W1 | 큼 | 흡수 후 architect 검토 + `security-reviewer` agent 1회 통과 의무 |
| R4 | 17문항 가중치 알고리즘이 PRD §3.1 카피와 BP 범위 불일치 | Stage B | 중 | PRD 7.0점 만점 매핑을 단위 테스트로 잠금, 모든 등급 boundary case 커버 |
| R5 | 카톡 공유 카드 이미지 생성(서버사이드 OG) 성능 | Stage B W6 | 중 | Vercel Edge OG 사용, 첫 렌더 ≤ 1.5s 목표, fail 시 정적 폴백 |
| R6 | Toss 빌링 가맹 재신청 승인 지연 | Stage D | 중 | 가맹 신청은 Stage C 끝에 미리 제출 (1~2주 리드타임 확보) |
| R7 | 핸들 충돌 / SEO redirect 누락 | Stage A W4 | 작 | 기존 UUID 라우트는 301 redirect 유지, 충돌 시 운영자 alert |

---

## 5. Stage 0 상세 — 정리·덜어내기·기반 완성

### 5.1 목적
PRD §2.2 4탭 구조로 정렬하고, 점수 시스템·스키마를 일괄 대수술하여 이후 모든 Stage 의 기반을 만든다.

### 5.2 Week 1 — 추가 탭 9개 정리

#### 작업 단위

- [ ] **T0-1-1**: `/club/{clubId}/finance`, `/notices`, `/join-requests` 를 `/manage` 탭 하위 섹션으로 흡수
  - Agent: executor-high (Opus)
  - 예상 시간: 1.5일
  - 입력: `src/app/club/[clubId]/{finance,notices,join-requests}/page.tsx` 3개
  - 출력: `/club/[clubId]/manage/page.tsx` 안에 3개 섹션 (탭 또는 accordion)
  - 위험: 기존 finance·notices RLS 정책이 manage 권한 범위와 다를 수 있음
  - 검증: `npm run typecheck` + `/manage` 진입 후 3섹션 모두 운영자만 보임 + 일반회원 403

- [ ] **T0-1-2**: `/stats`, `/report`, `/ranking` 을 새 `/stats` 통합 탭으로 흡수
  - Agent: executor-high (Opus)
  - 예상 시간: 1.5일
  - 입력: 3개 page.tsx, 관련 components (`RankingTable.tsx` 등)
  - 출력: `/club/[clubId]/stats/page.tsx` 단일 페이지에 3섹션 (탭형)
  - 위험: ranking actions 의 Glicko-2 호출 경로 변경
  - 검증: 기존 ranking/report 데이터가 stats 페이지에서 동일하게 표시

- [ ] **T0-1-3**: `/import` 라우트 비활성화
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 입력: `src/app/club/[clubId]/import/`, `src/lib/club/import/`
  - 출력: 라우트는 `/manage` 안에서 "준비 중" 카드만 노출, import 기능 자체는 코드 보존 (주석 추가)
  - 위험: 기존 사용자가 즐겨찾기로 진입 시 404 보다는 안내 페이지
  - 검증: `/club/[clubId]/import` 진입 시 200 + 준비 중 메시지

- [ ] **T0-1-4**: `/shuttle`, `/me` 보류 처리
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 입력: 두 라우트 page.tsx
  - 출력: 라우트는 임시로 유지하되 클럽 탭 네비에서 노출 제거, `/shuttle` 은 Stage C 에 `/session/{id}/summary` 로, `/me` 는 Stage A 에 `/mypage` 로 흡수 예정 주석 추가
  - 위험: 기존 링크 손상 → 보류 페이지에서 안내 + 향후 redirect 준비
  - 검증: 클럽 탭 UI 에 두 탭이 더 이상 노출되지 않음

- [ ] **T0-1-5**: 클럽 탭 네비 정렬 (`src/app/club/[clubId]/layout.tsx`)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 입력: 현재 layout.tsx 탭 메뉴
  - 출력: 회원 뷰 3탭(`[일정]`, `[멤버]`, `[스탯]`), 운영자 뷰는 + `[관리]` 1탭 추가
  - 검증: 회원/운영자 두 권한으로 진입 시 탭 개수·라벨 일치

### 5.3 Week 2 — 게임보드 + Glicko-2 + 스키마

- [ ] **T0-2-1**: 게임보드 점수 입력 UI 제거 → 3버튼
  - Agent: executor-high (Opus)
  - 예상 시간: 2일
  - 입력: `src/components/club/gameboard/PlayingPhase.tsx`, `src/components/club/gameboard/playing/*`, `src/components/club/GameBoardClient.tsx`
  - 출력: 코트 카드의 `- 0 +` 점수 위젯 제거, 종료 액션을 `[A팀 승]/[B팀 승]/[무승부]` 3버튼으로 교체, 매치 결과 저장 시 `winning_team` 만 기록
  - 위험: PlayingPhase 의 timer/state machine 과 점수 위젯 결합도가 높을 수 있음
  - 검증: 한 매치를 종료하면 `matches.winning_team` 이 'A'|'B'|null 로 저장, 점수 컬럼은 NULL/제거

- [ ] **T0-2-2**: Glicko-2 W/L 기반 재설계
  - Agent: executor-high (Opus) + 사전 architect 분석 1회
  - 예상 시간: 2일
  - 입력: `src/lib/club/glicko2.ts`, `src/lib/club/__tests__/glicko2.test.ts`, `src/app/club/[clubId]/ranking/actions.ts`, 마이그레이션 `20260510000002_glicko2_ratings.sql`
  - 출력: 점수차(margin) 의존성 제거, win=1.0 / loss=0.0 / draw=0.5 만 사용, mu/phi/sigma 갱신식 유지
  - 위험: 기존 레이팅 분포가 평탄해질 수 있음 → 사전 simulate replay 로 분포 비교
  - 검증: 단위 테스트 전부 통과 + 기존 시즌 matches 를 새 알고리즘으로 replay 했을 때 상위/하위 랭킹 순서가 80% 이상 유지

- [ ] **T0-2-3**: PRD §4 스키마 일괄 마이그레이션
  - Agent: executor-high (Opus) + architect 사전 리뷰 필수
  - 예상 시간: 2일
  - 입력: PRD §4 + 알려진 부채 (drift 컬럼)
  - 출력: `supabase/migrations/20260518000000_prd_schema_alignment.sql`
    - `users`: `kakao_id`, `bp_score`, `grade`, `manner_temp` 추가/정규화, `phone`/`is_placeholder`/`quiz_level`/`profile_img` 마이그레이션 정합
    - `clubs`: `custom_url_id UNIQUE`, `plan_type ENUM('free','basic','pro')`
    - `guests`: `invited_by uuid REFERENCES users(id)` 추가
    - `matches`: `winning_team enum('A','B') NULL` 추가, 점수 컬럼 제거 또는 nullable 화 + 다음 마이그레이션에 drop 예약
    - `birdieminton_user_id` 타입 정합 (UUID vs text 결정 — Stage 0 시작 시 architect 와 1차 회의 필요)
  - 위험: 운영 DB 무결성 (R1)
  - 검증: staging 환경에서 마이그레이션 후 모든 RPC 호출 200, 기존 회원/매치 데이터 손실 0

- [ ] **T0-2-4**: 마이그레이션 후 회귀 테스트
  - Agent: qa-tester (Sonnet)
  - 예상 시간: 0.5일
  - 입력: 마이그레이션 적용된 staging DB
  - 출력: 회귀 테스트 리포트 (gameboard 한 사이클, 랭킹, 정산, 가입 신청 등)
  - 검증: 핵심 8개 시나리오 모두 통과

### 5.4 Stage 0 dogfooding 체크포인트

- [ ] 클럽 탭에 `[일정]/[멤버]/[스탯]` (+ 운영자 `[관리]`) 만 보이는가
- [ ] `/club/[clubId]/finance` 등 옛 라우트 직접 진입 시 흡수된 페이지로 redirect 되는가 (또는 적절히 표시)
- [ ] 게임보드 한 사이클 (셋업 → 자동 배정 → 진행 → 3버튼 종료 → 다음 매치)이 매끄러운가
- [ ] Glicko-2 W/L 만으로 매치 5회 후 mu/phi 가 합리적으로 갱신되는가
- [ ] 새 스키마로 기존 클럽 1개의 모든 페이지가 정상 조회되는가
- [ ] `tsc` 0 error, `npm run lint` 0 error, e2e 핵심 시나리오 pass

---

## 6. Stage A 상세 — 글로벌 네비 + 마이페이지 + 핸들

### 6.1 목적
PRD §2.1 GNB 4탭을 풀도입하고, 사용자 정체성 페이지(마이페이지)와 클럽 핸들 라우팅을 완성한다.

### 6.2 Week 3 — 글로벌 네비 4탭 신설

- [ ] **TA-1-1**: `/dashboard` 신설 — 다가오는 내 일정 투표 카드 + 미납 회비 배너 (+ 운영자라면 요약 데이터)
  - Agent: executor-high (Opus) + designer-high (Opus) 사전 와이어
  - 예상 시간: 2일
  - 입력: PRD §2.1, 기존 `src/app/my/`
  - 출력: `src/app/dashboard/page.tsx` + 카드 컴포넌트들
  - 검증: 비로그인 → 로그인 redirect / 로그인 → 카드 데이터 정상 로드

- [ ] **TA-1-2**: `/my-clubs` 신설 — 내가 소속된 모임 아카이브
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 입력: 기존 `src/app/clubs/` 의 my 분리 로직
  - 출력: `src/app/my-clubs/page.tsx`
  - 검증: 클럽 카드 3개 이상 정상 노출, 클릭 시 핸들 라우트로 진입

- [ ] **TA-1-3**: `/explore` 신설 — "매칭 기능 준비 중" 배너 + 공개 클럽 디스커버리
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 입력: 기존 `/clubs` 공개 디스커버리 부분
  - 출력: `src/app/explore/page.tsx` + 상단 매칭 안내 카드
  - 검증: 공개 클럽 RPC 정상 호출

- [ ] **TA-1-4**: `/mypage` 신설 (껍데기)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: `src/app/mypage/page.tsx` 스켈레톤 (Week 4 에서 컨텐츠 채움)

- [ ] **TA-1-5**: 전역 GNB 컴포넌트 통합
  - Agent: designer (Sonnet)
  - 예상 시간: 1일
  - 입력: 기존 layout/nav
  - 출력: 모바일/데스크톱 GNB 4탭 통합, 현재 페이지 highlight
  - 검증: 4탭 왕복 클릭 정상

### 6.3 Week 4 — 마이페이지 컨텐츠 + 핸들 라우팅

- [ ] **TA-2-1**: 마이페이지 컨텐츠 (카톡 프사 + BP/등급 뱃지 + 매너 온도)
  - Agent: designer-high (Opus)
  - 예상 시간: 2일
  - 입력: Stage 0 정렬된 `users` 스키마, 기존 `GradeBadge.tsx`
  - 출력: 프사 카드, BP/등급 뱃지, 매너 온도 게이지
  - 검증: BP=0 / grade=null / manner=36.5 디폴트 정상 표시

- [ ] **TA-2-2**: `/club/{handle}` 핸들 라우팅
  - Agent: executor-high (Opus)
  - 예상 시간: 2일
  - 입력: Stage 0 마이그레이션의 `clubs.custom_url_id UNIQUE`
  - 출력: `src/app/club/[handleOrId]/page.tsx` 가 handle/UUID 모두 수용, 기존 UUID 진입은 301 redirect
  - 위험: 핸들 충돌 (R7)
  - 검증: handle 진입 → 정상 / 같은 handle 두 번 입력 시 unique 에러

- [ ] **TA-2-3**: 기존 클럽 자동 슬러그 마이그레이션
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 입력: 기존 클럽 N 개
  - 출력: 마이그레이션 스크립트 — 한글 이름 → 슬러그 생성, 충돌 시 -2, -3 접미
  - 검증: 모든 클럽에 custom_url_id 가 존재

- [ ] **TA-2-4**: 운영자 핸들 수정 UI (`/club/{handle}/manage`)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: 핸들 입력 폼 + 실시간 중복 체크

- [ ] **TA-2-5**: 푸시 알림 미들웨어 통합
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 입력: 기존 `supabase/migrations/20260510000006_push_subscriptions.sql`
  - 출력: GNB 어디서든 푸시 권한 요청 가능
  - 검증: 알림 권한 허용 → 토큰 저장

### 6.4 Stage A dogfooding 체크포인트
- [ ] GNB 4탭 모두 진입·왕복 가능
- [ ] 마이페이지에 BP/등급/매너 영역 표시
- [ ] 클럽 핸들로 진입 가능 / 충돌 검증
- [ ] 푸시 권한 요청 동작

---

## 7. Stage B 상세 — BP 테스트 (바이럴 엔진)

### 7.1 목적
PRD §3.1 의 17문항 빠른 스캔 + 결과 공유 카드를 MVP 수준으로 출시한다. (28문항·GIF 는 점진적)

### 7.2 Week 5 — 17문항 페이징 UI + 알고리즘

- [ ] **TB-1-1**: 17문항 데이터 정의 + 가중치 매핑
  - Agent: researcher (Sonnet) + executor (Sonnet)
  - 예상 시간: 1.5일
  - 출력: `src/lib/bp-test/questions.ts` (17문항 + 카테고리·가중치 메타)
  - 카테고리: 기술 45%, 경험/이력 25%, 전술 15%, 체력 10%, 멘탈 5%
  - 검증: 17문항 합산 후 0~7.0 점 범위 보장하는 단위 테스트

- [ ] **TB-1-2**: `/test` 페이징 UI (MBTI 방식)
  - Agent: designer-high (Opus)
  - 예상 시간: 2일
  - 출력: `src/app/test/page.tsx` + 스카우터 진행률 바 + 좌우 스와이프
  - 위험: 모바일 스와이프 제스처 충돌
  - 검증: 17문항 한 사이클 매끄러움, 뒤로가기 시 진행률 유지

- [ ] **TB-1-3**: 알고리즘 구현 + 단위 테스트
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: `src/lib/bp-test/score.ts` (총점 → grade + BP)
  - 검증: 모든 등급 boundary (0.8, 1.7, 2.7, 3.7, 4.7, 5.7) 정확히 매핑

- [ ] **TB-1-4**: BP/grade users 테이블 저장 액션
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: server action + Supabase update RLS 통과
  - 검증: 비로그인 시도 → 결과만 보이고 저장 안 됨, 로그인 시 즉시 저장

### 7.3 Week 6 — 결과 페이지 + 공유 카드

- [ ] **TB-2-1**: 결과 페이지 (S~F 등급 + 칭호 + BP)
  - Agent: designer-high (Opus)
  - 예상 시간: 1.5일
  - 출력: `src/app/test/result/page.tsx` — PRD §3.1 칭호 카피 100% 동일
  - 검증: PRD 카피 검사 단위 테스트

- [ ] **TB-2-2**: 레이더 차트 (5개 카테고리)
  - Agent: designer (Sonnet)
  - 예상 시간: 1일
  - 출력: Chart.js 또는 SVG 기반 레이더 컴포넌트
  - 검증: 5축 라벨 + 정상 폴리곤 렌더

- [ ] **TB-2-3**: 약점 1개 피드백 텍스트
  - Agent: writer (Haiku)
  - 예상 시간: 0.5일
  - 출력: 가장 낮은 카테고리 1개를 자동 식별 → 카피 매핑

- [ ] **TB-2-4**: 공유 카드 이미지 생성 (OG)
  - Agent: executor-high (Opus)
  - 예상 시간: 2일
  - 출력: `src/app/api/og/bp/route.ts` (Vercel OG) — 캐릭터 + BP + 칭호 + 레이더 미니
  - 위험: R5 (성능)
  - 검증: 첫 호출 ≤ 1.5s, 카카오톡 공유 미리보기 정상

- [ ] **TB-2-5**: 마이페이지 연동
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: 마이페이지에 BP 결과 반영 (Stage A TA-2-1 자리)

### 7.4 Stage B dogfooding 체크포인트
- [ ] 17문항 한 사이클 매끄러움
- [ ] 등급/BP/칭호 카피 PRD §3.1 100% 일치
- [ ] 공유 카드 이미지 생성, SNS 공유 미리보기 정상
- [ ] 마이페이지에 BP/등급 반영

---

## 8. Stage C 상세 — 정산소 + 매너온도 + 초대 랜딩

### 8.1 목적
PRD §3.4, §3.5 의 정산 사이클을 완성한다. 게임보드 → 정산 → 매너평가 풀 사이클 dogfooding 가능 상태.

### 8.2 Week 7 — 정산소 MVP (`/session/{id}/summary`)

- [ ] **TC-1-1**: 정산 페이지 라우트 + 모듈형 입력 폼
  - Agent: designer-high (Opus) + executor-high (Opus)
  - 예상 시간: 2일
  - 출력: `src/app/session/[sessionId]/summary/page.tsx` — 장소료/콕값 토글
  - 검증: 토글 OFF 한 항목은 합산 제외

- [ ] **TC-1-2**: N빵 계산기 (고정 회비제 / 실비 분담제)
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: 회원 X원 / 게스트 Y원 입력 → 자동 차액, 또는 총지출 / 인원 + 게스트 가중치
  - 검증: 회원 10 + 게스트 2 + 게스트 가중치 +2000 케이스 정확 계산

- [ ] **TC-1-3**: 게스트 결제 합산 (invited_by)
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 입력: Stage 0 마이그레이션의 `guests.invited_by`
  - 출력: 게스트 명단 옆 [결제자 선택] 드롭다운, 선택 시 해당 user 총합에 합산
  - 검증: 게스트 1명 → 초대한 회원의 결제액에 게스트 회비 합산

- [ ] **TC-1-4**: 카톡 정산 알림 — 고유 링크 생성 (실발송은 Stage D)
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: 정산 결과를 토큰 기반 공개 URL 로 생성 (`/session/{id}/summary/share/[token]`)
  - 검증: 토큰 URL 접근 시 정산 영수증 정상 렌더

- [ ] **TC-1-5**: 기존 `/shuttle` 코드 흡수
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: shuttle 의 콕 비용 입력 로직을 정산 페이지로 이전, `/shuttle` 라우트는 redirect

### 8.3 Week 8 — 매너온도 + 초대 랜딩

- [ ] **TC-2-1**: 매너온도 평가 팝업 (`/session/{id}/review`)
  - Agent: designer (Sonnet)
  - 예상 시간: 1.5일
  - 출력: 정산 완료 후 자동 등장 팝업 — 같이 뛴 파트너 프사 + 👍/😐/👎
  - 검증: 평가 1회 후 manner_temp 변화 (👍 +0.1, 😐 0, 👎 -0.2 등 — Stage C 시작 시 architect 와 수치 확정)

- [ ] **TC-2-2**: 비매너 리포트 → Admin
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: 👎 3회 누적 시 `/admin` 리포트 큐에 자동 등록

- [ ] **TC-2-3**: 초대 랜딩 페이지 (`/club/{handle}/invite`)
  - Agent: designer-high (Opus)
  - 예상 시간: 1.5일
  - 출력: 커버 이미지 기반 랜딩 + "[홍길동]님이 초대했습니다" + [카카오 1초 로그인]
  - 위험: 초대 토큰 위변조 → 단방향 hash 적용
  - 검증: 토큰 만료 24h, 만료된 토큰 진입 시 안내 페이지

- [ ] **TC-2-4**: 초대 → 가입 자동화
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: 카카오 로그인 콜백 → 자동으로 해당 클럽 가입 신청 (Free 인원 한도 통과 시 즉시 승인 큐, 아니면 차단)
  - 검증: 비로그인 → 초대 링크 → 카카오 → 가입 신청 자동 완료

### 8.4 Stage C dogfooding 체크포인트
- [ ] 모임 → 정모 → 게임보드 → 정산 → 매너평가 풀 사이클 완주
- [ ] 게스트 추가 + 초대자 지정 + 정산 합산 정확
- [ ] 초대 링크 → 가입 자동화 동작
- [ ] 알림톡 발송 미연결이지만 토큰 URL 까지는 정상

---

## 9. Stage D 상세 — Basic/Pro 플랜 + Toss 빌링

### 9.1 목적
PRD §5 의 누적 인원 종량제 SaaS 화. Toss 빌링 정기결제로 정상 매출 발생.

### 9.2 Week 9 — 인원 가드 + Toss SDK

- [ ] **TD-1-1**: 가입 신청 시 누적 인원 차단 로직
  - Agent: executor-high (Opus)
  - 예상 시간: 1.5일
  - 입력: `clubs.plan_type`, `club_members` 카운트
  - 출력: 가입 신청 RPC 에서 plan 한도 검사 → 초과 시 업그레이드 유도 응답
  - 검증: Free 50명 클럽에 51번째 신청 → 차단 + 업그레이드 팝업

- [ ] **TD-1-2**: Toss 빌링 SDK 백엔드 (테스트 모드)
  - Agent: researcher (Sonnet) + executor-high (Opus)
  - 예상 시간: 2일
  - 출력: `/api/billing/*` 라우트 (auth, charge, webhook), `.env` 키 분리
  - 위험: R6 (가맹 승인) — Stage C 끝에 사전 신청 필수
  - 검증: 테스트 모드 카드로 9,900원/29,900원 결제 성공

- [ ] **TD-1-3**: `/pricing` 페이지 + 결제 흐름
  - Agent: designer-high (Opus)
  - 예상 시간: 1.5일
  - 출력: 3티어 비교 표 + Basic/Pro CTA → Toss 결제 위젯
  - 검증: 결제 완료 후 클럽 plan_type 자동 업데이트

### 9.3 Week 10 — 차등 기능

- [ ] **TD-2-1**: 공동관리자 (Co-admin) 권한
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: `/manage/co-admins` UI — Basic 최대 3, Pro 무제한
  - 검증: Free 플랜에서 추가 버튼 비활성, Basic 4번째 추가 시 차단

- [ ] **TD-2-2**: 미납 알림톡 (Basic 부터)
  - Agent: researcher (Sonnet) + executor-high (Opus)
  - 예상 시간: 1.5일
  - 출력: 카카오 알림톡 템플릿 등록 + 정산 완료 24h 후 운영자 버튼 클릭 시 발송 RPC
  - 위험: 알림톡 템플릿 사전 승인 1~3일 소요
  - 검증: Basic 클럽 운영자 → 미납자 1명 → 알림톡 발송 성공

- [ ] **TD-2-3**: Excel 추출 (Pro 부터)
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: 정산/출석/재무 데이터 xlsx 다운로드 endpoint
  - 검증: Pro 클럽에서 다운로드 → 시트 3개 (정산, 출석, 재무) 정상

- [ ] **TD-2-4**: PDF 보고서 (Pro 부터)
  - Agent: executor (Sonnet)
  - 예상 시간: 1일
  - 출력: 연말/총회용 PDF — 시즌 통계 + 매너 온도 + 재무 요약
  - 검증: 1년치 데이터로 PDF 생성 시간 ≤ 5s

- [ ] **TD-2-5**: 데이터 보존 정책 (downgrade)
  - Agent: executor (Sonnet)
  - 예상 시간: 0.5일
  - 출력: 결제 만료 → plan_type=free 변경, 기존 데이터 유지, 신규 정기 일정 개설은 50명 초과 시 차단

### 9.4 Stage D dogfooding 체크포인트
- [ ] Free 50명 초과 클럽 가입 신청 시 차단 + 업그레이드 유도
- [ ] 테스트 결제로 Basic/Pro 업그레이드 성공
- [ ] 알림톡 / Excel / PDF 핵심 기능 1회씩 검증
- [ ] Downgrade 시 데이터 유지 + 신규 일정 차단 검증

---

## 10. Stage E 상세 (선택) — 안정화 + 베타 + 잔재 정리

### 10.1 목적
대수술 직후 회귀를 정리하고, 보류했던 `import` / 체험하기 운명을 결정한 뒤 베타를 연다.

### 10.2 작업 단위

- [ ] **TE-1**: 종합 dogfooding 라운드 (운영자 시나리오 5개 + 회원 시나리오 5개)
  - Agent: qa-tester-high (Opus)
  - 예상 시간: 2일

- [ ] **TE-2**: 버그 핫스팟 정리 (사용자 결정으로 우선순위 매김)
  - Agent: executor / executor-high
  - 예상 시간: 가변

- [ ] **TE-3**: 성능 회귀 점검 (Vercel Speed Insights + Sentry)
  - Agent: scientist (Sonnet) + executor
  - 예상 시간: 1일
  - 검증: LCP ≤ 2.5s on /dashboard, /club/{handle}, /test, /summary

- [ ] **TE-4**: Import 운명 결정
  - Stage 시작 시 사용자 결정: (a) 폐기 (b) PRD 정합 재구현 (c) 보류 연장
  - 산출물: 결정 문서 + 후속 plan 또는 코드 제거 PR

- [ ] **TE-5**: 체험하기 페이지 재도입 결정
  - Stage 시작 시 사용자 결정: 재도입 여부 + 분리 구현 범위

- [ ] **TE-6**: 베타 사용자 모집 + 90일 grandfather 전환
  - Agent: writer (Haiku) + executor
  - 출력: 가입 안내 메일, grandfather 표시 (users.beta_until 컬럼)

### 10.3 Stage E dogfooding 체크포인트
- [ ] 10개 통합 시나리오 모두 pass
- [ ] LCP 목표치 달성
- [ ] Import/체험하기 결정 문서화
- [ ] 베타 사용자 10명 이상 grandfather 적용

---

## 11. 커밋 전략 (모든 Stage 공통)

- Stage 별 브랜치: `stage-0/cleanup`, `stage-a/global-nav`, ...
- 작업 단위(T*) 별 atomic commit
- 마이그레이션 적용 commit 은 단독 PR (롤백 가능성 확보)
- 각 PR description 에 dogfooding 체크리스트 복사·체크
- master merge 는 dogfooding 통과 + architect 검증 후

---

## 12. 성공 기준 (Definition of Done — 전체 플랜)

- [ ] PRD §1~7 의 모든 명세가 코드와 1:1 매핑됨 (격하/제거된 항목은 결정 문서에 명시)
- [ ] PRD 미명세 부가 기능 0개 (또는 명시적 격하 후 보존)
- [ ] Free/Basic/Pro 누적 인원 차단 정상 동작 + Toss 결제 흐름 라이브
- [ ] 게임보드 → 정산 → 매너평가 풀 사이클 dogfooding 통과
- [ ] BP 테스트 결과 카드 SNS 공유 1회 이상 검증
- [ ] tsc 0 error, lint 0 error, e2e 핵심 시나리오 pass, Sentry 신규 critical 0건
- [ ] 베타 사용자 10명 이상 grandfather 처리

---

## 13. 다음 행동 (사용자가 결정할 것)

이 plan 은 인터뷰 결과를 정밀 정렬한 산출물이다. 다음 중 선택:

1. **review** — Critic agent 에게 plan 비평 요청 (`/oh-my-claudecode:review`)
2. **Stage 0 시작** — `/oh-my-claudecode:start-work birdieminton-prd-alignment-roadmap-2026-05-11` 로 실행 진입
3. **조정** — 특정 Stage/Task 만 수정 요청 (예: "T0-2-3 의 birdieminton_user_id 타입을 UUID 로 확정해줘")

---

## 14. 부록 — 핵심 코드 위치 참조

| 영역 | 경로 |
|------|------|
| 게임보드 | `src/components/club/gameboard/`, `src/components/club/GameBoardClient.tsx` |
| 게임보드 라우트 | `src/app/club/[clubId]/gameboard/`, `src/app/club/[clubId]/gameboard/[sessionId]/` |
| 클럽 탭 (정리 대상) | `src/app/club/[clubId]/{finance,notices,join-requests,stats,report,ranking,shuttle,me,import}/` |
| Glicko-2 | `src/lib/club/glicko2.ts`, `src/lib/club/__tests__/glicko2.test.ts` |
| 랭킹 액션 | `src/app/club/[clubId]/ranking/actions.ts` |
| 마이그레이션 | `supabase/migrations/` (최신: `20260511000000_fix_rls_regressions.sql`) |
| 마스터 어드민 | `src/app/admin/`, `src/lib/auth/master.ts` |
| 알림 | `src/lib/notifications/`, `supabase/migrations/20260510000006_push_subscriptions.sql` |
| 등급 라이브러리 | `src/lib/club/grade.ts`, `src/components/club/GradeBadge.tsx` |
