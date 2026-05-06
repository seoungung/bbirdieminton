import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Users } from 'lucide-react'
import type { ClubDiscoveryItem } from './types'

interface Props {
  club: ClubDiscoveryItem
}

export function ClubsCard({ club }: Props) {
  const isAccepting = club.isAcceptingMembers ?? true
  const fallbackBg = club.thumbnailColor || 'var(--color-brand-bg-muted)'

  return (
    <Link
      href={`/clubs/${club.id}`}
      className="group block bg-white border border-[var(--color-brand-border)] rounded-2xl overflow-hidden transition-all hover:border-[var(--color-brand-lime)] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-lime)] focus-visible:ring-offset-2"
    >
      {/* 썸네일 영역 */}
      <div
        className="relative aspect-[16/10] flex items-center justify-center"
        style={{ background: fallbackBg }}
      >
        {club.thumbnailUrl ? (
          <Image
            src={club.thumbnailUrl}
            alt={club.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <Image
            src="/symbol_birdieminton-black.png"
            alt=""
            width={48}
            height={48}
            className="opacity-30"
            aria-hidden
          />
        )}

        {/* 상태 배지 */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
          {club.isDemo && (
            <span className="inline-flex items-center rounded-full bg-[var(--color-brand-streak-bg)] text-[var(--color-brand-streak)] px-2 py-0.5 text-[10px] font-bold tracking-wide">
              체험
            </span>
          )}
          {!club.isDemo && (
            <span
              className={
                isAccepting
                  ? 'inline-flex items-center rounded-full bg-[var(--color-brand-court)] text-white px-2 py-0.5 text-[10px] font-bold tracking-wide'
                  : 'inline-flex items-center rounded-full bg-[var(--color-brand-text-muted)] text-white px-2 py-0.5 text-[10px] font-bold tracking-wide'
              }
            >
              {isAccepting ? '모집중' : '정원 마감'}
            </span>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="p-4 space-y-2">
        <div>
          <h3 className="text-base font-bold text-[var(--color-text-strong)] truncate">
            {club.name}
          </h3>
          <p className="text-xs text-[var(--color-brand-text-sub)] truncate flex items-center gap-1 mt-0.5">
            <MapPin size={11} strokeWidth={2.4} className="shrink-0" />
            <span>
              {club.location || '지역 미설정'}
              {club.activityPlace && ` · ${club.activityPlace}`}
            </span>
          </p>
        </div>

        <div className="border-t border-[var(--color-brand-border-sub)] pt-2 flex items-center justify-between text-xs text-[var(--color-brand-text-sub)]">
          <span className="inline-flex items-center gap-1">
            <Users size={11} strokeWidth={2.4} />
            <span className="tabular-nums">{club.memberCount}명</span>
          </span>
          {club.courtCount > 0 && (
            <span className="text-[var(--color-brand-text-muted)]">
              코트 {club.courtCount}개
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
