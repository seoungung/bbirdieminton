import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const { authorization } = Object.fromEntries(req.headers)
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('guides')
    .update({ published: true })
    .eq('published', false)
    .not('publish_at', 'is', null)
    .lte('publish_at', now)
    .select('id, title, slug')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ published: data ?? [], count: data?.length ?? 0 })
}
