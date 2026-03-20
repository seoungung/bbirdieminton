'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Racket } from '@/types/racket'
import { useCompare } from '@/context/CompareContext'
import { cn } from '@/lib/utils'

function parseFirstUrl(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    const match = trimmed.match(/"([^"]+)"/)
    return match ? match[1] : null
  }
  return trimmed
}

export function RacketCard({ racket }: { racket: Racket }) {
  const firstImage = parseFirstUrl(racket.image_url)
  const { toggle, isSelected, isFull } = useCompare()
  const selected = isSelected(racket.slug)

  return (
    <div className="relative group">
      <Link href={'/rackets/' + racket.slug} className="block">
        <article className="rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            {firstImage ? (
              <Image
                src={firstImage}
                alt={racket.name}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-3xl">🏸</span>
              </div>
            )}
            {racket.editor_pick && (
              <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                에디터 픽
              </span>
            )}
            {racket.is_popular && !racket.editor_pick && (
              <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                인기
              </span>
            )}
          </div>

          <div className="p-3">
            <p className="text-[13px] text-muted-foreground mb-0.5 font-medium">{racket.brand}</p>
            <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {racket.name}
            </h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {racket.type.map((t) => (
                <span key={t} className="text-[12px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">
                  {t}
                </span>
              ))}
              {racket.level.slice(0, 2).map((l) => (
                <span key={l} className="text-[12px] border border-border text-muted-foreground px-1.5 py-0.5 rounded-full">
                  {l}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-[13px] text-muted-foreground">
              <span className="font-medium">{racket.weight ?? '-'}</span>
              <span>{racket.price_range ?? '-'}</span>
            </div>
          </div>
        </article>
      </Link>

      {/* 비교 버튼 */}
      <button
        onClick={() => toggle({ slug: racket.slug, name: racket.name })}
        disabled={!selected && isFull}
        className={cn(
          'absolute top-2 right-2 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors',
          selected
            ? 'bg-black text-[#beff00] border-black'
            : 'bg-[#beff00] text-black border-[#beff00] hover:bg-[#a8e600] hover:border-[#a8e600]',
          !selected && isFull && 'opacity-30 cursor-not-allowed'
        )}
      >
        {selected ? '✓ 비교중' : '비교'}
      </button>
    </div>
  )
}
