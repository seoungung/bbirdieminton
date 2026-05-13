# 토스페이먼츠 빌링(정기결제) v2 통합 가이드 — 버디민턴 도입 종합 정리

> 작성일: 2026-05-11
> 작성: researcher agent (researcher 0512)
> 목적: Stage D 빌링 SDK 통합 + 토스 가맹 심사 통과를 위한 홈페이지 진열 준비
> 출처: 토스페이먼츠 공식 가이드 v2 + 일반 PG 통상 요건 + 전자상거래법 개정 사항

---

## 0. 코드 현황 확인 결과

| 파일 | 상태 |
|------|------|
| `src/app/pricing/page.tsx` | 존재 |
| `src/components/pricing/PricingClient.tsx` | 존재 — Free/Pro/Team 3플랜, 월간/연간 토글, FAQ 포함 |
| `src/app/privacy/page.tsx` | 존재 |
| `src/app/terms/page.tsx` | 존재 |
| `src/app/policy/refund/page.tsx` | 존재 — 정기결제 환불 정책으로 이미 갱신됨 |
| `src/app/business/page.tsx` | 존재 — 통신판매업신고번호 "신고 진행 중" 상태 |
| `src/components/layout/marketing/MarketingFooter.tsx` | 존재 — 사업자 정보 포함 |
| `@tosspayments/tosspayments-sdk` | **이미 설치됨 (v2.7.0)** |

---

## §1. 빌링 통합 전체 흐름

빌링(자동결제)은 구매자가 최초 1회 카드를 등록하면 이후 별도 인증 없이 반복 결제가 가능한 방식이다. 빌링키는 카드번호·유효기간·CVC 등 결제 정보를 암호화한 값으로, 최초 본인인증이 이후 인증을 대체한다.

```
[1] 카드 등록 (클라이언트) ──→ requestBillingAuth() 호출 → 토스 결제창 오픈
        ↓ 성공 시 successUrl?authKey=...&customerKey=... 로 리다이렉트
[2] 빌링키 발급 (서버)     ──→ POST /v1/billing/authorizations/issue
        ↓ 응답: { billingKey, ... }
[3] 빌링키 저장            ──→ DB에 customerKey ↔ billingKey 매핑 저장
        ↓
[4] 정기결제 실행 (서버)   ──→ POST /v1/billing/{billingKey}  (스케줄러가 호출)
        ↓ 응답: Payment 객체 (card 필드 포함)
```

| 역할 | 담당 |
|------|------|
| 결제창 오픈 (`requestBillingAuth`) | 클라이언트 SDK (`@tosspayments/tosspayments-sdk`) |
| authKey 수신 및 빌링키 발급 | 서버사이드 API Route (secret key 사용) |
| 빌링키 저장·관리 | 서버 DB |
| 정기결제 실행 스케줄링 | 서버 스케줄러 (토스가 제공하지 않음, 직접 구현) |
| 결제 취소 / 환불 | 서버사이드 API |

---

## §2. 필요 API 엔드포인트 + 인증

### 인증 방식

```
Authorization: Basic {Base64(secretKey + ":")}
```
- 콜론(:) 생략 시 `INCORRECT_BASIC_AUTH_FORMAT` 에러
- Secret key는 절대 클라이언트(브라우저, GitHub 등)에 노출 금지
- 테스트 키: `test_sk_...` / 라이브 키: `sk_...`

### 핵심 엔드포인트

| 엔드포인트 | 메서드 | 용도 |
|-----------|--------|------|
| `/v1/billing/authorizations/issue` | POST | 결제창 방식: authKey로 빌링키 발급 |
| `/v1/billing/{billingKey}` | POST | 정기결제 실행 |
| `/v1/billing/{billingKey}` | DELETE | 빌링키 삭제(해지) |
| `/v1/payments/{paymentKey}` | GET | 결제 조회 |
| `/v1/payments/{paymentKey}/cancel` | POST | 결제 취소/환불 |

### 빌링키 발급 요청/응답 예시

```http
POST /v1/billing/authorizations/issue
Authorization: Basic dGVzdF9za18...
Content-Type: application/json

{
  "authKey": "YbX2HuSlsC1OQwiHor2xAAAA...",
  "customerKey": "user-uuid-v4-여기에"
}
```

