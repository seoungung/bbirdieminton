# 14개 라우트 운명 결정 매트릭스 (T0-1-0)

> **작성일**: 2026-05-13
> **작성자**: Oracle (architect, Opus)
> **선행 문서**: `.omc/plans/birdieminton-prd-alignment-roadmap-2026-05-11-v2.md` §0.2.3, §7.3
> **PRD §2.2 기준**: 클럽 내부 탭은 `[일정]`, `[멤버]`, `[스탯]` (회원 뷰) + `[관리]` (운영자 뷰)
> **레포 루트**: `C:\Users\skyyo\Projects\Birdminton\birdminton`

---

## 1. 메타·전제

- 본 매트릭스는 plan v2 Stage 0 W1 의 첫 task. 후속 task(T0-1-1~T0-1-7) 의 입력.
- v1 → v2 변경점: v1 은 "흡수" 단어로 9개 라우트를 묶었지만, **실제 조사 결과 `/manage` 와 `/settlements` 는 이미 redirect-only stub** 으로 존재. 따라서 "manage 흡수" 의 정확한 의미는 "settings 를 manage 의 정체성으로 격상" 임.
- **무한 redirect 잠재 버그 발견**: `FinanceClient.tsx:74` 와 `ClubDashboardClient.tsx:230` 이 `/settlements` 로 링크 → `/settlements/page.tsx:9` 가 `/finance` 로 redirect → **dead loop UX**. 이건 T0-1-1 에서 반드시 동시에 픽스해야 함 (executor 입력에 포함).

---

## 2. 14개 라우트 정밀 분석 표

