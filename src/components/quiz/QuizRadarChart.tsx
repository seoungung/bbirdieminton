'use client'

interface Props {
  labels: string[]
  data: number[]
  color?: string
}

export function QuizRadarChart({ labels, data, color = '#beff00' }: Props) {
  const size = 200
  const center = size / 2
  const radius = 80
  const levels = 4

  function polarToXY(angle: number, r: number) {
    const rad = (angle - 90) * (Math.PI / 180)
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    }
  }

  const n = labels.length
  const angleStep = 360 / n

  // 배경 그리드
  const gridLines = Array.from({ length: levels }, (_, i) => {
    const r = (radius / levels) * (i + 1)
    const pts = Array.from({ length: n }, (__, j) => {
      const { x, y } = polarToXY(j * angleStep, r)
      return `${x},${y}`
    })
    return pts.join(' ')
  })

  // 축 라인
  const axisLines = Array.from({ length: n }, (_, i) => {
    const { x, y } = polarToXY(i * angleStep, radius)
    return { x, y }
  })

  // 데이터 폴리곤
  const dataPoints = data.map((v, i) => {
    const r = (v / 100) * radius
    return polarToXY(i * angleStep, r)
  })
  const dataPath = dataPoints.map(({ x, y }) => `${x},${y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px]">
      {/* 배경 그리드 */}
      {gridLines.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="white" strokeOpacity={0.08} strokeWidth={1} />
      ))}
      {/* 축 */}
      {axisLines.map(({ x, y }, i) => (
        <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="white" strokeOpacity={0.1} strokeWidth={1} />
      ))}
      {/* 데이터 */}
      <polygon points={dataPath} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={2} strokeOpacity={0.8} />
      {/* 데이터 점 */}
      {dataPoints.map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r={3} fill={color} />
      ))}
      {/* 라벨 */}
      {labels.map((label, i) => {
        const { x, y } = polarToXY(i * angleStep, radius + 18)
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fillOpacity={0.6}
            fontSize={10}
            fontFamily="Pretendard, sans-serif"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}
