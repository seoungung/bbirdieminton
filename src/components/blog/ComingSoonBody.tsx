import Link from 'next/link'
import { Construction, ArrowRight } from 'lucide-react'
import { POSTS } from '@/lib/blog/posts'
import { getCategoryBadge } from '@/lib/blog/category'

interface Props {
  currentSlug: string
}

export function ComingSoonBody({ currentSlug }: Props) {
  const related = POSTS.filter((p) => p.slug !== currentSlug).slice(0, 3)

  return (
    <div>
      {/* 작성 중 안내 */}
      <div className="text-center py-12 mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mb-6">
          <Construction size={28} strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-extrabold text-[#111] mb-3">
          이 글은 작성 중이에요
        </h2>
        <p className="text-[14px] text-[#666] leading-relaxed max-w-[420px] mx-auto">
          곧 공개합니다. 먼저 알림을 원하시면{' '}
          <Link
            href="/contact"
            className="font-semibold text-[#0a0a0a] underline hover:text-[#555] transition-colors"
          >
            문의
          </Link>
          를 남겨 주세요.
        </p>
      </div>

      {/* 다른 글 추천 */}
      {related.length > 0 && (
        <div className="border-t border-[#f0f0f0] pt-10">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-3">
            OTHER POSTS
          </p>
          <h3 className="text-xl font-extrabold text-[#111] mb-6">
            이런 글은 어떠세요?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl border border-[#e5e5e5] hover:border-[#0a0a0a] transition-colors overflow-hidden"
              >
                {/* 커버 */}
                <div
                  className={`h-[70px] bg-gradient-to-br ${post.coverGradient}`}
                  aria-hidden="true"
                />
                {/* 내용 */}
                <div className="p-3">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 ${getCategoryBadge(post.category)}`}
                  >
                    {post.category}
                  </span>
                  <p className="text-[13px] font-bold text-[#111] leading-snug line-clamp-2 group-hover:text-[#555] transition-colors">
                    {post.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#555] hover:text-[#111] transition-colors"
            >
              전체 글 보기
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