| # | 라우트 | 현재 콘텐츠 (1줄) | 핵심 import / 컴포넌트 | 권한 체크 | 외부 진입점 | 최종 결정 | 후속 task |
|---|--------|-------------------|----------------------|-----------|-----------|----------|-----------|
| 1 | `events/` (`page.tsx:42`) | 정기모임 일정 리스트 + 참석 현황 | `EventsListClient`, `getMyMembership`, `todayKST` | 멤버십 필수, role 무관 | 사이드바 + Dashboard×2 + SetupPhase | **유지** (PRD §2.2 [일정] 탭) | — |
| 2 | `gameboard/` (`page.tsx:19`) | 게임 세션 목록 100개 | `GameboardListClient` | 인증만 (멤버십 미체크—후속 확인 필요) | 사이드바 + Dashboard×2 + ClosedSession | **유지** (핵심 화면) | — |
| 3 | `members/` (`page.tsx:18`) | 멤버 목록 + Glicko 레이팅 + 통계 | `MembersClient`, `getClubMemberRatings` | 멤버십 필수, role 무관 | 사이드바 + Dashboard + Ranking + MembersClient | **유지** (PRD §2.2 [멤버] 탭) | — |
| 4 | `finance/` (`page.tsx:18`) | 이달 회비 납부 현황 + N빵 | `FinanceClient`, `dues` 테이블 | 멤버십 필수 (수정은 manager) | 사이드바 + (`/settlements`→`/finance` stub) | **유지** (PRD §2.2 [관리] 하위 섹션 후보) | T0-1-1 |
| 5 | `notices/` (`page.tsx:24`) | 공지사항 목록 + 읽지 않음 카운트 | `NoticesClient`, `getNoticesAction` | 멤버십 필수, 작성은 owner | 사이드바 + 알림벨 + Layout (unread count) | **유지** (PRD §2.2 [관리] 하위 섹션 후보) | T0-1-1 |
| 6 | `join-requests/` (`page.tsx:22`) | 가입 대기자 승인/거절 | `JoinRequestsClient` | **owner/manager 만** (line 34-36) | 외부 진입점 0, 직접 URL 만 | **유지** (PRD §2.2 [관리] 하위 섹션 후보) | T0-1-1 |
| 7 | `stats/` (`page.tsx:40`) | 등급 분포·Top mover·신입 케어 | `getClubMembers`+`getClubMemberRatings`+`muToGrade` | **owner/manager 만** (line 56-58) | 사이드바 (ownerOnly, proOnly) | **유지 + 통합 허브** (PRD §2.2 [스탯] 탭) | T0-1-2 |
| 8 | `report/` (`page.tsx:45`) | 시즌 리포트 (인쇄용 30/90/365) | `ReportView`, `ReportShareBar` | **owner/manager 만** (line 61-63) | 사이드바 (ownerOnly, proOnly) + 자기 자신 (RangeSelector) | **흡수** (`/stats` 하위 섹션화) | T0-1-2 |
| 9 | `ranking/` (`page.tsx:19`) | 클럽 멤버 승률 랭킹 + 레이팅 | `RankingTable`, `RankingGuideBanner` | 인증만 (멤버십 미체크—후속 확인 필요) | 사이드바 + Dashboard + RankingTable→members | **흡수** (`/stats` 하위 섹션화, 단 회원도 봐야 함—권한 분리 주의) | T0-1-2 |
| 10 | `shuttle/` (`page.tsx:34`) | 셔틀콕 풀·미납자·진행세션 트래커 | `ShuttleManageClient`+`ShuttleSubmissionTracker` | **owner/manager 만** (line 50-52) | 사이드바 (ownerOnly) | **W1 보류, Stage C 정산소 통합** | T0-1-4 / Stage C TC-1-5 |
| 11 | `me/` (`page.tsx:22`) | 내 mu/phi/등급/최근 변동 | `getMemberRatingDetail`, `muToGrade` | 멤버십 필수, role 무관 | 사이드바 + `members/[memberId]/page.tsx:43` redirect | **Stage 0 W2 까지 살려둠**, Stage A W5 에 `/mypage` 흡수 | T0-1-6 |
| 12 | `import/` (`page.tsx:10`) | 엑셀 임포트 + 최근 이력 | `ImportClient`, `import_logs` 테이블 | **owner/manager 만** (line 32-34) | SettingsClient×1 + Dashboard×1 + SetupPhase×1 | **"준비 중" 안내, 네비 노출 제거** (코드 보존) | T0-1-3 |
| 13 | `settings/` (`page.tsx:18`) | 클럽 정보 + 권한 + 정책 + 멤버역할 | `SettingsClient`, `SettingsProfileExtras` | 멤버십 필수 (수정은 owner/manager 분기) | 사이드바 + Dashboard + SetupPhase | **유지 + PRD §2.2 [관리] 의 정체성으로 격상** (manage 흡수 주체) | T0-1-1 (settings 가 manage 역할 흡수) |
| 14 | `settlements/` (`page.tsx:7`) | redirect-only stub → `/finance` | (없음, 1-liner) | (없음) | FinanceClient×1 + ClubDashboardClient×1 (둘 다 stub 대상→dead loop) | **즉시 폐기 + 호출처 2곳 정리** + Stage C 정산소(`/session/{id}/summary`) 가 새로운 정체성 | T0-1-4 + Stage C TC-1-1 |

**부가 라우트** (14개에 포함되지 않음, 참고):
- `manage/page.tsx:9` — redirect-only stub → `/settings` (외부 진입점 0). T0-1-1 에서 `/settings`가 [관리] 정체성으로 격상되면 이 stub 도 제거 후보. 단 sidebar 가 `/manage` 를 가리키는 곳은 없음 (모두 `/settings`) — 즉시 삭제 안전.

---

## 3. 미정 2건 결정

### 3.1 `settlements/` — 결정: **(b) 즉시 폐기 + Stage C 에서 `/session/{id}/summary` 신설**

