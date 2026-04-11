'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClubAction } from '@/app/club/create/actions'

export function ClubCreateForm({ clubUserId: _ }: { clubUserId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedCourt, setSelectedCourt] = useState(2)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('court_count', String(selectedCourt))
    setError(null)

    startTransition(async () => {
      const result = await createClubAction(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-[#111] mb-1.5">
          모임 이름 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder="예: 화요일 배드민턴 모임"
          maxLength={30}
          className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] bg-white transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#111] mb-1.5">모임 소개</label>
        <textarea
          name="description"
          placeholder="모임에 대한 간단한 소개를 작성해주세요"
          rows={3}
          maxLength={200}
          className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] bg-white transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#111] mb-1.5">코트 수</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSelectedCourt(n)}
              className={
                'flex-1 h-10 border rounded-xl text-sm font-semibold transition-colors ' +
                (selectedCourt === n
                  ? 'bg-[#beff00] border-[#beff00] text-[#111]'
                  : 'border-[#e5e5e5] text-[#999] hover:border-[#beff00]')
              }
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl hover:bg-[#f8f8f8] transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-3.5 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
        >
          {isPending ? '생성 중...' : '모임 만들기'}
        </button>
      </div>
    </form>
  )
}
