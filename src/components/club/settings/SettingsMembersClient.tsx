'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
// T0-1-3: Link import 제거 (엑셀 임포트 진입점 hide로 미사용). Stage E 복구 시 추가.
import { Crown, Shield, User } from 'lucide-react'
import type { Club, ClubMemberWithUser, MemberRole } from '@/types/club'
import { updateMemberRoleAction } from '@/app/club/[clubId]/members/actions'
import { updateClubProfileAction } from '@/app/club/[clubId]/settings/actions'
import { ROLE_LABEL } from '@/lib/club/labels'
import { inputCls } from '@/lib/forms/inputClassName'

interface Props {
  club: Club
  members: ClubMemberWithUser[]
  myMemberId: string
  isOwner: boolean
  isManager: boolean
}

const ROLE_ICON: Record<MemberRole, React.ReactNode> = {
  owner: <Crown size={13} className="text-[var(--color-brand-elite)]" />,
  manager: <Shield size={13} className="text-[var(--color-brand-team-a)]" />,
  member: <User size={13} className="text-[#bbb]" />,
}

/**
 * [관리] · 회원·권한 탭
 *
 * 섹션 구성:
 *   1) 최대 코트 수 (manager)
 *   2) 멤버 목록 + 역할 변경 (owner) + 엑셀 임포트 진입점 (manager)
 *
 * 기존 SettingsClient 의 섹션 2/5 를 그대로 옮긴 것 — 로직 변경 0.
 */
export function SettingsMembersClient({
  club,
  members,
  myMemberId,
  isOwner,
  isManager,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
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

  const changeRole = (memberId: string, newRole: 'manager' | 'member') => {
    if (!isOwner) return
    startTransition(async () => {
      await updateMemberRoleAction(memberId, club.id, newRole)
      router.refresh()
    })
  }

  return (
    <div className="space-y-9">
      {/* ── 최대 코트 수 — 운영진만 변경 가능 ── */}
      {isManager && (
        <section>
          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[var(--color-text-strong)] mb-3">
            최대 코트 수
          </h2>
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={20}
              value={courtCount}
              onChange={(e) => setCourtCount(Number(e.target.value))}
              onBlur={handleCourtCountSave}
              disabled={isPending}
              className={`${inputCls} w-24 text-center disabled:opacity-50`}
            />
            <span className="text-sm text-[#999]">면 (1~20)</span>
          </div>
          {courtCountError && (
            <p className="text-xs text-[var(--color-brand-streak)] mt-1.5">{courtCountError}</p>
          )}
          <p className="text-[11px] text-[#999] mt-1.5 leading-relaxed">
            이 모임이 운영할 수 있는 최대 코트 수예요. 매 게임 시작 시 그날 사용할 코트 수를 1~최대값 사이로 조정할 수 있어요.
          </p>
          </div>
        </section>
      )}

      {/* ── 멤버 목록 ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[var(--color-text-strong)]">
            멤버 <span className="text-[#999] font-semibold tabular-nums">{members.length}</span>
          </h2>
          {/* T0-1-3: 엑셀 임포트 진입점 hide (Stage E 부활 예정) */}
        </div>
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
                  className="text-xs border border-[#e5e5e5] rounded-xl px-2 py-1 text-[#555] bg-white focus:outline-none focus:border-[var(--color-brand-lime)] transition-colors"
                >
                  <option value="member">멤버</option>
                  <option value="manager">매니저</option>
                </select>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
