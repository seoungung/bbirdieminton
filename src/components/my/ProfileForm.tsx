'use client'

import { useActionState, useEffect } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { updateNicknameAction } from '@/app/my/profile/actions'

interface Props {
  initialName: string
}

export function ProfileForm({ initialName }: Props) {
  const [state, formAction, isPending] = useActionState(updateNicknameAction, null)

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => {
        // feedback 메시지 3초 후 사라지도록 상태 초기화는 불가, CSS로만 fadeout 처리
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-[13px] font-semibold text-[#555] mb-2">
          닉네임
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initialName}
          maxLength={20}
          required
          className="w-full px-4 py-3 text-sm border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#0a0a0a] transition-colors"
          placeholder="2~20자"
        />
        <p className="text-[12px] text-[#999] mt-1.5">
          클럽 내에서 표시되는 이름입니다. 언제든 변경 가능합니다.
        </p>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 text-[13px] text-red-500 bg-red-50 px-3 py-2.5 rounded-lg">
          <AlertCircle size={15} />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="flex items-center gap-2 text-[13px] text-[#10b981] bg-[#ecfdf5] px-3 py-2.5 rounded-lg">
          <CheckCircle2 size={15} />
          <span>{state.success}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 bg-[#0a0a0a] text-white font-bold text-[14px] rounded-xl hover:bg-[#222] disabled:opacity-50 transition-colors"
      >
        {isPending ? '저장 중...' : '닉네임 저장'}
      </button>
    </form>
  )
}
