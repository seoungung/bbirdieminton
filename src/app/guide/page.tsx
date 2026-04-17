import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '가이드북 | Birdieminton',
  description: '배드민턴을 더 잘 알고 싶다면 - 배린이를 위한 가이드 모음',
}

interface Guide {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image: string
  created_at: string
}

export default async function GuidePage() {
  const supabase = await createClient()
  const { data: guides } = await supabase
    .from('guides')
    .select('id, slug, title, excerpt, cover_image, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const list: Guide[] = (guides as Guide[]) ?? []

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="px-4 md:px-8 py-12 max-w-[1088px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-[#111111]">가이드북</h1>
        <p className="text-sm text-[#555555] mt-2">
          배드민턴을 더 잘 알고 싶다면
        </p>
      </div>

      {/* Empty state */}
      {list.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[#999999] text-sm">
            아직 발행된 가이드가 없습니다.
          </p>
        </div>
      )}

      {/* Card grid */}
      {list.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {list.map((guide) => (
            <Link
              key={guide.id}
              href={`/guide/${guide.slug}`}
              className="group rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden hover:border-[#beff00] transition-colors"
            >
              {guide.cover_image && (
                <div className="aspect-[16/9] overflow-hidden bg-[#f0f0f0]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guide.cover_image}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5">
                <h2 className="text-base font-bold text-[#111111] mb-1.5 line-clamp-2">
                  {guide.title}
                </h2>
                {guide.excerpt && (
                  <p className="text-sm text-[#555555] line-clamp-2 mb-3">
                    {guide.excerpt}
                  </p>
                )}
                <p className="text-xs text-[#999999]">
                  {formatDate(guide.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
