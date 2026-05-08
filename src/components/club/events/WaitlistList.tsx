'use client'

import { Clock } from 'lucide-react'
import { scoreToGrade } from '@/lib/club/grade'
import type { WaitlistEntry } from './types'

interface Props {
  entries: WaitlistEntry[]
  /** 본인 member_id — 본인 행 강조용 */
  myMemberId?: string | null
}

/**
 * 대기 명단 — position 순서대로 표시.
 * 출석 명단(AttendeeList) 아래에 노출.
 * 빈 명단이면 섹션 자체 숨김.
 */
export function WaitlistList({ entries, myMemberId }: Props) {
  if (entries.length === 0) return null

  return (
    <section className="bg-white rounded-3xl border border-[#e5e5e5] p-5">
      <header className="flex items-baseline justify-between mb-3">
        <h2 className="text-[15px] font-extrabold text-[#111] inline-flex items-center gap-1.5">
          <Clock size={15} strokeWidth={2.4} className="text-[#999]" />
          대기 명단
          <span className="text-[#999] font-semibold tabular-nums">
            {entries.length}
          </span>
        </h2>
        <p className="text-[11px] text-[#999]">
          자리가 나면 1번부터 자동 승격
        </p>
      </header>

      <ul className="divide-y divide-[#f4f4f4]">
        {entries.map((e) => {
          const isMine = myMemberId && e.member_id === myMemberId
          const grade = scoreToGrade(e.skill)
          return (
            <li
              key={e.member_id}
              className={
                'flex items-center gap-3 py-2.5 ' +
                (isMine ? 'bg-[var(--color-brand-bg-sub)] -mx-2 px-2 rounded-lg' : '')
              }
            >
              <span
                className={
                  'inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-extrabold tabular-nums shrink-0 ' +
                  (e.position === 1
                    ? 'bg-[var(--color-brand-streak-soft)] text-[#92400e]'
                    : 'bg-[#f0f0f0] text-[#666]')
                }
                aria-label={`${e.position}번 대기`}
              >
                {e.position}
              </span>
              <span className="flex-1 min-w-0 text-[13.5px] font-semibold text-[#111] truncate">
                {e.name}
                {isMine && (
                  <span className="ml-1.5 text-[11px] font-bold text-[var(--color-brand-court-deep)]">
                    (나)
                  </span>
                )}
              </span>
              <span className="text-[11px] font-bold text-[#999] shrink-0">
                {grade}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
