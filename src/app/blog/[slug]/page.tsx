import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { POSTS, getPost } from '@/lib/blog/posts'
import { getPostBody } from '@/lib/blog/posts/index'
import { getCategoryBadge } from '@/lib/blog/category'
import { ComingSoonBody } from '@/components/blog/ComingSoonBody'

interface RouteProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: '블로그 | 버디민턴' }
  return {
    title: `${post.title} | 버디민턴 블로그`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | 버디민턴 블로그`,
      description: post.excerpt,
    },
  }
}

export default async function BlogPostPage({ params }: RouteProps) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const Body = getPostBody(slug)
  const badgeClass = getCategoryBadge(post.category)

  return (
    <main className="bg-white text-[#0a0a0a] min-h-screen">
      {/* 헤더 */}
      <header className="px-6 sm:px-8 pt-12 pb-10 border-b border-[#f0f0f0]">
        <div className="max-w-[760px] mx-auto">
          {/* 뒤로가기 */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#999] hover:text-[#111] transition-colors mb-8"
          >
            <ArrowLeft size={13} />
            블로그
          </Link>

          {/* 커버 그라데이션 */}
          <div
            className={`w-full aspect-[16/7] rounded-2xl bg-gradient-to-br ${post.coverGradient} mb-8`}
            aria-hidden="true"
          />

          {/* 카테고리 배지 */}
          <div className="mb-4">
            <span
              className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeClass}`}
            >
              {post.category}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.2] mb-5">
            {post.title}
          </h1>

          {/* 요약 */}
          <p className="text-[15px] text-[#666] leading-relaxed mb-6">
            {post.excerpt}
          </p>

          {/* 작성자 / 날짜 */}
          <div className="flex items-center gap-2 text-[12px] text-[#999]">
            <span className="font-medium">{post.author}</span>
            <span className="text-[#ddd]">·</span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} />
              {post.date}
            </span>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <article className="px-6 sm:px-8 py-14 sm:py-20">
        <div className="max-w-[680px] mx-auto leading-[1.8]">
          {post.hasContent && Body ? (
            <Body />
          ) : (
            <ComingSoonBody currentSlug={post.slug} />
          )}
        </div>
      </article>
    </main>
  )
}
