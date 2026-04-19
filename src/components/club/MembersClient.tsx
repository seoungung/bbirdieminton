'use client'

import { useState, useTransition } from 'react'
import { updateMemberRoleAction, updateSkillScoreAction, removeMemberAction } from '@/app/club/[clubId]/members/actions'
import type { ClubMemberWithUser, PlayerStats, MemberRole } from '@/types/club'
import { getSkillLabel, getSkillColor } from '@/lib/club/skillLevels'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const ROLE_LABEL: Record<MemberRole, string> = { owner: '회장', manager: '운영진', member: '회원' }
const ROLE_COLOR: Record<MemberRole, string> = {
  owner: 'bg-[#beff00] text-[#111]',
  manager: 'bg-blue-100 text-blue-700',
  member: 'bg-[#f0f0f0] text-[#555]',
}


interface Props {
  clubId: string
  members: ClubMemberWithUser[]
  statsData: PlayerStats[]
  isManager: boolean
  isOwner: boolean
  myMemberId: string
}

export function MembersClient({ clubId, members, statsData, isManager, isOwner, myMemberId }: Props) {
  const [editingSkill, setEditingSkill] = useState<string | null>(null)
  const [skillInput, setSkillInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<'all' | MemberRole>('all')
  const [dialog, setDialog] = useState<{
    title: string
    description: string
    confirmText?: string
    variant?: 'default' | 'destructive'
    onConfirm: () => void
  } | null>(null)

  const statsMap = Object.fromEntries(statsData.map(s => [s.member_id, s]))

  const filtered = filter === 'all' ? members : members.filter(m => m.role === filter)

  function handleSkillSave(memberId: string) {
    const score = parseInt(skillInput)
    if (isNaN(score) || score < 0 || score > 100) return
    startTransition(async () => {
      await updateSkillScoreAction(memberId, clubId, score)
      setEditingSkill(null)
    })
  }

  function handleRoleToggle(member: ClubMemberWithUser) {
    if (member.role === 'owner') return
    const next: 'manager' | 'member' = member.role === 'manager' ? 'member' : 'manager'
    startTransition(async () => {
      await updateMemberRoleAction(member.id, clubId, next)
    })
  }

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'owner', 'manager', 'member'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === f ? 'bg-[#111] text-white' : 'bg-[#f0f0f0] text-[#555] hover:bg-[#e0e0e0]'
            }`}
          >
            {f === 'all' ? `전체 (${members.length})` : `${ROLE_LABEL[f]} (${members.filter(m => m.role === f).length})`}
          </button>
        ))}
      </div>

      {/* 멤버 목록 */}
      <div className="space-y-2">
        {filtered.map(member => {
          const stats = statsMap[member.id]
          const isMe = member.id === myMemberId

          return (
            <div key={member.id} className={`bg-white rounded-2xl border p-4 ${isMe ? 'border-[#beff00]' : 'border-[#e5e5e5]'}`}>
              <div className="flex items-center gap-3">
                {/* 아바타 */}
                <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center text-base font-bold text-[#555] shrink-0">
                  {member.user?.name?.[0] ?? '?'}
                </div>

                {/* 이름 + 역할 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#111] text-base">{member.user?.name ?? '이름없음'}</span>
                    {isMe && <span className="text-xs text-[#beff00] font-bold">나</span>}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ROLE_COLOR[member.role]}`}>
                      {ROLE_LABEL[member.role]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: getSkillColor(member.skill_score), color: '#111' }}
                    >
                      {getSkillLabel(member.skill_score)}
                    </span>
                    <span className="text-sm text-[#999]">점수 {member.skill_score}</span>
                    {stats && (
                      <span className="text-sm text-[#999]">
                        {stats.games_played}경기 · {stats.wins}승 {stats.losses}패{stats.draws > 0 ? ` ${stats.draws}무` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* 관리 버튼 (manager/owner 전용) */}
                {isManager && !isMe && member.role !== 'owner' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRoleToggle(member)}
                      disabled={isPending}
                      className="text-sm px-2.5 py-1.5 rounded-lg border border-[#e5e5e5] text-[#555] hover:border-[#111] transition-colors disabled:opacity-50"
                    >
                      {member.role === 'manager' ? '회원으로' : '운영진으로'}
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => {
                          setDialog({
                            title: '멤버 내보내기',
                            description: `'${member.user?.name ?? '이 멤버'}'를 내보내시겠어요?\n과거 경기 기록은 유지됩니다.`,
                            confirmText: '내보내기',
                            variant: 'destructive',
                            onConfirm: () => {
                              setDialog(null)
                              startTransition(async () => {
                                await removeMemberAction(member.id, clubId)
                              })
                            },
                          })
                        }}
                        disabled={isPending}
                        className="text-sm px-2.5 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        내보내기
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 실력 점수 편집 (관리자) */}
              {isManager && (
                <div className="mt-3 pt-3 border-t border-[#f0f0f0]">
                  {editingSkill === member.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        className="w-20 border border-[#e5e5e5] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#111]"
                        placeholder="0-100"
                        autoFocus
                      />
                      <button onClick={() => handleSkillSave(member.id)} disabled={isPending}
                        className="text-sm px-3 py-1.5 bg-[#beff00] text-[#111] rounded-lg font-bold disabled:opacity-50">저장</button>
                      <button onClick={() => setEditingSkill(null)}
                        className="text-sm px-3 py-1.5 bg-[#f0f0f0] text-[#555] rounded-lg">취소</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingSkill(member.id); setSkillInput(String(member.skill_score)) }}
                      className="text-sm text-[#999] hover:text-[#111] transition-colors"
                    >
                      실력 점수 수정 →
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

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
