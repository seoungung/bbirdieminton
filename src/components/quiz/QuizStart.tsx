'use client'

import { useState } from 'react'

interface QuizStartProps {
  onStart: () => void
  onGenderSelect: (gender: string) => void
}

const GENDER_OPTIONS = [
  { value: 'male',   label: '남성', emoji: '👨' },
  { value: 'female', label: '여성', emoji: '👩' },
  { value: 'other',  label: '기타', emoji: '🙋' },
]

export function QuizStart({ onStart, onGenderSelect }: QuizStartProps) {
  const [selected, setSelected] = useState('')

  const handleSelect = (value: string) => {
    setSelected(value)
    onGenderSelect(value)
  }

  return (
    <div className="flex flex-col items-center text-center px-4 py-12 max-w-sm mx-auto">
      <div className="text-6xl mb-6">🏸</div>

      <h1 className="text-[28px] font-extrabold text-white leading-tight tracking-tight mb-3">
        내 배드민턴 레벨은?
      </h1>
      <p className="text-white/60 text-[15px] leading-relaxed mb-8">
        17가지 질문으로 지금 내 실력을 확인해보세요.<br />
        레벨에 맞는 라켓까지 추천해 드릴게요.
      </p>

      <div className="flex gap-6 text-center mb-10">
        <div>
          <p className="text-[22px] font-bold text-[#beff00]">17</p>
          <p className="text-xs text-white/40 mt-0.5">문항</p>
        </div>
        <div className="w-px bg-white/10" />
        <div>
          <p className="text-[22px] font-bold text-[#beff00]">2분</p>
          <p className="text-xs text-white/40 mt-0.5">소요</p>
        </div>
        <div className="w-px bg-white/10" />
        <div>
          <p className="text-[22px] font-bold text-[#beff00]">4개</p>
          <p className="text-xs text-white/40 mt-0.5">레벨</p>
        </div>
      </div>

      {/* 성별 선택 */}
      <div className="w-full mb-6">
        <p className="text-white/60 text-[13px] mb-3">성별을 선택해 주세요</p>
        <div className="flex gap-3">
          {GENDER_OPTIONS.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className={
                'flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ' +
                (selected === value
                  ? 'bg-[#beff00] border-[#beff00] text-black'
                  : 'bg-white/5 border-white/15 text-white hover:border-white/40')
              }
            >
              <span className="block text-lg mb-0.5">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={!selected}
        className="w-full py-4 bg-[#beff00] text-black font-extrabold text-[15px] rounded-2xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {selected ? '지금 내 레벨 확인하기 →' : '성별을 선택해 주세요'}
      </button>

      <p className="text-xs text-white/30 mt-4">스팸 없음 · 언제든 취소 가능</p>
    </div>
  )
}
