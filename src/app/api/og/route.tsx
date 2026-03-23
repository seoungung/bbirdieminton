import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') ?? '라켓 도감'
  const brand = searchParams.get('brand') ?? ''
  const level = searchParams.get('level') ?? ''
  const type = searchParams.get('type') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 상단 브랜드 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#beff00',
            }}
          />
          <span style={{ color: '#beff00', fontSize: '18px', fontWeight: 700, letterSpacing: '0.1em' }}>
            BIRDIEMINTON
          </span>
        </div>

        {/* 중앙 콘텐츠 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {brand && (
            <span style={{ color: '#6b6b6b', fontSize: '20px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              {brand}
            </span>
          )}
          <h1
            style={{
              color: '#ffffff',
              fontSize: name.length > 30 ? '42px' : '54px',
              fontWeight: 800,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {name}
          </h1>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            {level && (
              <span
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  color: '#beff00',
                  fontSize: '16px',
                  fontWeight: 600,
                  padding: '6px 16px',
                  borderRadius: '999px',
                }}
              >
                {level}
              </span>
            )}
            {type && (
              <span
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 600,
                  padding: '6px 16px',
                  borderRadius: '999px',
                }}
              >
                {type}
              </span>
            )}
          </div>
        </div>

        {/* 하단 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b6b6b', fontSize: '16px' }}>
            배드민턴, 제대로 시작하는 법
          </span>
          <span style={{ color: '#6b6b6b', fontSize: '16px' }}>
            birdieminton.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
