import type { Grade } from '@/lib/club/grade'

export type GradeFilter = 'all' | Grade

/** 급수 필터 옵션 — SetupPhase / PlayingPhase 공통 라벨/순서 */
export const GRADE_FILTER_OPTS: { value: GradeFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'S',   label: 'S' },
  { value: 'A',   label: 'A' },
  { value: 'B',   label: 'B' },
  { value: 'C',   label: 'C' },
  { value: 'D',   label: 'D' },
  { value: 'E',   label: 'E' },
  { value: 'F',   label: 'F' },
]