응답:
```json
{
  "billingKey": "tBill_...",
  "customerKey": "user-uuid-...",
  "cardCompany": "현대",
  "cardNumber": "12XX-XXXX-XXXX-3456",
  "authenticatedAt": "2026-05-13T10:00:00+09:00"
}
```

### 정기결제 실행

```http
POST /v1/billing/tBill_xxxxx
{
  "customerKey": "user-uuid-...",
  "amount": 9900,
  "orderId": "birdminton-sub-20260513-userId",
  "orderName": "버디민턴 Pro 월 구독",
  "customerEmail": "user@example.com",
  "customerName": "홍길동"
}
```

### 멱등키

`Idempotency-Key` 헤더에 고유 UUID 권장. 스케줄러 재시도 시 필수.

### 주요 에러

| 에러 코드 | 상황 | 대응 |
|-----------|------|------|
| `UNAUTHORIZED_KEY` | 잘못된 키 또는 base64 인코딩 오류 | 키 + 콜론 확인 |
| `NOT_SUPPORTED_METHOD` | 빌링 계약 없음 | 빌링 가맹 필요 |
| `NOT_MATCHES_CUSTOMER_KEY` | 빌링키-customerKey 불일치 | 일관성 확인 |
| `REJECT_CARD_PAYMENT` | 잔액부족/한도초과 | 카드 변경 안내 |
| `REJECT_CARD_COMPANY` | 카드사 거절 | 카드사 문의 안내 |
| `INVALID_CARD_INFO_RE_REGISTER` | 카드 정보 무효 | 카드 재등록 |
| `INVALID_STOPPED_CARD` | 정지된 카드 | 다른 카드 안내 |
| `NOT_SUPPORTED_BILLING_MERCHANT` | 빌링 미가입 | 빌링 계약 확인 |

---

## §3. Payment Widget vs Payment SDK

| 구분 | Payment Widget (`widgets()`) | Payment SDK (`payment()`) |
|------|------------------------------|--------------------------|
| 용도 | 주문서 형태 통합 결제 UI | 단일 결제수단 결제창 |
| 빌링(정기결제) | **지원하지 않음** | `requestBillingAuth()` 지원 |
| 카드 등록 | 불가 | **가능** |
| SDK 키 접두사 | `gck`/`gsk` | `ck`/`sk` |

**버디민턴 선택: `payment()` 방식 (API-only 키)**

```bash
npm install @tosspayments/tosspayments-sdk  # 이미 v2.7.0 설치됨
```

---

## §4. 웹훅

### 이벤트 타입

| 이벤트 | 설명 |
|--------|------|
| `PAYMENT_STATUS_CHANGED` | 결제 상태 변경 (정기결제 성공/실패 포함) |
| `BILLING_DELETED` | 빌링키 삭제 |
| `CANCEL_STATUS_CHANGED` | 결제 취소 상태 변경 |

### 페이로드

```json
{
  "eventType": "PAYMENT_STATUS_CHANGED",
  "createdAt": "2026-05-13T10:00:00+09:00",
  "data": {
    "paymentKey": "tviva...",
    "orderId": "birdminton-sub-...",
    "status": "DONE",
    "amount": 9900
  }
}
```

### 시그니처 검증

v2 docs에 명시 없음. 일반 PG 통상 요건으로 HMAC 시그니처 헤더 또는 IP 화이트리스트 권장. 토스 고객센터(1544-7772) 확인 필요.

### 재시도 정책

10초 내 200 응답 필요. 최대 7회 재시도 (1분, 4분, 16분, 64분, 256분, 1024분, 4096분 간격, 총 약 3일 19시간).

---

## §5. 정기결제 실패 처리

토스는 자동 재시도 제공 안 함 — 가맹점이 직접 구현.

| 실패 사유 | 에러 코드 | 권장 대응 |
|-----------|-----------|----------|
| 잔액 부족 | `REJECT_CARD_PAYMENT` | Grace Period + 알림 |
| 카드 만료 | `INVALID_CARD_INFO_RE_REGISTER` | 카드 재등록 요청 |
| 카드 정지 | `INVALID_STOPPED_CARD` | 카드 변경 안내 |
| 카드사 거절 | `REJECT_CARD_COMPANY` | 카드사 문의 |

