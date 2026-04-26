'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Calendar } from 'lucide-react'
import {
  MANUAL_CATEGORIES,
  type ManualCategoryFilter,
  type ManualEntry,
} from '@/lib/manual/entries'

interface Props {
  entries: ManualEntry[]
}

export function ManualGrid({ entries }: Props) {
  const [active, setActive] = useState<ManualCategoryFilter>('전체')

  const filtered =
    active === '전체' ? entries : entries.filter((e) => e.category === active)

  return (
    <>
      {/* 카테고리 필터 */}
      <section className="px-8 py-8 border-b border-[#f0f0f0] sticky top-16 bg-white/95 backdrop-blur-md z-10">
        <div className="max-w-[1200px] mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
          {MANUAL_CATEGORIES.map((cat) => {
            const isActive = cat === active
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#0a0a0a] text-white'
                    : 'text-[#555] hover:bg-[#f5f5f5]'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </section>

      {/* 글 그리드 */}
      <section className="px-8 py-16">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {filtered.map((entry) => (
            <Link
              key={entry.slug}
              href={`/manual/${entry.slug}`}
              className="group block"
            >
              <div
                className={`relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-gradient-to-br ${entry.coverGradient}`}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white/40 text-[11px] font-mono">
                  [ 썸네일 — 준비 중 ]
                </div>
                {!entry.hasContent && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                    준비 중
                  </span>
                )}
              </div>

              <div className="mb-2">
                <span className="inline-block text-[11px] font-bold text-[#0a0a0a] bg-[#f5f5f5] px-2.5 py-1 rounded-full">
                  {entry.category}
                </span>
              </div>

              <h2 className="text-[18px] font-extrabold leading-snug mb-2 group-hover:text-[#555] transition-colors line-clamp-2">
                {entry.title}
              </h2>

              <p className="text-[13px] text-[#666] leading-relaxed mb-3 line-clamp-2">
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
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="max-w-[600px] mx-auto mt-20 text-center">
            <p className="text-[13px] text-[#999]">
              해당 카테고리의 가이드가 아직 없습니다.
            </p>
          </div>
        )}
      </section>
    </>
  )
}
