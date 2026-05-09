'use client'

import { inputCls } from '@/lib/forms/inputClassName'

interface FeeInputsProps {
  feeMonthly: string
  onFeeMonthlyChange: (v: string) => void
  feePerSession: string
  onFeePerSessionChange: (v: string) => void
  feeNote: string
  onFeeNoteChange: (v: string) => void
}

/**
 * 회비 입력 필드 묶음.
 * - 월 / 회당 / 추가 안내 (자유 텍스트).
 * - 비워두면 "협의" 로 표시됨.
 */
export function FeeInputs({
  feeMonthly,
  onFeeMonthlyChange,
  feePerSession,
  onFeePerSessionChange,
  feeNote,
  onFeeNoteChange,
}: FeeInputsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">
            월회비 (원)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            placeholder="예: 30000"
            value={feeMonthly}
            onChange={(e) => onFeeMonthlyChange(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">
            회당 회비 (원)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            placeholder="예: 5000"
            value={feePerSession}
            onChange={(e) => onFeePerSessionChange(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">
          회비 추가 안내 <span className="text-[#bbb] font-normal">(선택)</span>
        </label>
        <input
          type="text"
          maxLength={80}
          placeholder="예: 신입 첫 달 50% 할인"
          value={feeNote}
          onChange={(e) => onFeeNoteChange(e.target.value)}
          className={inputCls}
        />
      </div>

      <p className="text-[11px] text-[#999] leading-relaxed">
        둘 다 비워두면 미리보기에 &quot;협의&quot; 로 표시됩니다.
      </p>
    </div>
  )
}
