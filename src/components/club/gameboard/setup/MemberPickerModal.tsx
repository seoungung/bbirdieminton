'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { scoreToGrade } from '@/lib/club/grade'
import type { ClubMemberWithUser } from '@/types/club'
import { GradeBadge } from './GradeBadge'

interface Props {
  open: boolean
  members: ClubMemberWithUser[]
  alreadySelectedIds: Set<string>
  onClose: () => void
  onConfirm: (newMemberIds: string[]) => void
}

export function MemberPickerModal({
  open,
  members,
  alreadySelectedIds,
  onClose,
  onConfirm,
}: Props) {
  const [query, setQuery] = useState('')
  const [localSelected, setLocalSelected] = useState<Set<string>>(new Set())

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

  /* 모달 열릴 때마다 상태 초기화 */
  useEffect(() => {
    if (open) {
      setQuery('')
      setLocalSelected(new Set())
    }
  }, [open])

  const eligible = useMemo(() => {
    return members
      .filter(m => !alreadySelectedIds.has(m.id))
      .sort((a, b) => {
        const scoreDiff = b.skill_score - a.skill_score
        if (scoreDiff !== 0) return scoreDiff
        return (a.user?.name ?? '').localeCompare(b.user?.name ?? '')
      })
  }, [members, alreadySelectedIds])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return eligible
    return eligible.filter(m => (m.user?.name ?? '').toLowerCase().includes(q))
  }, [eligible, query])

  const toggleLocal = (id: string) => {
    setLocalSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleConfirm = () => {
    onConfirm(Array.from(localSelected))
    onClose()
  }

  if (!open) return null

  const n = localSelected.size

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="회원 불러오기"
    >
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 패널 */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-[480px] max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-[var(--color-brand-border-sub)] flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-[#111]">회원 불러오기</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-lg text-[var(--color-brand-text-muted)] hover:text-[var(--color-text-body)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* 검색 */}
        <div className="px-5 py-3 shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-text-muted)] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="이름으로 검색"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm text-[#111] placeholder:text-[var(--color-brand-text-muted)] focus:outline-none focus:border-[var(--color-brand-lime)] transition-colors"
            />
          </div>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
          {filtered.length === 0 ? (
            <p className="text-sm text-[var(--color-brand-text-muted)] text-center py-8">
              {query ? '검색 결과가 없어요' : '추가할 수 있는 회원이 없어요'}
            </p>
          ) : (
            filtered.map(m => {
              const grade = scoreToGrade(m.skill_score)
              const isChecked = localSelected.has(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleLocal(m.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                    isChecked ? 'bg-[#f7fff7]' : 'hover:bg-[var(--color-surface-sub)]'
                  )}
                >
                  {/* 체크 서클 */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors',
                      isChecked
                        ? 'bg-[var(--color-brand-lime)] border-[var(--color-brand-lime)]'
                        : 'border-[var(--color-brand-border)] bg-white'
                    )}
                  >
                    {isChecked && (
                      <Check size={11} className="text-[var(--color-brand-ink)]" strokeWidth={3.5} />
                    )}
                  </div>

                  {/* 급수 배지 */}
                  <GradeBadge grade={grade} />

                  {/* 이름 */}
                  <span className="flex-1 text-sm font-semibold text-[#111] truncate">
                    {m.user?.name ?? '?'}
                  </span>

                  {/* 성별 표시 */}
                  {m.gender === 'F' ? (
                    <span className="w-4 h-4 rounded-full bg-red-400 shrink-0" title="여자" />
                  ) : m.gender === 'M' ? (
                    <span className="w-4 h-4 rounded-full bg-blue-400 shrink-0" title="남자" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-[var(--color-brand-bg-muted)] shrink-0" title="미지정" />
                  )}

                  {/* 회원 태그 */}
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface-muted)] text-[var(--color-brand-text-sub)] shrink-0">
                    회원
                  </span>
                </button>
              )
            })
          )}
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
