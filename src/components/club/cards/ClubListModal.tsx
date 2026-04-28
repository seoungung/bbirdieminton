'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'

type ModalType = 'create' | 'join'

interface ClubListModalProps {
  type: ModalType
  onClose: () => void
}

/**
 * 게스트 제한 모달.
 * - 'create': 모임 만들기 차단 → 로그인 유도
 * - 'join': 아직 미구현 기능 안내
 */
export function ClubListModal({ type, onClose }: ClubListModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-14 h-14 bg-[#f0f0f0] rounded-2xl mx-auto mb-5">
          <Lock size={26} className="text-[#555]" />
        </div>

        {type === 'create' ? (
          <>
            <h2 className="text-xl font-extrabold text-[#111] text-center mb-2">모임을 만들 수 없어요</h2>
            <p className="text-sm text-[#777] text-center leading-relaxed mb-7">
              체험 모드에서는 모임을 생성할 수 없어요.<br />로그인 후 이용해 주세요.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/login?next=%2Fclub%2Fhome"
                className="w-full flex items-center justify-center bg-[#beff00] text-[#111] font-bold py-3.5 rounded-2xl hover:brightness-95 transition-all text-sm"
              >
                로그인하고 모임 만들기
              </Link>
              <button
                onClick={onClose}
                className="w-full py-3 text-sm text-[#999] hover:text-[#555] transition-colors"
              >
                계속 둘러보기
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-extrabold text-[#111] text-center mb-2">사용할 수 없는 기능이에요</h2>
            <p className="text-sm text-[#777] text-center leading-relaxed mb-7">
              아직 이 기능을 사용할 수 없습니다.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#f0f0f0] text-[#555] font-bold rounded-2xl hover:bg-[#e5e5e5] transition-colors text-sm"
            >
              닫기
            </button>
          </>
        )}
      </div>
    </div>
  )
}
