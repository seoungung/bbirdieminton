'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Grade } from '@/lib/club/grade'
import { GradeBadge } from './GradeBadge'

interface GuestDraft {
  name: string
  gender: 'M' | 'F' | null
  grade: Grade | null
}

interface PendingGuest extends GuestDraft {
  _key: number
}

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (guests: Array<{ name: string; gender: 'M' | 'F' | null; grade: Grade | null }>) => void
}

const GRADE_OPTIONS: Grade[] = ['A', 'B', 'C', 'D', 'E']

const GRADE_PILL_COLOR: Record<Grade, string> = {
  S: 'text-[var(--color-brand-elite)] border-purple-300',
  A: 'text-[var(--color-brand-team-b)] border-[var(--color-brand-streak-soft)]',
  B: 'text-[var(--color-brand-streak)] border-amber-300',
  C: 'text-[#ea580c] border-orange-300',
  D: 'text-[var(--color-brand-elite)] border-violet-300',
  E: 'text-[var(--color-brand-court)] border-[var(--color-brand-court-soft)]',
  F: 'text-[var(--color-brand-text-sub)] border-[var(--color-brand-border)]',
}

const GRADE_PILL_ACTIVE: Record<Grade, string> = {
  S: 'bg-purple-100 border-purple-300',
  A: 'bg-[var(--color-brand-streak-soft)]/50 border-[var(--color-brand-streak-soft)]',
  B: 'bg-amber-100 border-amber-300',
  C: 'bg-orange-100 border-orange-300',
  D: 'bg-violet-100 border-violet-300',
  E: 'bg-[var(--color-brand-court-bg)] border-[var(--color-brand-court-soft)]',
  F: 'bg-[var(--color-surface-muted)] border-[var(--color-brand-border)]',
}

let _keyCounter = 0

export function GuestAddModal({ open, onClose, onConfirm }: Props) {
  const [draft, setDraft] = useState<GuestDraft>({ name: '', gender: null, grade: null })
  const [pending, setPending] = useState<PendingGuest[]>([])
  const nameRef = useRef<HTMLInputElement>(null)

  /* body 스크롤 잠금 */
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  /* ESC 닫기 */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  /* 열릴 때 상태 초기화 + 포커스 */
  useEffect(() => {
    if (open) {
      setDraft({ name: '', gender: null, grade: null })
      setPending([])
      // 약간의 지연 후 포커스 (모달 렌더 완료 대기)
      const t = setTimeout(() => nameRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  const canAddToPending = draft.name.trim().length > 0

  const handleAddToPending = () => {
    if (!canAddToPending) return
    const key = ++_keyCounter
    setPending(prev => [...prev, { ...draft, name: draft.name.trim(), _key: key }])
    setDraft({ name: '', gender: null, grade: null })
    nameRef.current?.focus()
  }

  const handleRemovePending = (key: number) => {
    setPending(prev => prev.filter(g => g._key !== key))
  }

  const handleConfirm = () => {
    onConfirm(pending.map(({ name, gender, grade }) => ({ name, gender, grade })))
    onClose()
  }

  const genderLabel = (g: 'M' | 'F') => g === 'M' ? '남' : '여'

  if (!open) return null

  const n = pending.length

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="게스트 추가하기"
    >
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 패널 */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-[480px] max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-[var(--color-brand-border-sub)] flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-[#111]">게스트 추가하기</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-lg text-[var(--color-brand-text-muted)] hover:text-[var(--color-text-body)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 min-h-0">
          {/* 입력 폼 */}
          <div className="space-y-4">
            {/* 이름 */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-text-sub)] mb-1.5">이름 <span className="text-[var(--color-brand-streak)]">*</span></label>
              <input
                ref={nameRef}
                type="text"
                value={draft.name}
                onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') handleAddToPending() }}
                placeholder="게스트 이름"
                maxLength={10}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm text-[#111] placeholder:text-[var(--color-brand-text-muted)] focus:outline-none focus:border-[var(--color-brand-lime)] transition-colors"
              />
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-text-sub)] mb-1.5">성별 <span className="text-[var(--color-brand-text-muted)]">(선택)</span></label>
              <div className="flex gap-2">
                {(['M', 'F'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, gender: prev.gender === g ? null : g }))}
                    className={cn(
                      'px-5 py-2 rounded-xl text-sm font-semibold border transition-colors',
                      draft.gender === g
                        ? 'bg-[var(--color-brand-lime)] border-[var(--color-brand-lime)] text-[var(--color-brand-ink)]'
                        : 'bg-white border-[var(--color-brand-border)] text-[var(--color-brand-text-sub)] hover:border-[var(--color-brand-text-muted)]'
                    )}
                  >
                    {genderLabel(g)}
                  </button>
                ))}
              </div>
            </div>

            {/* 급수 */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-text-sub)] mb-1.5">급수 <span className="text-[var(--color-brand-text-muted)]">(선택)</span></label>
              <div className="flex flex-wrap gap-2">
                {GRADE_OPTIONS.map(g => {
                  const isActive = draft.grade === g
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setDraft(prev => ({ ...prev, grade: prev.grade === g ? null : g }))}
                      className={cn(
                        'px-4 py-1.5 rounded-xl text-sm font-bold border transition-colors',
                        isActive
                          ? GRADE_PILL_ACTIVE[g]
                          : 'bg-white border-[var(--color-brand-border)] hover:border-[var(--color-brand-text-muted)]',
                        GRADE_PILL_COLOR[g]
                      )}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* + 추가 버튼 */}
            <button
              type="button"
              onClick={handleAddToPending}
              disabled={!canAddToPending}
              className="w-full py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm font-semibold text-[var(--color-text-body)] hover:border-[var(--color-brand-text-muted)] hover:bg-[var(--color-surface-sub)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              + 목록에 추가
            </button>
          </div>

          {/* 추가 대기 목록 */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-brand-text-sub)] mb-2">추가할 게스트 목록</p>
            {pending.length === 0 ? (
              <p className="text-sm text-[var(--color-brand-text-muted)] text-center py-4">추가한 게스트가 없습니다</p>
            ) : (
              <div className="space-y-1.5">
                {pending.map(guest => (
                  <div
                    key={guest._key}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--color-surface-sub)]"
                  >
                    {/* 아바타 — 급수 배지 재활용 */}
                    <GradeBadge grade={guest.grade} size="sm" />

                    {/* 이름 */}
                    <span className="flex-1 text-sm font-semibold text-[#111] truncate">
                      {guest.name}
                    </span>

                    {/* 성별 */}
                    {guest.gender && (
                      <span className="text-xs text-[var(--color-brand-text-sub)] shrink-0">
                        {genderLabel(guest.gender)}
                      </span>
                    )}

                    {/* 제거 */}
                    <button
                      type="button"
                      onClick={() => handleRemovePending(guest._key)}
                      aria-label={`${guest.name} 제거`}
                      className="p-1 rounded-lg text-[var(--color-brand-text-muted)] hover:text-[var(--color-text-body)] hover:bg-[var(--color-brand-bg-muted)] transition-colors shrink-0"
                    >
                      <X size={14} strokeWidth={2.2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-5 py-4 border-t border-[var(--color-brand-border-sub)] flex gap-2 justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-[var(--color-brand-text-sub)] border border-[var(--color-brand-border)] rounded-xl hover:bg-[var(--color-surface-sub)] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={n === 0}
            className="px-4 py-2.5 text-sm font-bold bg-[var(--color-brand-lime)] text-[var(--color-brand-ink)] rounded-xl hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            추가하기 ({n}명)
          </button>
        </div>
      </div>
    </div>
  )
}
