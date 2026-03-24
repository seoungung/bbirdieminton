'use server'

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

export async function uploadRacketImage(
  formData: FormData,
): Promise<{ success: boolean; url?: string; error?: string }> {
  const file = formData.get('file') as File | null
  const slug = formData.get('slug') as string | null
  const indexRaw = formData.get('index') as string | null

  if (!file || !slug || indexRaw === null) {
    return { success: false, error: '필수 파라미터가 없습니다.' }
  }

  const index = Number(indexRaw)
  if (isNaN(index) || index < 0 || index >= SLOT_COUNT) {
    return { success: false, error: '유효하지 않은 인덱스입니다.' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${slug}/${index}.${ext}`

  const supabase = createAdminClient()

  // ArrayBuffer로 변환 후 업로드
  const buffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return { success: false, error: uploadError.message }
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const publicUrl = publicData.publicUrl

  // 캐시 버스팅을 위해 타임스탬프 쿼리 추가
  const urlWithTs = `${publicUrl}?t=${Date.now()}`

  // 현재 image_url 조회
  const { data: racketRow, error: fetchError } = await supabase
    .from('rackets')
    .select('image_url')
    .eq('slug', slug)
    .single()

  if (fetchError) {
    return { success: false, error: fetchError.message }
  }

  const urls = parseImageUrls(racketRow?.image_url ?? null)
  urls[index] = urlWithTs

  const { error: updateError } = await supabase
    .from('rackets')
    .update({ image_url: toPostgresArray(urls), updated_at: new Date().toISOString() })
    .eq('slug', slug)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true, url: urlWithTs }
}

export async function deleteRacketImage(
  slug: string,
  index: number,
): Promise<{ success: boolean; error?: string }> {
  if (index < 0 || index >= SLOT_COUNT) {
    return { success: false, error: '유효하지 않은 인덱스입니다.' }
  }

  const supabase = createAdminClient()

  // 현재 image_url 조회해서 실제 경로 파악
  const { data: racketRow, error: fetchError } = await supabase
    .from('rackets')
    .select('image_url')
    .eq('slug', slug)
    .single()

  if (fetchError) {
    return { success: false, error: fetchError.message }
  }

  const urls = parseImageUrls(racketRow?.image_url ?? null)

  // Storage에서 파일 삭제 (확장자를 모르므로 일반적인 확장자 모두 시도)
  const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  const pathsToDelete = extensions.map((ext) => `${slug}/${index}.${ext}`)

  // 존재하는 파일만 삭제 (에러 무시)
  await supabase.storage.from(BUCKET).remove(pathsToDelete)

  urls[index] = ''

  const { error: updateError } = await supabase
    .from('rackets')
    .update({ image_url: toPostgresArray(urls), updated_at: new Date().toISOString() })
    .eq('slug', slug)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true }
}

export interface RacketImageRow {
  id: string
  slug: string
  name: string
  brand: string
  image_url: string | null
}

export async function getRacketsWithImages(): Promise<RacketImageRow[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('rackets')
    .select('id, slug, name, brand, image_url')
    .neq('status', 'discontinued')
    .order('name', { ascending: true })

  if (error) {
    console.error('getRacketsWithImages error:', error)
    return []
  }

  return (data ?? []) as RacketImageRow[]
}
