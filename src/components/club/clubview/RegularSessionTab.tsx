'use client'

import { useState, useTransition } from 'react'
import { createClubEventAction, toggleEventAttendanceAction } from '@/app/club/[clubId]/events/actions'
import {
  RegularSessionItem,
  MemberViewItem,
  UserStatus,
  AVATAR_COLORS,
  calcDDay,
  formatShortDate,
  startTime,
  shareClubSession,
} from './types'
import { DDayBadge, AvatarRow } from './SharedUI'

// ── CreateSessionModal ──────────────────────────────────

const EMPTY_FORM = { title: '', date: '', startTime: '', endTime: '', place: '', fee: '', maxAttend: '' }

function CreateSessionModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (data: typeof EMPTY_FORM) => void
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-[480px] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e5]">
          <h2 className="text-lg font-extrabold text-[#111]">정기모임 만들기</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] text-[#888] transition-colors text-xl">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-[#555] mb-1.5">모임 제목 <span className="text-red-400">*</span></label>
            <input type="text" placeholder="예: 토요일 오전민턴" value={form.title} onChange={set('title')}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#555] mb-1.5">날짜 <span className="text-red-400">*</span></label>
            <input type="date" value={form.date} onChange={set('date')}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#555] mb-1.5">시작 시간 <span className="text-red-400">*</span></label>
              <input type="time" value={form.startTime} onChange={set('startTime')}
                className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#555] mb-1.5">종료 시간</label>
              <input type="time" value={form.endTime} onChange={set('endTime')}
                className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#555] mb-1.5">장소 <span className="text-red-400">*</span></label>
            <input type="text" placeholder="예: 국사봉체육관" value={form.place} onChange={set('place')}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#555] mb-1.5">비용 <span className="text-[#bbb] font-normal">(선택)</span></label>
            <input type="text" placeholder="예: 국사봉 입장비용" value={form.fee} onChange={set('fee')}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#555] mb-1.5">최대 참석 인원 <span className="text-red-400">*</span></label>
            <input type="number" min="1" max="100" placeholder="예: 24" value={form.maxAttend} onChange={set('maxAttend')}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#e5e5e5] flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#e5e5e5] text-sm font-bold text-[#555] hover:bg-[#f8f8f8] transition-colors">취소</button>
          <button
            onClick={() => onSubmit(form)}
            disabled={!form.title || !form.date || !form.startTime || !form.place || !form.maxAttend}
            className="flex-1 py-3 rounded-xl bg-[#beff00] text-[#111] text-sm font-extrabold hover:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >만들기</button>
        </div>
      </div>
    </div>
  )
}

// ── RegularSessionTab ───────────────────────────────────

interface Props {
  regularSessions: RegularSessionItem[]
  members: MemberViewItem[]
  userStatus: UserStatus
  clubId: string
  onShowToast: (msg: string) => void
  myMemberId?: string | null
}

export function RegularSessionTab({ regularSessions, members, userStatus, clubId, onShowToast, myMemberId }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [, startEventTransition] = useTransition()
  const [attendPending, startAttendTransition] = useTransition()

  const handleShare = async (s: RegularSessionItem) => {
    await shareClubSession(s, clubId, () => onShowToast('링크가 복사됐어요!'))
  }

  const handleCreate = (data: typeof EMPTY_FORM) => {
    setShowCreateModal(false)
    if (userStatus !== 'member' || !myMemberId) {
      onShowToast('로그인 후 정기모임을 만들 수 있어요')
      return
    }
    startEventTransition(async () => {
      const result = await createClubEventAction(clubId, myMemberId, {
        title: data.title,
        event_date: data.date,
        start_time: data.startTime,
        end_time: data.endTime || undefined,
        place: data.place,
        fee: data.fee || undefined,
        max_attend: parseInt(data.maxAttend) || 20,
      })
      if (result.error) {
        onShowToast(result.error)
      } else {
        onShowToast(`"${data.title}" 일정이 추가됐어요!`)
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-base font-bold text-[#555]">정기모임 {regularSessions.length}개</p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-[#111] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#333] transition-colors"
        >
          <span className="text-base leading-none">+</span>
          정기모임 만들기
        </button>
      </div>

      {regularSessions.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-base font-semibold text-[#555]">등록된 정기모임이 없어요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {regularSessions.map((s, si) => {
            const dDay = calcDDay(s.nextDate)
            const isClosed = dDay < 0
            const attendeeNames = members.slice(0, Math.min(4, s.currentAttend)).map(m => m.name)

            return (
              <div key={s.id} className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <DDayBadge dDay={dDay} />
                    <p className="text-lg font-bold text-[#111]">{s.title}</p>
                  </div>

                  <div className="flex gap-5 items-start">
                    <div className="flex-1 space-y-3">
                      {[
                        { label: '일시', value: `${formatShortDate(s.nextDate, s.dayOfWeek)} ${startTime(s.time)}` },
                        { label: '위치', value: s.place },
                        ...(s.fee ? [{ label: '비용', value: s.fee }] : []),
                        { label: '참석', value: `${s.currentAttend}명 참석중 (${s.currentAttend}/${s.maxAttend})` },
                      ].map(row => (
                        <div key={row.label} className="flex items-start gap-3">
                          <span className="text-sm text-[#999] w-8 shrink-0">{row.label}</span>
                          <span className="text-sm text-[#111] font-medium">{row.value}</span>
                        </div>
                      ))}

                      {attendeeNames.length > 0 && (
                        <AvatarRow
                          names={attendeeNames}
                          count={s.currentAttend}
                          colorOffset={si * 4}
                        />
                      )}
                    </div>

                    <div
                      className="w-[200px] h-[200px] rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: s.thumbnailColor }}
                    >
                      <span className="text-8xl select-none">🏸</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#f0f0f0]">
                    <button
                      onClick={() => handleShare(s)}
                      className="w-11 h-11 rounded-xl bg-[#f8f8f8] flex items-center justify-center hover:bg-[#f0f0f0] transition-all active:scale-90"
                      aria-label="공유하기"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </button>

                    <div className="flex-1" />

                    {!isClosed && userStatus === 'member' && myMemberId ? (
                      <button
                        onClick={() => {
                          const newStatus = s.isAttending ? 'not_going' : 'going'
                          startAttendTransition(async () => {
                            const result = await toggleEventAttendanceAction(s.id, myMemberId, clubId, newStatus)
                            if (result.error) onShowToast(result.error)
                          })
                        }}
                        disabled={attendPending}
                        className={`font-bold text-base px-7 py-2.5 rounded-xl transition-all disabled:opacity-50 ${
                          s.isAttending
                            ? 'bg-[#111] text-white hover:bg-[#333]'
                            : 'bg-[#beff00] text-[#111] hover:brightness-95'
                        }`}
                      >
                        {s.isAttending ? '참석 취소' : '참석'}
                      </button>
                    ) : !isClosed ? (
                      <button disabled className="bg-[#beff00] text-[#111] font-bold text-base px-7 py-2.5 rounded-xl opacity-35 cursor-not-allowed" title="모임 멤버만 참석할 수 있어요">
                        참석
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateSessionModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} />
      )}
    </>
  )
}
