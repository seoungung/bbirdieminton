/**
 * 셔틀콕 아이콘 (🏸 대체용 커스텀 SVG)
 * lucide-react 스타일 — 24px 기준, strokeWidth 지원
 * MIT-호환: 자작 SVG
 */

interface Props {
  size?: number
  className?: string
  strokeWidth?: number
  'aria-label'?: string
}

export function ShuttlecockIcon({
  size = 24,
  className = '',
  strokeWidth = 1.8,
  'aria-label': ariaLabel,
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={ariaLabel ? 'img' : 'presentation'}
      aria-label={ariaLabel}
    >
      {/* 코르크 헤드 (아래 반원) */}
      <path d="M8.5 17.5 A3.5 3.5 0 0 0 15.5 17.5 L15 15 L9 15 Z" />
      {/* 깃털 (위로 퍼지는 부채꼴) */}
      <path d="M9 15 L5 5" />
      <path d="M10.5 15 L8.5 4.5" />
      <path d="M12 15 L12 4" />
      <path d="M13.5 15 L15.5 4.5" />
      <path d="M15 15 L19 5" />
      {/* 깃털 사이 가로줄 (중간 높이) */}
      <path d="M7 10 L17 10" />
    </svg>
  )
}
