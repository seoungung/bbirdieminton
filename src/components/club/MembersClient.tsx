'use client'

import Link from 'next/link'
import { useState, useTransition, useMemo } from 'react'
import { updateMemberRoleAction, updateSkillScoreAction, removeMemberAction, updateMemberGenderAction } from '@/app/club/[clubId]/members/actions'
import type { ClubMemberWithUser, PlayerStats, MemberRole } from '@/types/club'
import { buildRankMap } from '@/lib/club/grade'
import type { RatingMap } from '@/lib/club/client'
import { ROLE_LABEL } from '@/lib/club/labels'
import { GradeBadge } from '@/components/club/GradeBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const ROLE_COLOR: Record<MemberRole, string> = {
  owner: 'bg-[var(--color-brand-lime)] text-[#111]',
  manager: 'bg-[var(--color-brand-team-a-bg)] text-[var(--color-brand-elite)]',
  member: 'bg-[#f0f0f0] text-[#555]',
}


interface Props {
  clubId: string
  members: ClubMemberWithUser[]
  statsData: PlayerStats[]
  isManager: boolean
  isOwner: boolean
  myMemberId: string
  /** member_id → Glicko-2 레이팅. mu 있으면 mu 기반 등급, 없으면 skill_score fallback */
  ratingsMap?: RatingMap
}

export function MembersClient({ clubId, members, statsData, isManager, isOwner, myMemberId, ratingsMap = {} }: Props) {
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
  const rankMap = useMemo(() => buildRankMap(members), [members])

  const filtered = filter === 'all' ? members : members.filter(m => m.role === filter)

  function handleSkillSave(memberId: string) {
    const trimmed = skillInput.trim()
    const score = Number(trimmed)
    if (
      trimmed === '' ||
      !Number.isFinite(score) ||
      !Number.isInteger(score) ||
      score < 0 ||
      score > 100
    ) {
      return
    }
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
            <div key={member.id} className={`bg-white rounded-2xl border p-4 ${isMe ? 'border-[var(--color-brand-lime)]' : 'border-[#e5e5e5]'}`}>
              <div className="flex items-center gap-3">
                {/* 아바타 */}
                <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center text-base font-bold text-[#555] shrink-0">
                  {member.user?.name?.[0] ?? '?'}
                </div>

                {/* 이름 + 역할 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <GradeBadge
                      score={member.skill_score}
                      mu={ratingsMap[member.id]?.mu ?? null}
                      size="md"
                    />
                    <Link
                      href={`/club/${clubId}/members/${member.id}`}
                      className="font-bold text-[#111] text-base truncate hover:underline underline-offset-2 decoration-[var(--color-brand-lime)] decoration-2"
                    >
                      {member.user?.name ?? '이름없음'}
                    </Link>
                    {isMe && (
                      <span className="text-[10px] font-extrabold text-[#111] bg-[var(--color-brand-lime)] px-1.5 py-0.5 rounded">나</span>
                    )}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ROLE_COLOR[member.role]}`}>
                      {ROLE_LABEL[member.role]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {rankMap.get(member.id) && (
                      <span className="text-xs font-bold text-[#555] bg-[#f0f0f0] rounded-full px-2 py-0.5 tabular-nums">
                        {rankMap.get(member.id)}위
                      </span>
                    )}
                    <span className="text-xs text-[#999] tabular-nums">
                      점수 <span className="font-semibold text-[#555]">{member.skill_score}</span>
                    </span>
                    {stats && (
                      <span className="text-xs text-[#999] tabular-nums">
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
                            title: '회원 내보내기',
                            description: `'${member.user?.name ?? '이 회원'}'을 내보내시겠어요?\n과거 경기 기록은 유지됩니다.`,
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
                        className="text-sm px-2.5 py-1.5 rounded-lg border border-[var(--color-brand-streak-soft)] text-[var(--color-brand-streak)] hover:bg-[var(--color-brand-streak-bg)] transition-colors disabled:opacity-50"
                      >
                        내보내기
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 성별 표시 */}
              <div className="flex items-center gap-1.5 mt-1">
                {member.gender === 'F' ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-brand-team-b-bg)] text-[var(--color-brand-team-b)]">여</span>
                ) : member.gender === 'M' ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-brand-team-a-bg)] text-[var(--color-brand-team-a)]">남</span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f0f0f0] text-[#999]">미지정</span>
                )}
              </div>

              {/* 실력 점수 편집 (관리자) */}
              {isManager && (
                <div className="mt-3 pt-3 border-t border-[#f0f0f0]">
                  {editingSkill === member.id ? (
                    <div className="space-y-2">
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
                          className="text-sm px-3 py-1.5 bg-[var(--color-brand-lime)] text-[#111] rounded-lg font-bold disabled:opacity-50">저장</button>
                        <button onClick={() => setEditingSkill(null)}
                          className="text-sm px-3 py-1.5 bg-[#f0f0f0] text-[#555] rounded-lg">취소</button>
                      </div>
                      {/* 점수 → 급수 가이드 */}
                      <div className="bg-[#f8f8f8] border border-[#f0f0f0] rounded-lg p-2.5">
                        <p className="text-[10px] font-bold text-[#999] mb-1.5 uppercase tracking-wider">급수별 점수 기준</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[10px]">
                          <span><strong className="text-purple-700">S</strong> 90~100 자강조</span>
                          <span><strong className="text-red-700">A</strong> 80~89 A조</span>
                          <span><strong className="text-orange-700">B</strong> 65~79 B조</span>
                          <span><strong className="text-amber-700">C</strong> 50~64 C조</span>
                          <span><strong className="text-green-700">D</strong> 35~49 D조</span>
                          <span><strong className="text-sky-700">E</strong> 20~34 초심</span>
                          <span><strong className="text-gray-600">F</strong> 0~19 왕초보</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => { setEditingSkill(member.id); setSkillInput(String(member.skill_score)) }}
                        className="text-sm text-[#999] hover:text-[#111] transition-colors"
                      >
                        실력 점수 수정 →
                      </button>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-xs text-[#999]">성별</span>
                        {(['M', 'F', null] as const).map((g) => (
                          <button
                            key={String(g)}
                            onClick={() => {
                              startTransition(async () => {
                                await updateMemberGenderAction(member.id, clubId, g)
                              })
                            }}
                            disabled={isPending}
                            className={`text-xs px-2 py-0.5 rounded font-bold transition-colors disabled:opacity-50 ${
                              member.gender === g
                                ? g === 'F'
                                  ? 'bg-[var(--color-brand-team-b)] text-white'
                                  : g === 'M'
                                  ? 'bg-[var(--color-brand-team-a)] text-white'
                                  : 'bg-[#555] text-white'
                                : 'bg-[#f0f0f0] text-[#555] hover:bg-[#e0e0e0]'
                            }`}
                          >
                            {g === 'M' ? '남자' : g === 'F' ? '여자' : '미지정'}
                          </button>
                        ))}
                      </div>
                    </div>
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
