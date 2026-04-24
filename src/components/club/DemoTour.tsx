'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'

const TOUR_ACTIVE_KEY = 'birdieminton.demo.tour.active'
const TOUR_START_SIGNAL = 'birdieminton.demo.tour.start'

interface TourStep {
  /** 이 단계에서 도달해야 할 경로 */
  path: string
  /** 스포트라이트 대상 selector (data-tour 속성으로 마크) */
  target: string
  /** 툴팁 카드 제목 */
  title: string
  /** 툴팁 설명 */
  description: string
  /** 툴팁 위치 (target 기준) */
  placement?: 'right' | 'bottom' | 'left' | 'top'
}

interface Props {
  clubId: string
}

const buildSteps = (clubId: string): TourStep[] => [
  {
    path: `/club/${clubId}`,
    target: '[data-tour="nav-dashboard"]',
    title: '1. 대시보드',
    description: '모임 전체 현황을 한눈에 볼 수 있어요. 멤버 수·경기·다음 정기모임까지 모두 여기서.',
    placement: 'right',
  },
  {
    path: `/club/${clubId}/gameboard`,
    target: '[data-tour="nav-gameboard"]',
    title: '2. 게임보드',
    description: '현장에서 폰으로 바로. 자동 팀 배정부터 경기 결과 입력, 셔틀콕비 정산까지 한번에.',
    placement: 'right',
  },
  {
    path: `/club/${clubId}/ranking`,
    target: '[data-tour="nav-ranking"]',
    title: '3. 랭킹 & 전적',
    description: '경기 결과가 자동으로 누적되어 랭킹에 반영돼요. 회원들 동기부여에도 최고.',
    placement: 'right',
  },
  {
    path: `/club/${clubId}/notices`,
    target: '[data-tour="nav-notices"]',
    title: '4. 공지사항',
    description: '카카오 단체방에 묻히던 공지도 이제 깔끔하게. 이벤트·정기 시합·행사까지 한곳에서.',
    placement: 'right',
  },
]

