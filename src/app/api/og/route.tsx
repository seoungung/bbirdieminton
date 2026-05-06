import { ImageResponse } from 'next/og'

/**
 * 동적 OG 이미지 — 카톡/슬랙/디스코드/X 등 외부 공유 시 노출되는 1200×630 카드.
 *
 * Query params (모두 옵션):
 *   - title: 카드 상단 큰 글씨 (기본: 브랜드 슬로건)
 *   - subtitle: 카드 하단 서브 카피 (기본: tagline)
 *   - tag: 우상단 작은 라벨 (예: "SEASON REPORT", "MY CARD")
 *
 * 사용 예:
 *   /api/og
 *   /api/og?title=관악FC%20시즌%20리포트&subtitle=최근%2090일%20요약&tag=REPORT
 */

export const runtime = 'edge'

// DoS 방지 — 외부 크롤러가 임의 길이로 호출 가능. 길이 클램프 + 제어문자 제거.
const clamp = (s: string, max: number) =>
  s.replace(/[\x00-\x1f\x7f]/g, '').slice(0, max)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = clamp(
    searchParams.get('title') ?? '매주의 매칭, 코트 두 개를 10초 안에.',
    80,
  )
  const subtitle = clamp(
    searchParams.get('subtitle') ?? '동호인이 만든 배드민턴 운영 도구',
    120,
  )
  const tag = clamp(searchParams.get('tag') ?? 'BIRDIEMINTON', 32)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0a0a',
          color: '#ffffff',
          padding: '80px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 라임 라디얼 글로우 (top-right) */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -180,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(219,230,76,0.32), rgba(219,230,76,0))',
            display: 'flex',
          }}
        />

        {/* 우상단 태그 */}
        <div
          style={{
            position: 'absolute',
            top: 80,
            right: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#DBE64C',
            color: '#0a0a0a',
            padding: '10px 18px',
            borderRadius: 999,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '0.12em',
          }}
        >
          {tag}
        </div>

        {/* 좌상단 마커 + 브랜드 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 40,
            color: 'rgba(255,255,255,0.6)',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: '#DBE64C',
              display: 'flex',
            }}
          />
          버디민턴 · BIRDIEMINTON
        </div>

        {/* 헤드라인 */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            maxWidth: 980,
            display: 'flex',
            flexWrap: 'wrap',
            marginTop: 'auto',
            marginBottom: 24,
          }}
        >
          {title}
        </div>

        {/* 서브 */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.6)',
            display: 'flex',
          }}
        >
          — {subtitle}
        </div>

        {/* 하단 라임 라인 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: '#DBE64C',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
