const AXIS_LABELS: Record<string, string> = {
  experience: '경험',
  skill: '기술',
  environment: '환경',
  awareness: '인식',
}

function getMotivation(current: number, total: number): string {
  const pct = (current / total) * 100
  if (current === 1)            return '시작했어요! 편하게 답해주세요 😊'
  if (pct >= 90)                return '거의 다 왔어요! 마지막 한 걸음 🏁'
  if (pct >= 70)                return '잘 하고 있어요! 조금만 더 💪'
  if (pct >= 50)                return '절반 넘었어요! 이제 내리막길 🎯'
  if (pct >= 30)                return '순조롭게 진행 중이에요 👍'
  return ''
}

interface QuizProgressProps {
  current: number
  total: number
  axis: string
}

export function QuizProgress({ current, total, axis }: QuizProgressProps) {
  const pct = Math.round((current / total) * 100)
  const motivation = getMotivation(current, total)
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/50">{AXIS_LABELS[axis] ?? axis}</span>
        <span className="text-[#beff00] font-semibold">{current} / {total}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#beff00] rounded-full transition-all duration-500"
          style={{ width: pct + '%' }}
        />
      </div>
      {motivation && (
        <p className="text-[11px] text-white/40 text-right">{motivation}</p>
      )}
    </div>
  )
}
