import type { MetadataRoute } from 'next'
import { MANUAL_ENTRIES } from '@/lib/manual/entries'

const BASE = 'https://birdieminton.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const manualUrls: MetadataRoute.Sitemap = MANUAL_ENTRIES.map((m) => ({
    url: `${BASE}/manual/${m.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    { url: BASE,                  lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/pricing`,     lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/manual`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/blog`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/demo`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`,     lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/faq`,         lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/terms`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/privacy`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/policy/refund`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ...manualUrls,
  ]
}
