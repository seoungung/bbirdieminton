'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ClubCreateForm({ clubUserId }: { clubUserId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = (fd.get('name') as string).trim()
    const description = (fd.get('description') as string).trim()
    const courtCount = parseInt(fd.get('court_count') as string, 10)

    if (!name) { setError('모임 이름을 입력해주세요.'); return }

    startTransition(async () => {
      setError(null)
      const supabase = createClient()

      // 1. clubs 테이블에 모임 생성
      const { data: club, error: clubErr } = await supabase
        .from('clubs')
        .insert({ owner_id: clubUserId, name, description: description || null, court_count: courtCount })
        .select('id')
        .single()

      if (clubErr || !club) {
        setError('모임 생성에 실패했습니다. 다시 시도해주세요.')
        return
      }

      // 2. 생성자를 owner로 club_members에 추가
      const { error: memberErr } = await supabase
        .from('club_members')
        .insert({ club_id: club.id, user_id: clubUserId, role: 'owner' })

      if (memberErr) {
        setError('멤버 등록에 실패했습니다.')
        return
      }

      router.push(`/club/${club.id}`)
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
            <label key={n} className="flex-1">
              <input type="radio" name="court_count" value={n} defaultChecked={n === 2} className="sr-only peer" />
              <span className="flex items-center justify-center h-10 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#999] cursor-pointer peer-checked:bg-[#beff00] peer-checked:border-[#beff00] peer-checked:text-[#111] hover:border-[#beff00] transition-colors">
                {n}
              </span>
            </label>
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
