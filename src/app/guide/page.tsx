'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const TOC_ITEMS = [
  { id: 'weight',  label: '01 무게' },
  { id: 'balance', label: '02 밸런스' },
  { id: 'shaft',   label: '03 샤프트' },
  { id: 'frame',   label: '04 프레임' },
  { id: 'tension', label: '05 맥스텐션' },
]

// ─── SVG Diagrams ────────────────────────────────────────────────────────────

function WeightDiagram() {
  const segments = [
    { id: '6U', label: '6U', sub: '70~74g', color: '#beff00', textColor: '#0a0a0a', note: '왕초보' },
    { id: '5U', label: '5U', sub: '75~79g', color: '#9fd400', textColor: '#0a0a0a', note: '초심자' },
    { id: '4U', label: '4U', sub: '80~84g', color: '#6aaa00', textColor: '#fff',    note: '입문자' },
    { id: '3U', label: '3U', sub: '85~89g', color: '#f97316', textColor: '#fff',    note: 'D조~C조' },
    { id: '2U', label: '2U', sub: '90g+',   color: '#ef4444', textColor: '#fff',    note: '상급자' },
  ]
  return (
    <svg viewBox="0 0 520 130" width="100%" xmlns="http://www.w3.org/2000/svg" aria-label="라켓 무게 스펙트럼 다이어그램">
      {/* 배경 */}
      <rect width="520" height="130" fill="transparent" />

      {/* 방향 라벨 */}
      <text x="10"  y="18" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="Pretendard, sans-serif">가볍다 ←</text>
      <text x="430" y="18" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="Pretendard, sans-serif">→ 무겁다</text>

      {/* 세그먼트 */}
      {segments.map((seg, i) => {
        const x = 10 + i * 100
        const w = 96
        return (
          <g key={seg.id}>
            <rect x={x} y="28" width={w} height="46" rx="6" fill={seg.color} opacity="0.9" />
            <text x={x + w / 2} y="49" textAnchor="middle" fill={seg.textColor} fontSize="15" fontWeight="800" fontFamily="Pretendard, sans-serif">{seg.label}</text>
            <text x={x + w / 2} y="65" textAnchor="middle" fill={seg.textColor} fontSize="9.5" fontFamily="Pretendard, sans-serif" opacity="0.8">{seg.sub}</text>
            {/* 아래 레이블 */}
            <text x={x + w / 2} y="95" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9.5" fontFamily="Pretendard, sans-serif">{seg.note}</text>
          </g>
        )
      })}

      {/* 입문자 추천 표시 */}
      <rect x="10" y="106" width="196" height="18" rx="4" fill="rgba(190,255,0,0.12)" />
      <text x="108" y="119" textAnchor="middle" fill="#beff00" fontSize="9" fontFamily="Pretendard, sans-serif" fontWeight="700">입문자 추천 구간</text>
    </svg>
  )
}

function BalanceDiagram() {
  // 세 가지 라켓 실루엣: 헤드라이트 / 이븐 / 헤드헤비
  const configs = [
    { label: '헤드라이트', dotY: 110, handleW: 16, headOpacity: 0.3, handleOpacity: 0.9, accent: '#beff00', desc: '손잡이 쪽 무게중심' },
    { label: '이븐밸런스', dotY: 72,  handleW: 12, headOpacity: 0.6, handleOpacity: 0.6, accent: '#ffffff', desc: '중앙 무게중심' },
    { label: '헤드헤비',   dotY: 34,  handleW: 8,  headOpacity: 0.9, handleOpacity: 0.3, accent: '#f97316', desc: '헤드 쪽 무게중심' },
  ]
  return (
    <svg viewBox="0 0 480 160" width="100%" xmlns="http://www.w3.org/2000/svg" aria-label="밸런스 타입 비교 다이어그램">
      <rect width="480" height="160" fill="transparent" />
      {configs.map((cfg, i) => {
        const cx = 80 + i * 160
        // 라켓 몸체 (세로 직사각형 + 타원 헤드)
        return (
          <g key={cfg.label}>
            {/* 헤드 타원 */}
            <ellipse cx={cx} cy="40" rx="26" ry="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            {/* 헤드 내부 채움 (강도 표현) */}
            <ellipse cx={cx} cy="40" rx="26" ry="30" fill={cfg.accent} opacity={cfg.headOpacity * 0.18} />
            {/* 샤프트 */}
            <line x1={cx} y1="70" x2={cx} y2="105" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
            {/* 손잡이 */}
            <rect x={cx - cfg.handleW / 2} y="105" width={cfg.handleW} height="30" rx="3" fill={cfg.accent} opacity={cfg.handleOpacity * 0.6} />
            {/* 무게중심 점 */}
            <circle cx={cx} cy={cfg.dotY} r="5" fill={cfg.accent} />
            <circle cx={cx} cy={cfg.dotY} r="8" fill={cfg.accent} opacity="0.2" />
            {/* 레이블 */}
            <text x={cx} y="148" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="10.5" fontWeight="700" fontFamily="Pretendard, sans-serif">{cfg.label}</text>
            <text x={cx} y="158" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8.5" fontFamily="Pretendard, sans-serif">{cfg.desc}</text>
          </g>
        )
      })}
    </svg>
  )
}

