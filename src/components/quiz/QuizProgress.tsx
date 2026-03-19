const AXIS_LABELS: Record<string, string> = {
  experience: '경험',
  skill: '기술',
  environment: '환경',
  awareness: '인식',
}

interface QuizProgressProps {
  current: number
  total: number
  axis: string
}

export function QuizProgress({ current, total, axis }: QuizProgressProps) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/50">{AXIS_LABELS[axis] ?? axis}</span>
        <span className="text-white/50">{current} / {total}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#beff00] rounded-full transition-all duration-500"
          style={{ width: pct + '%' }}
        />
      </div>
    </div>
  )
}