export function DemoTour({ clubId }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [showComplete, setShowComplete] = useState(false)

  const steps = buildSteps(clubId)
  const step = steps[stepIndex]

  /* 투어 시작 시그널 감지 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const startSignal = window.localStorage.getItem(TOUR_START_SIGNAL)
    const currentActive = window.localStorage.getItem(TOUR_ACTIVE_KEY)
    if (startSignal === '1' || currentActive === '1') {
      setActive(true)
      window.localStorage.removeItem(TOUR_START_SIGNAL)
      window.localStorage.setItem(TOUR_ACTIVE_KEY, '1')
    }
  }, [])

  /* 현재 step의 경로와 현재 pathname이 다르면 자동 이동 */
  useEffect(() => {
    if (!active || !step) return
    if (pathname !== step.path) {
      router.push(step.path)
    }
  }, [active, step, pathname, router])

  /* 대상 요소 위치 측정 (resize 대응) */
  useEffect(() => {
    if (!active || !step || pathname !== step.path) return

    function measure() {
      const el = document.querySelector(step.target) as HTMLElement | null
      if (el) {
        const r = el.getBoundingClientRect()
        setRect(r)
      } else {
        setRect(null)
      }
    }

    // 페이지 렌더 기다리기 위해 짧은 지연
    const timer = setTimeout(measure, 200)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [active, step, pathname])

  function next() {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1)
    } else {
      setShowComplete(true)
      try {
        window.localStorage.removeItem(TOUR_ACTIVE_KEY)
      } catch {}
    }
  }

  function prev() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1)
  }

  function skip() {
    setActive(false)
    try {
      window.localStorage.removeItem(TOUR_ACTIVE_KEY)
    } catch {}
  }

  if (!active) return null

  if (showComplete) {
    return <TourCompleteModal onClose={() => setActive(false)} />
  }

  const padding = 8
  const hole = rect
    ? {
        x: rect.left - padding,
        y: rect.top - padding,
        w: rect.width + padding * 2,
        h: rect.height + padding * 2,
      }
    : null

  return (
    <>
      {/* SVG 기반 스포트라이트 */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-[75]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tour-spotlight">
            <rect width="100%" height="100%" fill="white" />
            {hole && (
              <rect
                x={hole.x}
                y={hole.y}
                width={hole.w}
                height={hole.h}
                rx="10"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(10, 10, 10, 0.72)"
          mask="url(#tour-spotlight)"
        />
      </svg>

      {/* 하이라이트 테두리 (펄스) */}
      {hole && (
        <div
          className="fixed pointer-events-none z-[76] rounded-[10px] border-2 border-[#beff00]"
          style={{
            left: hole.x,
            top: hole.y,
            width: hole.w,
            height: hole.h,
            boxShadow: '0 0 0 4px rgba(190, 255, 0, 0.2)',
          }}
        />
      )}

      {/* 툴팁 카드 */}
      <TourTooltip
        hole={hole}
        placement={step.placement ?? 'right'}
        title={step.title}
        description={step.description}
        stepNumber={stepIndex + 1}
        totalSteps={steps.length}
        onNext={next}
        onPrev={prev}
        onSkip={skip}
        isFirst={stepIndex === 0}
        isLast={stepIndex === steps.length - 1}
      />
    </>
  )
}

/* ─────────────────────────────────────────────── */

interface TooltipProps {
  hole: { x: number; y: number; w: number; h: number } | null
  placement: 'right' | 'bottom' | 'left' | 'top'
  title: string
  description: string
  stepNumber: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
}

function TourTooltip({
  hole,
  placement,
  title,
  description,
  stepNumber,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  isFirst,
  isLast,
}: TooltipProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [tipRect, setTipRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (ref.current) {
      setTipRect(ref.current.getBoundingClientRect())
    }
  }, [title])

  /* 툴팁 위치 계산 */
  let left = 16
  let top = 16
  if (hole && tipRect) {
    const gap = 16
    switch (placement) {
      case 'right':
        left = hole.x + hole.w + gap
        top = hole.y + hole.h / 2 - tipRect.height / 2
        break
      case 'bottom':
        left = hole.x + hole.w / 2 - tipRect.width / 2
        top = hole.y + hole.h + gap
        break
      case 'left':
        left = hole.x - tipRect.width - gap
        top = hole.y + hole.h / 2 - tipRect.height / 2
        break
      case 'top':
        left = hole.x + hole.w / 2 - tipRect.width / 2
        top = hole.y - tipRect.height - gap
        break
    }
    // 뷰포트 밖 방지
    const vw = window.innerWidth
    const vh = window.innerHeight
    left = Math.max(16, Math.min(left, vw - tipRect.width - 16))
    top = Math.max(16, Math.min(top, vh - tipRect.height - 16))
  }

  return (
    <div
      ref={ref}
      className="fixed z-[80] w-[340px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeInDown_200ms_ease-out]"
      style={{ left, top }}
    >
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#999]">
          {stepNumber} / {totalSteps}
        </span>
        <button
          onClick={onSkip}
          className="text-[12px] text-[#999] hover:text-[#555] transition-colors flex items-center gap-1"
          aria-label="투어 건너뛰기"
        >
          건너뛰기
          <X size={12} />
        </button>
      </div>

      {/* 본문 */}
      <div className="px-5 pb-4">
        <h3 className="text-[17px] font-extrabold text-[#111] mb-2">{title}</h3>
        <p className="text-[13px] text-[#555] leading-relaxed">{description}</p>
      </div>

      {/* 진행률 바 */}
      <div className="px-5 pb-4">
        <div className="h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0a0a0a] rounded-full transition-all duration-300"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* 푸터 액션 */}
      <div className="px-5 py-3 border-t border-[#f0f0f0] flex items-center justify-between bg-[#fafafa]">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="flex items-center gap-1 text-[13px] font-semibold text-[#555] hover:text-[#111] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={13} />
          이전
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0a0a0a] text-white text-[13px] font-bold rounded-full hover:bg-[#222] transition-colors"
        >
          {isLast ? '완료' : '다음'}
          {!isLast && <ArrowRight size={13} />}
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────── */

function TourCompleteModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center px-4 animate-[fadeInDown_200ms_ease-out]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-3xl max-w-[440px] w-full overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-white px-8 pt-10 pb-8 text-center relative">
          <div className="absolute top-4 right-4 text-[#beff00]">
            <Sparkles size={22} strokeWidth={2} className="animate-pulse" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#beff00] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">
            투어 완료!
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            이제 자유롭게 둘러보셔도 좋고,<br />
            진짜 내 모임을 만들어 보셔도 좋아요.
          </p>
        </div>
        <div className="p-6 space-y-2.5">
          <a
            href="/login?next=%2Fclub%2Fcreate"
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#0a0a0a] text-white font-extrabold text-[14px] rounded-2xl hover:bg-[#222] transition-colors"
          >
            내 모임 만들러 가기
            <ArrowRight size={14} />
          </a>
          <button
            onClick={onClose}
            className="w-full py-3 text-[13px] font-semibold text-[#999] hover:text-[#555] transition-colors"
          >
            조금 더 둘러볼게요
          </button>
        </div>
      </div>
    </div>
  )
}
