'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateClubProfileAction } from '@/app/club/[clubId]/settings/actions'
import { createClubEventAction, toggleEventAttendanceAction } from '@/app/club/[clubId]/events/actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

/* ── 타입 ──────────────────────────────────────────── */

type Tab = '홈' | '정기모임' | '게임보드' | '운영' | '설정'
const TABS: Tab[] = ['홈', '정기모임', '게임보드', '운영', '설정']

export type UserStatus = 'demo' | 'guest' | 'non-member' | 'member'

export interface ClubViewData {
  id: string
  name: string
  description: string | null
  court_count: number
  created_at: string
  memberCount: number
  location: string
  activityPlace: string
  category: string
  leaderName: string
  thumbnailColor: string
}

export interface MemberViewItem {
  id: string
  name: string
  role: string
  skill?: number
  level?: string
}

export interface RegularSessionItem {
  id: string
  title: string
  dayOfWeek: string
  time: string
  place: string
  fee?: string
  nextDate: string
  maxAttend: number
  currentAttend: number
  thumbnailColor: string
  isAttending?: boolean
}

export interface GameSessionItem {
  id: string
  sessionDate: string
  status: 'open' | 'in_progress' | 'closed'
  notes: string | null
}

interface Props {
  club: ClubViewData
  members: MemberViewItem[]
  regularSessions: RegularSessionItem[]
  userStatus: UserStatus
  clubId: string
  isAuthenticated: boolean
  isOwner: boolean
  isManager: boolean
  gameSessions: GameSessionItem[]
  myMemberId?: string | null
}

/* ── 상수 ──────────────────────────────────────────── */

const ROLE_LABEL: Record<string, string> = {
  owner: '운영자',
  manager: '매니저',
  member: '멤버',
}

const AVATAR_COLORS = [
  '#beff00', '#c8f5ff', '#ffd6e0', '#ffd700',
  '#d4f5d4', '#e8d4ff', '#ffd4b3', '#b3e8ff',
]

const MEMBERS_PREVIEW = 7 // 홈탭 기본 노출 수

/* ── 유틸 ──────────────────────────────────────────── */

