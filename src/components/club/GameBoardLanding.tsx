'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, ChevronRight, Users, Shield } from 'lucide-react'
import { createClubAction } from '@/app/club/create/actions'

interface Props {
  isLoggedIn: boolean
}

export function GameBoardLanding({ isLoggedIn }: Props) {
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [courtCount, setCourtCount] = useState(2)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    if (!isLoggedIn) { setShowLoginModal(true); return }
    setShowCreateModal(true)
  }

  const handleMyClubs = () => {
    if (!isLoggedIn) { setShowLoginModal(true); return }
    router.push('/club/home')
  }

  const handleLoginConfirm = () => {
    setShowLoginModal(false)
    router.push('/login?next=%2Fclub')
  }

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('court_count', String(courtCount))
    setCreateError(null)
    startTransition(async () => {
      const result = await createClubAction(fd)
      if (result?.error) setCreateError(result.error)
    })
  }

  return (
    <>
      {/* ── Hero ── */}
      <div className="bg-[#0a0a0a] pt-10 pb-6 px-4 text-center">
        <div className="max-w-[1088px] mx-auto">
          <p className="text-[#beff00] text-[10px] font-bold tracking-[0.2em] mb-3 uppercase">Birdieminton</p>
          <h1 className="text-[32px] font-extrabold text-white mb-2 tracking-tight">🎮 게임보드</h1>
          <p className="text-sm text-white/50 mb-6">함께하는 배드민턴, 더 스마트하게</p>

          {/* Search */}
          <div className="flex gap-2 mb-5">
            <input
              type="text"
              placeholder="게임보드 이름으로 검색..."
              className="flex-1 bg-white/8 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#beff00]/60 transition-colors"
            />
            <button className="bg-[#beff00] text-[#111] px-4 py-2.5 rounded-xl text-sm font-bold hover:brightness-95 transition-all shrink-0">
              검색
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#beff00] text-[#111] font-bold py-3 rounded-xl hover:brightness-95 transition-all text-sm"
            >
              <Plus size={15} />
              모임 만들기
            </button>
            <button
              onClick={handleMyClubs}
              className="flex-1 inline-flex items-center justify-center bg-white/10 border border-white/15 text-white font-semibold py-3 rounded-xl hover:bg-white/15 transition-all text-sm"
            >
              내 모임
            </button>
          </div>
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="max-w-[1088px] mx-auto px-4 py-8 space-y-3">
        <p className="text-xs text-[#999] font-semibold px-1 mb-4">게임보드란?</p>
        {[
          { icon: '📋', title: '출석 · 코트 배정', desc: '오늘 참석자를 확인하고 코트별로 자동 배정합니다' },
          { icon: '⚡', title: '실력 균등 매칭', desc: '실력 점수 기반으로 공정한 팀을 구성합니다' },
          { icon: '🏆', title: '자동 랭킹', desc: '경기 결과가 자동으로 누적되어 랭킹을 산출합니다' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-white border border-[#e5e5e5] rounded-2xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-[#beff00]/15 rounded-xl flex items-center justify-center text-xl shrink-0">{icon}</div>
            <div className="flex-1">
              <p className="font-bold text-[#111] text-sm">{title}</p>
              <p className="text-xs text-[#999] mt-0.5">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-[#bbb] shrink-0" />
          </div>
        ))}
      </div>

      {/* ── Login confirm modal ── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
            <h3 className="font-bold text-[#111] text-base mb-2">로그인이 필요해요</h3>
            <p className="text-sm text-[#777] mb-6">
              이 기능을 사용하려면 로그인이 필요합니다.<br />로그인 페이지로 이동할까요?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-2.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl hover:bg-[#f8f8f8] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleLoginConfirm}
                className="flex-1 py-2.5 bg-[#111] text-white font-bold text-sm rounded-xl hover:bg-[#333] transition-colors"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create club modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#e5e5e5] sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-[#beff00]" />
                <h3 className="font-bold text-[#111] text-base">모임 만들기</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#bbb] hover:text-[#555] transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#111] mb-1.5">
                  모임 이름 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="예: 화요일 배드민턴 모임"
                  maxLength={30}
                  required
                  className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111] mb-1.5">모임 소개</label>
                <textarea
                  name="description"
                  placeholder="모임에 대한 간단한 소개를 작성해주세요"
                  rows={3}
                  maxLength={200}
                  className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] bg-white transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111] mb-1.5">
                  코트 수 <span className="text-[#999] font-normal text-xs">(1~6개)</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCourtCount(n)}
                      className={
                        'flex-1 h-10 border rounded-xl text-sm font-semibold transition-colors ' +
                        (courtCount === n
                          ? 'bg-[#beff00] border-[#beff00] text-[#111]'
                          : 'border-[#e5e5e5] text-[#999] hover:border-[#beff00]')
                      }
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {createError && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{createError}</p>
              )}

              <div className="flex gap-3 pt-2 pb-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl hover:bg-[#f8f8f8] transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3.5 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isPending ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#111] border-t-transparent" />
                  ) : (
                    <><Plus size={14} /> 모임 만들기</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
