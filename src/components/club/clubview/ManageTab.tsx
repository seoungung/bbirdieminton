'use client'

import Link from 'next/link'
import type { UserStatus } from './types'

export function ManageTab({ userStatus, clubId }: { userStatus: UserStatus; clubId: string }) {
  if (userStatus === 'member' || userStatus === 'demo') {
    return (
      <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">
        <h2 className="text-lg font-bold text-[#111] mb-4">운영</h2>
        <Link
          href={`/club/${clubId}/manage`}
          className="flex items-center justify-between py-4 px-4 bg-[#f8f8f8] rounded-xl hover:bg-[#f0f0f0] transition-all"
        >
          <span className="text-base font-semibold text-[#111]">모임 관리 페이지로 이동</span>
          <span className="text-lg text-[#999]">→</span>
        </Link>
      </section>
    )
  }

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 text-center">
      <p className="text-5xl mb-3">🔒</p>
      <p className="text-xl font-bold text-[#111] mb-2">모임 멤버 전용</p>
      <p className="text-base text-[#888]">운영 기능은 모임 멤버만 이용할 수 있어요</p>
      {userStatus === 'non-member' && (
        <Link
          href="/club/join"
          className="mt-6 inline-flex items-center justify-center bg-[#beff00] text-[#111] font-bold text-base py-3 px-7 rounded-xl hover:brightness-95 transition-all"
        >
          초대코드로 참여
        </Link>
      )}
    </div>
  )
}
