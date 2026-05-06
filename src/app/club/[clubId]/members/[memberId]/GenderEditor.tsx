'use client'

import { useTransition } from 'react'
import { updateMemberGenderAction } from '@/app/club/[clubId]/members/actions'

interface Props {
  memberId: string
  clubId: string
  currentGender: 'M' | 'F' | null
}

export function GenderEditor({ memberId, clubId, currentGender }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleSelect = (gender: 'M' | 'F' | null) => {
    if (gender === currentGender) return
    startTransition(async () => {
      await updateMemberGenderAction(memberId, clubId, gender)
    })
  }

  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#999] mb-3">
        성별
      </p>
      <div className="flex gap-2 flex-wrap">
        {(['M', 'F', null] as const).map((g) => {
          const isActive = currentGender === g
          const label = g === 'M' ? '남자' : g === 'F' ? '여자' : '지정 안 함'
          const activeClass =
            g === 'F'
              ? 'bg-red-500 text-white border-red-500'
              : g === 'M'
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-[#555] text-white border-[#555]'
          return (
            <button
              key={String(g)}
              type="button"
              onClick={() => handleSelect(g)}
              disabled={isPending}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50 ${
                isActive
                  ? activeClass
                  : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#111]'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
      {isPending && (
        <p className="text-xs text-[#999] mt-2">저장 중...</p>
      )}
    </section>
  )
}
