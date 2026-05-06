'use client'

import { TAG_GROUPS, CLUB_TAGS, type ClubTag } from '@/lib/club/tags'

interface TagPickerProps {
  value: ClubTag[]
  onChange: (next: ClubTag[]) => void
  /** 최대 선택 개수 — 기본 8개. 너무 많으면 정보가 흐려져서 cap 둠. */
  max?: number
}

/**
 * 사전 정의 태그 multi-select. 그룹별 칩 row.
 * 클릭 토글. 자유 입력 X.
 */
export function TagPicker({ value, onChange, max = 8 }: TagPickerProps) {
  const selected = new Set<ClubTag>(value)

  const toggle = (tag: ClubTag) => {
    const next = new Set(selected)
    if (next.has(tag)) {
      next.delete(tag)
    } else {
      if (next.size >= max) return
      next.add(tag)
    }
    onChange(Array.from(next))
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-[12px] font-semibold text-[#666]">
          모임 태그 <span className="text-[#bbb] font-normal">(선택)</span>
        </label>
        <span className="text-[11px] text-[#999] tabular-nums">
          {selected.size} / {max}
        </span>
      </div>

      <div className="space-y-3">
        {TAG_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#bbb] mb-1.5">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.tags.map((tag) => {
                const active = selected.has(tag)
                const reachedMax = !active && selected.size >= max
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggle(tag)}
                    disabled={reachedMax}
                    title={CLUB_TAGS[tag]}
                    className={
                      'text-[12px] font-semibold tracking-tight px-2.5 py-1.5 rounded-full border transition-colors ' +
                      (active
                        ? 'bg-[var(--color-brand-court-deep)] text-white border-[var(--color-brand-court-deep)]'
                        : reachedMax
                        ? 'bg-[#fafafa] text-[#ccc] border-[#ebebeb] cursor-not-allowed'
                        : 'bg-white text-[#555] border-[#ebebeb] hover:border-[#888]')
                    }
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