**현재 상태 정밀 분석**:
- `src/app/club/[clubId]/settlements/page.tsx` 는 **단순 redirect stub** (`redirect(`/club/${clubId}/finance`)` 11줄짜리 파일).
- 진짜 데이터·UI·actions 가 전혀 없음. v1 의 어떤 시점에 finance 가 settlements 를 흡수했지만 호출처 2곳을 정리하지 않은 잔재.
- **무한 dead loop 발견**: `FinanceClient.tsx:74` 가 "셔틀콕비 정산" 배너로 `/settlements` → `/finance` → 같은 페이지 반복. 사용자가 누르면 뭔가 변하는 듯 보이지만 동일 페이지로 돌아옴. UX 깨짐.
- PRD §3.4 정산소는 `/session/{id}/summary` 명세 — **클럽 단위가 아니라 세션 단위**. 데이터 모델·진입점·UX 가 현재 `/club/[clubId]/settlements` 와 본질적으로 다름.

**옵션 비교**:
| 옵션 | 비용 | 이득 | 리스크 |
|------|------|------|--------|
| (a) Stage C summary 와 통합 | 통합 비용 0 (실제 코드 없음). 단 라우트 명 충돌·legacy URL SEO 모호 | URL 한 곳에서 정산 일관성 | URL 의미 충돌 ( `/club/[id]/settlements` vs `/session/[id]/summary` — 단위 다름) |
| **(b) 즉시 폐기** | 1줄 파일 삭제 + 호출처 2곳 finance/summary 분기. 0.2일 | dead loop UX 버그 해결, PRD §3.4 와 깨끗한 출발 | 외부 북마크/검색 인덱스에서 진입 시 404 (현재도 finance 로 리다이렉트되니 큰 차이 없음) |
| (c) 유지 | (현재 상태). 사용자 혼란 + dead loop 지속 | 0 | 모든 dogfooding 에서 같은 버그 반복 |

**권고**: **(b) 즉시 폐기**.
- 사유: 실제 코드 0줄(=stub), Stage C 가 `/session/{id}/summary` 로 별도 정체성 — 라우트 명 자체를 폐기하는 게 가장 깨끗. 외부 진입점 2곳 모두 stub 으로 의미 없는 링크라 갱신 비용 거의 0. T0-1-4 에 묶어 진행.
- 변경 후 `FinanceClient.tsx:74` "셔틀콕비 정산" 배너는 → `/club/[clubId]/finance` 자체에 컬랩스 또는 Stage C 까지 임시 숨김. `ClubDashboardClient.tsx:230` 의 ShortcutCard 는 W1 동안 `/club/[clubId]/finance` 로 임시 라우팅 → Stage C 에 `/session/[id]/summary` 진입점으로 갱신.

### 3.2 `settings/` — 결정: **(b) 별도 유지 + PRD §2.2 [관리] 의 정체성으로 격상**

**현재 상태 정밀 분석** (`SettingsClient.tsx` 전수):
SettingsClient 가 담당하는 6개 섹션:
1. **초대코드** (line 156~209) — 표시·복사·카톡 초대·재발급(owner)
2. **최대 코트 수** (line 212~239) — manager 만
3. **모임 프로필** (line 242, `SettingsProfileExtras`) — manager 만, 가입 전 페이지 편집
4. **게임 규칙** (line 245~288) — 21/25점 듀스 선택, manager 만
5. **멤버 역할 변경 + 엑셀 임포트 진입점** (line 290~345)
6. **위험 영역** (line 347~369) — 모임 나가기(non-owner) / 모임 삭제(owner)

**PRD §2.2 [관리] 탭 명세**: "SaaS 업그레이드, 대기자 승인, Basic 요금제부터 공동 관리자 지정". 즉 [관리] 는 **운영 행정 (가입 신청 승인, 회비, 공지, 결제, 권한 위임, 임포트 등)** 의 단일 진입점. `settings` 의 현재 6개 섹션은 PRD [관리] 의 일부 (특히 1, 3, 4, 5, 6) 와 정확히 매핑되고, 그 위에 finance/notices/join-requests 가 추가로 합쳐져야 함.

