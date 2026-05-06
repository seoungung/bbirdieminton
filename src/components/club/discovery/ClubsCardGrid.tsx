import { ClubsCard } from './ClubsCard'
import type { ClubDiscoveryItem } from './types'

interface Props {
  clubs: ClubDiscoveryItem[]
  /** 그리드 헤더 타이틀 (탭별 가변). 기본값: "전체 모임" */
  title?: string
  /** 빈 상태 안내 문구. 기본값: "등록된 모임이 아직 없어요" */
  emptyMessage?: string
}

export function ClubsCardGrid({
  clubs,
  title = '전체 모임',
  emptyMessage = '등록된 모임이 아직 없어요',
}: Props) {
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

  return (
    <section className="max-w-[1088px] mx-auto px-4 py-6 md:py-8">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-[var(--color-text-strong)]">
          {title}
          <span className="ml-2 text-sm font-medium text-[var(--color-brand-text-muted)] tabular-nums">
            {clubs.length}개
          </span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club) => (
          <ClubsCard key={club.id} club={club} />
        ))}
      </div>
    </section>
  )
}
