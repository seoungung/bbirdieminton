'use client'

import { useState, useTransition } from 'react'
import { Check, X, AlertCircle, UserPlus } from 'lucide-react'
import type { JoinRequestRow } from './actions'
import { approveJoinRequestAction, rejectJoinRequestAction } from './actions'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

interface Props {
  clubId: string
  initialRequests: JoinRequestRow[]
}

export function JoinRequestsClient({ clubId, initialRequests }: Props) {
  const [requests, setRequests] = useState(initialRequests)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleApprove = (req: JoinRequestRow) => {
    setError(null)
    startTransition(async () => {
      const result = await approveJoinRequestAction(clubId, req.id, req.user_id)
      if (result.error) { setError(result.error); return }
      setRequests(prev => prev.filter(r => r.id !== req.id))
    })
  }

  const handleReject = (req: JoinRequestRow) => {
    setError(null)
    startTransition(async () => {
      const result = await rejectJoinRequestAction(clubId, req.id)
      if (result.error) { setError(result.error); return }
      setRequests(prev => prev.filter(r => r.id !== req.id))
    })
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl">
          <AlertCircle size={14} className="shrink-0" />{error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center">
          <UserPlus size={40} className="text-[#ccc] mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-[#555]">대기 중인 가입 신청이 없어요</p>
          <p className="text-xs text-[#bbb] mt-1">새로운 가입 신청이 들어오면 여기에 표시돼요</p>
        </div>
      ) : (
        requests.map(req => (
          <div
            key={req.id}
            className="bg-white rounded-2xl border border-[#e5e5e5] px-4 py-3.5 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* 아바타 */}
              <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-bold text-[#888] shrink-0">
                {req.requester_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#111] truncate">
                  {req.requester_name ?? '이름 없음'}
                </p>
                <p className="text-xs text-[#bbb] mt-0.5">{formatDate(req.created_at)} 신청</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleReject(req)}
                disabled={isPending}
                className="flex items-center gap-1 px-3 py-2 border border-[#e5e5e5] rounded-xl text-xs font-bold text-[#888] hover:border-red-300 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                <X size={13} />거절
              </button>
              <button
                onClick={() => handleApprove(req)}
                disabled={isPending}
                className="flex items-center gap-1 px-3 py-2 bg-[#beff00] rounded-xl text-xs font-bold text-[#111] hover:brightness-95 transition-all disabled:opacity-50"
              >
                <Check size={13} />승인
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
