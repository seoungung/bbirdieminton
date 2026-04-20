import { scoreToGrade, GRADE_COLOR, type Grade } from '@/lib/club/grade'

interface Props {
  /** skill_score (0-100) */
  score: number
  /** 사이즈 프리셋 */
  size?: 'xs' | 'sm' | 'md'
  /** 외곽선 포함 여부 (기본 false — 채움 형태) */
  outlined?: boolean
  className?: string
}

/**
 * 급수(F~S) 배지 — 플레이어 이름 옆에 인라인으로 배치
 *
 * 예: <GradeBadge score={65} />  →  [B]
 */
export function GradeBadge({ score, size = 'sm', outlined = false, className = '' }: Props) {
  const grade: Grade = scoreToGrade(score)
  const color = GRADE_COLOR[grade]

  const sizeClass =
    size === 'xs'
      ? 'w-4 h-4 text-[9px]'
      : size === 'md'
      ? 'w-6 h-6 text-[11px]'
      : 'w-5 h-5 text-[10px]'

  return (
    <span
      className={`inline-flex items-center justify-center rounded font-extrabold shrink-0 leading-none ${sizeClass} ${color.bg} ${color.text} ${
        outlined ? `border ${color.border}` : ''
      } ${className}`}
      title={grade === 'S' ? '자강조' : grade === 'F' ? '왕초보' : grade === 'E' ? '초심' : `${grade}조`}
    >
      {grade}
    </span>
  )
}
