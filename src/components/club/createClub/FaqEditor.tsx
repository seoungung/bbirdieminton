'use client'

import { Plus, Trash2 } from 'lucide-react'
import type { ClubFAQ } from '@/types/club'
import { inputClsCompact } from '@/lib/forms/inputClassName'

interface FaqEditorProps {
  value: ClubFAQ[]
  onChange: (next: ClubFAQ[]) => void
  /** 최대 FAQ 개수 — 기본 6개 */
  max?: number
}

/**
 * Q&A 페어 multi-add 에디터.
 * - 추가 버튼으로 빈 row 생성, 휴지통 아이콘으로 삭제.
 * - 부모에서 `onChange` 받아 ClubFAQ[] 그대로 사용.
 */
export function FaqEditor({ value, onChange, max = 6 }: FaqEditorProps) {
  const updateAt = (i: number, patch: Partial<ClubFAQ>) => {
    const next = value.slice()
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }

  const removeAt = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i))
  }

  const add = () => {
    if (value.length >= max) return
    onChange([...value, { question: '', answer: '' }])
  }

  const reachedMax = value.length >= max

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-[12px] font-semibold text-[#666]">
          자주 묻는 질문 <span className="text-[#bbb] font-normal">(선택)</span>
        </label>
        <span className="text-[11px] text-[#999] tabular-nums">
          {value.length} / {max}
        </span>
      </div>

      {value.length === 0 ? (
        <p className="text-[12px] text-[#bbb] mb-2">
          가입 전 자주 받는 질문이 있다면 미리 답변해두세요.
        </p>
      ) : (
        <ul className="space-y-2.5 mb-2">
          {value.map((f, i) => (
            <li
              key={i}
              className="rounded-2xl border border-[#ebebeb] bg-white p-3 space-y-2"
            >
              <div className="flex items-start gap-2">
                <span className="mt-1.5 shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand-court-bg)] text-[var(--color-brand-court-deep)] inline-flex items-center justify-center text-[10px] font-extrabold">
                  Q
                </span>
                <input
                  type="text"
                  placeholder="질문 (예: 초보자도 참여할 수 있나요?)"
                  maxLength={120}
                  value={f.question}
                  onChange={(e) => updateAt(i, { question: e.target.value })}
                  className={inputClsCompact}
                />
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="질문 삭제"
                  className="shrink-0 mt-1 w-7 h-7 rounded-lg text-[#bbb] hover:text-[var(--color-brand-streak)] hover:bg-[var(--color-brand-streak-bg)] flex items-center justify-center transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1.5 shrink-0 w-5 h-5 rounded-full bg-[#f5f5f5] text-[#666] inline-flex items-center justify-center text-[10px] font-extrabold">
                  A
                </span>
                <textarea
                  placeholder="답변"
                  rows={2}
                  maxLength={500}
                  value={f.answer}
                  onChange={(e) => updateAt(i, { answer: e.target.value })}
                  className={`${inputClsCompact} resize-none leading-relaxed`}
                />
                <span className="shrink-0 mt-1 w-7 h-7" aria-hidden />
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={add}
        disabled={reachedMax}
        className={
          'w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed text-[12.5px] font-semibold transition-colors ' +
          (reachedMax
            ? 'border-[#ebebeb] text-[#ccc] cursor-not-allowed'
            : 'border-[#ddd] text-[#666] hover:border-[#888] hover:text-[#111]')
        }
      >
        <Plus size={14} strokeWidth={2.4} />
        FAQ 추가
      </button>
    </div>
  )
}
