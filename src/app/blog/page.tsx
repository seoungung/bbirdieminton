import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Calendar } from 'lucide-react'
import { POSTS } from '@/lib/blog/posts'

export const metadata: Metadata = {
  title: '블로그 | 버디민턴',
  description: '배드민턴 동호회 운영 인사이트, 총무 노하우, 제품 업데이트 이야기.',
}

const CATEGORIES = ['전체', '총무 노하우', '인사이트', '업데이트', '사례 공유'] as const

export default function BlogPage() {
  return (
    <main className="bg-white text-[#0a0a0a] min-h-screen">
      {/* 헤더 */}
      <section className="px-8 py-16 sm:py-24 border-b border-[#f0f0f0]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-3">
            BLOG
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
            블로그
          </h1>
          <p className="text-lg text-[#666] max-w-[600px] leading-relaxed">
            동호회 운영 인사이트와 총무 노하우를 공유합니다.
          </p>
        </div>
      </section>

      {/* 카테고리 필터 */}
      <section className="px-8 py-8 border-b border-[#f0f0f0] sticky top-16 bg-white/95 backdrop-blur-md z-10">
        <div className="max-w-[1200px] mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
                cat === '전체'
                  ? 'bg-[#0a0a0a] text-white'
                  : 'text-[#555] hover:bg-[#f5f5f5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 글 그리드 */}
      <section className="px-8 py-16">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              {/* 썸네일 */}
              <div className={`relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-gradient-to-br ${post.coverGradient}`}>
                <div className="absolute inset-0 flex items-center justify-center text-white/40 text-[11px] font-mono">
                  [ 썸네일 — 준비 중 ]
                </div>
              </div>

              {/* 카테고리 */}
              <div className="mb-2">
                <span className="inline-block text-[11px] font-bold text-[#0a0a0a] bg-[#f5f5f5] px-2.5 py-1 rounded-full">
                  {post.category}
                </span>
              </div>

              {/* 제목 */}
              <h2 className="text-[18px] font-extrabold leading-snug mb-2 group-hover:text-[#555] transition-colors line-clamp-2">
                {post.title}
              </h2>

              {/* 요약 */}
              <p className="text-[13px] text-[#666] leading-relaxed mb-3 line-clamp-2">
                {post.excerpt}
              </p>

              {/* 메타 */}
              <div className="flex items-center gap-2 text-[12px] text-[#999]">
                <span className="font-medium">{post.author}</span>
                <span className="text-[#ddd]">·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={11} />
                  {post.date}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* 준비 중 안내 */}
        <div className="max-w-[600px] mx-auto mt-20 text-center">
          <p className="text-[13px] text-[#999] leading-relaxed">
            모든 글은 현재 준비 중입니다.<br />
            첫 글이 발행되면 알림 받으시려면{' '}
            <Link href="/contact" className="font-semibold text-[#0a0a0a] underline hover:text-[#555]">
              문의
            </Link>
            를 남겨주세요.
          </p>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="bg-[#fafafa] border-t border-[#f0f0f0] px-8 py-16">
        <div className="max-w-[640px] mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-[#111] mb-3">
            우리 동호회도 시작해볼까요?
          </h2>
          <p className="text-[14px] text-[#666] mb-6">
            v2.0 베타 기간, 모든 기능 무료입니다.
          </p>
          <Link
            href="/login?next=%2Fclubs"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0a0a0a] text-white font-bold text-[13px] rounded-full hover:bg-[#222] transition-colors"
          >
            무료로 시작하기
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  )
}
