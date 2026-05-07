'use client'

import { useEffect, useRef, useState } from 'react'
import { ClubsCard } from './ClubsCard'
import type { ClubDiscoveryItem } from './types'

interface Props {
  clubs: ClubDiscoveryItem[]
  /** 그리드 헤더 타이틀 (탭별 가변). 기본값: "전체 모임" */
  title?: string
  /** 빈 상태 안내 문구. 기본값: "등록된 모임이 아직 없어요" */
  emptyMessage?: string
  /** 무한스크롤 활성화. 첨부 이미지의 '전체 모임' 영역에서만 사용. */
  infiniteScroll?: boolean
  /** 무한스크롤 초기 표시 개수. 기본 20. */
  initialBatch?: number
  /** 무한스크롤 추가 로드 batch. 기본 20. */
  loadMore?: number
}

/**
 * 모임 리스트 컨테이너 — 단일 컬럼, 행 사이 여백.
 * 첨부 이미지의 소모임/네이버카페 리스트 패턴.
 * 카드 테두리·디바이더 없음, 행은 단순 gap 으로 구분.
 *
 * `infiniteScroll=true` 일 때 IntersectionObserver 로 sentinel 가시화 → batch 추가 로드.
 */
export function ClubsCardGrid({
  clubs,
  title = '전체 모임',
  emptyMessage = '등록된 모임이 아직 없어요',
  infiniteScroll = false,
  initialBatch = 20,
  loadMore = 20,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(
    infiniteScroll ? Math.min(initialBatch, clubs.length) : clubs.length,
  )
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // clubs 가 바뀌면 가시 개수 리셋 (탭 전환 등)
  useEffect(() => {
    setVisibleCount(
      infiniteScroll ? Math.min(initialBatch, clubs.length) : clubs.length,
    )
  }, [clubs, infiniteScroll, initialBatch])

  // sentinel 이 화면에 들어오면 loadMore 만큼 추가 노출
  useEffect(() => {
    if (!infiniteScroll) return
    if (visibleCount >= clubs.length) return
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisibleCount((prev) => Math.min(prev + loadMore, clubs.length))
          }
        }
      },
      { rootMargin: '300px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [infiniteScroll, visibleCount, clubs.length, loadMore])

  if (clubs.length === 0) {
    return (
      <section className="max-w-[1088px] mx-auto px-4 py-12">
        <div className="rounded-2xl border border-dashed border-[var(--color-brand-border)] bg-[var(--color-surface-sub)] py-16 text-center">
          <p className="text-sm text-[var(--color-brand-text-muted)]">
            {emptyMessage}
          </p>
        </div>
      </section>
    )
  }

  const visibleClubs = clubs.slice(0, visibleCount)
  const hasMore = visibleCount < clubs.length

  return (
    <section className="max-w-[1088px] mx-auto px-4 py-6 md:py-8">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-[var(--color-brand-text)]">
          {title}
          <span className="ml-2 text-sm font-medium text-[var(--color-brand-text-muted)] tabular-nums">
            {clubs.length}개
          </span>
        </h2>
      </div>

      <ul className="flex flex-col gap-5">
        {visibleClubs.map((club) => (
          <li key={club.id}>
            <ClubsCard club={club} />
          </li>
        ))}
      </ul>

      {hasMore && (
        <div
          ref={sentinelRef}
          className="py-6 flex justify-center text-[12px] text-[var(--color-brand-text-muted)]"
        >
          더 불러오는 중…
        </div>
      )}
    </section>
  )
}
