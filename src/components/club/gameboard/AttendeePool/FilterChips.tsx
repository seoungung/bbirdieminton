'use client'

import { cn } from '@/lib/utils'
import { GRADE_FILTER_OPTS, type GradeFilter } from './shared'

/**
 * 급수 필터 칩 — Setup / Playing 풀 양쪽에서 재사용.
 * 회원/참가자 수 ≥ 8 일 때만 호출 측에서 노출하도록 하고, 본 컴포넌트는 렌더만 책임.
 */
export function FilterChips({
  counts,
  value,
  onChange,
}: {
  counts: Record<GradeFilter, number>
  value: GradeFilter
  onChange: (v: GradeFilter) => void
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-2 mb-2">
      {GRADE_FILTER_OPTS.map(opt => {
        const count = counts[opt.value]
        if (opt.value !== 'all' && count === 0) return null
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold transition-colors',
              isActive
                ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[var(--color-brand-lime)]'
            )}
          >
            {opt.label}
            <span className={cn('text-[10px] tabular-nums', isActive ? 'text-white/60' : 'text-[#bbb]')}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