### Grace Period 패턴 권장

```
결제 실패 D+0: 즉시 이메일/알림톡 발송
결제 실패 D+3: 1차 재시도 + 2차 알림
결제 실패 D+7: 2차 재시도 + 최종 경고
결제 실패 D+10: Free 다운그레이드 + 빌링키 유지 (재결제 가능)
```

`subscription_status = 'past_due'` 상태 필드 관리.

---

## §6. 테스트 모드

### 테스트 키

개발자센터(developers.tosspayments.com) 가입 후 즉시 발급. `test_` 접두사.

### 테스트 카드

API 직접: 카드번호 앞 6자리(BIN)만 유효하면 됨.
결제창 방식: 토스 테스트 결제창에서 자동 제공.

### 가맹 심사 전 개발

| 항목 | 가능 |
|------|------|
| SDK 설치/초기화 | O |
| 테스트 키로 빌링키 발급 | O |
| 테스트 키로 정기결제 실행 | O |
| 웹훅 엔드포인트 구현 | O |
| 라이브 키 사용 | **빌링 계약 후만** |

---

## §7. 가맹 심사 통과 — 홈페이지 필수 요소 (CRITICAL)

### A. 푸터 필수 정보

| 항목 | 현재 |
|------|------|
| 상호명 | 버디민턴 — 완료 |
| 대표자명 | 양성웅 — 완료 |
| 사업자등록번호 | 227-11-71746 — 완료 |
| **통신판매업신고번호** | **"신고 진행 중" — 미완료 (심사 블로커)** |
| 사업장 주소 | 완료 |
| 전화번호 | 010-4977-3867 — 완료 |
| 이메일 | skyyolle7@gmail.com (hello@로 통일 권장) |

**통신판매업신고번호 주의**: 국민카드 등 일부 카드사는 이게 없으면 심사 불통과. 간이과세자도 전자상거래 매출이 있으면 신고 필요.

### B. 서비스/상품 진열

- 실제 판매할 서비스 1개 이상 노출
- 테스트 상품(0원, 품절) 불가
- 가격 표시 "월 ₩9,900" — 완료
- **"정기결제"/"자동결제" 명시 — 미흡 (보강 필요)**

### C. 정책 페이지

| 페이지 | 경로 | 상태 |
|--------|------|------|
| 이용약관 | `/terms` | 존재 |
| 개인정보처리방침 | `/privacy` | 존재 |
| 환불정책 | `/policy/refund` | 정기결제 포함 |
| 사업자정보 | `/business` | 존재 |
| 결제정책/결제안내 | 별도 없음 | **미흡** |

### D. 빌링 심사 특이 요건

- **결제경로 PPT/PDF 제출 필수**: 홈페이지 → 플랜 선택 → 카드 등록 → 결제 완료 화면 흐름
- 테스트 계정(로그인 가능) 제출 필요
- 서비스 제공기간 명시: 월간 = "1개월", 연간 = "12개월" (1년 초과 불가)

### E. 구독 해지 경로

사용자가 직접 해지할 수 있는 UI 명확히 존재. 현재 `/policy/refund`에 "마이페이지 결제 관리에서 해지" 명시했으나 **실제 UI 없음**. 심사 전 최소 "이메일로 해지" 경로라도 명시 필요.

---

## §8. 빌링키 보관·DB 설계

### Supabase 테이블

```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  billing_key text not null,           -- 암호화 저장 권장
  customer_key text not null unique,
  plan text not null check (plan in ('basic', 'pro', 'team')),
  status text not null default 'active'
    check (status in ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  canceled_at timestamptz,
  card_company text,
  card_number_masked text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table subscriptions enable row level security;
create policy "user can read own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);
```

### 보안

- 빌링키 AES-256 암호화 또는 Supabase Vault
- 클라이언트에 절대 노출 금지
- `customerKey` UUID v4 (순차 숫자/username 금지 — 토스 명시)
- 빌링키 분실 시 재발급 불가

---

## §9. 정기결제 해지

토스 공식: "다음 결제일에 카드 자동결제 승인 API를 호출하지 않으면 됩니다"

### 해지 흐름

