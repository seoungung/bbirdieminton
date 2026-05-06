'use client'

import { CLUB_TAGS } from '@/lib/club/tags'

interface Props {
  tags: string[]
}

/**
 * Hero 메타 라인 아래 태그 칩 row.
 * 클릭 X — 정보 노출 전용. 빈 배열이면 섹션 숨김.
 */
export function ClubPreviewIdentityTags({ tags }: Props) {
  if (!tags || tags.length === 0) return null

  return (
    <section
      aria-label="모임 태그"
      className="px-4 pb-1"
    >
      <ul className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const label = (CLUB_TAGS as Record<string, string>)[tag] ?? tag
          return (
            <li
              key={tag}
              title={label}
              className="inline-flex items-center text-[11.5px] font-semibold tracking-tight px-2 py-1 rounded-full bg-[var(--color-brand-court-bg)] text-[var(--color-brand-court-deep)] border border-[var(--color-brand-court-soft)]"
            >
              {tag}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