**옵션 비교**:
| 옵션 | 비용 | 이득 | 리스크 |
|------|------|------|--------|
| (a) `/manage` 흡수 | `/manage` 가 이미 `/settings` 로 redirect-only stub — 흡수할 게 없음. 의미 모호 | (없음) | 라우트명 `/manage` 자체가 사라지면 PRD §2.2 와 명명 불일치 |
| **(b) settings 별도 유지 + [관리] 격상** | 0 (이미 존재). T0-1-1 에서 finance/notices/join-requests 가 settings 하위 섹션화 | PRD §2.2 [관리] 의 7~8개 책임이 한 페이지로 응집 | settings 단일 파일 비대 가능 — 탭/accordion 분리 필수 |
| (c) 일부만 흡수 | 어중간 | (없음) | 사용자 멘탈 모델 분산 |

**권고**: **(b) 별도 유지 + 정체성 격상**.
- 사유: `/manage` 는 이미 empty stub 이라 흡수 대상 자체가 없음. 반대로 `/settings` 는 PRD §2.2 [관리] 의 실질 콘텐츠를 이미 6개 섹션으로 보유 — settings 를 [관리] 의 본체로 격상하는 게 자연스러움.
- **선택지 추가**: 라우트 명 자체를 `/club/[clubId]/manage` 로 옮기는 정합 작업은 가능하지만, **(b1) settings 명 유지 + [관리] 라벨**, **(b2) 라우트명도 manage 로 통일** 두 옵션. **권고는 (b1)** — 외부 진입점(SetupPhase, Dashboard ShortcutCard, sidebar 모두 `/settings`)이 이미 안정화. 라우트명 변경의 SEO·북마크 비용 ≫ 이득. AppShell 사이드바 라벨만 "설정" → "관리" 로 변경.
- T0-1-1 에서 settings/page.tsx 가 finance/notices/join-requests 의 3섹션을 추가로 흡수 (탭 또는 accordion 컴포넌트로 분리). 현재 6개 섹션 + 3개 = 9개 섹션 — 비대 우려 있으므로 **상단 탭 4분할 권장**: [클럽정보] / [회원·권한] / [회비·셔틀콕·정산소] / [공지·가입신청].

---

## 4. 흡수 작업 위험 매트릭스

### 4.1 T0-1-1 (finance/notices/join-requests → settings 흡수)

| # | 위험 | 영향 | 발생 트리거 | 완화책 |
|---|------|------|------------|--------|
| R-1a | 권한 비대칭 — `join-requests` 는 owner/manager 만, `notices` 는 멤버 전체, `finance` 는 멤버+manager 분기 | RLS 우회 또는 멤버에게 가입 신청 노출 | 단일 페이지로 합치면서 섹션별 권한 분기 누락 | 각 섹션을 별도 컴포넌트로 분리 + 섹션 진입 시 server-side 권한 분기 + security-reviewer 1회 패스 |
| R-1b | 페이지 비대화 (현재 SettingsClient 385줄 + 3개 컴포넌트) | 클라이언트 번들 폭증, 첫 렌더 LCP | 한 페이지에 모두 client component 마운트 | 상단 탭 4분할 + 각 탭 lazy (`dynamic`) + 서버 데이터는 page.tsx 에서 병렬 fetch |
| R-1c | 알림벨 unread count 결합 | 공지 흡수 시 `getUnreadCountAction` 호출 위치 변경 → layout.tsx 의 unreadCount 가 깨질 수 있음 | `layout.tsx:8, 60-62` 는 notices/actions 에서 import — 이전 시 알림벨이 0 표시 | notices/actions.ts 는 그대로 두고 settings 내부에서 재사용 (작성 시점·읽음 처리만 settings 안으로) |
| R-1d | finance 의 `/settlements` 배너 dead loop | UX 버그 영구화 | T0-1-1 에서 settlements 폐기를 같이 안 하면 | settlements 폐기를 같은 PR 에 묶음 (T0-1-1 + T0-1-4 부분 병합) |

### 4.2 T0-1-2 (report/ranking → stats 흡수)

