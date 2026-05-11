import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Users } from 'lucide-react'
import type { ClubDiscoveryItem } from './types'
import { ClubThumbnailFallback } from '@/components/club/cards/ClubThumbnailFallback'
import { isNewClub } from '@/lib/club/isNewClub'

interface Props {
  club: ClubDiscoveryItem
  /** NEW 배지 강제 비활성화. 기본은 createdAt 기준 14일 이내면 자동 노출. */
  hideNewBadge?: boolean
}

/**
 * 리스트형 모임 행 — 첨부 이미지(소모임/네이버카페) 패턴 그대로.
 * 좌측 정사각 썸네일 + 우측 제목·설명·메타 (📍지역 · 👤N · 카테고리).
 * 14일 이내 신규 모임은 제목 옆 'NEW' 배지 자동 노출.
 */
export function ClubsCard({ club, hideNewBadge = false }: Props) {
  const showNew = !hideNewBadge && isNewClub(club.createdAt)

  return (
    <Link
      href={`/clubs/${club.id}`}
      className="group flex items-start gap-4 focus:outline-none"
    >
      {/* 정사각 썸네일 */}
      <div className="relative w-[80px] h-[80px] shrink-0 rounded-2xl overflow-hidden bg-[var(--color-brand-bg-muted)]">
        {club.thumbnailUrl ? (
          <Image
            src={club.thumbnailUrl}
            alt={club.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <ClubThumbnailFallback logoSize={36} />
        )}
      </div>

      {/* 본문 */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-1.5">
          {showNew && (
            <span className="shrink-0 inline-flex items-center rounded-md bg-[#111] text-[var(--color-brand-lime)] px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase">
              NEW
            </span>
          )}
          <h3 className="text-[16px] font-bold text-[var(--color-brand-text)] truncate group-hover:underline">
            {club.name}
          </h3>
        </div>

        {club.description && (
          <p className="mt-1 text-[13px] text-[var(--color-brand-text-sub)] line-clamp-1 leading-snug">
            {club.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[var(--color-brand-text-muted)]">
          {club.location && club.location.trim() && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin size={12} strokeWidth={2.4} className="shrink-0" />
              <span className="truncate">{club.location}</span>
            </span>
          )}
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-0.5">
            <Users size={12} strokeWidth={2.4} className="shrink-0" />
            <span className="tabular-nums">{club.memberCount}</span>
          </span>
          {club.category && club.category.trim() && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{club.category}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
