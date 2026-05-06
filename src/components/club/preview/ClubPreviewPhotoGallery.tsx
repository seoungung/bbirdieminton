'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ClubPreviewPhotoLightbox } from './ClubPreviewPhotoLightbox'

interface Props {
  photos: string[]
  clubName: string
}

/**
 * 활동 사진 갤러리 — Hero-leader (1장) + 2-col grid (나머지).
 * 0장이면 섹션 숨김.
 * 사진 클릭 시 풀스크린 라이트박스 (Phase B).
 */
export function ClubPreviewPhotoGallery({ photos, clubName }: Props) {
  const list = photos.filter((u) => typeof u === 'string' && u.length > 0).slice(0, 6)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (list.length === 0) return null

  const [first, ...rest] = list

  const openAt = (i: number) => setLightboxIndex(i)

  return (
    <section>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#bbb] mb-2.5">
        활동 사진
      </p>

      <div className="grid grid-cols-2 gap-1.5">
        {/* 첫 번째 — 가로로 풀 폭, 16:10 */}
        <button
          type="button"
          onClick={() => openAt(0)}
          aria-label={`${clubName} 활동 사진 1 크게 보기`}
          className="col-span-2 relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#f0f0f0] cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-ink)]"
        >
          <Image
            src={first}
            alt={`${clubName} 활동 사진 1`}
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover transition-transform hover:scale-[1.015]"
          />
        </button>

        {rest.map((url, i) => {
          const idx = i + 1
          return (
            <button
              key={url + i}
              type="button"
              onClick={() => openAt(idx)}
              aria-label={`${clubName} 활동 사진 ${idx + 1} 크게 보기`}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#f0f0f0] cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-ink)]"
            >
              <Image
                src={url}
                alt={`${clubName} 활동 사진 ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 360px"
                className="object-cover transition-transform hover:scale-[1.015]"
              />
            </button>
          )
        })}
      </div>

      {lightboxIndex !== null && (
        <ClubPreviewPhotoLightbox
          photos={list}
          initialIndex={lightboxIndex}
          clubName={clubName}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  )
}