| # | 위험 | 영향 | 발생 트리거 | 완화책 |
|---|------|------|------------|--------|
| R-2a | 권한 비대칭 — `stats/report` 는 owner/manager 만, `ranking` 은 인증된 회원도 봐야 함 | 흡수 시 ranking 까지 ownerOnly 가 되면 일반 회원이 차단 | 단순히 stats 페이지에 ranking 섹션 추가 | stats 상단 탭으로 [내부 분석(ownerOnly)] / [랭킹(전체)] 분리. 회원은 [랭킹] 탭만 진입 가능 |
| R-2b | proOnly 정책 — 사이드바에서 stats·report 는 `proOnly: true` (`AppShell.tsx:142-143`), ranking 은 일반 | 흡수 후 ranking 도 proOnly 가 되어버리면 Free 플랜 회원이 차단 | 통합 후 페이지 자체에 proOnly 가 걸리면 | proOnly 는 섹션 단위 (Top mover, 신입 케어 등 분석 카드만) — 랭킹 카드는 free 도 노출. layout.tsx 또는 페이지 내부 `usePlan` 분기 |
| R-2c | T0-2-2 (winning_team 재배선) 결합 | ranking actions 가 winning_team 전환 전까지 깨질 수 있음 | T0-1-2 가 T0-2-2 전에 진행되면 | plan v2 §7.4 명시대로 **T0-2-2 후행 필수**. T0-1-2 는 UI 셸만 미리 만들고, ranking 데이터 fetch 는 T0-2-2 완료 후 재배선 |
| R-2d | RangeSelector (`report/page.tsx:199`) 가 `/club/${clubId}/report?days=30` 절대 경로로 자기 자신을 가리킴 | 흡수 후 `/stats?tab=report&days=30` 으로 변경해야 함 | 흡수 시 URL 시그니처 변경 누락 | RangeSelector 의 href 와 searchParams 파싱을 stats/page.tsx 의 통합 시그니처로 마이그 |

---

## 5. 외부 진입점 갱신 리스트 (executor 입력)

### 5.1 T0-1-1 흡수 후 갱신 대상 (settings 가 [관리] 본체로 격상)

| 위치 | 현재 코드 | 갱신 후 |
|------|----------|---------|
| `src/components/club/AppShell.tsx:144` | `{ href: ..../settings, label: '설정', Icon: SettingsIcon, ownerOnly: true }` | label `'관리'` 로 변경 (라우트는 유지) |
| `src/components/club/AppShell.tsx:140` | `{ href: .../finance, label: '회비', ...ownerOnly: true }` | **제거** (settings 에 흡수) |
| `src/components/club/AppShell.tsx:135` | `{ href: .../notices, label: '공지' ... }` | "커뮤니티" 섹션에서 **제거** + settings 내부 [공지·가입신청] 탭으로 이동 |
| `src/components/club/ClubDashboardClient.tsx:244` | ShortcutCard 의 `/settings` href, label "운영·관리" | label "관리" 로 통일, desc "회비·공지·가입신청·정산" 확장 |
| `src/components/club/SidebarNotificationBell.tsx:125` | `href={`/club/${clubId}/notices`}` | `href={`/club/${clubId}/settings?tab=notices`}` (또는 anchor `#notices`) |
| `src/components/club/gameboard/SetupPhase.tsx:500` | `href={.../settings}` | 그대로 (이미 settings 가리킴) |
| `src/app/club/[clubId]/manage/page.tsx:9` | `redirect(.../settings)` | **파일 자체 삭제 검토** (외부 진입점 0건이라 안전) |

### 5.2 T0-1-2 흡수 후 갱신 대상

| 위치 | 현재 코드 | 갱신 후 |
|------|----------|---------|
| `src/components/club/AppShell.tsx:142-143` | stats/report 2개 nav item | 1개로 통합 (stats 만, label "분석") |
| `src/components/club/AppShell.tsx:133` | `{ href: .../ranking, label: '랭킹' }` | "커뮤니티" 섹션 유지 OR stats 통합 탭으로 진입 (둘 다 가능, 사용자 결정 필요 — 권고: **랭킹은 커뮤니티 섹션 유지** + stats 페이지에도 랭킹 탭 미러링) |
| `src/components/club/ClubDashboardClient.tsx:181` | `href={.../ranking}` | 그대로 또는 `/stats?tab=ranking` (사용자 결정에 따라) |
| `src/components/club/RankingTable.tsx:113` | `href={/club/${row.member.club_id}/members/${row.member.id}}` | 그대로 (members 흡수 안 함) |
| `src/app/club/[clubId]/report/page.tsx:199` | `href={/club/${clubId}/report?days=${d}}` | `/club/${clubId}/stats?tab=report&days=${d}` |

