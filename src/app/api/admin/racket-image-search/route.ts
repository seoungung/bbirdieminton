import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'racket-images'
const SLOT_COUNT = 5

// PostgreSQL array → string[]
function parseImageUrls(raw: string | null): string[] {
  if (!raw) return Array(SLOT_COUNT).fill('')
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    const matches = [...trimmed.slice(1, -1).matchAll(/"([^"]*)"/g)]
    const arr = matches.map((m) => m[1])
    while (arr.length < SLOT_COUNT) arr.push('')
    return arr.slice(0, SLOT_COUNT)
  }
  return Array(SLOT_COUNT).fill('')
}

// string[] → PostgreSQL array literal
function toPostgresArray(urls: string[]): string {
  const escaped = urls.map((u) => `"${u.replace(/"/g, '\\"')}"`)
  return `{${escaped.join(',')}}`
}

function buildSearchUrl(name: string, brand: string): string {
  const query = encodeURIComponent(`${brand} ${name} 배드민턴 라켓`)
  return `https://search.shopping.naver.com/search/all?query=${query}`
}

function extractImageUrls(text: string): string[] {
  const urls: string[] = []
  const regex = /!\[.*?\]\((https?:\/\/[^\s)]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s)]*)?)\)/gi
  let match
  while ((match = regex.exec(text)) !== null) {
    const url = match[1]
    // 광고/배너/로고 이미지 제외
    if (!url.includes('banner') && !url.includes('/ad/') && !url.includes('logo')) {
      urls.push(url)
    }
  }
  return urls
}

export async function POST(req: NextRequest) {
  let body: { racketId?: string; racketName?: string; brand?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { racketId, racketName, brand, password } = body

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!racketId || !racketName || !brand) {
    return Response.json({ error: '필수 파라미터가 없습니다.' }, { status: 400 })
  }

  const searchUrl = buildSearchUrl(racketName, brand)
  const jinaUrl = `https://r.jina.ai/${searchUrl}`

  let text: string
  try {
    const res = await fetch(jinaUrl, {
      headers: {
        Accept: 'text/plain',
        'X-Return-Format': 'markdown',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      return Response.json({ error: '이미지 검색에 실패했습니다.' }, { status: 400 })
    }
    text = await res.text()
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : '검색 요청 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }

  const imgUrls = extractImageUrls(text)
  if (imgUrls.length === 0) {
    return Response.json({ error: '이미지를 찾을 수 없어요.' }, { status: 404 })
  }

  const imageUrl = imgUrls[0]
  let imgBuffer: ArrayBuffer
  let contentType: string
  try {
    const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) })
    if (!imgRes.ok) {
      return Response.json({ error: '이미지 다운로드에 실패했습니다.' }, { status: 400 })
    }
    contentType = imgRes.headers.get('content-type') ?? 'image/jpeg'
    imgBuffer = await imgRes.arrayBuffer()
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : '이미지 다운로드 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }

  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'

  const supabase = createAdminClient()

  // 현재 image_url 조회
  const { data: racketRow, error: fetchError } = await supabase
    .from('rackets')
    .select('image_url')
    .eq('id', racketId)
    .single()

  if (fetchError) {
    return Response.json({ error: fetchError.message }, { status: 500 })
  }

  const urls = parseImageUrls(racketRow?.image_url ?? null)
  const slotIndex = urls.findIndex((u) => u.trim() === '')
  const targetSlot = slotIndex !== -1 ? slotIndex : 0

  const fileName = `${racketId}-auto-${Date.now()}.${ext}`
  const storagePath = `${racketId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, imgBuffer, { contentType, upsert: true })

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 })
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

  const urlWithTs = `${publicUrl}?t=${Date.now()}`
  urls[targetSlot] = urlWithTs

  const { error: updateError } = await supabase
    .from('rackets')
    .update({ image_url: toPostgresArray(urls), updated_at: new Date().toISOString() })
    .eq('id', racketId)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({ url: urlWithTs, slot: targetSlot })
}
