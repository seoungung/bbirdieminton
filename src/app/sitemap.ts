import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

const BASE = 'https://birdminton.kr'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('rackets')
    .select('slug, updated_at')

  const racketUrls: MetadataRoute.Sitemap = (data ?? []).map(r => ({
    url: BASE + '/rackets/' + r.slug,
    lastModified: new Date(r.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    { url: BASE,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: BASE + '/rackets', lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: BASE + '/newsletter', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...racketUrls,
  ]
}
