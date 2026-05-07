import * as Sentry from '@sentry/nextjs'

/* Replay 통합은 ~150KB 추가 비용 — 베타 단계에서는 에러 트래킹만으로 충분.
 * 정식 출시 + 트래픽 확보 후 디버깅 필요 시 다시 활성. */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
})
