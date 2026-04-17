# 콘텐츠 자동화 — Phase A (MVP)

한 줄 자연어 입력으로 라켓 도감 페이지 1개를 end-to-end 생성합니다.

## 파이프라인 개요

```
"요넥스 나노플레어 001"
        ↓
[add-racket.ts]   — 입력 파싱 → slug 생성 → 리서처 프롬프트 출력
        ↓ (사용자 복붙)
[racket-researcher] — 공식 스펙/가격/리뷰 수집 → content/research/{slug}.json
        ↓
[add-racket.ts --resume]  — 라이터 프롬프트 출력
        ↓ (사용자 복붙)
[racket-writer]   — JSON → 프론트매터 + 본문 → content/drafts/{slug}.md
        ↓
[add-racket.ts --publish]
        ↓
[validate-racket.ts]  — Zod 스키마 검증
        ↓
promote: drafts/{slug}.md → rackets/{slug}.md
        ↓
[sync-supabase.ts]    — rackets 테이블 upsert (env 없으면 skip)
        ↓
http://localhost:3000/rackets/{slug}
```

## 수동 테스트 단계

### 1) 시작: 리서처 프롬프트 받기
```bash
npm run racket:add -- "요넥스 나노플레어 001"
```
stdout 에 `@agent racket-researcher ...` 블록이 출력됩니다. 그걸 Claude Code 채팅에 **그대로 복붙**하세요.

### 2) 리서처가 완료되면 라이터 단계로
리서처가 `content/research/yonex-nanoflare-001.json` 을 생성한 뒤:
```bash
npm run racket:add -- "요넥스 나노플레어 001" --resume
```
stdout 의 `@agent racket-writer ...` 블록을 Claude Code 에 복붙.

### 3) 라이터가 끝나면 검증 + 발행 + 싱크
```bash
npm run racket:add -- --slug yonex-nanoflare-001 --publish
```
- Zod 검증 통과 시: `content/drafts/yonex-nanoflare-001.md` → `content/rackets/yonex-nanoflare-001.md`
- `.env.local` 에 Supabase 키가 있으면 DB 로도 upsert.
- 키가 없으면 조용히 skip 됩니다 (에러 아님).

### 4) 결과 확인
```
http://localhost:3000/rackets/yonex-nanoflare-001
```

## 추가 옵션

| 플래그 | 의미 |
|---|---|
| `--force` | 기존 research/draft/published 파일 덮어쓰기 |
| `--resume` | 리서치 완료 후 라이터 단계로 |
| `--publish` | 검증 + 발행 + Supabase 싱크 |
| `--slug <slug>` | 자연어 파싱 건너뛰고 슬러그 직접 지정 |

## 개별 스크립트

```bash
npm run racket:validate -- yonex-nanoflare-001
npm run racket:sync -- --slug yonex-nanoflare-001
npm run racket:sync -- --all
```

## 디렉토리 역할

| 경로 | 용도 |
|---|---|
| `content/_input/` | 배치 입력 대기열 (향후 Phase B) |
| `content/research/` | 리서처가 남긴 raw JSON (수치 근거) |
| `content/drafts/` | 라이터가 쓴 마크다운 (검증 전) |
| `content/rackets/` | 검증 통과 + 발행된 최종 마크다운 |
| `content/eval/` | 품질 리포트 (향후 Phase B) |

## Iron Rules

- `src/app/`, `src/components/`, `src/types/` 수정 금지 (읽기만 OK)
- `create-next-app` 절대 실행 금지
- `.env.local`, `next.config.ts`, `supabase/*.sql` 기존 내용 수정 금지

## 알려진 제한 (MVP)

- 에이전트를 스크립트가 자동 호출하지 않습니다 — 사용자가 프롬프트를 복붙합니다.
  (API 키 관리·비용 통제를 위한 의도적 설계. Phase B에서 Anthropic SDK 직접 호출로 전환 가능.)
- 이미지 업로드·Supabase Storage 는 이 MVP 범위 밖. `image_url` 은 리서처가 수집한 외부 URL 만 저장.
