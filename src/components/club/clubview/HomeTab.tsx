'use client'

import { useState } from 'react'
import {
  ClubViewData,
  MemberViewItem,
  RegularSessionItem,
  AVATAR_COLORS,
  MEMBERS_PREVIEW,
  calcDDay,
  formatShortDate,
  startTime,
} from './types'
import { DDayBadge, Avatar } from './SharedUI'

const ROLE_LABEL: Record<string, string> = {
  owner: '운영자',
  manager: '매니저',
  member: '멤버',
}

interface Props {
  club: ClubViewData
  members: MemberViewItem[]
  rankings: MemberViewItem[]
  regularSessions: RegularSessionItem[]
  onGoToSessions: () => void
}

export function HomeTab({ club, members, rankings, regularSessions, onGoToSessions }: Props) {
  const [showAllMembers, setShowAllMembers] = useState(false)

  const visibleMembers = showAllMembers ? members : members.slice(0, MEMBERS_PREVIEW)
  const remainingCount = club.memberCount - members.length

  return (
    <div className="space-y-4">
      {/* ── 모임 소개 ── */}
      <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">
        <h2 className="text-lg font-bold text-[#111] mb-3">모임 소개</h2>
        <p className="text-base text-[#555] leading-relaxed whitespace-pre-line">
          {club.description ??
            `${club.name}은 함께 배드민턴을 즐기는 모임입니다. 코트 ${club.court_count}면에서 활동 중이에요.`}
        </p>
      </section>

      {/* ── 멤버 ── */}
      <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">
        <h2 className="text-lg font-bold text-[#111] mb-4">
          멤버{' '}
          <span className="text-[#999] font-normal text-base">({club.memberCount}명)</span>
        </h2>

        <div className="flex flex-wrap gap-4">
          {visibleMembers.map((m, i) => (
            <div key={m.id} className="flex flex-col items-center gap-1.5 w-14">
              <Avatar name={m.name} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
              <span className="text-xs font-semibold text-[#111] text-center leading-tight truncate w-full">
                {m.name}
              </span>
              <span className="text-xs text-[#999]">{ROLE_LABEL[m.role] ?? '멤버'}</span>
            </div>
          ))}

          {members.length > MEMBERS_PREVIEW && (
            <button
              onClick={() => setShowAllMembers(v => !v)}
              className="flex flex-col items-center gap-1.5 w-14"
            >
              <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-bold text-[#555] hover:bg-[#e8e8e8] transition-colors">
                {showAllMembers ? '▲' : `+${members.length - MEMBERS_PREVIEW}`}
              </div>
              <span className="text-xs text-[#888]">{showAllMembers ? '접기' : '더보기'}</span>
            </button>
          )}

          {!showAllMembers && remainingCount > 0 && (
            <div className="flex flex-col items-center gap-1.5 w-14">
              <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-bold text-[#888]">
                +{remainingCount}
              </div>
              <span className="text-xs text-[#888]">외</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 정기모임 미리보기 ── */}
      {regularSessions.length > 0 && (
        <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-[#111]">📅 정기 모임</h2>
            <button
              onClick={onGoToSessions}
              className="text-sm font-semibold text-[#888] hover:text-[#111] transition-colors"
            >
              전체보기 →
            </button>
          </div>

          <div className="space-y-2.5">
            {regularSessions.map(s => {
              const dDay = calcDDay(s.nextDate)
              return (
                <button
                  key={s.id}
                  onClick={onGoToSessions}
                  className="w-full flex items-center gap-3 py-3 px-3.5 bg-[#f8f8f8] rounded-xl hover:bg-[#f0f0f0] transition-colors text-left"
                >
                  <DDayBadge dDay={dDay} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#111] truncate">{s.title}</p>
                    <p className="text-xs text-[#888] mt-0.5">
                      {formatShortDate(s.nextDate, s.dayOfWeek)} {startTime(s.time)} · {s.place}
                    </p>
                  </div>
                  <span className="text-xs text-[#999] shrink-0">{s.currentAttend}/{s.maxAttend}명</span>
                  <span className="text-[#bbb] text-sm">›</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 랭킹 ── */}
      {rankings.length > 0 && (
        <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">
          <h2 className="text-lg font-bold text-[#111] mb-4">🏆 랭킹</h2>
          <div className="flex flex-col gap-2">
            {rankings.slice(0, 5).map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 py-2.5 px-3 bg-[#f8f8f8] rounded-xl">
                <span
                  className={`text-base font-extrabold w-6 text-center ${
                    i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-[#A8A8A8]' : i === 2 ? 'text-[#CD7F32]' : 'text-[#ccc]'
                  }`}
                >
                  {i + 1}
                </span>
                <Avatar name={m.name} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} size="sm" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-[#111]">{m.name}</span>
                  {m.level && <span className="ml-2 text-xs text-[#888]">{m.level}</span>}
                </div>
                {m.skill !== undefined && (
                  <span className="text-sm font-bold text-[#111] shrink-0">{m.skill}점</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
