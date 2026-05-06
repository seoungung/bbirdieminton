import Link from 'next/link'
import Image from 'next/image'
import type { ClubDiscoveryItem } from './types'

interface Props {
  club: ClubDiscoveryItem
}

export function ClubsMiniCard({ club }: Props) {
  const fallbackBg = club.thumbnailColor || 'var(--color-brand-bg-muted)'
  return (
    <Link
      href={`/clubs/${club.id}`}
      className="group block w-[180px] sm:w-[200px] shrink-0 bg-white border border-[var(--color-brand-border)] rounded-2xl overflow-hidden transition-all hover:border-[var(--color-brand-lime)] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-lime)] focus-visible:ring-offset-2"
    >
      <div
        className="relative aspect-square flex items-center justify-center"
        style={{ background: fallbackBg }}
      >
        {club.thumbnailUrl ? (
          <Image
            src={club.thumbnailUrl}
            alt={club.name}
            fill
            sizes="200px"
            className="object-cover"
          />
        ) : (
          <Image
            src="/symbol_birdieminton-black.png"
            alt=""
            width={36}
            height={36}
            className="opacity-30"
            aria-hidden
          />
        )}
        {club.isDemo && (
          <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-[var(--color-brand-streak-bg)] text-[var(--color-brand-streak)] px-1.5 py-0 text-[10px] font-bold">
            체험
          </span>
        )}
      </div>
      <div className="p-3 space-y-0.5">
        <h4 className="text-sm font-bold text-[var(--color-text-strong)] truncate">{club.name}</h4>
        <p className="text-xs text-[var(--color-brand-text-sub)] truncate">
          {club.location || '지역 미설정'} · {club.memberCount}명
        </p>
      </div>
    </Link>
  )
}
