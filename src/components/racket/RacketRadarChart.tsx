'use client'

interface RacketRadarChartProps {
  power: number
  control: number
  speed: number
  durability: number
  repulsion: number
  maneuver: number
}

const STAT_LABELS = ['파워', '반발력', '스피드', '조작성', '컨트롤', '내구성']
const SIZE = 200
const CENTER = SIZE / 2
const MAX_RADIUS = 72
const GRID_LEVELS = 5

export function RacketRadarChart({
  power, control, speed, durability, repulsion, maneuver,
}: RacketRadarChartProps) {
  const values = [power, repulsion, speed, maneuver, control, durability]
  const n = STAT_LABELS.length

  const getPoint = (index: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / n - Math.PI / 2
    return {
      x: CENTER + radius * Math.cos(angle),
      y: CENTER + radius * Math.sin(angle),
    }
  }

  const toPoints = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(' ')

  const gridPolygons = Array.from({ length: GRID_LEVELS }, (_, i) => {
    const r = (MAX_RADIUS * (i + 1)) / GRID_LEVELS
    return toPoints(Array.from({ length: n }, (_, j) => getPoint(j, r)))
  })

  const dataPolygon = toPoints(
    values.map((v, i) => getPoint(i, (Math.min(v, 100) / 100) * MAX_RADIUS))
  )

  const axisEndpoints = Array.from({ length: n }, (_, i) => getPoint(i, MAX_RADIUS))
  const labelPositions = STAT_LABELS.map((label, i) => ({
    ...getPoint(i, MAX_RADIUS + 16),
    label,
  }))
  const valueDots = values.map((v, i) => ({
    ...getPoint(i, (Math.min(v, 100) / 100) * MAX_RADIUS),
    value: v,
  }))

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full max-w-[200px]"
      aria-label="라켓 성능 레이더 차트"
    >
      {gridPolygons.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      ))}
      {axisEndpoints.map((pt, i) => (
        <line
          key={i}
          x1={CENTER} y1={CENTER}
          x2={pt.x} y2={pt.y}
          stroke="#e5e7eb" strokeWidth="1"
        />
      ))}
      <polygon
        points={dataPolygon}
        fill="rgba(34,197,94,0.15)"
        stroke="rgb(34,197,94)"
        strokeWidth="2"
      />
      {labelPositions.map(({ x, y, label }) => (
        <text
          key={label}
          x={x} y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="#6b7280"
          fontFamily="inherit"
        >
          {label}
        </text>
      ))}
      {valueDots.map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="rgb(34,197,94)" />
      ))}
    </svg>
  )
}
