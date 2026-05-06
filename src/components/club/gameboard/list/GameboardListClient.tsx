'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Gamepad2, ChevronDown, ChevronUp } from 'lucide-react'
import { SessionCard } from './SessionCard'

export interface SessionItem {
  id: string
  session_date: string
  status: 'in_progress' | 'closed'
  court_count: number
  notes: string | null
  created_at: string
  event_id: string | null
  event: { id: string; title: string; event_date: string; place: string | null } | null
  attendance_count: number
}

interface Props {
  clubId: string
  grouped: {
    in_progress: SessionItem[]
    closed: SessionItem[]
  }
}

export function GameboardListClient({ clubId, grouped }: Props) {
  const total = grouped.in_progress.length + grouped.closed.length
  const isEmpty = total === 0

  const closedDefaultExpanded = grouped.closed.length <= 5
  const [closedExpanded, setClosedExpanded] = useState(closedDefaultExpanded)

  const newUrl = `/club/${clubId}/gameboard/new`

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-5 space-y-5">
      {/* Top action row */}
      <div className="flex justify-end">
        <Link
          href={newUrl}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--color-brand-lime)] text-[var(--color-brand-ink)] rounded-xl px-4 py-2.5 font-semibold text-sm hover:bg-[var(--color-brand-lime-dim)] transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          게임보드 만들기
        </Link>
      </div>

      {isEmpty ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-bg-muted)] flex items-center justify-center mb-4">
            <Gamepad2 size={32} className="text-[var(--color-brand-text-muted)]" strokeWidth={1.5} />
          </div>
          <p className="text-lg font-bold text-[var(--color-brand-text)] mb-1">
            아직 게임보드가 없습니다
          </p>
          <p className="text-sm text-[var(--color-brand-text-sub)] mb-6">
            첫 게임을 만들어 보세요
          </p>
          <Link
            href={newUrl}
            className="flex items-center gap-2 bg-[var(--color-brand-lime)] text-[var(--color-brand-ink)] rounded-xl px-5 py-3 font-semibold text-sm hover:bg-[var(--color-brand-lime-dim)] transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            게임보드 만들기
          </Link>
        </div>
      ) : (
        <>
          {/* 현재 진행중 */}
          {grouped.in_progress.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-court)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-brand-court)]" />
                </span>
                <h2 className="text-[13px] font-bold text-[var(--color-brand-text-sub)] uppercase tracking-wide">
                  현재 진행중 ({grouped.in_progress.length})
                </h2>
              </div>
              <div className="space-y-2.5">
                {grouped.in_progress.map(s => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    href={`/club/${clubId}/gameboard/${s.id}`}
                    cta="재개하기"
                    variant="in_progress"
                  />
                ))}
              </div>
            </section>
          )}

          {/* 종료 모임 */}
          {grouped.closed.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-bold text-[var(--color-brand-text-sub)] uppercase tracking-wide">
                  종료 모임 ({grouped.closed.length})
                </h2>
                {grouped.closed.length > 5 && (
                  <button
                    onClick={() => setClosedExpanded(p => !p)}
                    className="flex items-center gap-1 text-[12px] text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-text-sub)] transition-colors"
                  >
                    {closedExpanded ? (
                      <>접기 <ChevronUp size={13} /></>
                    ) : (
                      <>펼치기 <ChevronDown size={13} /></>
                    )}
                  </button>
                )}
              </div>
              {closedExpanded && (
                <div className="space-y-2">
                  {grouped.closed.map(s => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      href={`/club/${clubId}/gameboard/${s.id}`}
                      cta="자세히 보기"
                      variant="closed"
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
