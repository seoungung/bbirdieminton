'use client'

import { useEffect, useState } from 'react'
import { X, ArrowRight, Rocket, Play } from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'

const STORAGE_KEY = 'birdieminton.demo.welcomed.v1'

/**
 * 데모 클럽 첫 방문 시 환영 모달
 *
 * - localStorage로 한 번만 표시
 * - 3분 투어 / 자유 체험 / 닫기 3옵션
 * - 3분 투어는 Sprint 7C에서 실제 스포트라이트 투어 연결 예정
 */
export function DemoWelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // 클라이언트 사이드에서만 localStorage 확인
    if (typeof window === 'undefined') return
    const welcomed = window.localStorage.getItem(STORAGE_KEY)
    if (!welcomed) {
      // 짧은 지연 후 표시 (페이지 로드 인상 주지 않기 위해)
      const timer = setTimeout(() => setOpen(true), 600)
      return () => clearTimeout(timer)
    }
  }, [])

  function handleClose(markWelcomed: boolean) {
    setOpen(false)
    if (markWelcomed) {
      try {
        window.localStorage.setItem(STORAGE_KEY, new Date().toISOString())
      } catch {
        // private mode 등 storage 사용 불가한 환경 무시
      }
    }
  }

  function startTour() {
    // TODO: Sprint 7C에서 투어 상태를 localStorage에 표시
    // 현재는 마크만 하고 닫기
    handleClose(true)
    // 투어 시작 시그널 (추후 customEvent나 URL param 사용 가능)
    try {
      window.localStorage.setItem('birdieminton.demo.tour.start', '1')
    } catch {}
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-[fadeInDown_200ms_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => handleClose(true)}
        aria-hidden="true"
      />

      {/* 모달 콘텐츠 */}
      <div className="relative bg-white rounded-3xl max-w-[480px] w-full overflow-hidden shadow-2xl">
        {/* 닫기 버튼 */}
        <button
          onClick={() => handleClose(true)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 hover:bg-[#f5f5f5] flex items-center justify-center text-[#555] transition-colors z-10"
          aria-label="닫기"
        >
          <X size={16} />
        </button>

        {/* Hero 영역 */}
        <div className="bg-[#0a0a0a] text-white px-8 pt-10 pb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#beff00] flex items-center justify-center mx-auto mb-4">
            <ShuttlecockIcon size={26} className="text-[#0a0a0a]" strokeWidth={1.8} />
          </div>
          <h2 id="welcome-title" className="text-2xl font-extrabold tracking-tight mb-2">
            버디민턴에 오신 걸<br />환영해요! 👋
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            이곳은 체험용 모임이에요.<br />
            자유롭게 둘러보시거나 3분 투어로 핵심 기능만 빠르게 확인하세요.
          </p>
        </div>

        {/* 옵션 2개 */}
        <div className="p-6 space-y-3">
          <button
            onClick={startTour}
            className="w-full flex items-center gap-4 p-5 bg-white border-2 border-[#0a0a0a] rounded-2xl hover:bg-[#0a0a0a] hover:text-white transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#beff00] flex items-center justify-center text-[#0a0a0a] group-hover:scale-105 transition-transform shrink-0">
              <Rocket size={20} strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-extrabold text-[15px]">3분 투어 시작 (추천)</p>
              <p className="text-[12px] text-[#999] group-hover:text-white/70 mt-0.5">
                핵심 기능 4가지 빠르게 살펴보기
              </p>
            </div>
            <ArrowRight size={15} className="text-[#bbb] group-hover:text-white" />
          </button>

          <button
            onClick={() => handleClose(true)}
            className="w-full flex items-center gap-4 p-5 bg-[#fafafa] border border-[#f0f0f0] rounded-2xl hover:border-[#e5e5e5] hover:bg-[#f5f5f5] transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#555] shrink-0">
              <Play size={18} strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-[15px] text-[#111]">자유롭게 둘러보기</p>
              <p className="text-[12px] text-[#999] mt-0.5">
                원하는 메뉴부터 직접 클릭
              </p>
            </div>
            <ArrowRight size={15} className="text-[#bbb]" />
          </button>

          <p className="text-[11px] text-center text-[#bbb] pt-3">
            언제든지 우측 상단 <strong className="text-[#555]">내 모임 만들기</strong> 버튼으로 진짜 모임을 시작할 수 있어요
          </p>
        </div>
      </div>
    </div>
  )
}
