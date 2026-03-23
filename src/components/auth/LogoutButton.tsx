'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'
import { logout } from '@/app/login/actions'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-2 py-3 border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-500/40 rounded-2xl text-sm font-medium transition-colors disabled:opacity-50"
    >
      <LogOut size={15} />
      {isPending ? '로그아웃 중...' : '로그아웃'}
    </button>
  )
}
