'use client'

import Link from 'next/link'
import { ChevronRight, Lock, Gamepad2 } from 'lucide-react'
import type { UserStatus } from './types'

import { Users, UserPlus, Wallet, Trophy, FileDown } from 'lucide-react'

const FEATURES = [
  {
    Icon: Users,
    label: '회원 관리',
    description: '멤버 목록, 역할 변경, 강퇴',
    href: (id: string) => `/club/${id}/members`,
  },
  {
    Icon: UserPlus,
    label: '가입 신청',
    description: '신규 가입 승인 · 거절',
    href: (id: string) => `/club/${id}/join-requests`,
  },
  {
    Icon: Wallet,
    label: '회비 관리',
    description: '회비 납부 현황, 정산',
    href: (id: string) => `/club/${id}/finance`,
  },
  {
    Icon: Trophy,
    label: '랭킹',
    description: '승점, 승률, 연승 기록',
    href: (id: string) => `/club/${id}/ranking`,
  },
  {
    Icon: FileDown,
    label: '엑셀 임포트',
    description: '기존 회원·회비 데이터 가져오기',
    href: (id: string) => `/club/${id}/import`,
  },
] as const

export function ManageTab({ userStatus, clubId }: { userStatus: UserStatus; clubId: string }) {
  const isMember = userStatus === 'member' || userStatus === 'demo'

  if (!isMember) {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 text-center">
        <Lock size={40} className="text-[#bbb] mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-xl font-bold text-[#111] mb-2">모임 멤버 전용</p>
        <p className="text-base text-[#888]">운영·관리 기능은 모임 멤버만 이용할 수 있어요</p>
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

  return (
    <section className="space-y-3">
      {userStatus === 'demo' && (
        <div className="bg-[#fff8e1] border border-[#ffe082] rounded-2xl px-4 py-3 text-sm text-[#b8860b] font-semibold flex items-center gap-2">
          <Gamepad2 size={16} className="shrink-0" />
          체험 모드 — 변경사항은 저장되지 않아요
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map((feat) => (
          <Link
            key={feat.label}
            href={feat.href(clubId)}
            className="bg-white rounded-2xl border border-[#e5e5e5] p-5 hover:border-[#beff00]/50 transition-colors group"
          >
            <div className="flex items-start justify-between mb-2">
              <feat.Icon size={22} className="text-[#111]" strokeWidth={1.8} />
              <ChevronRight
                size={16}
                className="text-[#bbb] group-hover:text-[#111] transition-colors mt-1"
              />
            </div>
            <p className="font-bold text-[#111] text-sm">{feat.label}</p>
            <p className="text-xs text-[#999] mt-1">{feat.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
