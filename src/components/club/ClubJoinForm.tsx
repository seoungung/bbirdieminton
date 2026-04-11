'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getClubByInviteCode } from '@/lib/club/client'

export function ClubJoinForm({ clubUserId }: { clubUserId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim().length !== 8) {
      setError('8자리 코드를 입력해주세요.')
      return
    }

    startTransition(async () => {
      setError(null)
      const supabase = createClient()

      const club = await getClubByInviteCode(supabase, code.trim().toLowerCase())
      if (!club) {
        setError('올바르지 않은 초대코드예요. 다시 확인해주세요.')
        return
      }

      // 이미 가입했는지 확인
      const { data: existing } = await supabase
        .from('club_members')
        .select('id')
        .eq('club_id', club.id)
        .eq('user_id', clubUserId)
        .single()

      if (existing) {
        router.push(`/club/${club.id}`)
        return
      }

      // 멤버로 추가
      const { error: joinErr } = await supabase
        .from('club_members')
        .insert({ club_id: club.id, user_id: clubUserId, role: 'member' })

      if (joinErr) {
        setError('모임 참여에 실패했습니다. 다시 시도해주세요.')
        return
      }

      router.push(`/club/${club.id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="XXXXXXXX"
        maxLength={8}
        className="w-full border border-[#e5e5e5] rounded-xl px-4 py-4 text-center text-2xl font-mono font-bold tracking-widest text-[#111] placeholder:text-[#ddd] focus:outline-none focus:border-[#beff00] bg-white transition-colors uppercase"
      />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl text-center">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl hover:bg-[#f8f8f8] transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending || code.length !== 8}
          className="flex-1 py-3.5 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
        >
          {isPending ? '확인 중...' : '참여하기'}
        </button>
      </div>
    </form>
  )
}
