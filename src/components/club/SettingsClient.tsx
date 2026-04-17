'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, LogOut, Crown, Shield, User, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Club, ClubMemberWithUser, MemberRole } from '@/types/club'
import { updateMemberRoleAction, regenerateInviteCodeAction } from '@/app/club/[clubId]/members/actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

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

export function SettingsClient({ club, members, myMemberId, isOwner, isManager: _isManager }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [codeRegen, setCodeRegen] = useState<string | null>(null)
  const [dialog, setDialog] = useState<{
    title: string
    description: string
    confirmText?: string
    variant?: 'default' | 'destructive'
    onConfirm: () => void
  } | null>(null)

  const copyInviteCode = () => {
    navigator.clipboard.writeText(codeRegen ?? club.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const changeRole = (memberId: string, newRole: 'manager' | 'member') => {
    if (!isOwner) return
    startTransition(async () => {
      await updateMemberRoleAction(memberId, club.id, newRole)
      router.refresh()
    })
  }

  const handleDeleteClub = () => {
    setDialog({
      title: '모임 삭제',
      description: `'${club.name}' 모임을 삭제하시겠어요?\n\n모든 멤버, 경기 기록, 랭킹이 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`,
      confirmText: '삭제',
      variant: 'destructive',
      onConfirm: () => {
        setDialog(null)
        startTransition(async () => {
          const supabase = createClient()
          const { error } = await supabase.rpc('delete_club_cascade', { p_club_id: club.id })
          if (error) { alert('모임 삭제에 실패했습니다'); return }
          router.push('/club/home')
        })
      },
    })
  }

  const leaveClub = () => {
    setDialog({
      title: '모임 나가기',
      description: '정말 모임에서 나가시겠어요?',
      confirmText: '나가기',
      variant: 'destructive',
      onConfirm: () => {
        setDialog(null)
        startTransition(async () => {
          const supabase = createClient()
          await supabase.from('club_members').delete().eq('id', myMemberId)
          router.push('/club/home')
        })
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* 초대코드 */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4">
        <p className="text-xs font-bold text-[#999] mb-2">초대코드</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono font-bold text-xl tracking-widest text-[#111] uppercase">
            {codeRegen ?? club.invite_code}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {isOwner && (
              <button
                onClick={() => {
                  setDialog({
                    title: '초대코드 재발급',
                    description: '초대코드를 재발급하면 기존 코드는 사용할 수 없어요. 계속할까요?',
                    confirmText: '재발급',
                    onConfirm: () => {
                      setDialog(null)
                      startTransition(async () => {
                        const result = await regenerateInviteCodeAction(club.id)
                        if (result.success && result.invite_code) setCodeRegen(result.invite_code)
                        else alert(result.error ?? '재발급 실패')
                      })
                    },
                  })
                }}
                disabled={isPending}
                className="flex items-center gap-1 text-xs font-semibold text-[#999] border border-[#e5e5e5] px-2.5 py-1.5 rounded-xl hover:bg-[#f8f8f8] transition-colors disabled:opacity-50"
              >
                재발급
              </button>
            )}
            <button
              onClick={copyInviteCode}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#555] border border-[#e5e5e5] px-3 py-1.5 rounded-xl hover:bg-[#f8f8f8] transition-colors"
            >
              <Copy size={13} />
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>
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
                  onChange={(e) => changeRole(m.id, e.target.value as 'manager' | 'member')}
                  disabled={isPending}
                  className="text-xs border border-[#e5e5e5] rounded-xl px-2 py-1 text-[#555] bg-white focus:outline-none focus:border-[#beff00] transition-colors"
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

      {/* 모임 삭제 (owner만) */}
      {isOwner && (
        <button
          onClick={handleDeleteClub}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 border border-red-200 text-red-500 font-semibold text-sm rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 size={15} />
          모임 삭제
        </button>
      )}

      {dialog && (
        <ConfirmDialog
          open
          title={dialog.title}
          description={dialog.description}
          confirmText={dialog.confirmText}
          variant={dialog.variant}
          onConfirm={dialog.onConfirm}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  )
}