function ShaftDiagram() {
  // 세 가지 굽힘 곡선
  const shafts = [
    { label: 'Flexible', color: '#beff00', d: 'M 60 30 Q 90 90 60 130',  deflect: '많이 휘어짐',  sub: '왕초보·초심자' },
    { label: 'Medium',   color: '#ffffff', d: 'M 190 30 Q 208 80 190 130', deflect: '중간',         sub: '초심자~D조' },
    { label: 'Stiff',    color: '#f97316', d: 'M 320 30 Q 325 80 320 130', deflect: '거의 안 휘어짐', sub: 'D조~C조' },
  ]
  return (
    <svg viewBox="0 0 420 175" width="100%" xmlns="http://www.w3.org/2000/svg" aria-label="샤프트 강성 시각화 다이어그램">
      <rect width="420" height="175" fill="transparent" />
      {shafts.map((s, i) => {
        const baseX = 60 + i * 130
        return (
          <g key={s.label}>
            {/* 기준선 (직선) */}
            <line x1={baseX} y1="30" x2={baseX} y2="130" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 3" />
            {/* 굽힘 곡선 */}
            <path d={s.d} fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round" />
            {/* 임팩트 방향 화살표 */}
            <path d={`M ${baseX + 18} 75 L ${baseX + 6} 80`} fill="none" stroke={s.color} strokeWidth="1.5" opacity="0.5" markerEnd="url(#arr)" />
            {/* 레이블 */}
            <text x={baseX} y="145" textAnchor="middle" fill={s.color} fontSize="11" fontWeight="700" fontFamily="Pretendard, sans-serif">{s.label}</text>
            <text x={baseX} y="157" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8.5" fontFamily="Pretendard, sans-serif">{s.deflect}</text>
            <text x={baseX} y="169" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="Pretendard, sans-serif">{s.sub}</text>
          </g>
        )
      })}
      {/* 힘 방향 설명 */}
      <text x="210" y="20" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="Pretendard, sans-serif">← 임팩트 시 휘어지는 정도 비교</text>
    </svg>
  )
}

