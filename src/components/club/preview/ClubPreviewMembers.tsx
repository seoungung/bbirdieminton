'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Crown, ChevronDown } from 'lucide-react'
import type { ClubPreviewMember } from '@/types/club'

interface Props {
  members: ClubPreviewMember[]
  totalCount: number
}

const NEW_THRESHOLD_DAYS = 7
const INITIAL_LIMIT = 9 // 3 컬럼 × 3 행

/**
 * 모임 멤버 미리보기 — 3 컬럼 그리드 카드.
 * 10명 초과 시 "모임 멤버 더보기" 버튼으로 전체 펼침.
 * 비멤버 가입 유도 안내 — 가입 후 전체 N명 노출.
 */
export function ClubPreviewMembers({ members, totalCount }: Props) {
  const [expanded, setExpanded] = useState(false)
  const showAll = expanded || members.length <= INITIAL_LIMIT
  const visible = showAll ? members : members.slice(0, INITIAL_LIMIT)
  const hasMoreToReveal = !showAll && members.length > INITIAL_LIMIT

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[var(--color-text-strong)]">
          모임 멤버 <span className="text-[#999] font-semibold tabular-nums">{totalCount}</span>
        </h2>
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
        <>
          {/* 3 컬럼 그리드 — 모바일 2 / sm+ 3 */}
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {visible.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </ul>

          {hasMoreToReveal && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-4 w-full h-11 rounded-xl border border-[#e5e5e5] bg-white text-[14px] font-bold text-[#111] hover:bg-[#fafafa] transition-colors"
            >
              모임 멤버 더보기 ({members.length - INITIAL_LIMIT}명)
            </button>
          )}

          {showAll && totalCount > members.length && (
            <p className="mt-4 text-center text-[12px] text-[#999]">
              가입하면 전체 멤버 {totalCount}명을 볼 수 있어요.
            </p>
          )}
        </>
      )}
    </section>
  )
}

// ── Card ───────────────────────────────────────────────────────

function MemberCard({ member }: { member: ClubPreviewMember }) {
  const initial = member.name.charAt(0).toUpperCase()
  const isNew = isRecentJoin(member.joined_at)
  const isOwner = member.role === 'owner'

  return (
    <li className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-[#fafafa] border border-[#f0f0f0]">
      <Avatar
        name={member.name}
        profileImg={member.profile_img}
        initial={initial}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[14px] font-semibold text-[#111] truncate">
            {member.name}
          </p>
          {isNew && (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[var(--color-brand-lime)] text-[#111] uppercase tracking-wider shrink-0">
              NEW
            </span>
          )}
        </div>
        {isOwner && (
          <span className="inline-flex items-center gap-0.5 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-brand-streak-soft)] text-[#92400e]">
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
    const safeSrc = profileImg.startsWith('http://')
      ? profileImg.replace(/^http:\/\//, 'https://')
      : profileImg
    return (
      <div className="relative w-11 h-11 rounded-full overflow-hidden bg-[#f0f0f0] shrink-0">
        <Image
          src={safeSrc}
          alt={name}
          fill
          sizes="44px"
          className="object-cover"
        />
      </div>
    )
  }
  return (
    <div className="w-11 h-11 rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0">
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
