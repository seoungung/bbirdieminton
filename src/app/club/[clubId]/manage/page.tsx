import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '모임 관리 | 버디민턴' }

const FEATURES = [
  {
    icon: '✏️',
    label: '모임 소개',
    description: '이름, 소개글, 장소, 썸네일 편집',
    href: (id: string) => `/club/${id}/settings`,
  },
  {
    icon: '👥',
    label: '회원 관리',
    description: '멤버 목록, 역할 변경, 초대',
    href: (id: string) => `/club/${id}/members`,
  },
  {
    icon: '💰',
    label: '회비 관리',
    description: '회비 납부 현황, 정산',
    href: (id: string) => `/club/${id}/finance`,
  },
  {
    icon: '🏆',
    label: '랭킹',
    description: '승점, 승률, 연승 기록',
    href: (id: string) => `/club/${id}/ranking`,
  },
  {
    icon: '📢',
    label: '공지',
    description: '준비 중',
    href: null,
  },
] as const

export default async function ManagePage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params

  // 데모 모임: 인증 없이 UI 노출
  if (clubId.startsWith('demo-')) {
    return (
      <div>
        <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
          <div className="max-w-[1088px] mx-auto flex items-center gap-3">
            <Link href={`/club/${clubId}/view`} className="flex items-center gap-1.5 text-[#555] hover:text-[#111] transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="font-bold text-[#111] text-base">모임 관리 (체험)</h1>
          </div>
        </header>
        <main className="max-w-[1088px] mx-auto px-4 py-5">
          <div className="bg-[#fff8e1] border border-[#ffe082] rounded-2xl px-4 py-3 mb-4 text-sm text-[#b8860b] font-semibold">
            🎮 체험 모드 — 변경사항은 저장되지 않아요
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((feat) => {
              const isDisabled = feat.href === null
              if (isDisabled) {
                return (
                  <div key={feat.label} className="bg-white rounded-2xl border border-[#e5e5e5] p-5 opacity-50 cursor-not-allowed">
                    <p className="text-2xl mb-2">{feat.icon}</p>
                    <p className="font-bold text-[#111] text-sm">{feat.label}</p>
                    <p className="text-xs text-[#999] mt-1">{feat.description}</p>
                  </div>
                )
              }
              return (
                <Link key={feat.label} href={feat.href(clubId)}
                  className="bg-white rounded-2xl border border-[#e5e5e5] p-5 hover:border-[#beff00]/50 transition-colors group">
                  <div className="flex items-start justify-between">
                    <p className="text-2xl mb-2">{feat.icon}</p>
                    <ChevronRight size={16} className="text-[#bbb] group-hover:text-[#111] transition-colors mt-1" />
                  </div>
                  <p className="font-bold text-[#111] text-sm">{feat.label}</p>
                  <p className="text-xs text-[#999] mt-1">{feat.description}</p>
                </Link>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  // Only owner/manager can access manage page
  if (!['owner', 'manager'].includes(membership.role)) {
    redirect(`/club/${clubId}`)
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <Link
            href={`/club/${clubId}`}
            className="flex items-center gap-1.5 text-[#555] hover:text-[#111] transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-bold text-[#111] text-base">모임 관리</h1>
        </div>
      </header>

      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((feat) => {
            const isDisabled = feat.href === null

            if (isDisabled) {
              return (
                <div
                  key={feat.label}
                  className="bg-white rounded-2xl border border-[#e5e5e5] p-5 opacity-50 cursor-not-allowed"
                >
                  <p className="text-2xl mb-2">{feat.icon}</p>
                  <p className="font-bold text-[#111] text-sm">{feat.label}</p>
                  <p className="text-xs text-[#999] mt-1">{feat.description}</p>
                </div>
              )
            }

            return (
              <Link
                key={feat.label}
                href={feat.href(clubId)}
                className="bg-white rounded-2xl border border-[#e5e5e5] p-5 hover:border-[#beff00]/50 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <p className="text-2xl mb-2">{feat.icon}</p>
                  <ChevronRight
                    size={16}
                    className="text-[#bbb] group-hover:text-[#111] transition-colors mt-1"
                  />
                </div>
                <p className="font-bold text-[#111] text-sm">{feat.label}</p>
                <p className="text-xs text-[#999] mt-1">{feat.description}</p>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
