import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Users } from 'lucide-react'
import type { ClubDiscoveryItem } from './types'
import { ClubThumbnailFallback } from '@/components/club/cards/ClubThumbnailFallback'

interface Props {
  club: ClubDiscoveryItem
}

/**
 * 리스트형 모임 행 — 소모임/네이버카페 패턴.
 * 좌측 정사각 썸네일 + 우측 제목·설명·메타.
 */
export function ClubsCard({ club }: Props) {
  const isAccepting = club.isAcceptingMembers ?? true
  const meta = [
    club.location && club.location.trim() ? club.location : null,
    `${club.memberCount}명`,
    club.category && club.category.trim() ? club.category : null,
  ].filter(Boolean) as string[]

  return (
    <Link
      href={`/clubs/${club.id}`}
      className="group flex items-start gap-4 py-4 px-4 sm:px-5 hover:bg-[var(--color-brand-bg-sub)] transition-colors focus:outline-none focus-visible:bg-[var(--color-brand-bg-sub)]"
    >
      {/* 정사각 썸네일 */}
      <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-[var(--color-brand-bg-muted)]">
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
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-[15px] font-bold text-[var(--color-brand-text)] truncate">
            {club.name}
          </h3>
          {club.isDemo && (
            <span className="shrink-0 inline-flex items-center rounded-md bg-[var(--color-brand-streak-bg)] text-[var(--color-brand-streak)] px-1.5 py-0.5 text-[10px] font-bold tracking-wide">
              체험
            </span>
          )}
          {!club.isDemo && !isAccepting && (
            <span className="shrink-0 inline-flex items-center rounded-md bg-[var(--color-brand-text-muted)] text-white px-1.5 py-0.5 text-[10px] font-bold tracking-wide">
              마감
            </span>
          )}
        </div>

        {club.description && (
          <p className="text-[13px] text-[var(--color-brand-text-sub)] line-clamp-1 leading-snug mb-1.5">
            {club.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-brand-text-muted)] flex-wrap">
          {meta.map((item, i) => {
            const isLocation = i === 0 && club.location && club.location.trim()
            const isMembers = item.endsWith('명')
            return (
              <span key={i} className="inline-flex items-center gap-0.5">
                {i > 0 && <span className="mr-1.5">·</span>}
                {isLocation && (
                  <MapPin size={11} strokeWidth={2.4} className="shrink-0" />
                )}
                {isMembers && (
                  <Users size={11} strokeWidth={2.4} className="shrink-0" />
                )}
                <span className="truncate max-w-[140px]">{item}</span>
              </span>
            )
          })}
        </div>
      </div>
    </Link>
  )
}
