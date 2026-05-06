import { cn } from '@/lib/utils'
import type { Grade } from '@/lib/club/grade'

const GRADE_LETTER_COLOR: Record<Grade, string> = {
  S: 'text-[var(--color-brand-elite)]',
  A: 'text-[var(--color-brand-team-b)]',
  B: 'text-[var(--color-brand-streak)]',
  C: 'text-[#ea580c]',
  D: 'text-[var(--color-brand-elite)]',
  E: 'text-[var(--color-brand-court)]',
  F: 'text-[var(--color-brand-text-sub)]',
}

interface GradeBadgeProps {
  grade: Grade | null
  /** 원 크기 — 기본 w-7 h-7 */
  size?: 'sm' | 'md'
}

/**
 * 급수 letter 배지.
 * grade 없으면 "?" 중립 뱃지.
 */
export function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  const dim = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'
  return (
    <div className={cn('rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center shrink-0', dim)}>
      {grade ? (
        <span className={cn('font-extrabold leading-none', size === 'sm' ? 'text-[10px]' : 'text-[12px]', GRADE_LETTER_COLOR[grade])}>
          {grade}
        </span>
      ) : (
        <span className={cn('font-bold text-[var(--color-brand-text-muted)] leading-none', size === 'sm' ? 'text-[9px]' : 'text-[10px]')}>
          ?
        </span>
      )}
    </div>
  )
}
