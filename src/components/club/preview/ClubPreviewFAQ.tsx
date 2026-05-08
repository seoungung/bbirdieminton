'use client'

import { ChevronDown } from 'lucide-react'
import type { ClubFAQ } from '@/types/club'

interface Props {
  faqs: ClubFAQ[]
}

/**
 * 자주 묻는 질문 — `<details>` 기반 아코디언.
 * 빈 배열이면 섹션 숨김.
 */
export function ClubPreviewFAQ({ faqs }: Props) {
  const list = (faqs ?? []).filter(
    (f) =>
      f &&
      typeof f.question === 'string' &&
      f.question.trim().length > 0 &&
      typeof f.answer === 'string' &&
      f.answer.trim().length > 0,
  )
  if (list.length === 0) return null

  return (
    <section>
      <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[var(--color-text-strong)] mb-3">
        자주 묻는 질문
      </h2>

      <ul className="space-y-2">
        {list.map((f, i) => (
          <li key={i}>
            <details className="group rounded-2xl border border-[#ebebeb] bg-white open:bg-[var(--color-brand-bg-sub)] transition-colors">
              <summary className="list-none cursor-pointer px-4 py-3 flex items-center gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand-court-bg)] text-[var(--color-brand-court-deep)] inline-flex items-center justify-center text-[10px] font-extrabold">
                  Q
                </span>
                <span className="flex-1 min-w-0 text-[13.5px] font-semibold text-[#111] break-keep">
                  {f.question.trim()}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.2}
                  className="shrink-0 text-[#999] transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="px-4 pb-3 pt-0">
                <div className="flex gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[#f5f5f5] text-[#666] inline-flex items-center justify-center text-[10px] font-extrabold">
                    A
                  </span>
                  <p className="flex-1 text-[13px] text-[#444] leading-relaxed whitespace-pre-wrap break-keep">
                    {f.answer.trim()}
                  </p>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}
