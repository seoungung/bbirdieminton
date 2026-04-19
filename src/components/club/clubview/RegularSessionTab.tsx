'use client'

import { useState, useTransition } from 'react'
import {
  createClubEventAction,
  updateClubEventAction,
  deleteClubEventAction,
  toggleEventAttendanceAction,
} from '@/app/club/[clubId]/events/actions'
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

// ── 공통 폼 상수 ────────────────────────────────────

const EMPTY_FORM = { title: '', date: '', startTime: '', endTime: '', place: '', fee: '', maxAttend: '' }

type EventForm = typeof EMPTY_FORM

// ── 공통 입력 필드 ──────────────────────────────────

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#555] mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors'

// ── EventFormModal — Create / Edit 겸용 ─────────────

function EventFormModal({
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  initial?: Partial<EventForm>
  onClose: () => void
  onSubmit: (data: EventForm) => void
}) {
  const [form, setForm] = useState<EventForm>({ ...EMPTY_FORM, ...initial })
  const set = (k: keyof EventForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const isValid = form.title.trim() && form.date && form.startTime && form.place.trim() && form.maxAttend

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-[480px] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e5]">
          <h2 className="text-lg font-extrabold text-[#111]">
            {mode === 'create' ? '정기모임 만들기' : '정기모임 수정'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] text-[#888] transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <FormField label="모임 제목" required>
            <input type="text" placeholder="예: 토요일 오전민턴" value={form.title} onChange={set('title')} className={inputClass} />
          </FormField>

          <FormField label="날짜" required>
            <input type="date" value={form.date} onChange={set('date')} className={inputClass} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="시작 시간" required>
              <input type="time" value={form.startTime} onChange={set('startTime')} className={inputClass} />
            </FormField>
            <FormField label="종료 시간">
              <input type="time" value={form.endTime} onChange={set('endTime')} className={inputClass} />
            </FormField>
          </div>

          <FormField label="장소" required>
            <input type="text" placeholder="예: 국사봉체육관" value={form.place} onChange={set('place')} className={inputClass} />
          </FormField>

          <FormField label="비용">
            <input type="text" placeholder="예: 코트비 5,000원" value={form.fee} onChange={set('fee')} className={inputClass} />
          </FormField>

          <FormField label="최대 참석 인원" required>
            <input
              type="number"
              min="1"
              max="100"
              placeholder="예: 24"
              value={form.maxAttend}
              onChange={set('maxAttend')}
              className={inputClass}
            />
          </FormField>
        </div>

        <div className="px-6 py-4 border-t border-[#e5e5e5] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#e5e5e5] text-sm font-bold text-[#555] hover:bg-[#f8f8f8] transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => isValid && onSubmit(form)}
            disabled={!isValid}
            className="flex-1 py-3 rounded-xl bg-[#beff00] text-[#111] text-sm font-extrabold hover:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {mode === 'create' ? '만들기' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── DeleteConfirmModal ──────────────────────────────

function DeleteConfirmModal({
  title,
  onClose,
  onConfirm,
  isPending,
}: {
  title: string
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-[360px] shadow-2xl p-6">
        <p className="text-lg font-extrabold text-[#111] mb-2">일정 삭제</p>
        <p className="text-sm text-[#666] mb-6">
          <span className="font-semibold text-[#111]">"{title}"</span>를 삭제할까요?<br />
          참석 정보도 함께 삭제되며 되돌릴 수 없어요.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-3 rounded-xl border border-[#e5e5e5] text-sm font-bold text-[#555] hover:bg-[#f8f8f8] transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-extrabold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isPending ? '삭제 중...' : '삭제'}
          </button>
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
  isManager?: boolean
}

export function RegularSessionTab({
  regularSessions,
  members,
  userStatus,
  clubId,
  onShowToast,
  myMemberId,
  isManager = false,
}: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editTarget, setEditTarget] = useState<RegularSessionItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RegularSessionItem | null>(null)

  const [, startEventTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()
  const [attendPending, startAttendTransition] = useTransition()

  const canManage = isManager && (userStatus === 'member' || userStatus === 'demo')

  const handleShare = async (s: RegularSessionItem) => {
    await shareClubSession(s, clubId, () => onShowToast('링크가 복사됐어요!'))
  }

  // ── Create ─────────────────────────────────────────
  const handleCreate = (data: EventForm) => {
    setShowCreateModal(false)
    if (!myMemberId && userStatus !== 'demo') {
      onShowToast('권한이 없습니다')
      return
    }
    startEventTransition(async () => {
      const result = await createClubEventAction(clubId, myMemberId ?? '', {
        title: data.title,
        event_date: data.date,
        start_time: data.startTime,
        end_time: data.endTime || undefined,
        place: data.place,
        fee: data.fee || undefined,
        max_attend: parseInt(data.maxAttend) || 20,
      })
      if ('error' in result && result.error) {
        onShowToast(result.error)
      } else {
        onShowToast(`"${data.title}" 일정이 추가됐어요!`)
      }
    })
  }

  // ── Edit ───────────────────────────────────────────
  const handleEdit = (data: EventForm) => {
    if (!editTarget) return
    const id = editTarget.id
    const title = data.title
    setEditTarget(null)
    startEventTransition(async () => {
      const result = await updateClubEventAction(clubId, id, {
        title: data.title,
        event_date: data.date,
        start_time: data.startTime,
        end_time: data.endTime || undefined,
        place: data.place,
        fee: data.fee || undefined,
        max_attend: parseInt(data.maxAttend) || 20,
      })
      if ('error' in result && result.error) {
        onShowToast(result.error)
      } else {
        onShowToast(`"${title}" 일정이 수정됐어요!`)
      }
    })
  }

  // ── Delete ─────────────────────────────────────────
  const handleDelete = () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    const title = deleteTarget.title
    setDeleteTarget(null)
    startDeleteTransition(async () => {
      const result = await deleteClubEventAction(clubId, id)
      if ('error' in result && result.error) {
        onShowToast(result.error)
      } else {
        onShowToast(`"${title}" 일정이 삭제됐어요`)
      }
    })
  }

  // editTarget → 폼 초기값 변환
  const editInitial = editTarget
    ? {
        title: editTarget.title,
        date: editTarget.nextDate,
        startTime: editTarget.time.split('~')[0].trim(),
        endTime: editTarget.time.includes('~') ? editTarget.time.split('~')[1].trim() : '',
        place: editTarget.place,
        fee: editTarget.fee ?? '',
        maxAttend: String(editTarget.maxAttend),
      }
    : undefined

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-base font-bold text-[#555]">정기모임 {regularSessions.length}개</p>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-[#111] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#333] transition-colors"
          >
            <span className="text-base leading-none">+</span>
            정기모임 만들기
          </button>
        )}
      </div>

      {regularSessions.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-base font-semibold text-[#555]">등록된 정기모임이 없어요</p>
          {canManage && (
            <p className="text-sm text-[#bbb] mt-1">위의 버튼으로 첫 정기모임을 만들어보세요</p>
          )}
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
                  {/* 헤더: D-day + 제목 + 운영진 메뉴 */}
                  <div className="flex items-center gap-3 mb-4">
                    <DDayBadge dDay={dDay} />
                    <p className="text-lg font-bold text-[#111] flex-1 truncate">{s.title}</p>
                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditTarget(s)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#888] hover:text-[#111] hover:bg-[#f0f0f0] transition-colors text-xs font-bold"
                          title="수정"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#888] hover:text-red-500 hover:bg-red-50 transition-colors text-xs font-bold"
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
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

                  {/* 하단: 공유 + 참석 버튼 */}
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
                            if ('error' in result && result.error) onShowToast(result.error)
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
                    ) : !isClosed && userStatus !== 'demo' ? (
                      <button
                        disabled
                        className="bg-[#beff00] text-[#111] font-bold text-base px-7 py-2.5 rounded-xl opacity-35 cursor-not-allowed"
                        title="모임 멤버만 참석할 수 있어요"
                      >
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

      {/* 모달들 */}
      {showCreateModal && (
        <EventFormModal mode="create" onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} />
      )}
      {editTarget && editInitial && (
        <EventFormModal mode="edit" initial={editInitial} onClose={() => setEditTarget(null)} onSubmit={handleEdit} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.title}
          isPending={deletePending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
