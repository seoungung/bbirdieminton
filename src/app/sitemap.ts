import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

const BASE = 'https://birdieminton.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: rackets }, { data: guides }] = await Promise.all([
    supabase.from('rackets').select('slug, updated_at').neq('status', 'discontinued'),
    supabase.from('guides').select('slug, updated_at').eq('published', true),
  ])

  const racketUrls: MetadataRoute.Sitemap = (rackets ?? []).map(r => ({
    url: BASE + '/rackets/' + r.slug,
    lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const guideUrls: MetadataRoute.Sitemap = (guides ?? []).map(g => ({
    url: BASE + '/guide/' + g.slug,
    lastModified: g.updated_at ? new Date(g.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    { url: BASE,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: BASE + '/rackets', lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: BASE + '/quiz',    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: BASE + '/guide',   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: BASE + '/about',   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...racketUrls,
    ...guideUrls,
  ]
}