function FrameDiagram() {
  return (
    <svg viewBox="0 0 460 175" width="100%" xmlns="http://www.w3.org/2000/svg" aria-label="프레임 헤드 형태 비교 다이어그램">
      <rect width="460" height="175" fill="transparent" />

      {/* 아이소메트릭 */}
      <g>
        {/* 외형: 각진 타원 */}
        <rect x="40" y="18" width="100" height="110" rx="50" ry="45" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
        {/* 스윗스팟 영역 (넓은) */}
        <rect x="52" y="32" width="76" height="82" rx="38" ry="36" fill="#beff00" opacity="0.12" />
        <rect x="52" y="32" width="76" height="82" rx="38" ry="36" fill="none" stroke="#beff00" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        {/* 라벨 */}
        <text x="90" y="145" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="11" fontWeight="700" fontFamily="Pretendard, sans-serif">아이소메트릭</text>
        <text x="90" y="157" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Pretendard, sans-serif">넓은 스윗스팟</text>
        {/* 스윗스팟 설명 태그 */}
        <rect x="55" y="68" width="70" height="16" rx="3" fill="rgba(190,255,0,0.15)" />
        <text x="90" y="79" textAnchor="middle" fill="#beff00" fontSize="8.5" fontFamily="Pretendard, sans-serif" fontWeight="700">스윗스팟 넓음</text>
      </g>

      {/* 구분선 */}
      <line x1="230" y1="10" x2="230" y2="165" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

      {/* 오벌 */}
      <g>
        {/* 외형: 계란형 */}
        <ellipse cx="330" cy="73" rx="50" ry="62" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
        {/* 파워 집중점 */}
        <ellipse cx="330" cy="50" rx="22" ry="22" fill="#f97316" opacity="0.18" />
        <circle cx="330" cy="50" r="6" fill="#f97316" opacity="0.7" />
        <circle cx="330" cy="50" r="3" fill="#f97316" />
        {/* 방사선 */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180
          return (
            <line
              key={deg}
              x1={330 + 6 * Math.cos(rad)} y1={50 + 6 * Math.sin(rad)}
              x2={330 + 22 * Math.cos(rad)} y2={50 + 22 * Math.sin(rad)}
              stroke="#f97316" strokeWidth="1" opacity="0.3"
            />
          )
        })}
        {/* 라벨 */}
        <text x="330" y="148" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="11" fontWeight="700" fontFamily="Pretendard, sans-serif">오벌</text>
        <text x="330" y="160" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Pretendard, sans-serif">파워 집중</text>
        {/* 파워 설명 태그 */}
        <rect x="290" y="26" width="80" height="16" rx="3" fill="rgba(249,115,22,0.15)" />
        <text x="330" y="37" textAnchor="middle" fill="#f97316" fontSize="8.5" fontFamily="Pretendard, sans-serif" fontWeight="700">파워 집중점</text>
      </g>
    </svg>
  )
}

function TensionDiagram() {
  // 가로 게이지 바: 22lbs ~ 33lbs
  const zones = [
    { label: '22lbs 이하', pct: 0,  width: 0.2,  color: '#ef4444', text: '위험' },
    { label: '23~27lbs',   pct: 0.2, width: 0.28, color: '#f59e0b', text: '일반' },
    { label: '28~30lbs',   pct: 0.48,width: 0.28, color: '#beff00', text: '추천' },
    { label: '31lbs+',     pct: 0.76,width: 0.24, color: '#6aaa00', text: '상급자' },
  ]
  const BAR_X = 20
  const BAR_Y = 48
  const BAR_W = 440
  const BAR_H = 34

  return (
    <svg viewBox="0 0 480 155" width="100%" xmlns="http://www.w3.org/2000/svg" aria-label="맥스텐션 게이지 다이어그램">
      <rect width="480" height="155" fill="transparent" />

      {/* 상단 헤더 */}
      <text x="240" y="22" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9.5" fontFamily="Pretendard, sans-serif">맥스텐션 지원 범위</text>
      <text x="20"  y="38" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="Pretendard, sans-serif">22lbs</text>
      <text x="452" y="38" textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="Pretendard, sans-serif">33lbs+</text>

      {/* 배경 트랙 */}
      <rect x={BAR_X} y={BAR_Y} width={BAR_W} height={BAR_H} rx="8" fill="rgba(255,255,255,0.05)" />

      {/* 구간 채움 */}
      {zones.map((z, i) => {
        const x = BAR_X + z.pct * BAR_W
        const w = z.width * BAR_W
        const isFirst = i === 0
        const isLast = i === zones.length - 1
        const rx = isFirst ? '8 0 0 8' : isLast ? '0 8 8 0' : '0'
        return (
          <g key={z.label}>
            <rect x={x} y={BAR_Y} width={w} height={BAR_H}
              rx={isFirst ? 8 : 0} ry={isFirst ? 8 : 0}
              fill={z.color} opacity="0.75"
              style={isLast ? { borderRadius: '0 8px 8px 0' } : {}}
            />
            {/* 구간 텍스트 */}
            <text x={x + w / 2} y={BAR_Y + 22} textAnchor="middle" fill="#0a0a0a" fontSize="10" fontWeight="800" fontFamily="Pretendard, sans-serif">{z.text}</text>
          </g>
        )
      })}

      {/* 28lbs 추천 마커 */}
      <line x1={BAR_X + 0.48 * BAR_W} y1={BAR_Y - 6} x2={BAR_X + 0.48 * BAR_W} y2={BAR_Y + BAR_H + 6} stroke="#beff00" strokeWidth="2" strokeDasharray="4 3" />

      {/* 하단 레이블 */}
      {zones.map((z) => {
        const x = BAR_X + z.pct * BAR_W + (z.width * BAR_W) / 2
        return (
          <text key={z.label} x={x} y={BAR_Y + BAR_H + 18} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8.5" fontFamily="Pretendard, sans-serif">{z.label}</text>
        )
      })}

      {/* 입문자 권장 라인 설명 */}
      <rect x={BAR_X + 0.48 * BAR_W + 4} y={BAR_Y - 24} width={110} height={18} rx="4" fill="rgba(190,255,0,0.12)" />
      <text x={BAR_X + 0.48 * BAR_W + 10} y={BAR_Y - 12} fill="#beff00" fontSize="9" fontFamily="Pretendard, sans-serif" fontWeight="700">← 최소 28lbs 이상 권장</text>
    </svg>
  )
}

