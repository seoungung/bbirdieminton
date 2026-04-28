'use client'

import Image from 'next/image'
import { Crown, ChevronDown } from 'lucide-react'
import type { ClubPreviewMember } from '@/types/club'

interface Props {
  members: ClubPreviewMember[]
  totalCount: number
}

const NEW_THRESHOLD_DAYS = 7

/**
 * 모임 멤버 미리보기 — 최근 가입 10명까지만 노출.
 * 비멤버는 "전체 멤버 보기" 클릭해도 진입 불가 (가입 유도 텍스트로 대체).
 */
export function ClubPreviewMembers({ members, totalCount }: Props) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[16px] font-bold text-[#111]">
          모임 멤버 <span className="text-[#999] font-semibold">({totalCount})</span>
        </h3>
        <span className="text-[11px] font-medium text-[#999] inline-flex items-center gap-0.5">
          최근 가입
          <ChevronDown size={12} strokeWidth={2.2} />
        </span>
      </div>

      {members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ebebeb] bg-[#fafafa] px-4 py-8 text-center">
          <p className="text-[13px] text-[#999]">아직 멤버가 없어요.</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {members.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </ul>
      )}

      {totalCount > members.length && (
        <p className="mt-3 text-center text-[12px] text-[#999]">
          가입하면 전체 멤버 {totalCount}명을 볼 수 있어요.
        </p>
      )}
    </section>
  )
}

// ── Row ───────────────────────────────────────────────────────

function MemberRow({ member }: { member: ClubPreviewMember }) {
  const initial = member.name.charAt(0).toUpperCase()
  const isNew = isRecentJoin(member.joined_at)
  const isOwner = member.role === 'owner'

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Avatar
        name={member.name}
        profileImg={member.profile_img}
        initial={initial}
      />
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <p className="text-[14px] font-semibold text-[#111] truncate">
          {member.name}
        </p>
        {isNew && (
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[var(--color-brand-lime)] text-[#111] uppercase tracking-wider">
            NEW
          </span>
        )}
        {isOwner && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-brand-streak-soft)] text-[#92400e]">
            <Crown size={10} strokeWidth={2.5} />
            모임장
          </span>
        )}
      </div>
    </li>
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
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#f0f0f0] shrink-0">
        <Image
          src={profileImg}
          alt={name}
          fill
          sizes="40px"
          className="object-cover"
        />
      </div>
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0">
      <span className="text-[14px] font-bold text-[#666]">{initial}</span>
    </div>
  )
}

// ── 헬퍼 ──────────────────────────────────────────────────────

function isRecentJoin(joinedAtIso: string): boolean {
  const joined = new Date(joinedAtIso).getTime()
  if (Number.isNaN(joined)) return false
  const diffDays = (Date.now() - joined) / (24 * 60 * 60 * 1000)
  return diffDays <= NEW_THRESHOLD_DAYS
}
