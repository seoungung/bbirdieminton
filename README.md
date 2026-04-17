This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 버디모아 (클럽 관리)

배드민턴 동호회 모임 관리 앱.

### 기술 스택

| 항목 | 기술 |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Backend | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS v4 |
| Deploy | Vercel |

### 로컬 개발 환경 설정

#### 1. 패키지 설치
```bash
npm install
```

#### 2. 환경 변수 설정
```bash
cp .env.example .env.local
# .env.local 에 Supabase URL / ANON_KEY 입력
```

#### 3. 로컬 Supabase 시작
```bash
npx supabase start
```

#### 4. DB 마이그레이션
```bash
npm run db:reset
```

#### 5. 개발 서버 실행
```bash
npm run dev
```

### 스크립트

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm run test` | Vitest 단위 테스트 |
| `npm run lint` | ESLint |
| `npm run db:reset` | DB 초기화 (로컬) |
| `npm run db:push` | 마이그레이션 적용 |
| `npm run db:types` | Supabase 타입 생성 |
| `npm run analyze` | 번들 분석 |

### 프로젝트 구조

```
src/
├── app/
│   ├── club/          # 버디모아 클럽 관리
│   └── ...            # 라켓 도감, 퀴즈
├── components/
│   └── club/          # 클럽 전용 컴포넌트
├── lib/
│   └── club/          # 클럽 유틸리티, 매칭 로직
└── types/             # TypeScript 타입 정의
```

### 버디모아 개발 원칙

- TypeScript strict 모드 — `any` 사용 금지
- Supabase 클라이언트 vs 서버 클라이언트 구분 필수
- `getClubUserId(supabase)` 로 `auth.uid()` → `users.id` 변환 후 비교
- 컴포넌트 200줄 초과 시 분리
- 모바일 퍼스트 (375px 기준)
- 브랜드 컬러 `#beff00` CTA 전용 (5~10% 이내)
