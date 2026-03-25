import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import ShareButtons from '@/components/guide/ShareButtons'
import '../guide-prose.css'

interface Guide {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string
  published: boolean
  created_at: string
}

interface GuideDetailPageProps {
  params: Promise<{ slug: string }>
}

async function getGuide(slug: string): Promise<Guide | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error || !data) return null
  return data as Guide
}

export async function generateMetadata({ params }: GuideDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuide(slug)
  if (!guide) return { title: '가이드를 찾을 수 없습니다' }
  return {
    title: `${guide.title} | Birdieminton 가이드`,
    description: guide.excerpt || guide.title,
    openGraph: {
      title: guide.title,
      description: guide.excerpt || guide.title,
      ...(guide.cover_image ? { images: [{ url: guide.cover_image }] } : {}),
    },
  }
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = await params
  const guide = await getGuide(slug)
  if (!guide) notFound()

  const formattedDate = new Date(guide.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const shareUrl = `https://birdieminton.com/guide/${slug}`

  return (
    <article className="px-4 md:px-8 py-12 max-w-[768px] mx-auto">
      {/* Cover image */}
      {guide.cover_image && (
        <div className="mb-8 rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={guide.cover_image}
            alt={guide.title}
            className="w-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-extrabold text-[#111111] leading-tight mb-3">
        {guide.title}
      </h1>

      {/* Date */}
      <p className="text-sm text-[#999999] mb-10">{formattedDate}</p>

      {/* Content */}
      <div
        className="guide-prose"
        dangerouslySetInnerHTML={{ __html: guide.content }}
      />

      {/* Share buttons */}
      <ShareButtons title={guide.title} url={shareUrl} />

      {/* Back link */}
      <div className="mt-8 pt-6 border-t border-[#e5e5e5]">
        <Link
          href="/guide"
          className="inline-flex items-center gap-1.5 text-sm text-[#555555] hover:text-[#111111] transition-colors"
        >
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          목록으로 돌아가기
        </Link>
      </div>
    </article>
  )
}