### 5.3 T0-1-3 (import 비활성화) 갱신 대상

| 위치 | 처리 |
|------|------|
| `src/app/club/[clubId]/import/page.tsx` | 인증·권한 체크 유지, 본문만 "준비 중 / Stage E 재논의" 카드로 교체, `ImportClient` import 제거 (코드는 보존) |
| `src/components/club/SettingsClient.tsx:298` | `<Link href={import}>` 제거 또는 disabled 상태로 변경 |
| `src/components/club/ClubDashboardClient.tsx:254` | 동일하게 hide 또는 disabled |
| `src/components/club/gameboard/SetupPhase.tsx:506` | 동일 |

### 5.4 T0-1-4 (settlements 폐기 + shuttle/me 보류) 갱신 대상

| 위치 | 처리 |
|------|------|
| `src/app/club/[clubId]/settlements/page.tsx` | **파일 삭제** |
| `src/components/club/FinanceClient.tsx:74` | "셔틀콕비 정산" 배너 — Stage C 까지 임시 hide 또는 `/club/[clubId]/finance#shuttle` 앵커로 변경 |
| `src/components/club/ClubDashboardClient.tsx:230` | "셔틀콕 정산" ShortcutCard — 임시 hide 또는 `/club/[clubId]/finance` 로 라우팅 |
| `src/components/club/AppShell.tsx:141` (shuttle) | 사이드바에서 hide (코드 주석으로 Stage C 흡수 예정 명시) |
| `src/components/club/AppShell.tsx:134` (me) | 사이드바에서 hide, 라우트는 살려둠 (Stage A W5 에 `/mypage` 흡수) |

### 5.5 T0-1-7 (클럽 탭 네비 정렬) 최종 형태

PRD §2.2 매핑:
- **회원 뷰 (3탭)**: `[일정]`(events) · `[멤버]`(members) · `[스탯]`(stats — 랭킹 미러 포함)
- **운영자 뷰 (+1탭)**: + `[관리]`(settings — finance/notices/join-requests/import-disabled 흡수)

사이드바 "커뮤니티" 섹션의 ranking/me/notices 는 PRD §2.2 의 4탭 체계와 충돌. plan v2 §7.3 T0-1-7 검증 기준 "회원 뷰 3탭, 운영자 뷰 + [관리] 1탭" 을 그대로 적용하려면 사이드바 구조 자체를 **하단 탭바 4분할** 또는 **상단 탭바** 로 단순화하는 결정이 추가로 필요. **이건 T0-1-7 의 architect 1회 사전 컨설팅 안건**.

---

## 6. 후속 task 핸드오프 핵심 위험 Top 3

1. **dead loop 우선 픽스** — `/settlements` stub + `FinanceClient.tsx:74` + `ClubDashboardClient.tsx:230` 의 dead loop 는 T0-1-4 보다 먼저 단독 PR 로 빼는 게 안전 (사용자 dogfooding 중에도 영향).
2. **권한 비대칭** — settings 흡수 시 join-requests(owner/manager 만) + notices(전체) + finance(전체+manager 수정) 의 권한 매트릭스가 한 페이지에 공존. server-side 분기 + security-reviewer 1회 패스 의무.
3. **stats/ranking 권한 분리** — ranking 은 일반 회원도 봐야 함. 단순히 ownerOnly stats 페이지에 ranking 을 통합하면 회원 차단. 상단 탭으로 [분석(ownerOnly)] / [랭킹(전체)] 분리 또는 ranking 은 사이드바 "커뮤니티" 섹션에 유지하고 stats 페이지에 미러링.