```
사용자 해지 신청
    ↓
DB: subscriptions.canceled_at = now(), status = 'canceled'
    ↓
스케줄러: canceled_at이 있으면 API 호출 건너뜀
    ↓
서비스: current_period_end까지 유료 기능 유지 (선결제분 소진)
    ↓ current_period_end 도달
서비스: plan = 'free' 다운그레이드
    ↓ (선택)
DELETE /v1/billing/{billingKey}
```

**권장: 주기 말 해지** (선결제분 끝까지 유지)

---

## §10. 구독 결제 Best Practice

### 가격 변경 (전자상거래법 2025-02-14 시행)

- 기존 구독자: 변경 **30일 전 사전 동의** 필수
- 신규 구독자: 즉시 새 가격
- Grandfather 정책: `price_locked_at`, `grandfathered_price` 컬럼 관리

### 무료 → 유료 전환

- **7일 전 사전 통보** 필수 (전자상거래법)
- 베타 종료 → Pro 자동 전환: 30일 전 동의 필요

### 영수증

- `receiptUrl` 응답에 포함 → 이메일 발송
- 간이과세자: 세금계산서 발행 의무 없음

---

## §11. 비용 / 수수료

| 항목 | 금액 |
|------|------|
| 신용/체크카드 수수료 | **3.4%** (VAT 별도) |
| 가입비 (1회) | **₩220,000** |
| 연간 관리비 | **₩110,000/년** |
| 빌링 전용 추가 수수료 | **없음** |

**Pro 9,900/월 × 100명 시뮬**: 매출 ₩990,000 - 수수료 ₩33,660 = 순매출 ₩956,340/월

이미 결제된 ₩330,000 = 가입비 ₩220K + VAT + 연관리비 ₩110K 로 추정. 영수증 확인 권장.

---

## §12. Next.js 통합 예시

### 환경변수

```bash
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_여기에
TOSS_SECRET_KEY=test_sk_여기에
```

### 카드 등록 (클라이언트)

```tsx
'use client'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'

export function BillingAuthButton({ userId }: { userId: string }) {
  async function handleRegisterCard() {
    const tossPayments = await loadTossPayments(
      process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
    )
    const payment = tossPayments.payment({ customerKey: userId })

    await payment.requestBillingAuth({
      method: 'CARD',
      successUrl: `${window.location.origin}/billing/success`,
      failUrl: `${window.location.origin}/billing/fail`,
      customerEmail: 'user@example.com',
      customerName: '홍길동',
    })
  }

  return <button onClick={handleRegisterCard}>Pro 구독 시작</button>
}
```

### 빌링키 발급 (서버)

```typescript
// src/app/billing/success/route.ts
import { NextRequest, NextResponse } from 'next/server'

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!
const basicAuth = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const authKey = searchParams.get('authKey')
  const customerKey = searchParams.get('customerKey')

  // 1. 빌링키 발급
  const response = await fetch(
    'https://api.tosspayments.com/v1/billing/authorizations/issue',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ authKey, customerKey }),
    }
  )

  const { billingKey, cardCompany, cardNumber } = await response.json()

  // 2. DB 저장 + 3. 첫 결제 실행 (생략)
  return NextResponse.redirect('/billing/complete')
}
```

### 웹훅

```typescript
// src/app/api/webhooks/toss/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.eventType === 'PAYMENT_STATUS_CHANGED') {
    // DB 업데이트
  }

  return NextResponse.json({ ok: true })  // 반드시 10초 내 200
}
```

---

## §13. 버디민턴 도입 체크리스트

### T0 — 가맹 심사 통과 (홈페이지 진열)

