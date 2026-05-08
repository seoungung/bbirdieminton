'use client'

import Image from 'next/image'
import { Crown, Star } from 'lucide-react'

interface AdminItem {
  name: string
  profileImg: string | null
  bio: string | null
  /** 'owner' (모임장 — gold crown) | 'manager' (매니저 — pink star) */
  role: 'owner' | 'manager'
}

interface Props {
  ownerName: string | null
  ownerProfileImg: string | null
  ownerBio: string | null
  /** 운영자가 settings 에서 입력한 공개 연락처 — preview 카드 자체에는 표시 X (sticky CTA 영역으로 이전 검토) */
  contactUrl?: string | null
  /** mailto: 의 subject 등에서 사용할 클럽명 (선택) */
  clubName?: string
  /** 추가 매니저 — 향후 RPC 확장 시 주입. 비면 owner 1명만 노출. */
  managers?: Array<Omit<AdminItem, 'role'>>
}

/**
 * 운영진 — 가로 스크롤 그리드 카드 (소모임 패턴).
 *  ┌──────────┐ ┌──────────┐ ┌──────────┐
 *  │   ◯      │ │   ◯      │ │   ◯      │  대형 원형 프로필
 *  │ ★ 박영준 │ │ ★ 여민녕 │ │ ★ 정준표 │  이름 + 뱃지(crown/star)
 *  │  운동    │ │   🧸     │ │  운동    │  bio (선택)
 *  └──────────┘ └──────────┘ └──────────┘
 */
export function ClubPreviewOwnerCard({
  ownerName,
  ownerProfileImg,
  ownerBio,
  managers,
}: Props) {
  if (!ownerName) return null

  const admins: AdminItem[] = [
    { name: ownerName, profileImg: ownerProfileImg, bio: ownerBio, role: 'owner' },
    ...(managers ?? []).map((m) => ({ ...m, role: 'manager' as const })),
  ]

  return (
    <section>
      <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[var(--color-text-strong)] mb-3">
        운영진
      </h2>

      {/* 가로 스크롤 — 5명+ 시 모바일/태블릿에서 스와이프, lg+ 에서 자동 줄바꿈(grid) */}
      <ul className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:grid lg:grid-cols-7 lg:overflow-visible lg:gap-3 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d4d4d4] [&::-webkit-scrollbar-track]:bg-transparent">
        {admins.map((a, i) => (
          <li
            key={`${a.name}-${i}`}
            className="shrink-0 w-[126px] sm:w-[140px] lg:w-auto"
          >
            <AdminCard admin={a} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function AdminCard({ admin }: { admin: AdminItem }) {
  const initial = admin.name.charAt(0).toUpperCase()
  return (
    <div className="rounded-2xl bg-[#f5f5f5] px-3 py-4 flex flex-col items-center text-center">
      <Avatar name={admin.name} profileImg={admin.profileImg} initial={initial} />
      <div className="mt-3 inline-flex items-center gap-1">
        <RoleBadge role={admin.role} />
        <span className="text-[14px] font-bold text-[#111] truncate max-w-[100px]">
          {admin.name}
        </span>
      </div>
      {admin.bio && admin.bio.trim() && (
        <p className="mt-1.5 text-[12px] text-[#999] leading-snug line-clamp-1 max-w-[120px]">
          {admin.bio.trim()}
        </p>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: 'owner' | 'manager' }) {
  if (role === 'owner') {
    return (
      <span
        className="inline-flex w-4 h-4 rounded-full bg-[#fbbf24] items-center justify-center shrink-0"
        aria-label="모임장"
      >
        <Crown size={9} strokeWidth={2.5} className="text-white" />
      </span>
    )
  }
  return (
    <span
      className="inline-flex w-4 h-4 rounded-full bg-[#fbcfe8] items-center justify-center shrink-0"
      aria-label="매니저"
    >
      <Star size={9} strokeWidth={2.5} className="text-white" fill="currentColor" />
    </span>
  )
}

function Avatar({
  name,
  profileImg,
  initial,
}: {
  name: string
  profileImg: string | null
  initial: string
}) {
  if (profileImg) {
    /* 카카오 등 외부 프로필 이미지가 http:// 인 경우 — https 강제 변환 (보안 + 호환) */
    const safeSrc = profileImg.startsWith('http://')
      ? profileImg.replace(/^http:\/\//, 'https://')
      : profileImg
    return (
      <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-white shrink-0 ring-1 ring-[#e5e5e5]">
        <Image
          src={safeSrc}
          alt={name}
          fill
          sizes="72px"
          className="object-cover"
        />
      </div>
    )
  }
  return (
    <div className="w-[72px] h-[72px] rounded-full bg-white ring-1 ring-[#e5e5e5] flex items-center justify-center shrink-0">
      <span className="text-[24px] font-bold text-[#999]">{initial}</span>
    </div>
  )
}