function calcDDay(nextDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(nextDate)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function isNewClub(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 14 * 24 * 60 * 60 * 1000
}

function formatShortDate(nextDate: string, dayOfWeek: string) {
  const parts = nextDate.split('-')
  return `${parseInt(parts[1])}.${parseInt(parts[2])}(${dayOfWeek})`
}

function startTime(time: string) {
  return time.split('~')[0].trim()
}


/* ── 공유 핸들러 ──────────────────────────────────── */

async function shareSession(
  s: RegularSessionItem,
  clubId: string,
  onCopied: () => void,
) {
  const url = `${window.location.origin}/club/${clubId}/view`
  const text = `${s.title}\n${formatShortDate(s.nextDate, s.dayOfWeek)} ${startTime(s.time)} · ${s.place}`

  try {
    if (navigator.share) {
      await navigator.share({ title: s.title, text, url })
    } else {
      await navigator.clipboard.writeText(url)
      onCopied()
    }
  } catch {
    // 사용자가 공유 취소 — 무시
  }
}

/* ── 서브 컴포넌트 ─────────────────────────────────── */

function DDayBadge({ dDay }: { dDay: number }) {
  if (dDay < 0) {
    return (
      <span className="text-sm font-bold text-[#999] bg-[#f0f0f0] px-2.5 py-1 rounded-lg whitespace-nowrap">
        종료
      </span>
    )
  }
  if (dDay === 0) {
    return (
      <span className="text-sm font-extrabold text-[#beff00] bg-[#111] px-2.5 py-1 rounded-lg whitespace-nowrap">
        D-Day
      </span>
    )
  }
  return (
    <span className="text-sm font-extrabold text-[#beff00] bg-[#111] px-2.5 py-1 rounded-lg whitespace-nowrap">
      D-{dDay}
    </span>
  )
}

function Avatar({
  name,
  color,
  size = 'md',
}: {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const cls =
    size === 'sm' ? 'w-9 h-9 text-sm' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-12 h-12 text-base'
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-bold text-[#111] shrink-0`}
      style={{ background: color }}
    >
      {name.charAt(0)}
    </div>
  )
}

function CtaButton({ userStatus, clubId }: { userStatus: UserStatus; clubId: string }) {
  const base =
    'flex items-center justify-center w-full bg-[#beff00] text-[#111] font-extrabold text-lg py-4 rounded-2xl hover:brightness-95 transition-all'

  if (userStatus === 'demo' || userStatus === 'guest') return null
  if (userStatus === 'member') {
    return <Link href={`/club/${clubId}/gameboard`} className={base}>게임보드 입장하기</Link>
  }
  return <Link href="/club/join" className={base}>초대코드로 참여</Link>
}

/* ── 홈 탭 ─────────────────────────────────────────── */

function HomeTab({
  club,
  members,
  rankings,
  regularSessions,
  onGoToSessions,
}: {
  club: ClubViewData
  members: MemberViewItem[]
  rankings: MemberViewItem[]
  regularSessions: RegularSessionItem[]
  onGoToSessions: () => void
}) {
  const [showAllMembers, setShowAllMembers] = useState(false)

  const visibleMembers = showAllMembers ? members : members.slice(0, MEMBERS_PREVIEW)
  const remainingCount = club.memberCount - members.length // 실제 DB에 없는 나머지

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

          {/* 더보기 / 접기 */}
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

          {/* 표시된 멤버 외 DB에 없는 나머지 (실제 서비스) */}
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

/* ── 정기모임 만들기 모달 ────────────────────────────── */

const EMPTY_FORM = { title: '', date: '', startTime: '', endTime: '', place: '', fee: '', maxAttend: '' }

function CreateSessionModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (data: typeof EMPTY_FORM) => void
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-3xl w-full max-w-[480px] shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e5]">
          <h2 className="text-lg font-extrabold text-[#111]">정기모임 만들기</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] text-[#888] transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* 폼 */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-semibold text-[#555] mb-1.5">모임 제목 <span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="예: 토요일 오전민턴"
              value={form.title}
              onChange={set('title')}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors"
            />
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-sm font-semibold text-[#555] mb-1.5">날짜 <span className="text-red-400">*</span></label>
            <input
              type="date"
              value={form.date}
              onChange={set('date')}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors"
            />
          </div>

          {/* 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#555] mb-1.5">시작 시간 <span className="text-red-400">*</span></label>
              <input
                type="time"
                value={form.startTime}
                onChange={set('startTime')}
                className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#555] mb-1.5">종료 시간</label>
              <input
                type="time"
                value={form.endTime}
                onChange={set('endTime')}
                className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors"
              />
            </div>
          </div>

          {/* 장소 */}
          <div>
            <label className="block text-sm font-semibold text-[#555] mb-1.5">장소 <span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="예: 국사봉체육관"
              value={form.place}
              onChange={set('place')}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors"
            />
          </div>

          {/* 비용 */}
          <div>
            <label className="block text-sm font-semibold text-[#555] mb-1.5">비용 <span className="text-[#bbb] font-normal">(선택)</span></label>
            <input
              type="text"
              placeholder="예: 국사봉 입장비용"
              value={form.fee}
              onChange={set('fee')}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors"
            />
          </div>

          {/* 최대 인원 */}
          <div>
            <label className="block text-sm font-semibold text-[#555] mb-1.5">최대 참석 인원 <span className="text-red-400">*</span></label>
            <input
              type="number"
              min="1"
              max="100"
              placeholder="예: 24"
              value={form.maxAttend}
              onChange={set('maxAttend')}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors"
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-[#e5e5e5] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#e5e5e5] text-sm font-bold text-[#555] hover:bg-[#f8f8f8] transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={!form.title || !form.date || !form.startTime || !form.place || !form.maxAttend}
            className="flex-1 py-3 rounded-xl bg-[#beff00] text-[#111] text-sm font-extrabold hover:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            만들기
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── 정기모임 탭 ────────────────────────────────────── */

function RegularSessionTab({
  regularSessions,
  members,
  userStatus,
  clubId,
  onShowToast,
  myMemberId,
}: {
  regularSessions: RegularSessionItem[]
  members: MemberViewItem[]
  userStatus: UserStatus
  clubId: string
  onShowToast: (msg: string) => void
  myMemberId?: string | null
}) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [, startEventTransition] = useTransition()
  const [attendPending, startAttendTransition] = useTransition()

  const handleShare = async (s: RegularSessionItem) => {
    await shareSession(s, clubId, () => onShowToast('링크가 복사됐어요!'))
  }

  const handleCreate = (data: typeof EMPTY_FORM) => {
    setShowCreateModal(false)
    if (userStatus !== 'member' || !myMemberId) {
      onShowToast('로그인 후 정기모임을 만들 수 있어요')
      return
    }
    startEventTransition(async () => {
      const result = await createClubEventAction(clubId, myMemberId, {
        title: data.title,
        event_date: data.date,
        start_time: data.startTime,
        end_time: data.endTime || undefined,
        place: data.place,
        fee: data.fee || undefined,
        max_attend: parseInt(data.maxAttend) || 20,
      })
      if (result.error) {
        onShowToast(result.error)
      } else {
        onShowToast(`"${data.title}" 일정이 추가됐어요!`)
      }
    })
  }

  return (
    <>
      {/* 탭 헤더: 만들기 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-base font-bold text-[#555]">정기모임 {regularSessions.length}개</p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-[#111] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#333] transition-colors"
        >
          <span className="text-base leading-none">+</span>
          정기모임 만들기
        </button>
      </div>

      {regularSessions.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-base font-semibold text-[#555]">등록된 정기모임이 없어요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {regularSessions.map((s, si) => {
            const dDay = calcDDay(s.nextDate)
            const isClosed = dDay < 0
            const attendees = members.slice(0, Math.min(4, s.currentAttend))

            return (
              <div key={s.id} className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden">
                <div className="p-5">
                  {/* D-day + 제목 */}
                  <div className="flex items-center gap-3 mb-4">
                    <DDayBadge dDay={dDay} />
                    <p className="text-lg font-bold text-[#111]">{s.title}</p>
                  </div>

                  {/* 정보 + 썸네일 */}
                  <div className="flex gap-5 items-start">
                    <div className="flex-1 space-y-3">
                      {/* 정보 rows */}
                      {[
                        { label: '일시', value: `${formatShortDate(s.nextDate, s.dayOfWeek)} ${startTime(s.time)}` },
                        { label: '위치', value: s.place },
                        ...(s.fee ? [{ label: '비용', value: s.fee }] : []),
                        { label: '참석', value: `${s.currentAttend}명 참석중 (${s.currentAttend}/${s.maxAttend})` },
                      ].map(row => (
                        <div key={row.label} className="flex items-start gap-3">
                          <span className="text-sm text-[#999] w-8 shrink-0">{row.label}</span>
                          <span className="text-sm text-[#111] font-medium">{row.value}</span>
                        </div>
                      ))}

                      {/* 참석자 아바타 — 참석 row 바로 아래 */}
                      {attendees.length > 0 && (
                        <div className="flex items-center pt-1">
                          {attendees.map((m, i) => (
                            <div
                              key={m.id}
                              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[#111] border-2 border-white shadow-sm -ml-2 first:ml-0"
                              style={{ background: AVATAR_COLORS[(si * 4 + i) % AVATAR_COLORS.length] }}
                            >
                              {m.name.charAt(0)}
                            </div>
                          ))}
                          {s.currentAttend > 4 && (
                            <span className="text-xs text-[#888] ml-2">+{s.currentAttend - 4}명</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 썸네일 200×200 */}
                    <div
                      className="w-[200px] h-[200px] rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: s.thumbnailColor }}
                    >
                      <span className="text-8xl select-none">🏸</span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#f0f0f0]">
                    {/* 공유 */}
                    <button
                      onClick={() => handleShare(s)}
                      className="w-11 h-11 rounded-xl bg-[#f8f8f8] flex items-center justify-center hover:bg-[#f0f0f0] transition-all active:scale-90"
                      aria-label="공유하기"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </button>

                    <div className="flex-1" />

                    {/* 참석 토글 */}
                    {!isClosed && userStatus === 'member' && myMemberId ? (
                      <button
                        onClick={() => {
                          const newStatus = s.isAttending ? 'not_going' : 'going'
                          startAttendTransition(async () => {
                            const result = await toggleEventAttendanceAction(s.id, myMemberId, clubId, newStatus)
                            if (result.error) onShowToast(result.error)
                          })
                        }}
                        disabled={attendPending}
                        className={`font-bold text-base px-7 py-2.5 rounded-xl transition-all disabled:opacity-50 ${
                          s.isAttending
                            ? 'bg-[#111] text-white hover:bg-[#333]'
                            : 'bg-[#beff00] text-[#111] hover:brightness-95'
                        }`}
                      >
                        {s.isAttending ? '참석 취소' : '참석'}
                      </button>
                    ) : !isClosed ? (
                      <button
                        disabled
                        className="bg-[#beff00] text-[#111] font-bold text-base px-7 py-2.5 rounded-xl opacity-35 cursor-not-allowed"
                        title="모임 멤버만 참석할 수 있어요"
                      >
                        참석
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 모달 */}
      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}
    </>
  )
}

/* ── 게임보드 탭 ────────────────────────────────────── */

function GameBoardTab({
  userStatus,
  clubId,
  gameSessions,
}: {
  userStatus: UserStatus
  clubId: string
  gameSessions: GameSessionItem[]
}) {
  const features = [
    { icon: '🏸', label: '대진표 자동 생성' },
    { icon: '📊', label: '실시간 점수 기록' },
    { icon: '🏆', label: '랭킹 자동 집계' },
    { icon: '👥', label: '팀 매칭 최적화' },
  ]

  const ctaHref =
    userStatus === 'demo' || userStatus === 'guest'
      ? '/club/demo'
      : userStatus === 'member'
      ? `/club/${clubId}/gameboard`
      : '/club/join'

  const ctaLabel =
    userStatus === 'demo' || userStatus === 'guest'
      ? '게임보드 열기'
      : userStatus === 'member'
      ? '게임보드 입장하기'
      : '모임 참여 후 이용하기'

  function statusLabel(status: GameSessionItem['status']) {
    if (status === 'open') return '진행 중'
    if (status === 'in_progress') return '경기 중'
    return '완료'
  }

  function statusClass(status: GameSessionItem['status']) {
    if (status === 'open') return 'bg-[#beff00]/20 text-[#5a7a00]'
    if (status === 'in_progress') return 'bg-blue-50 text-blue-600'
    return 'bg-[#f0f0f0] text-[#999]'
  }

  // 게임 기록이 있으면 카드 목록 표시
  if (gameSessions.length > 0) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold text-[#999]">게임 기록 {gameSessions.length}개</p>
          <Link
            href={ctaHref}
            className="text-xs font-semibold text-[#beff00] bg-[#111] px-3 py-1.5 rounded-xl hover:brightness-110 transition-all"
          >
            {ctaLabel}
          </Link>
        </div>
        {gameSessions.map(s => (
          <div
            key={s.id}
            className="bg-white border border-[#e5e5e5] rounded-2xl px-4 py-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-[#111]">
                {new Date(s.sessionDate).toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                })}
              </p>
              {s.notes && (
                <p className="text-xs text-[#999] mt-0.5 line-clamp-1">{s.notes}</p>
              )}
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusClass(s.status)}`}>
              {statusLabel(s.status)}
            </span>
          </div>
        ))}
      </section>
    )
  }

  // 게임 기록 없으면 설명 화면
  return (
    <section className="bg-white border border-[#e5e5e5] rounded-2xl p-6">
      <div className="text-center mb-6">
        <p className="text-5xl mb-3">🎮</p>
        <h2 className="text-xl font-bold text-[#111] mb-2">게임보드</h2>
        <p className="text-base text-[#666]">실시간 대진, 점수, 랭킹을 한 곳에서 관리해요</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {features.map(f => (
          <div key={f.label} className="bg-[#f8f8f8] rounded-xl p-3.5 flex items-center gap-2.5">
            <span className="text-xl">{f.icon}</span>
            <span className="text-sm font-semibold text-[#555]">{f.label}</span>
          </div>
        ))}
      </div>
      <Link
        href={ctaHref}
        className="flex items-center justify-center w-full bg-[#beff00] text-[#111] font-extrabold text-lg py-4 rounded-2xl hover:brightness-95 transition-all"
      >
        {ctaLabel}
      </Link>
    </section>
  )
}

/* ── 운영 탭 ────────────────────────────────────────── */

function ManageTab({ userStatus, clubId }: { userStatus: UserStatus; clubId: string }) {
  if (userStatus === 'member') {
    return (
      <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">
        <h2 className="text-lg font-bold text-[#111] mb-4">운영</h2>
        <Link
          href={`/club/${clubId}/manage`}
          className="flex items-center justify-between py-4 px-4 bg-[#f8f8f8] rounded-xl hover:bg-[#f0f0f0] transition-all"
        >
          <span className="text-base font-semibold text-[#111]">모임 관리 페이지로 이동</span>
          <span className="text-lg text-[#999]">→</span>
        </Link>
      </section>
    )
  }

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 text-center">
      <p className="text-5xl mb-3">🔒</p>
      <p className="text-xl font-bold text-[#111] mb-2">모임 멤버 전용</p>
      <p className="text-base text-[#888]">운영 기능은 모임 멤버만 이용할 수 있어요</p>
      {userStatus === 'non-member' && (
        <Link
          href="/club/join"
          className="mt-6 inline-flex items-center justify-center bg-[#beff00] text-[#111] font-bold text-base py-3 px-7 rounded-xl hover:brightness-95 transition-all"
        >
          초대코드로 참여
        </Link>
      )}
    </div>
  )
}

/* ── 설정 탭 ────────────────────────────────────────── */

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f8f8f8] transition-colors"
      >
        <span className="text-sm font-bold text-[#111]">{title}</span>
        <ChevronDown
          size={16}
          className={`text-[#bbb] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-[#f0f0f0] px-5 py-4">
          {children}
        </div>
      )}
    </div>
  )
}

const THUMB_COLORS = [
  '#beff00', '#c8f5ff', '#ffd6e0', '#ffd700',
  '#d4f5d4', '#e8d4ff', '#ffd4b3', '#b3e8ff',
  '#f0f0f0', '#0a0a0a',
]

function SettingsTab({
  club,
  userStatus,
  clubId,
  isOwner,
  isManager,
}: {
  club: ClubViewData
  userStatus: UserStatus
  clubId: string
  isOwner: boolean
  isManager: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [editName, setEditName] = useState(club.name)
  const [editDesc, setEditDesc] = useState(club.description ?? '')
  const [editLocation, setEditLocation] = useState(club.location ?? '')
  const [editPlace, setEditPlace] = useState(club.activityPlace ?? '')
  const [editColor, setEditColor] = useState(club.thumbnailColor)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)

  const [notifMode, setNotifMode] = useState<'push' | 'silent' | 'off'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(`notif-${clubId}`) as 'push' | 'silent' | 'off') || 'push'
    }
    return 'push'
  })

  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)

  const [dialog, setDialog] = useState<{
    title: string
    description: string
    confirmText?: string
    variant?: 'default' | 'destructive'
    onConfirm: () => void
  } | null>(null)

  const handleNotif = (v: 'push' | 'silent' | 'off') => {
    setNotifMode(v)
    if (typeof window !== 'undefined') localStorage.setItem(`notif-${clubId}`, v)
  }

  const handleSaveProfile = () => {
    if (!editName.trim()) { setSaveError('모임 이름을 입력해주세요'); return }
    setSaveError(null)
    startTransition(async () => {
      const result = await updateClubProfileAction(clubId, {
        name: editName,
        description: editDesc,
        location: editLocation,
        activity_place: editPlace,
        thumbnail_color: editColor,
      })
      if (result.error) { setSaveError(result.error); return }
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 2000)
      router.refresh()
    })
  }

  const handleDeleteClub = () => {
    setDialog({
      title: '모임 삭제',
      description: `'${club.name}' 모임을 삭제하시겠어요?\n\n모든 멤버, 경기 기록, 랭킹이 영구 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`,
      confirmText: '삭제',
      variant: 'destructive',
      onConfirm: () => {
        setDialog(null)
        startTransition(async () => {
          const supabase = createClient()
          const { error } = await supabase.rpc('delete_club_cascade', { p_club_id: clubId })
          if (error) { alert('모임 삭제에 실패했습니다'); return }
          router.push('/club/home')
        })
      },
    })
  }

  const handleReport = () => {
    if (!reportReason.trim()) return
    setReportSent(true)
    setTimeout(() => { setShowReport(false); setReportSent(false); setReportReason('') }, 1800)
  }

  const NOTIF_OPTIONS: { value: 'push' | 'silent' | 'off'; label: string; desc: string }[] = [
    { value: 'push', label: '푸시 알림', desc: '새 소식을 알림으로 받아요' },
    { value: 'silent', label: '무음 알림 (팝업)', desc: '앱 내 팝업으로만 표시돼요' },
    { value: 'off', label: '알림 없음', desc: '어떠한 알림도 받지 않아요' },
  ]

  return (
    <div className="space-y-3">

      {/* 모임 프로필 */}
      <AccordionSection title="모임 프로필" defaultOpen={true}>
        {isManager ? (
          <div className="space-y-4">
            {/* 썸네일 색상 */}
            <div>
              <p className="text-xs font-semibold text-[#999] mb-2">썸네일 색상</p>
              <div className="flex gap-2 flex-wrap mb-2">
                {THUMB_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setEditColor(c)}
                    className="w-9 h-9 rounded-xl border-2 transition-all shrink-0"
                    style={{
                      background: c,
                      borderColor: editColor === c ? '#111' : 'transparent',
                      outline: editColor === c ? '2px solid #111' : 'none',
                      outlineOffset: '1px',
                    }}
                  />
                ))}
              </div>
              <div
                className="w-full h-12 rounded-xl flex items-center justify-center text-2xl transition-colors"
                style={{ background: editColor }}
              >
                🏸
              </div>
            </div>
            {/* 모임명 */}
            <div>
              <label className="text-xs font-semibold text-[#999] mb-1.5 block">모임명</label>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                maxLength={30}
                className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors"
              />
            </div>
            {/* 소개 */}
            <div>
              <label className="text-xs font-semibold text-[#999] mb-1.5 block">소개</label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                maxLength={300}
                rows={3}
                className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] resize-none focus:outline-none focus:border-[#beff00] transition-colors"
              />
            </div>
            {/* 지역 / 장소 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#999] mb-1.5 block">지역</label>
                <input
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  maxLength={20}
                  className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#999] mb-1.5 block">장소</label>
                <input
                  value={editPlace}
                  onChange={e => setEditPlace(e.target.value)}
                  maxLength={30}
                  className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors"
                />
              </div>
            </div>
            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
            <button
              onClick={handleSaveProfile}
              disabled={isPending}
              className="w-full py-3 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
            >
              {saveOk ? '✓ 저장됨' : isPending ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: '모임명', value: club.name },
              { label: '소개', value: club.description },
              { label: '지역', value: club.location },
              { label: '장소', value: club.activityPlace },
              { label: '멤버', value: `${club.memberCount}명` },
              { label: '운영자', value: club.leaderName },
            ]
              .filter(row => !!row.value)
              .map(row => (
                <div key={row.label} className="flex items-start justify-between gap-4">
                  <span className="text-sm text-[#999] shrink-0 w-14">{row.label}</span>
                  <span className="text-sm font-semibold text-[#111] text-right leading-relaxed">{row.value}</span>
                </div>
              ))}
          </div>
        )}
      </AccordionSection>

      {/* 알림 설정 */}
      <AccordionSection title="알림 설정">
        <div className="space-y-2">
          {NOTIF_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleNotif(opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                notifMode === opt.value ? 'border-[#111] bg-[#f8f8f8]' : 'border-[#e5e5e5] hover:border-[#ccc]'
              }`}
            >
              <div className="text-left">
                <p className={`text-sm font-semibold ${notifMode === opt.value ? 'text-[#111]' : 'text-[#555]'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-[#999] mt-0.5">{opt.desc}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                notifMode === opt.value ? 'border-[#111] bg-[#111]' : 'border-[#ddd]'
              }`}>
                {notifMode === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* 기타 액션 */}
      <div className="space-y-2.5 pt-1">
        {userStatus === 'member' && !isOwner && (
          <Link
            href={`/club/${clubId}/settings`}
            className="w-full flex items-center justify-center gap-2 py-3.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl hover:bg-[#f8f8f8] transition-colors"
          >
            모임 나가기
          </Link>
        )}
        <button
          onClick={() => setShowReport(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl hover:bg-[#f8f8f8] transition-colors"
        >
          🚨 모임 신고하기
        </button>
        {isOwner && (
          <button
            onClick={handleDeleteClub}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 border border-red-200 text-red-500 font-semibold text-sm rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            모임 삭제하기
          </button>
        )}
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

      {/* 신고 모달 */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
            {reportSent ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-3">✅</p>
                <p className="font-bold text-[#111]">신고가 접수되었습니다</p>
                <p className="text-sm text-[#999] mt-1">검토 후 조치하겠습니다</p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-[#111] text-base mb-1">모임 신고하기</h3>
                <p className="text-sm text-[#999] mb-4">신고 사유를 간단히 적어주세요</p>
                <textarea
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="예: 허위 정보, 부적절한 콘텐츠 등"
                  className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[#beff00] transition-colors mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReport(false)}
                    className="flex-1 py-2.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl"
                  >취소</button>
                  <button
                    onClick={handleReport}
                    disabled={!reportReason.trim()}
                    className="flex-1 py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl disabled:opacity-40"
                  >신고하기</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 토스트 ─────────────────────────────────────────── */

function Toast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#111] text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg animate-fade-in-up whitespace-nowrap pointer-events-none">
      {message}
    </div>
  )
}

/* ── 메인 컴포넌트 ─────────────────────────────────── */

export function ClubViewClient({
  club,
  members,
  regularSessions,
  userStatus,
  clubId,
  isAuthenticated,
  isOwner,
  isManager,
  gameSessions,
  myMemberId,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('홈')
  const [isFav, setIsFav] = useState(false)
  const [toast, setToast] = useState('')

  const isNew = isNewClub(club.created_at)
  const rankings = [...members].sort((a, b) => (b.skill ?? 0) - (a.skill ?? 0))

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favoriteClubs') || '[]') as string[]
    setIsFav(favs.includes(clubId))
  }, [clubId])

  const toggleFav = () => {
    const favs = JSON.parse(localStorage.getItem('favoriteClubs') || '[]') as string[]
    const next = isFav ? favs.filter((id: string) => id !== clubId) : [...favs, clubId]
    localStorage.setItem('favoriteClubs', JSON.stringify(next))
    setIsFav(!isFav)
  }

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }, [])

  const goToSessions = useCallback(() => setActiveTab('정기모임'), [])

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* ── 상단 고정 (헤더 + 탭바) ── */}
      <div className="sticky top-0 z-30 bg-white">
        <div className="border-b border-[#e5e5e5]">
          <div className="max-w-[1088px] mx-auto flex items-center justify-between px-5 h-14">
            <Link href={(userStatus === 'guest' || userStatus === 'demo') ? '/login?next=%2Fclub%2Fhome' : '/club/home'} className="text-[#555] hover:text-[#111] transition-colors" aria-label="뒤로 가기">
              <span className="text-2xl leading-none">←</span>
            </Link>
            <span className="text-base font-bold text-[#111] truncate max-w-[220px]">{club.name}</span>
            <button
              onClick={toggleFav}
              className="text-2xl transition-transform active:scale-90 select-none"
              aria-label={isFav ? '찜 취소' : '찜하기'}
            >
              {isFav ? '❤️' : '🤍'}
            </button>
          </div>
        </div>

        <div className="border-b border-[#e5e5e5]">
          <div className="max-w-[1088px] mx-auto flex">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-base font-bold transition-colors relative ${
                  activeTab === tab ? 'text-[#111]' : 'text-[#bbb]'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#111] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 썸네일 히어로 (게임보드 탭에서는 숨김) ── */}
      {activeTab !== '게임보드' && activeTab !== '운영' && activeTab !== '설정' && (
        <div
          className="w-full h-[200px] flex items-center justify-center relative"
          style={{ background: club.thumbnailColor }}
        >
          <span className="text-8xl select-none">🏸</span>
          {isNew && (
            <span className="absolute top-4 right-4 text-xs font-extrabold px-2.5 py-1 bg-[#111] text-[#beff00] rounded-lg tracking-wide">
              NEW
            </span>
          )}
        </div>
      )}

      {/* ── 메타 스트립 ── */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-5 py-3 flex items-center gap-2 flex-wrap text-sm text-[#666]">
          {club.location && <span>{club.location}</span>}
          {club.location && <span className="text-[#ddd]">·</span>}
          {club.activityPlace && <span>{club.activityPlace}</span>}
          {club.activityPlace && <span className="text-[#ddd]">·</span>}
          <span className="bg-[#f0f0f0] text-[#555] font-semibold px-2 py-0.5 rounded-md text-xs">
            {club.category || '동호회'}
          </span>
          <span className="text-[#ddd]">·</span>
          <span>멤버 {club.memberCount}명</span>
        </div>
      </div>

      {/* ── 모임명 + CTA ── */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-5 pt-4 pb-5">
          <h1 className="text-2xl font-extrabold text-[#111] mb-1">{club.name}</h1>
          <p className="text-sm text-[#888] mb-4">운영자 · {club.leaderName}</p>
          <CtaButton userStatus={userStatus} clubId={clubId} />
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div className="max-w-[1088px] mx-auto px-5 py-5">
        {activeTab === '홈' && (
          <HomeTab
            club={club}
            members={members}
            rankings={rankings}
            regularSessions={regularSessions}
            onGoToSessions={goToSessions}
          />
        )}
        {activeTab === '정기모임' && (
          <RegularSessionTab
            regularSessions={regularSessions}
            members={members}
            userStatus={userStatus}
            clubId={clubId}
            onShowToast={showToast}
            myMemberId={myMemberId}
          />
        )}
        {activeTab === '게임보드' && (
          <GameBoardTab userStatus={userStatus} clubId={clubId} gameSessions={gameSessions} />
        )}
        {activeTab === '운영' && (
          <ManageTab userStatus={userStatus} clubId={clubId} />
        )}
        {activeTab === '설정' && (
          <SettingsTab club={club} userStatus={userStatus} clubId={clubId} isOwner={isOwner} isManager={isManager} />
        )}
      </div>

      {/* ── 토스트 ── */}
      <Toast message={toast} />

      {/* ── 데모 체험 바 ── */}
      {userStatus === 'demo' && isAuthenticated && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#e5e5e5] shadow-lg">
          <div className="max-w-[1088px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">🎮</span>
              <span className="text-sm font-semibold text-[#555] truncate">데모 체험 중입니다</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.open('https://forms.gle/demo', '_blank')}
                className="text-xs font-semibold text-[#555] border border-[#e5e5e5] px-3 py-2 rounded-xl hover:bg-[#f8f8f8] transition-colors whitespace-nowrap"
              >
                설문 참여하기
              </button>
              <button
                onClick={async () => {
                  const url = window.location.href
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: '버디민턴 데모', url })
                    } else {
                      await navigator.clipboard.writeText(url)
                    }
                  } catch { /* ignore */ }
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-[#111] bg-[#beff00] px-3 py-2 rounded-xl hover:brightness-95 transition-all whitespace-nowrap"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                공유하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
