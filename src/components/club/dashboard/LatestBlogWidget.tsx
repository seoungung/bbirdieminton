'use client'

import Link from 'next/link'
import { Newspaper, ChevronRight, Calendar } from 'lucide-react'
import { getLatestPosts } from '@/lib/blog/posts'
import { getCategoryBadge } from '@/lib/blog/category'

/**
 * 대시보드용 최신 블로그 위젯 (3개 카드)
 * ClubDashboardClient에서 사용 — 최근 경기 기록 섹션 바로 앞에 삽입
 */
export function LatestBlogWidget() {
  const posts = getLatestPosts(3)

  return (
    <section className="bg-white rounded-3xl border border-[#e5e5e5] p-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Newspaper size={13} className="text-[#555]" strokeWidth={2.5} />
          <span className="text-xs font-extrabold text-[#555] uppercase tracking-wider">
            최신 블로그
          </span>
        </div>
        <Link
          href="/blog"
          className="text-[11px] font-bold text-[#555] hover:text-[#111] transition-colors inline-flex items-center gap-0.5"
        >
          전체 보기 <ChevronRight size={11} />
        </Link>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-2xl border border-[#e5e5e5] hover:border-[var(--color-brand-lime)] hover:shadow-sm transition-all overflow-hidden"
          >
            {/* 커버 그라데이션 */}
            <div
              className={`h-[80px] bg-gradient-to-br ${post.coverGradient}`}
              aria-hidden="true"
            />

            {/* 카드 본문 */}
            <div className="p-3">
              {/* 카테고리 배지 */}
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 ${getCategoryBadge(post.category)}`}
              >
                {post.category}
              </span>

              {/* 제목 */}
              <p className="text-[13px] font-extrabold text-[#111] leading-snug line-clamp-2 mb-1 group-hover:text-[#555] transition-colors">
                {post.title}
              </p>

              {/* 요약 */}
              <p className="text-[11px] text-[#999] leading-relaxed line-clamp-2 mb-2">
                {post.excerpt}
              </p>

              {/* 날짜 */}
              <div className="flex items-center gap-1 text-[10px] text-[#bbb]">
                <Calendar size={9} strokeWidth={2} />
                <span>{post.date}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
