import type { RadarStats } from '@/types/quiz'

const STAT_LABELS = ['파워', '컨트롤', '지구력', '기술', '경험', '멘탈']
const SIZE = 220
const CENTER = SIZE / 2
const MAX_RADIUS = 78
const GRID_LEVELS = 5

export function QuizRadarChart({ stats }: { stats: RadarStats }) {
  const values = [stats.power, stats.control, stats.endurance, stats.skill, stats.experience, stats.mental]
  const n = STAT_LABELS.length

  const getPoint = (index: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / n - Math.PI / 2
    return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) }
  }

  const toPoints = (pts: { x: number; y: number }[]) => pts.map((p) => p.x + ',' + p.y).join(' ')

  const gridPolygons = Array.from({ length: GRID_LEVELS }, (_, i) => {
    const r = (MAX_RADIUS * (i + 1)) / GRID_LEVELS
    return toPoints(Array.from({ length: n }, (_, j) => getPoint(j, r)))
  })

  const dataPolygon = toPoints(values.map((v, i) => getPoint(i, (Math.min(v, 100) / 100) * MAX_RADIUS)))
  const axisEndpoints = Array.from({ length: n }, (_, i) => getPoint(i, MAX_RADIUS))
  const labelPositions = STAT_LABELS.map((label, i) => ({ ...getPoint(i, MAX_RADIUS + 18), label }))
  const valueDots = values.map((v, i) => ({ ...getPoint(i, (Math.min(v, 100) / 100) * MAX_RADIUS), value: v }))

  return (
    <svg
      width={SIZE} height={SIZE}
      viewBox={'0 0 ' + SIZE + ' ' + SIZE}
      className="w-full max-w-[220px]"
    >
      {gridPolygons.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {axisEndpoints.map((pt, i) => (
        <line key={i} x1={CENTER} y1={CENTER} x2={pt.x} y2={pt.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      <polygon points={dataPolygon} fill="rgba(190,255,0,0.15)" stroke="#beff00" strokeWidth="2" />
      {labelPositions.map(({ x, y, label }) => (
        <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="rgba(255,255,255,0.6)" fontFamily="inherit">
          {label}
        </text>
      ))}
      {valueDots.map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill="#beff00" />
      ))}
    </svg>
  )
}
