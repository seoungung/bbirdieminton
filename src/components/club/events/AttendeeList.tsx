'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { GradeBadge } from '@/components/club/GradeBadge'
import type { AttendeeRow } from './types'

interface Props {
  going: AttendeeRow[]
  notGoing: AttendeeRow[]
}

export function AttendeeList({ going, notGoing }: Props) {
  const [showNotGoing, setShowNotGoing] = useState(false)

  return (
    <section className="bg-white rounded-3xl border border-[#e5e5e5] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-extrabold text-[#999] uppercase tracking-widest">
          참가 ({going.length}명)
        </p>
      </div>
      {going.length === 0 ? (
        <p className="text-sm text-[#bbb] text-center py-6">아직 참가자가 없어요</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {going.map((m) => (
            <li
              key={m.member_id}
              className="flex items-center gap-2.5 bg-[#fafafa] rounded-xl px-3 py-2"
            >
              <GradeBadge score={m.skill} size="xs" />
              <span className="text-sm font-semibold text-[#111] truncate">{m.name}</span>
            </li>
          ))}
        </ul>
      )}

      {notGoing.length > 0 && (
        <div className="mt-4 border-t border-[#f0f0f0] pt-3">
          <button
            onClick={() => setShowNotGoing((v) => !v)}
            className="w-full inline-flex items-center justify-between text-[12px] font-semibold text-[#555] hover:text-[#111] transition-colors"
          >
            <span>불참 ({notGoing.length}명)</span>
            {showNotGoing ? (
              <ChevronUp size={14} className="text-[#999]" />
            ) : (
              <ChevronDown size={14} className="text-[#999]" />
            )}
          </button>
          {showNotGoing && (
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {notGoing.map((m) => (
                <li
                  key={m.member_id}
                  className="flex items-center gap-2.5 bg-[#fafafa] rounded-xl px-3 py-2 opacity-70"
                >
                  <GradeBadge score={m.skill} size="xs" />
                  <span className="text-sm font-medium text-[#555] truncate">{m.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
