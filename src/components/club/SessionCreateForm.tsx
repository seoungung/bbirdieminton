'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { MatchMode } from '@/types/club'

const MATCH_MODES: { value: MatchMode; label: string; desc: string }[] = [
  { value: 'skill_balance', label: '실력 균등', desc: '스킬 점수 기반으로 팀을 균등하게 배분' },
  { value: 'game_count', label: '게임수 균등', desc: '경기 수가 적은 순으로 우선 배정' },
  { value: 'random', label: '랜덤', desc: '완전 무작위로 팀 배정' },
  { value: 'custom', label: '수동', desc: '운영자가 직접 팀을 배정' },
]

export function SessionCreateForm({
  clubId,
  memberId,
}: {
  clubId: string
  memberId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedMode, setSelectedMode] = useState<MatchMode>('skill_balance')

  // 오늘 날짜 기본값
  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const sessionDate = fd.get('session_date') as string

    startTransition(async () => {
      setError(null)
      const supabase = createClient()

      const { data: session, error: err } = await supabase
        .from('sessions')
        .insert({
          club_id: clubId,
          created_by: memberId,
          session_date: sessionDate,
          match_mode: selectedMode,
          status: 'open',
        })
        .select('id')
        .single()

      if (err || !session) {
        setError('세션 생성에 실패했습니다.')
        return
      }

      router.push(`/club/${clubId}/session/${session.id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 날짜 */}
      <div>
        <label className="block text-sm font-semibold text-[#111] mb-1.5">
          세션 날짜 <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          name="session_date"
          defaultValue={today}
          className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#beff00] bg-white transition-colors"
          required
        />
      </div>

      {/* 경기 배정 모드 */}
      <div>
        <label className="block text-sm font-semibold text-[#111] mb-2">경기 배정 방식</label>
        <div className="space-y-2">
          {MATCH_MODES.map((mode) => (
            <label
              key={mode.value}
              className={
                'flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-colors ' +
                (selectedMode === mode.value
                  ? 'border-[#beff00] bg-[#beff00]/5'
                  : 'border-[#e5e5e5] hover:border-[#beff00]/50')
              }
            >
              <input
                type="radio"
                name="match_mode"
                value={mode.value}
                checked={selectedMode === mode.value}
                onChange={() => setSelectedMode(mode.value)}
                className="sr-only"
              />
              <div
                className={
                  'mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ' +
                  (selectedMode === mode.value ? 'border-[#beff00]' : 'border-[#bbb]')
                }
              >
                {selectedMode === mode.value && (
                  <div className="w-2 h-2 bg-[#beff00] rounded-full" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111]">{mode.label}</p>
                <p className="text-xs text-[#999] mt-0.5">{mode.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
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
          disabled={isPending}
          className="flex-1 py-3.5 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
        >
          {isPending ? '생성 중...' : '세션 시작'}
        </button>
      </div>
    </form>
  )
}
