import { createClient } from '@/lib/supabase/server'

const LEVEL_LABELS: Record<string, string> = {
  beginner: '왕초보',
  novice:   '초심자',
  d_class:  'D조',
  c_class:  'C조',
}

const GENDER_LABELS: Record<string, string> = {
  male:   '남성',
  female: '여성',
  other:  '기타',
}

export async function POST(req: Request) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const { data: all } = await supabase
    .from('subscribers')
    .select('email, level_tag, gender, created_at')
    .order('created_at', { ascending: false })

  if (!all) return Response.json({ error: 'db error' }, { status: 500 })

  const total = all.length
  const today = new Date().toISOString().slice(0, 10)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const todayCount = all.filter(r => r.created_at?.startsWith(today)).length
  const weekCount  = all.filter(r => r.created_at >= weekAgo).length

  // 레벨별 집계
  const byLevel: Record<string, number> = {}
  for (const r of all) {
    const k = r.level_tag ?? 'unknown'
    byLevel[k] = (byLevel[k] ?? 0) + 1
  }

  // 성별 집계
  const byGender: Record<string, number> = {}
  for (const r of all) {
    const k = r.gender ?? 'unknown'
    byGender[k] = (byGender[k] ?? 0) + 1
  }

  // 레벨 × 성별
  const crossTable: Record<string, Record<string, number>> = {}
  for (const r of all) {
    const lv = r.level_tag ?? 'unknown'
    const gd = r.gender ?? 'unknown'
    if (!crossTable[lv]) crossTable[lv] = {}
    crossTable[lv][gd] = (crossTable[lv][gd] ?? 0) + 1
  }

  // 최근 10명
  const recent = all.slice(0, 10).map(r => ({
    email:     r.email,
    level:     LEVEL_LABELS[r.level_tag] ?? r.level_tag,
    gender:    GENDER_LABELS[r.gender]   ?? r.gender ?? '-',
    createdAt: r.created_at?.slice(0, 16).replace('T', ' ') ?? '-',
  }))

  return Response.json({
    total, todayCount, weekCount,
    byLevel, byGender, crossTable,
    recent,
    levelLabels: LEVEL_LABELS,
    genderLabels: GENDER_LABELS,
  })
}
