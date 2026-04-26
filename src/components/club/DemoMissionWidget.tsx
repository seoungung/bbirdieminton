'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CheckCircle2, Circle, Target, ChevronDown, ChevronUp, X, Sparkles } from 'lucide-react'

const STORAGE_KEY_VISITED = 'birdieminton.demo.missions.visited.v1'
const STORAGE_KEY_DISMISSED = 'birdieminton.demo.missions.dismissed.v1'
const WELCOMED_KEY = 'birdieminton.demo.welcomed.v1'

interface Mission {
  id: string
  label: string
  description: string
  /** 완료 조건: 경로 suffix (includes 매칭) */
  pathSuffix: string
  /** 이동할 경로 */
  href: (clubId: string) => string
}

const MISSIONS: Mission[] = [
  {
    id: 'gameboard',
    label: '게임보드 열어보기',
    description: '자동 팀 배정 체험',
    pathSuffix: '/gameboard',
    href: (id) => `/club/${id}/gameboard`,
  },
  {
    id: 'notices',
    label: '공지사항 확인',
    description: '카톡 대신 깔끔한 공지',
    pathSuffix: '/notices',
    href: (id) => `/club/${id}/notices`,
  },
  {
    id: 'ranking',
    label: '랭킹 보기',
    description: '30명 회원 전적',
    pathSuffix: '/ranking',
    href: (id) => `/club/${id}/ranking`,
  },
  {
    id: 'members',
    label: '회원 목록 확인',
    description: '실력 등급 분포',
    pathSuffix: '/members',
    href: (id) => `/club/${id}/members`,
  },
]

interface Props {
  clubId: string
}

export function DemoMissionWidget({ clubId }: Props) {
  const pathname = usePathname()
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [ready, setReady] = useState(false)
  const [showCelebrate, setShowCelebrate] = useState(false)

  /* 초기화: 방문 이력 + dismiss 상태 로드 */
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 환영 모달 닫기 전엔 표시하지 않음
    const welcomed = window.localStorage.getItem(WELCOMED_KEY)
    if (!welcomed) {
      // welcomed 가 생길 때까지 기다림 (1초 후 재확인)
      const timer = setTimeout(() => setReady(true), 1200)
      return () => clearTimeout(timer)
    }
    setReady(true)

    const dismissedFlag = window.localStorage.getItem(STORAGE_KEY_DISMISSED)
    if (dismissedFlag === '1') {
      setDismissed(true)
      return
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_VISITED)
      if (stored) {
        setVisited(new Set(JSON.parse(stored)))
      }
    } catch {}
  }, [])

  /* 경로 변경 감지 → 미션 체크 */
  useEffect(() => {
    for (const mission of MISSIONS) {
      if (pathname.includes(mission.pathSuffix) && !visited.has(mission.id)) {
        const newVisited = new Set(visited)
        newVisited.add(mission.id)
        setVisited(newVisited)
        try {
          window.localStorage.setItem(STORAGE_KEY_VISITED, JSON.stringify([...newVisited]))
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  /* 전체 완료 시 축하 */
  useEffect(() => {
    if (visited.size === MISSIONS.length && !dismissed) {
      const timer = setTimeout(() => setShowCelebrate(true), 500)
      return () => clearTimeout(timer)
    }
  }, [visited.size, dismissed])

  function handleDismiss() {
    setDismissed(true)
    try {
      window.localStorage.setItem(STORAGE_KEY_DISMISSED, '1')
    } catch {}
  }

  if (!ready || dismissed) return null

  const completedCount = visited.size
  const totalCount = MISSIONS.length
  const progress = (completedCount / totalCount) * 100
  const allCompleted = completedCount === totalCount

  return (
    <>
      {/* 축하 모달 */}
      {showCelebrate && (
        <CelebrateModal
          onClose={() => {
            setShowCelebrate(false)
            handleDismiss()
          }}
        />
      )}

      {/* 미션 위젯 */}
      <div
        className={`fixed bottom-20 lg:bottom-5 right-5 z-40 transition-all ${
          minimized ? 'w-auto' : 'w-[300px]'
        }`}
      >
        {minimized ? (
          <button
            onClick={() => setMinimized(false)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] text-white rounded-full shadow-lg hover:bg-[#222] transition-colors"
            aria-label="미션 열기"
          >
            <Target size={14} className="text-[#beff00]" strokeWidth={2.2} />
            <span className="text-[13px] font-bold">
              미션 {completedCount}/{totalCount}
            </span>
            <ChevronUp size={13} strokeWidth={2.2} />
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-[#e5e5e5] overflow-hidden animate-[fadeInDown_200ms_ease-out]">
            {/* 헤더 */}
            <div className="px-4 py-3 bg-[#0a0a0a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-[#beff00]" strokeWidth={2.2} />
                <span className="text-[12px] font-bold uppercase tracking-widest">
                  체험 미션
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(true)}
                  className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors"
                  aria-label="최소화"
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors"
                  aria-label="닫기"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* 진행률 */}
            <div className="px-4 pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#999]">
                  진행률 {completedCount}/{totalCount}
                </span>
                <span className="text-[11px] font-bold text-[#0a0a0a]">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10b981] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 미션 리스트 */}
            <div className="p-2">
              {MISSIONS.map((mission) => {
                const completed = visited.has(mission.id)
                return (
                  <Link
                    key={mission.id}
                    href={mission.href(clubId)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                      completed
                        ? 'bg-[#ecfdf5] hover:bg-[#d1fae5]'
                        : 'hover:bg-[#f8f8f8]'
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2
                        size={18}
                        className="text-[#10b981] flex-shrink-0 mt-0.5"
                        strokeWidth={2.2}
                      />
                    ) : (
                      <Circle
                        size={18}
                        className="text-[#bbb] flex-shrink-0 mt-0.5"
                        strokeWidth={2}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[13px] font-semibold ${
                          completed ? 'text-[#10b981] line-through' : 'text-[#111]'
                        }`}
                      >
                        {mission.label}
                      </p>
                      <p className="text-[11px] text-[#999] mt-0.5 truncate">
                        {mission.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* 완료 CTA */}
            {allCompleted && (
              <div className="p-3 pt-1 border-t border-[#f0f0f0] bg-[#fafafa]">
                <Link
                  href="/login?next=%2Fclub%2Fcreate"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0a0a0a] text-white text-[12px] font-extrabold rounded-xl hover:bg-[#222] transition-colors"
                >
                  <Sparkles size={13} className="text-[#beff00]" />
                  내 모임 만들러 가기
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────── */

function CelebrateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center px-4 animate-[fadeInDown_200ms_ease-out]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-3xl max-w-[440px] w-full overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white px-8 pt-10 pb-8 text-center relative">
          <div className="absolute top-4 right-4">
            <Sparkles size={22} strokeWidth={2} className="text-white/60 animate-pulse" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">
            모든 미션 완료!
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            4가지 핵심 기능을 모두 둘러보셨네요.<br />
            이제 진짜 시작해볼까요?
          </p>
        </div>
        <div className="p-6 space-y-2.5">
          <a
            href="/login?next=%2Fclub%2Fcreate"
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#0a0a0a] text-white font-extrabold text-[14px] rounded-2xl hover:bg-[#222] transition-colors"
          >
            <Sparkles size={15} className="text-[#beff00]" />
            내 모임 만들러 가기
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
