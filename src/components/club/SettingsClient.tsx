'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, LogOut, Crown, Shield, User, Trash2 } from 'lucide-react'
import type { Club, ClubMemberWithUser, MemberRole } from '@/types/club'
import { updateMemberRoleAction, regenerateInviteCodeAction } from '@/app/club/[clubId]/members/actions'
import {
  deleteClubAction,
  leaveClubAction,
  updateMatchPointTargetAction,
  updateClubProfileAction,
} from '@/app/club/[clubId]/settings/actions'
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

export function SettingsClient({ club, members, myMemberId, isOwner, isManager }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [codeRegen, setCodeRegen] = useState<string | null>(null)
  const [pointTarget, setPointTarget] = useState<21 | 25>(
    (club.match_point_target ?? 25) as 21 | 25,
  )
  const [courtCount, setCourtCount] = useState<number>(club.court_count)
  const [courtCountError, setCourtCountError] = useState<string | null>(null)

  const handleCourtCountSave = () => {
    const clamped = Math.min(20, Math.max(1, courtCount))
    if (clamped === club.court_count) return
    setCourtCountError(null)
    startTransition(async () => {
      const r = await updateClubProfileAction(club.id, {
        name: club.name,
        description: club.description ?? undefined,
        location: club.location ?? undefined,
        court_count: clamped,
      })
      if (r.error) setCourtCountError(r.error)
    })
  }

  const handlePointTargetChange = (next: 21 | 25) => {
    if (next === pointTarget) return
    const prev = pointTarget
    setPointTarget(next) // 낙관적
    startTransition(async () => {
      const r = await updateMatchPointTargetAction(club.id, next)
      if (r.error) {
        setPointTarget(prev)
        alert(r.error)
      }
    })
  }
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
          const result = await deleteClubAction(club.id)
          if (result?.error) { alert(result.error); return }
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
          const result = await leaveClubAction(club.id)
          if (result?.error) { alert(result.error); return }
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

      {/* 최대 코트 수 — 운영진만 변경 가능 */}
      {isManager && (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4">
          <p className="text-xs font-bold text-[#999] mb-3">최대 코트 수</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={20}
              value={courtCount}
              onChange={(e) => setCourtCount(Number(e.target.value))}
              onBlur={handleCourtCountSave}
              disabled={isPending}
              className="w-24 border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm text-[#111] focus:outline-none focus:border-[#beff00] bg-white transition-colors text-center disabled:opacity-50"
            />
            <span className="text-sm text-[#999]">면 (1~20)</span>
          </div>
          {courtCountError && (
            <p className="text-xs text-red-500 mt-1.5">{courtCountError}</p>
          )}
          <p className="text-[11px] text-[#999] mt-1.5 leading-relaxed">
            이 모임이 운영할 수 있는 최대 코트 수예요. 매 게임 시작 시 그날 사용할 코트 수를 1~최대값 사이로 조정할 수 있어요.
          </p>
        </div>
      )}

      {/* 게임 규칙 — 운영진만 변경 가능 */}
      {isManager && (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4">
          <p className="text-xs font-bold text-[#999] mb-1">게임 규칙</p>
          <p className="text-[12px] text-[#666] leading-relaxed mb-3">
            한국 클럽·동호회는 <strong className="text-[#111]">25점 듀스</strong>가 표준,
            정식 대회는 <strong className="text-[#111]">21점</strong>입니다.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {([21, 25] as const).map((n) => {
              const active = pointTarget === n
              return (
                <button
                  key={n}
                  onClick={() => handlePointTargetChange(n)}
                  disabled={isPending}
                  className={
                    'py-3 rounded-xl border text-left transition-colors px-3 ' +
                    (active
                      ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                      : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#0a0a0a]')
                  }
                >
                  <span className="text-sm font-extrabold">{n}점 듀스</span>
                  <p
                    className={
                      'text-[10px] mt-0.5 ' + (active ? 'text-white/70' : 'text-[#999]')
                    }
                  >
                    {n === 21 ? '정식 대회' : '일반 클럽 (기본)'}
                  </p>
                </button>
              )
            })}
          </div>
          <p className="text-[10px] text-[#bbb] mt-2 leading-relaxed">
            · 듀스 시 2점 차로 종료 · 강제 종료점은 종료점+9
            ({pointTarget === 21 ? '21→30' : '25→34'})
          </p>
        </div>
      )}

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
