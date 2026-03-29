import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { url, password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!url || typeof url !== 'string') {
    return Response.json({ error: 'url required' }, { status: 400 })
  }

  try {
    // Jina Reader로 페이지 텍스트 추출 (JS 렌더링 포함)
    const jinaUrl = `https://r.jina.ai/${url}`
    const res = await fetch(jinaUrl, {
      headers: {
        Accept: 'text/plain',
        'X-Return-Format': 'markdown',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      return Response.json({ error: '페이지를 불러올 수 없습니다.' }, { status: 400 })
    }

    const text = await res.text()
    const extracted = parseRacketInfo(text, url)

    return Response.json(extracted)
  } catch (e) {
    return Response.json(
      { error: '추출 실패: ' + (e instanceof Error ? e.message : '알 수 없는 오류') },
      { status: 500 },
    )
  }
}

function formatPriceRange(min: number, max: number): string {
  const fmt = (n: number) => {
    if (n >= 10000) return `${Math.round(n / 10000)}만원`
    return `${n.toLocaleString('ko-KR')}원`
  }
  if (min === max) return fmt(min)
  return `${fmt(min)}~${fmt(max)}`
}

function parseRacketInfo(text: string, url: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  // --- 브랜드 추출 ---
  const brandMap: Record<string, string> = {
    yonex: 'YONEX',
    victor: 'VICTOR',
    'li-ning': 'LI-NING',
    lining: 'LI-NING',
    mizuno: 'MIZUNO',
    kawasaki: 'KAWASAKI',
    fleet: 'FLEET',
    rsl: 'RSL',
    apex: 'APEX',
    maxbolt: 'MAXBOLT',
    pulse: 'PULSE',
    tricore: 'TRICORE',
    rider: 'RIDER',
    apacs: 'APACS',
    redson: 'REDSON',
    joobong: 'JOOBONG',
    trion: 'TRION',
  }
  const urlLower = url.toLowerCase()
  const textLower = text.toLowerCase()
  for (const [key, val] of Object.entries(brandMap)) {
    if (urlLower.includes(key) || textLower.includes(key)) {
      result.brand = val
      break
    }
  }

  // --- 라켓명 추출: 첫 번째 h1 또는 타이틀 ---
  const h1Match = text.match(/^#\s+(.+)$/m) ?? text.match(/^##\s+(.+)$/m)
  if (h1Match) {
    result.name = h1Match[1].trim().replace(/\s*\|.*$/, '').trim()
  }

  // --- 무게 추출 ---
  const weightMatch = text.match(/\b([2-6]U)\b/i)
  if (weightMatch) result.weight = weightMatch[1].toUpperCase()

  // --- 밸런스 추출 ---
  if (/헤드\s?헤비|head[\s-]?heavy|top[\s-]?heavy/i.test(text)) result.balance = 'head-heavy'
  else if (/헤드\s?라이트|head[\s-]?light/i.test(text)) result.balance = 'head-light'
  else if (/균형|이븐|even[\s-]?balance/i.test(text)) result.balance = 'even'

  // --- 강성 추출 ---
  if (/스티프|stiff|하드|hard/i.test(text)) result.flex = 'stiff'
  else if (/미디엄|medium|중간/i.test(text)) result.flex = 'medium'
  else if (/플렉시블|flexible|소프트|soft|유연/i.test(text)) result.flex = 'flexible'

  // --- 가격 추출 → price_range 문자열로 변환 ---
  const priceMatches = [...text.matchAll(/([0-9]{1,3}(?:,[0-9]{3})+)\s*원/g)]
  const prices: number[] = []
  for (const m of priceMatches) {
    const n = parseInt(m[1].replace(/,/g, ''), 10)
    if (n >= 10000 && n <= 1000000) prices.push(n)
  }
  if (prices.length > 0) {
    const sorted = [...prices].sort((a, b) => a - b)
    result.price_range = formatPriceRange(sorted[0], sorted[sorted.length - 1])
  }

  // --- 이미지 URL 추출 (마크다운 이미지 문법) ---
  const imgMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/)
  if (imgMatch) result.image_url = imgMatch[1]

  // --- slug 자동생성 ---
  if (result.name && result.brand) {
    const base = `${result.brand}-${result.name}`
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)
    result.slug = base
  }

  return result
}
