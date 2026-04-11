'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, LogOut, Crown, Shield, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Club, ClubMemberWithUser, MemberRole } from '@/types/club'

interface Props {
  club: Club
  members: ClubMemberWithUser[]
  myMemberId: string
  isOwner: boolean
  isManager: boolean
}

const ROLE_ICON: Record<MemberRole, React.ReactNode> = {
  owner: <Crown size={13} className="text-yellow-500" />,
  manager: <Shield size={13} className="text-blue-500" />,
  member: <User size={13} className="text-[#bbb]" />,
}

const ROLE_LABEL: Record<MemberRole, string> = {
  owner: '운영자',
  manager: '매니저',
  member: '멤버',
}

export function SettingsClient({ club, members, myMemberId, isOwner, isManager }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const copyInviteCode = () => {
    navigator.clipboard.writeText(club.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const changeRole = (memberId: string, newRole: MemberRole) => {
    if (!isOwner) return
    startTransition(async () => {
      const supabase = createClient()
      await supabase
        .from('club_members')
        .update({ role: newRole })
        .eq('id', memberId)
      router.refresh()
    })
  }

  const leaveClub = () => {
    if (!confirm('정말 모임에서 나가시겠어요?')) return
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('club_members').delete().eq('id', myMemberId)
      router.push('/club/home')
    })
  }

  return (
    <div className="space-y-6">
      {/* 초대코드 */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4">
        <p className="text-xs font-bold text-[#999] mb-2">초대코드</p>
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-xl tracking-widest text-[#111] uppercase">
            {club.invite_code}
          </span>
          <button
            onClick={copyInviteCode}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#555] border border-[#e5e5e5] px-3 py-1.5 rounded-xl hover:bg-[#f8f8f8] transition-colors"
          >
            <Copy size={13} />
            {copied ? '복사됨!' : '복사'}
          </button>
        </div>
      </div>

      {/* 멤버 목록 */}
      <div>
        <p className="text-xs font-bold text-[#999] mb-2">멤버 {members.length}명</p>
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between bg-white border border-[#e5e5e5] rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-bold text-[#555] shrink-0 overflow-hidden">
                  {m.user.profile_img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.user.profile_img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    m.user.name.slice(0, 1)
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111]">{m.user.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {ROLE_ICON[m.role]}
                    <span className="text-xs text-[#999]">{ROLE_LABEL[m.role]}</span>
                  </div>
                </div>
              </div>

              {/* 역할 변경 (owner만 가능, 본인 제외) */}
              {isOwner && m.id !== myMemberId && m.role !== 'owner' && (
                <select
                  value={m.role}
                  onChange={(e) => changeRole(m.id, e.target.value as MemberRole)}
                  disabled={isPending}
                  className="text-xs border border-[#e5e5e5] rounded-lg px-2 py-1 text-[#555] bg-white focus:outline-none focus:border-[#beff00] transition-colors"
                >
                  <option value="member">멤버</option>
                  <option value="manager">매니저</option>
                </select>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 나가기 */}
      {!isOwner && (
        <button
          onClick={leaveClub}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 border border-red-200 text-red-500 font-semibold text-sm rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <LogOut size={15} />
          모임 나가기
        </button>
      )}
    </div>
  )
}