| # | 항목 | 상태 | 우선순위 |
|---|------|------|---------|
| T0-1 | `/pricing` Free/Pro/Team 가격 진열 | 완료 | — |
| T0-2 | 가격 페이지에 "정기결제/자동결제" 명시 | **미흡** | 높음 |
| T0-3 | 구독 해지 방법 안내 | **미흡** | 높음 |
| T0-4 | 통신판매업신고번호 취득 + 갱신 | **미완료** | **최우선** |
| T0-5 | 결제경로 PPT/PDF 제작 | **미완료** | 높음 |
| T0-6 | 테스트 계정 제출 준비 | **미완료** | 높음 |
| T0-7 | 이용약관 — 정기결제/자동갱신 조항 | **검토 필요** | 중간 |
| T0-8 | 개인정보처리방침 — 결제 항목 | 부분 완료 | 낮음 |
| T0-9 | 환불정책 | 완료 | — |
| T0-10 | 사업자정보 갱신 | **미완료** | **최우선** |
| T0-11 | 이메일 `hello@birdieminton.com` 통일 | 미흡 | 중간 |
| T0-12 | 서비스 제공기간 명시 ("1개월" 등) | 미흡 | 높음 |

### Stage D — SDK 통합

| # | 항목 | 상태 |
|---|------|------|
| D-1 | `@tosspayments/tosspayments-sdk` 설치 | 완료 (v2.7.0) |
| D-2 | 환경변수 설정 | 미완료 |
| D-3 | `subscriptions` 테이블 마이그레이션 | 미완료 |
| D-4 | 카드 등록 컴포넌트 | 미완료 |
| D-5 | `/billing/success` API Route | 미완료 |
| D-6 | `/billing/fail` 페이지 | 미완료 |
| D-7 | `/api/webhooks/toss` | 미완료 |
| D-8 | 스케줄러 (Vercel Cron) | 미완료 |
| D-9 | 마이페이지 구독 관리 UI | 미완료 |
| D-10 | Grace Period 로직 | 미완료 |
| D-11 | 통합 테스트 | 미완료 |
| D-12 | 라이브 키 전환 | 미완료 (가맹 후) |

**Stage D 예상 작업량: 약 5.5일**

---

## §14. 위험 / 지뢰

### 가맹 심사 거절 흔한 사유

1. 통신판매업신고번호 없음 (국민카드 등 필수)
2. 서비스 미진열 ("준비 중" 상태)
3. 결제경로 PPT 미제출
4. 사업자등록증과 홈페이지 정보 불일치
5. 환불정책 미비

### SDK 호환성

- v1 API와 v2 API 시그니처 다름 (v2: `payment()` 인스턴스 사용)
- Widget 키(`gck/gsk`)와 API-only 키(`ck/sk`) 혼용 불가

### 법적 요건 (전자상거래법 2025-02-14)

| 요건 | 내용 |
|------|------|
| 가격 인상 사전 동의 | **30일 전 동의** 필수 |
| 무료 → 유료 전환 통보 | **7일 전 사전 통보** |
| 베타 종료 → 유료 전환 | 30일 전 동의 (가격 변경 해당) |

### PCI DSS

- SDK 결제창 방식 사용 시 PCI DSS 컴플라이언스 불필요
- API 직접 방식은 신규 계약 미지원

---

## 출처

- [자동결제(빌링) 이해하기 v2](https://docs.tosspayments.com/guides/v2/billing)
- [결제창 연동하기](https://docs.tosspayments.com/guides/v2/billing/integration)
- [API로 연동하기](https://docs.tosspayments.com/guides/v2/billing/integration-api)
- [JavaScript SDK v2](https://docs.tosspayments.com/sdk/v2/js)
- [코어 API 레퍼런스](https://docs.tosspayments.com/reference)
- [API 키 가이드](https://docs.tosspayments.com/reference/using-api/api-keys)
- [웹훅 v2](https://docs.tosspayments.com/guides/v2/webhook)
- [API 에러 코드](https://docs.tosspayments.com/reference/error-codes)
- [PG 수수료](https://www.tosspayments.com/about/fee)
- [계약과정 FAQ](https://toss.oopy.io/78932357-c9c3-4620-bb8e-1f311b2b14cc)
- [식스샵 토스 심사 미비 수정 가이드](https://help.sixshop.com/learn-sixshop/get-started/prepare-to-sell/payment-gateway/pg-toss/issues)
- [전자상거래법 자동갱신 개정 안내 (2025-02-14)](https://shopnotice.cafe24.com/view?bbs_no=5&no=348262)
- [구독 결제 서비스 구현하기 (1)](https://www.tosspayments.com/blog/articles/22425)
- [구독 결제 서비스 구현하기 (2) 스케줄링](https://www.tosspayments.com/blog/articles/dev-subscription-2)
