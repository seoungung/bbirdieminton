# 콘텐츠 영역 스포츠 다이나믹 UI 리디자인 작업 플랜

**작성일:** 2026-04-21
**상태:** Draft → Approved pending execution
**예상 소요:** 5~7 작업일 (Phase 단위 분할 가능)

---

## 0. 배경 & 전략

### 제품 구조 (확정)

```
┌─────────────────────────────────────────────────────┐
│  메인 프로덕트: 버디모아 (클럽 관리 툴)              │
│  → /club/*, /mypage                                  │
│  → SaaS 사이드바 대시보드 (AppShell 완료)            │
│  → 기능·효율·집중 지향                               │
└─────────────────────────────────────────────────────┘
              ↑                    ↑
       유입/훅 콘텐츠         눈요기/브랜드 경험
              │                    │
┌─────────────────────────────────────────────────────┐
│  서브 콘텐츠 (본 플랜의 대상)                        │
│  → /, /rackets, /quiz, /guide                        │
│  → 스포츠 다이나믹 (에너지) 감성                     │
│  → 배린이 → 버디모아 유입 깔때기                     │
└─────────────────────────────────────────────────────┘
```

### 비주얼 컨셉: 스포츠 다이나믹 (에너지)

- **타이포그래피**: 굵은 Pretendard ExtraBold 중심, 대형 헤드라인, 한글 스포츠 감성
- **컬러**: Ink(#0a0a0a) × Lime(#beff00) 강한 대비 기반, Court emerald 포인트
- **모션**: 강한 스태거 진입, 공격적 호버, 굵은 선 스트로크
- **레퍼런스**: Nike, 한스클럽, 스포츠 중계 화면의 몰입감

### 두 세계의 연결점

- 콘텐츠 영역 상단 지속 CTA: "버디모아 시작하기"
- 퀴즈 결과 → "내 레벨에 맞는 클럽 찾기"
- 라켓 상세 → "이 라켓 쓰는 클럽 멤버 보기"
- 공통 디자인 토큰(컬러 v2, Pretendard)만 공유

---

## 1. 현재 상태 (2026-04-21 explore 결과)

| 페이지 | 현재 에너지 | 핵심 문제 |
|---|---|---|
| `/` 랜딩 | 중간 | SaaS 포지셔닝 + 콘텐츠 허브 혼재, 6섹션 중 5개 플레인 |
| `/rackets` 목록 | 플레인 | hero 없음, 텍스트 2줄 + 카드 그리드, Lime 소폭만 |
| `/rackets/[slug]` | 중간 | 구조 있음, raw 색상 하드코드(blue-50, yellow-50 등) |
| `/rackets/compare` | 중간 | 비교 UI 있음, 에너지 부족 |
| `/quiz` 진행 | 스타일드 | Ink+Lime 다크 에너지 (유일) |
| `/quiz/result` | 스타일드 | Lime 16회, 블러 언락, 가장 완성도 높음 |
| `/guide` | 플레인 | 흰 배경 + 2컬럼 카드, hero 없음 |
| `/guide/[slug]` | 플레인 | max-w-768 산문, 에너지 전무 |

### 기술 부채 (선행 처리 필요)

1. **Lime 하드코드 363회** (70개 파일), `var(--color-brand-lime)` 참조 0회
2. **Semantic 컬러 6종 전부 미사용** (Court, Team A/B, Streak, Elite, Deuce)
3. **Framer Motion 미설치**, CSS keyframes 3개(progressBar, fadeInUp, slideInFromLeft)만 존재
4. **랜딩 포지셔닝 혼재** — SaaS 설명 + 콘텐츠 허브

---

## 2. 작업 범위 (Out of scope 포함)

### In Scope
- 콘텐츠 영역 4개 라우트 리디자인: `/`, `/rackets/*`, `/quiz/*`, `/guide/*`
- 공통 `ContentShell` 컴포넌트 추출
- 컬러 v2 토큰 실사용 전환
- Framer Motion 도입 및 모션 패턴 확립
- 호버/진입 인터랙션 신설

### Out of Scope
- 클럽 앱(`/club/*`, `/mypage`) UI — 이미 AppShell 완료
- 백엔드/DB/API 변경
- 신규 콘텐츠 페이지 신설
- 다크 테마 토글
- 다국어(i18n) 대응

---

## 3. Phase별 실행 플랜

### 🔧 Phase 0: 기반 정비 (0.5~1일)

**목표:** 리디자인 전 기술 부채 제거로 Phase 1 이후 속도 확보

**작업:**
1. Lime 하드코드 → CSS 변수 일괄 치환
   - `#beff00` → `var(--color-brand-lime)` 또는 Tailwind `bg-brand-lime` 유틸
   - `tailwind.config` 또는 `@theme`에 brand 토큰 노출 확인
   - 대상: 70개 파일, 363회 참조 (클럽 앱 파일 포함 — 단 수정만 하고 시각 변경 없음)
2. Framer Motion 설치 + 기본 패턴 정의
   - `npm install framer-motion`
   - `src/components/motion/` 폴더 신설
   - 기본 variants 3종: `fadeInUp`, `staggerContainer`, `scaleOnHover`
3. Semantic 컬러 매핑 (`/rackets/[slug]` 배지 대상)
   - 레벨 배지: 왕초보→Court / 초심자→Team A / D조→Streak / C조→Elite
   - 타입 배지: 공격형→Team B / 수비형→Team A / 올라운드→Court

**검증:**
- `npm run build` 통과
- `npm run typecheck` 통과
- 시각 회귀 없음 (Lime 색상 동일하게 렌더)

**담당:** `executor` (sonnet) — 단순 치환 + 설치 + 토큰 매핑

**파일:**
- 전역: 70개 파일 sed 치환
- 신규: `src/components/motion/variants.ts`
- 수정: `src/app/rackets/[slug]/page.tsx`, `src/app/globals.css`

---

### ⭐ Phase 1: /rackets 목록 전면 리디자인 (1.5~2일)

**목표:** 스포츠 다이나믹 감성의 "기준 작품" 완성. 여기서 확립된 패턴이 이후 전 페이지에 파생.

**작업:**
1. **Hero Banner 신설** (`RacketsHero.tsx`)
   - Ink 배경 + Lime 액센트 + 대형 ExtraBold 타이포
   - 카피: "당신의 라켓, 제대로 고르는 법" (또는 배린이 언어)
   - 서브 카피 + 퀴즈 CTA ("내 레벨 먼저 진단" → `/quiz`)
   - 우측: 라켓 일러스트 또는 동적 그래픽 (모션 포함)
   - 스크롤 인디케이터 또는 사운드 웨이브 모션

2. **RacketCard 에너지 업그레이드**
   - 호버 시: 스케일 1.03 + Lime 글로우 + 그림자 상승
   - 이미지 줌 인 효과
   - 진입 시 스태거 (100ms 간격)
   - 브랜드 태그 스포츠 감성 (굵은 라벨)

3. **필터 UI 재디자인** (`RacketFilter.tsx`)
   - 좌측 사이드바 → 상단 sticky 필터 바로 전환 (모바일 프렌들리)
   - 활성 필터 Lime 아웃라인 + 체크 아이콘
   - "초기화" 버튼 Ink + Lime hover

4. **정렬 바 강화**
   - 정렬 칩 Ink 배경 + Lime active
   - 결과 개수 표시 ("42개의 라켓" 대형 타이포)

5. **빈 상태 / 로딩 스켈레톤**
   - Lime 펄스 애니메이션
   - 빈 상태 일러스트 + "조건을 바꿔보세요" CTA

**검증:**
- Before/After 스크린샷 (모바일 375px + 데스크톱 1280px)
- Lighthouse 성능 점수 유지 (90+)
- Framer Motion 번들 사이즈 영향 확인 (`npm run analyze`)
- `qa-tester` 에이전트로 인터랙션 테스트

**담당:**
- `designer` (sonnet) — 시각 디자인
- `executor` (sonnet) — 구현
- `qa-tester` — 인터랙션 검증

**파일:**
- 신규: `src/components/racket/RacketsHero.tsx`
- 수정: `src/components/racket/RacketsView.tsx`, `RacketCard.tsx`, `RacketFilter.tsx`, `src/app/rackets/page.tsx`

---

### 🏗 Phase 2: ContentShell 추출 (0.5일)

**목표:** Phase 1에서 확립된 레이아웃 패턴을 재사용 가능한 쉘로 승격

**작업:**
1. `src/components/layout/ContentShell.tsx` 신설
   - Props: `bgVariant: 'white' | 'ink'`, `hero?: ReactNode`, `children: ReactNode`, `showFooter?: boolean`
   - 구성: sticky Header(Ink 유지) + main(bgVariant) + Footer 또는 Footer 제외
   - max-w 1088px 컨테이너 + 모바일 px-4

2. 기존 `MainShell`과 분리 검증
   - MainShell: 클럽 경로 여부 판단 → ContentShell 또는 AppShell 선택
   - 또는 각 라우트의 `layout.tsx`에서 개별 결정

3. `/guide` + `/rackets/[slug]`에 즉시 적용
   - 레이아웃 통일성 확인
   - 스타일 회귀 없음

**검증:**
- `/rackets`, `/guide`, `/rackets/[slug]` 모두 ContentShell 사용
- 헤더 sticky 동작 정상
- 페이지 전환 시 레이아웃 shift 없음

**담당:** `executor` (sonnet)

**파일:**
- 신규: `src/components/layout/ContentShell.tsx`
- 수정: `src/components/layout/MainShell.tsx`, `src/app/rackets/page.tsx`, `src/app/guide/page.tsx`, `src/app/guide/[slug]/page.tsx`, `src/app/rackets/[slug]/page.tsx`

---

### 📄 Phase 3: /rackets/[slug] 상세 페이지 (1일)

**목표:** 라켓 상세를 "쇼케이스+매거진" 감성으로 재구성

**작업:**
1. ContentShell 적용 (bgVariant: 'white')
2. Hero 섹션 신설
   - 좌측: 대형 라켓 이미지 (진입 시 페이드인 + 약간의 rotate)
   - 우측: 브랜드 → 모델명 ExtraBold → 가격 → CTA 2개(쿠팡/네이버 or 클럽 멤버 보기)
3. 레벨·타입 배지를 Phase 0 매핑된 semantic 토큰으로 교체
4. 레이더 차트 진입 모션 (각 축 애니메이션)
5. 스펙 바 진행 모션 (0 → 값으로 채워지는 효과)
6. "이 라켓도 봐요" 섹션 카드에 Phase 1 RacketCard 재사용
7. raw 색상(blue-50 등) 전부 제거

**검증:**
- 모바일/데스크톱 레이아웃 확인
- 모션 성능 (60fps 유지)
- `build` + `typecheck` 통과

**담당:** `designer` + `executor`

**파일:**
- 수정: `src/app/rackets/[slug]/page.tsx`, `src/components/racket/RacketRadarChart.tsx`, `src/components/racket/RacketSpec.tsx`

---

### 🏠 Phase 4: / 랜딩 재정렬 (1~1.5일)

**목표:** "동호회 SaaS 설명" + "콘텐츠 허브" 혼재를 해결하고 스포츠 다이나믹 아이덴티티 확립

**선행 결정 필요:**
- 랜딩의 주 메시지는? **"배린이의 첫 번째 배드민턴 가이드"** (콘텐츠 허브 중심) + 버디모아 CTA 유지
- 또는 A/B 섹션으로 분리 (상단 콘텐츠 훅 → 하단 버디모아 소개)

**작업:**
1. Hero 재작성
   - 강한 카피 + Lime 액센트 + 대형 이미지/비디오 loop
   - 퀴즈 시작 CTA (primary) + 버디모아 CTA (secondary)
2. 3개 훅 섹션 (퀴즈 → 도감 → 가이드) 시각적 스토리텔링
3. 버디모아 소개 섹션 정리 (축소 또는 재배치)
4. 페르소나 섹션 스포츠 감성 업그레이드
5. 최종 CTA 재설계
6. ContentShell 적용

**검증:**
- 깔때기 동선 (랜딩 → 퀴즈 → 클럽) 명확
- 모바일 퍼스트 체크
- SEO 메타데이터 유지

**담당:** `designer-high` (opus, 전략적 내러티브) + `executor`

**파일:**
- 수정: `src/app/page.tsx`, 기존 섹션 컴포넌트 다수

---

### 📚 Phase 5: /guide 에너지 주입 (0.5~1일)

**목표:** 가이드 목록·상세를 블로그 플레인에서 스포츠 매거진으로

**작업:**
1. `/guide` 목록
   - Hero 배너 (카테고리 네비)
   - 카드 그리드 에너지 업그레이드 (호버 효과, 대표 이미지)
2. `/guide/[slug]` 상세
   - Hero 커버 이미지 확장 (풀블리드)
   - 대형 타이틀 ExtraBold
   - 본문 prose 스타일 강화 (Lime 링크, 굵은 섹션 구분)
   - 관련 라켓/퀴즈 CTA (페이지 하단)
3. ContentShell 적용

**담당:** `designer` + `executor`

**파일:**
- 수정: `src/app/guide/page.tsx`, `src/app/guide/[slug]/page.tsx`

---

## 4. 위험 요소 & 대응

| 위험 | 영향 | 대응 |
|---|---|---|
| Framer Motion 번들 사이즈 증가 | 성능 저하 | tree-shaking 확인, 필요시 `m` 컴포넌트만 사용 |
| Lime 하드코드 치환 중 실수 | 시각 회귀 | Phase 0 이후 스냅샷 전수 검사, 시각 diff 도구 활용 |
| 랜딩 내러티브 결정 지연 | Phase 4 지연 | Phase 4 진입 전 사용자와 내러티브 한 번 더 정렬 |
| 모바일 퍼스트 깨짐 | UX 저하 | 각 Phase에서 375px / 768px / 1280px 3단 검증 |
| 디자인 언어 일관성 이탈 | 브랜드 훼손 | Phase 1에서 확립된 패턴을 "스포츠 다이나믹 디자인 레시피" 문서로 정리 후 참조 |

---

## 5. 성공 기준 (Definition of Done)

### 페이지별
- [ ] `/rackets` 히어로 + 카드 에너지 + 필터 재설계
- [ ] `/rackets/[slug]` semantic 토큰 + 모션
- [ ] `/` 랜딩 내러티브 정렬 + 히어로 재작성
- [ ] `/guide` 매거진 감성
- [ ] `/quiz` 기존 유지 (이미 완성도 높음)

### 기술
- [ ] Lime 토큰 실사용 전환 완료
- [ ] Semantic 컬러 v2 라켓 배지 적용
- [ ] Framer Motion 기본 variants 3종 정의
- [ ] ContentShell 추출 및 4개 라우트 적용
- [ ] `npm run build` + `npm run typecheck` 통과
- [ ] Lighthouse 성능 90+ 유지

### 검증
- [ ] `qa-tester` 에이전트 인터랙션 검증 통과
- [ ] Architect 최종 승인 (`architect` agent, opus)
- [ ] 모바일 375px / 태블릿 768px / 데스크톱 1280px 3단 스냅샷 확인

---

## 6. 다음 세션 이어가기

이 플랜을 기반으로 실행하려면:
```
/oh-my-claudecode:autopilot
> Phase 0부터 시작 (기반 정비)
```

또는 단계별 수동 실행:
```
Phase 0 → executor (sonnet)
Phase 1 → designer + executor (병렬 불가, 순차)
Phase 2 → executor (sonnet)
Phase 3 → designer + executor
Phase 4 → designer-high (opus, 내러티브) → executor
Phase 5 → designer + executor
```

**시작점 재확인:** Phase 0 (기반 정비) → Phase 1 (`/rackets` 목록)

---

## 7. 참고

- 관련 파일 경로는 explore 결과(`.omc/notepads/2026-04-21-explore-content/`) 또는 본 문서 Phase별 "파일" 절 참고
- 컬러 v2 정의: `CLAUDE.md` 섹션 "컬러 시스템 v2"
- 브랜드 보이스: `CLAUDE.md` 섹션 "브랜드 보이스" + `memory/brand_story.md`
- 참고 프로젝트: AppShell 완료된 `/club/*` 구조 — 아키텍처 분리 원칙 유지
