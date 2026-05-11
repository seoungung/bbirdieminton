import Link from 'next/link'
import { ArrowLeft, Calendar, ArrowRight } from 'lucide-react'
import type { ManualEntry } from '@/lib/manual/entries'

interface Props {
  entry: ManualEntry
  related?: ManualEntry[]
  children: React.ReactNode
}

export function GuideShell({ entry, related = [], children }: Props) {
  return (
    <main className="bg-white text-[#0a0a0a] min-h-screen">
      {/* 상단 — 카테고리·제목·메타 */}
      <header className="px-6 sm:px-8 pt-12 pb-10 border-b border-[#f0f0f0]">
        <div className="max-w-[760px] mx-auto">
          <Link
            href="/manual"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#999] hover:text-[#111] transition-colors mb-8"
          >
            <ArrowLeft size={13} />
            사용설명서
          </Link>

          <div className="mb-4">
            <span className="inline-block text-[11px] font-bold text-[#0a0a0a] bg-[#f5f5f5] px-2.5 py-1 rounded-full">
              {entry.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.2] mb-5">
            {entry.title}
          </h1>

          <p className="text-[15px] text-[#666] leading-relaxed mb-6">
            {entry.excerpt}
          </p>

          <div className="flex items-center gap-2 text-[12px] text-[#999]">
            <span className="font-medium">{entry.author}</span>
            <span className="text-[#ddd]">·</span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} />
              {entry.date}
            </span>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <article className="px-6 sm:px-8 py-14 sm:py-20">
        <div className="max-w-[720px] mx-auto guide-prose">{children}</div>
      </article>

      {/* 다음 액션 */}
      <section className="bg-[#fafafa] border-t border-[#f0f0f0] px-6 sm:px-8 py-14">
        <div className="max-w-[720px] mx-auto">
          <h2 className="text-xl font-extrabold text-[#111] mb-4">
            궁금한 점이 더 있으신가요?
          </h2>
          <p className="text-[14px] text-[#666] mb-6 leading-relaxed">
            가이드에서 다루지 않은 부분은 언제든 문의 주세요. 빠르게 답변드립니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white font-bold text-[13px] rounded-full hover:bg-[#222] transition-colors"
            >
              문의하기
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* 관련 가이드 */}
      {related.length > 0 && (
        <section className="px-6 sm:px-8 py-16 border-t border-[#f0f0f0]">
          <div className="max-w-[1080px] mx-auto">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-3">
              RELATED
            </p>
            <h2 className="text-2xl font-extrabold text-[#111] mb-8">
              관련 가이드
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/manual/${item.slug}`}
                  className="group block"
                >
                  <div
                    className={`relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-gradient-to-br ${item.coverGradient}`}
                  >
                    {!item.hasContent && (
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-bold text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        준비 중
                      </span>
                    )}
                  </div>
                  <span className="inline-block text-[10px] font-bold text-[#0a0a0a] bg-[#f5f5f5] px-2 py-0.5 rounded-full mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-[15px] font-bold leading-snug group-hover:text-[#555] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
