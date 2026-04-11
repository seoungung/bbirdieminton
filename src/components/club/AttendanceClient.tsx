'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Attendance, ClubMemberWithUser } from '@/types/club'

interface Props {
  sessionId: string
  members: ClubMemberWithUser[]
  initialAttendances: Attendance[]
  isManager: boolean
}

export function AttendanceClient({ sessionId, members, initialAttendances, isManager }: Props) {
  const [attendances, setAttendances] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    for (const a of initialAttendances) {
      map[a.member_id] = a.attended
    }
    return map
  })
  const [pending, startTransition] = useTransition()

  const toggle = (memberId: string) => {
    if (!isManager) return
    const next = !attendances[memberId]

    startTransition(async () => {
      setAttendances((prev) => ({ ...prev, [memberId]: next }))
      const supabase = createClient()
      await supabase.from('attendances').upsert(
        { session_id: sessionId, member_id: memberId, attended: next },
        { onConflict: 'session_id,member_id' }
      )
    })
  }

  const attendedCount = Object.values(attendances).filter(Boolean).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[#111]">
          출석 {attendedCount} / {members.length}명
        </p>
        {!isManager && (
          <span className="text-xs text-[#999]">운영자만 수정 가능</span>
        )}
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const attended = !!attendances[member.id]
          return (
            <button
              key={member.id}
              onClick={() => toggle(member.id)}
              disabled={!isManager || pending}
              className={
                'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ' +
                (attended
                  ? 'bg-[#beff00]/10 border-[#beff00]'
                  : 'bg-white border-[#e5e5e5]') +
                (!isManager ? '' : ' active:scale-[0.99]')
              }
            >
              <div className="flex items-center gap-3">
                {/* 아바타 */}
                <div className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-bold text-[#555] shrink-0 overflow-hidden">
                  {member.user.profile_img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.user.profile_img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    member.user.name.slice(0, 1)
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#111]">{member.user.name}</p>
                  <p className="text-xs text-[#999]">스킬 {member.skill_score}</p>
                </div>
              </div>
              <div
                className={
                  'w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors ' +
                  (attended ? 'bg-[#beff00] text-[#111] font-bold' : 'bg-[#f0f0f0] text-[#bbb]')
                }
              >
                {attended ? '✓' : '–'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