// ─── Section Component ────────────────────────────────────────────────────────

interface SectionProps {
  id: string
  number: string
  title: string
  subtitle: string
  body: string
  table: { key: string; value: string }[]
  tip: string
  tipColor: string
  diagram: React.ReactNode
}

function GuideSection({ id, number, title, subtitle, body, table, tip, tipColor, diagram }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-28">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/8 text-white/40 text-[11px] font-bold tracking-widest tabular-nums">
          {number} / 05
        </span>
      </div>
      <h2 className="text-[28px] sm:text-[34px] font-extrabold text-white tracking-[-0.03em] leading-tight mb-1.5">
        {title}
      </h2>
      <p className="text-sm text-white/40 mb-7">{subtitle}</p>

      {/* 다이어그램 */}
      <div className="bg-[#141414] border border-white/6 rounded-2xl p-4 sm:p-6 mb-7 overflow-hidden">
        {diagram}
      </div>

      {/* 본문 */}
      <p className="text-[15px] text-white/65 leading-[2.0] mb-7">{body}</p>

      {/* 표 */}
      <div className="bg-white/[0.03] border border-white/6 rounded-xl overflow-hidden mb-7">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {table.map(({ key, value }, i) => (
              <tr key={key} className={i !== table.length - 1 ? 'border-b border-white/5' : ''}>
                <td className="px-4 py-3 font-bold text-white text-xs whitespace-nowrap align-top w-28">
                  {key}
                </td>
                <td className="px-4 py-3 text-white/50 text-xs leading-relaxed">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 팁 박스 */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl border-l-4"
        style={{
          background: tipColor === '#ff6b6b' ? 'rgba(255,107,107,0.07)' : 'rgba(190,255,0,0.06)',
          borderLeftColor: tipColor,
        }}
      >
        <span className="text-base shrink-0 leading-tight">💡</span>
        <p className="text-[13px] leading-[1.85]" style={{ color: tipColor }}>
          {tip}
        </p>
      </div>

      {/* 섹션 구분 */}
      <hr className="mt-12 border-white/6" />
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GuidePage() {
  const [activeId, setActiveId] = useState<string>('weight')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const options: IntersectionObserverInit = {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    }
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }, options)

    TOC_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  const sections: Omit<SectionProps, 'diagram'>[] = [
    {
      id: 'weight',
      number: '01',
      title: '무게',
      subtitle: '숫자가 올라갈수록 가벼워요',
      body: '라켓 무게는 보통 3U~6U로 표기돼요. U 앞 숫자가 클수록 가벼운 라켓이에요. 4U(80~85g)가 가장 많이 출시되고, 입문자에게 가장 보편적인 무게예요. 처음에는 무거운 라켓보다 가벼운 5U~6U로 시작하는 게 팔꿈치 부상을 줄이는 데 도움이 돼요.',
      table: [
        { key: '6U', value: '가장 가벼움 (약 70~74g) — 왕초보, 근력 약한 분' },
        { key: '5U', value: '가벼움 (약 75~79g) — 왕초보~초심자' },
        { key: '4U', value: '보통 (약 80~84g) — 가장 보편적' },
        { key: '3U', value: '약간 무거움 (약 85~89g) — D조~C조' },
        { key: '2U', value: '무거움 (약 90g+) — 상급자' },
      ],
      tip: '처음 시작이라면 5U 이상의 가벼운 라켓을 먼저 써보세요.',
      tipColor: '#beff00',
    },
    {
      id: 'balance',
      number: '02',
      title: '밸런스',
      subtitle: '수비냐 공격이냐, 내 스타일을 먼저 파악하세요',
      body: '밸런스는 라켓의 무게중심 위치예요. 헤드라이트는 손잡이 쪽이 무거운 형태로 수비와 빠른 드라이브에 유리하고, 헤드헤비는 헤드 쪽이 무거워 스매시 등 공격에 파워가 실려요. 이븐밸런스는 둘의 중간으로 올라운드형이에요.',
      table: [
        { key: '헤드라이트', value: '수비·속도에 강함, 공격 파워는 다소 부족' },
        { key: '이븐밸런스', value: '수비·공격 균형, 올라운드 플레이어에게 적합' },
        { key: '헤드헤비',  value: '스매시·공격에 강함, 수비 반응은 느릴 수 있음' },
      ],
      tip: '입문자라면 이븐밸런스나 헤드라이트부터 시작하는 걸 추천해요.',
      tipColor: '#beff00',
    },
    {
      id: 'shaft',
      number: '03',
      title: '샤프트 (강성)',
      subtitle: '탄성이 실력을 좌우해요',
      body: '샤프트는 라켓의 대부분을 차지하는 몸통 부분의 굳기예요. Stiff(경)는 임팩트가 잘 맞으면 강한 타구가 가능하지만 힘이 필요해요. Flexible(유연)은 스윙이 가볍고 빠르지만 타이밍 맞추기가 어려울 수 있어요. 입문자에게는 Medium이 가장 적합해요.',
      table: [
        { key: 'Flexible', value: '스윙 가볍고 빠름, 타이밍 맞추기 어려울 수 있음 — 왕초보·초심자' },
        { key: 'Medium',   value: '중간 탄성, 무난한 선택 — 초심자~D조' },
        { key: 'Stiff',    value: '강한 임팩트, 힘이 필요 — D조~C조 이상' },
      ],
      tip: '실력이 늘기 전에 너무 딱딱한 라켓을 쓰면 손목·팔꿈치에 무리가 와요.',
      tipColor: '#beff00',
    },
    {
      id: 'frame',
      number: '04',
      title: '프레임',
      subtitle: '바디 두께와 헤드 모양을 확인하세요',
      body: '프레임은 두 가지를 봐야 해요. 첫째, 바디(두께): 와이드바디는 프레임이 굵어 작은 힘으로도 멀리 보내기 좋고, 슬림바디는 얇아서 빠른 스윙과 정밀한 컨트롤에 유리해요. 둘째, 헤드 형태: 아이소메트릭(각진 형태)은 스윗스팟이 넓어 안정적이고, 오벌(계란형)은 파워 집중도가 높아요.',
      table: [
        { key: '와이드바디',    value: '프레임 굵음, 탄성 강함, 멀리 날리기 쉬움' },
        { key: '슬림바디',      value: '프레임 얇음, 빠른 스윙, 정밀 컨트롤' },
        { key: '아이소메트릭',  value: '스윗스팟 넓음, 실수해도 어느정도 날아감' },
        { key: '오벌',          value: '파워 집중, 공격적 타구 — 최근 다시 유행' },
      ],
      tip: '입문자에게는 아이소메트릭 + 와이드바디 조합이 가장 관대한 라켓이에요.',
      tipColor: '#beff00',
    },
    {
      id: 'tension',
      number: '05',
      title: '맥스텐션',
      subtitle: '이걸 모르고 사면 라켓 또 사야 해요',
      body: '맥스텐션은 라켓이 버틸 수 있는 최대 스트링 장력이에요. 라켓에 직접 표기되어 있어요. 일반 동호인은 보통 25~27lbs를 사용하고, 상급자는 28~30lbs까지 써요. 맥스텐션이 22lbs인 라켓을 사면 나중에 제대로 된 텐션을 치지 못하고 라켓을 또 사야 하는 상황이 생겨요.',
      table: [
        { key: '여성·학생', value: '24~25lbs 사용 → 최소 28lbs 지원 라켓 필요' },
        { key: '일반 남성', value: '25~26lbs 사용 → 최소 28lbs 지원 라켓 필요' },
        { key: '상급자',    value: '27~30lbs 사용 → 28~33lbs 지원 라켓 필요' },
      ],
      tip: '최소 28~30lbs를 지원하는 라켓을 사야 오래 사용할 수 있어요. 라켓 구매 전 꼭 확인하세요!',
      tipColor: '#ff6b6b',
    },
  ]

  const diagrams = [
    <WeightDiagram key="weight" />,
    <BalanceDiagram key="balance" />,
    <ShaftDiagram key="shaft" />,
    <FrameDiagram key="frame" />,
    <TensionDiagram key="tension" />,
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

        {/* 아티클 메타 헤더 */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#beff00]/10 text-[#beff00] text-[11px] font-bold tracking-widest uppercase">
              Guide
            </span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-white/30 text-xs">읽기 약 5분</span>
            <span className="text-white/20 text-xs">·</span>
            <time className="text-white/30 text-xs" dateTime="2025-01-01">2025년 1월</time>
          </div>
          <h1 className="text-[36px] sm:text-[52px] font-extrabold text-white leading-[1.12] tracking-[-0.03em] mb-4">
            라켓 고를 때<br />가장 중요한 5가지
          </h1>
          <p className="text-[15px] text-white/50 leading-[1.85]">
            무게, 밸런스, 샤프트, 프레임, 맥스텐션 — 이 5가지만 알면<br className="hidden sm:block" />
            어떤 라켓이든 직접 고를 수 있어요.
          </p>
        </div>

        {/* 본문 레이아웃: 아티클 + TOC */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-0 lg:gap-14 items-start">

          {/* 아티클 본문 */}
          <div className="max-w-3xl space-y-12">
            {sections.map((section, i) => (
              <GuideSection
                key={section.id}
                {...section}
                diagram={diagrams[i]}
              />
            ))}

            {/* 하단 CTA */}
            <div className="bg-[#111] border border-white/8 rounded-2xl p-8 sm:p-10 text-center mt-4">
              <p className="text-[11px] font-bold text-[#beff00] tracking-widest uppercase mb-3">Next Step</p>
              <h3 className="text-[22px] sm:text-[27px] font-extrabold text-white tracking-[-0.02em] mb-3">
                내 레벨에 맞는 라켓이 궁금하다면?
              </h3>
              <p className="text-white/40 text-sm mb-7 leading-relaxed">
                레벨 테스트로 내 수준을 진단하고,<br className="sm:hidden" /> 딱 맞는 라켓 조건을 확인해보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/quiz"
                  className="px-8 py-3.5 bg-[#beff00] text-[#0a0a0a] font-bold text-sm rounded-full hover:brightness-105 transition-all"
                >
                  레벨 테스트 하기 →
                </Link>
                <Link
                  href="/rackets"
                  className="px-8 py-3.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm rounded-full transition-colors"
                >
                  라켓 도감 보기
                </Link>
              </div>
            </div>
          </div>

          {/* TOC 사이드바 */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">목차</p>
              <nav className="flex flex-col gap-0.5">
                {TOC_ITEMS.map(({ id, label }) => {
                  const isActive = activeId === id
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="group flex items-center gap-2.5 py-2 pr-2 transition-all duration-200"
                    >
                      {/* 활성 인디케이터 */}
                      <span
                        className="shrink-0 w-0.5 h-4 rounded-full transition-all duration-200"
                        style={{
                          background: isActive ? '#beff00' : 'rgba(255,255,255,0.1)',
                          opacity: isActive ? 1 : 0.5,
                        }}
                      />
                      <span
                        className="text-[12.5px] transition-colors duration-200"
                        style={{
                          color: isActive ? '#beff00' : 'rgba(255,255,255,0.35)',
                          fontWeight: isActive ? 700 : 400,
                        }}
                      >
                        {label}
                      </span>
                    </a>
                  )
                })}
              </nav>

              {/* 미니 구분선 */}
              <div className="mt-6 pt-6 border-t border-white/6">
                <p className="text-[10px] text-white/20 leading-relaxed">
                  배드민턴 입문자를 위한<br />라켓 선택 가이드
                </p>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
