'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { EventInput, EventListRow } from '@/app/club/[clubId]/events/actions'
import { Field } from './events/Field'

interface Props {
  mode: 'create' | 'edit'
  initial?: EventListRow
  isPending: boolean
  onClose: () => void
  onSubmit: (data: EventInput) => void
  onDelete?: () => void
}

interface FormState {
  title: string
  event_date: string
  start_time: string
  end_time: string
  place: string
  fee: string
  max_attend: number
}

function toFormState(initial?: EventListRow): FormState {
  return {
    title: initial?.title ?? '',
    event_date: initial?.event_date ?? '',
    start_time: initial?.start_time ? initial.start_time.slice(0, 5) : '',
    end_time: initial?.end_time ? initial.end_time.slice(0, 5) : '',
    place: initial?.place ?? '',
    fee: initial?.fee ?? '',
    max_attend: initial?.max_attend ?? 0,
  }
}

export function EventFormDialog({
  mode,
  initial,
  isPending,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial))
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (!form.event_date) {
      setError('날짜를 선택해주세요.')
      return
    }
    if (form.start_time && form.end_time && form.end_time <= form.start_time) {
      setError('종료 시간은 시작 시간보다 늦어야 합니다.')
      return
    }
    setError(null)
    onSubmit({
      title: form.title.trim(),
      event_date: form.event_date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      place: form.place.trim() || null,
      fee: form.fee.trim() || null,
      max_attend: Math.max(0, Math.floor(Number(form.max_attend) || 0)),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5]">
          <h2 className="font-bold text-[#111]">
            {mode === 'create' ? '정기모임 만들기' : '정기모임 수정'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#f0f0f0] text-[#999]"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* 본문 — 스크롤 가능 */}
        <div className="px-5 py-4 flex flex-col gap-3.5 overflow-y-auto flex-1">
          {error && (
            <p className="text-sm text-[var(--color-brand-streak)] bg-[var(--color-brand-streak-bg)] border border-[var(--color-brand-streak-soft)]/50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <Field label="제목" required>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="예: 4월 정기 토요민턴"
              className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#111] placeholder:text-[#999] focus:outline-none focus:border-[#0a0a0a]"
            />
          </Field>

          <Field label="날짜" required>
            <input
              type="date"
              value={form.event_date}
              onChange={(e) => update('event_date', e.target.value)}
              className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#0a0a0a]"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="시작 시간">
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => update('start_time', e.target.value)}
                className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#0a0a0a]"
              />
            </Field>
            <Field label="종료 시간">
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => update('end_time', e.target.value)}
                className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#0a0a0a]"
              />
            </Field>
          </div>

          <Field label="장소">
            <input
              type="text"
              value={form.place}
              onChange={(e) => update('place', e.target.value)}
              placeholder="예: 국사봉체육관 A코트"
              className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#111] placeholder:text-[#999] focus:outline-none focus:border-[#0a0a0a]"
            />
          </Field>

          <Field label="회비 (자유 입력)">
            <input
              type="text"
              value={form.fee}
              onChange={(e) => update('fee', e.target.value)}
              placeholder="예: 회비 + 입장료 5,000원"
              className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#111] placeholder:text-[#999] focus:outline-none focus:border-[#0a0a0a]"
            />
          </Field>

          <Field label="최대 인원" hint="0 = 무제한">
            <input
              type="number"
              min={0}
              max={1000}
              step={1}
              value={form.max_attend}
              onChange={(e) => update('max_attend', Number(e.target.value))}
              className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#0a0a0a] tabular-nums"
            />
          </Field>
        </div>

        {/* 푸터 */}
        <div className="flex gap-2 px-5 py-4 border-t border-[#f0f0f0]">
          {mode === 'edit' && onDelete && (
            <button
              onClick={onDelete}
              disabled={isPending}
              className="px-3 py-2.5 border border-[var(--color-brand-streak-soft)] rounded-xl text-sm font-medium text-[var(--color-brand-streak)] hover:bg-[var(--color-brand-streak-bg)] disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              삭제
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-medium text-[#555] hover:bg-[#f8f8f8] transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 py-2.5 bg-[#0a0a0a] text-white rounded-xl text-sm font-medium hover:bg-[#222] disabled:opacity-50 transition-colors"
          >
            {isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

