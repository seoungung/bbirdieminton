# AGENTS.md — 버디민턴 AI 개발 지침

## 네이밍 규칙

| 항목 | 규칙 |
|---|---|
| DB 유저 ID | `birdieminton_user_id` (auth.uid 아님) |
| 스킬 점수 | `skill_score` (0-100 정수) |
| 초대코드 | `invite_code` (8자 영문+숫자) |
| 썸네일 | `thumbnail_color` / `thumbnail_url` |
| 이벤트 | `club_events` (일회성, 반복 규칙 없음) |

## 핵심 유틸리티

- `getClubUserId(supabase)` — `auth.uid()` → `users.id` 변환 (항상 사용)
- `createClient()` — 서버 컴포넌트/Server Action용 클라이언트
- `createBrowserClient()` — 클라이언트 컴포넌트용 (필요시만)

## Server Action 패턴

```typescript
'use server'
export async function myAction(clubId: string, ...) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }
  // owner/manager 검증
  const { data: membership } = await supabase
    .from('club_members').select('role')
    .eq('club_id', clubId).eq('user_id', clubUserId).single()
  if (!membership || !['owner', 'manager'].includes(membership.role))
    return { error: '운영진만 가능합니다.' }
  // ... 실제 작업
  revalidatePath(`/club/${clubId}/...`)
  return { success: true }
}
```

## 금지 사항

- `window.confirm()` 사용 금지 → `ConfirmDialog` 컴포넌트 사용
- `auth.uid()` 직접 비교 금지 → `getClubUserId()` 통해서만
- `service_role` 키 클라이언트 노출 금지
- `any` 타입 사용 금지

## 컬러 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `--color-brand-lime` | `#beff00` | CTA, 강조 (5~10%) |
| `--color-brand-bg-sub` | `#f8f8f8` | 섹션/카드 배경 |
| `--color-brand-text` | `#111111` | 기본 텍스트 |
| `--color-brand-text-muted` | `#999999` | 힌트, 라벨 |
| `--color-brand-border` | `#e5e5e5` | 구분선 |

## 매칭 알고리즘

- `skillBalanceMatch`: skill_score 기준 정렬 후 스네이크 배정 [1위,4위] vs [2위,3위]
- `gameCountMatch`: 누적 게임수 적은 순서
- `randomMatch`: 랜덤 셔플
- 임시 참가자 포함 시 `excluded_from_ranking: true` 자동 설정
