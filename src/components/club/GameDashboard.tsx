'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Copy,
  Check,
  Users,
  Plus,
  Trash2,
  Shuffle,
  Trophy,
  LogOut,
  UserPlus,
  Swords,
  X,
} from 'lucide-react'
import type { Club, ClubMemberWithUser, ClubMember, Session } from '@/types/club'

interface Props {
  club: Club
  members: ClubMemberWithUser[]
  todaySession: Session | null
  myMembership: ClubMember | null
}

type PlayerStatus = 'waiting' | 'playing' | 'done'

interface PlayerState {
  memberId: string
  status: PlayerStatus
  courtNumber: number | null
  gameCount: number
}

interface CourtState {
  number: number
  teamA: string[] // memberId[]
  teamB: string[] // memberId[]
  status: 'available' | 'playing'
}

function getDisplayName(member: ClubMemberWithUser) {
  return member.user?.name || '이름없음'
}

function getRoleLabel(role: string) {
  return role === 'owner' ? '운영자' : role === 'manager' ? '매니저' : '멤버'
}

type FilterStatus = 'all' | 'waiting' | 'playing' | 'done'

export function GameDashboard({ club, members, todaySession, myMembership }: Props) {
  const [copied, setCopied] = useState(false)
  const [courts, setCourts] = useState<CourtState[]>(
    Array.from({ length: club.court_count }, (_, i) => ({
      number: i + 1,
      teamA: [],
      teamB: [],
      status: 'available' as const,
    }))
  )
  const [playerStates, setPlayerStates] = useState<Record<string, PlayerState>>(
    Object.fromEntries(
      members.map((m) => [m.id, { memberId: m.id, status: 'waiting', courtNumber: null, gameCount: 0 }])
    )
  )
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [waitingQueue, setWaitingQueue] = useState<string[]>([]) // memberId[]
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(club.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addCourt = () => {
    setCourts((prev) => [
      ...prev,
      { number: prev.length + 1, teamA: [], teamB: [], status: 'available' },
    ])
  }

  const removeCourt = (num: number) => {
    setCourts((prev) => prev.filter((c) => c.number !== num).map((c, i) => ({ ...c, number: i + 1 })))
  }

  const toggleWaiting = (memberId: string) => {
    setWaitingQueue((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
  }

  const randomAssign = () => {
    const waitingMembers = [...waitingQueue]
    const availableCourts = courts.filter((c) => c.status === 'available')
    if (waitingMembers.length < 4 || availableCourts.length === 0) return

    // shuffle
    for (let i = waitingMembers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[waitingMembers[i], waitingMembers[j]] = [waitingMembers[j], waitingMembers[i]]
    }

    const newCourts = [...courts]
    let memberIdx = 0
    for (const court of newCourts) {
      if (court.status !== 'available' || memberIdx + 4 > waitingMembers.length) continue
      court.teamA = waitingMembers.slice(memberIdx, memberIdx + 2)
      court.teamB = waitingMembers.slice(memberIdx + 2, memberIdx + 4)
      court.status = 'playing'
      memberIdx += 4
    }

    setCourts(newCourts)
    setWaitingQueue((prev) => prev.filter((id) => !waitingMembers.slice(0, memberIdx).includes(id)))

    // update player states
    setPlayerStates((prev) => {
      const next = { ...prev }
      newCourts.forEach((c) => {
        ;[...c.teamA, ...c.teamB].forEach((id) => {
          const member = members.find((m) => m.id === id || m.user_id === id)
          if (member && next[member.id]) {
            next[member.id] = { ...next[member.id], status: 'playing', courtNumber: c.number }
          }
        })
      })
      return next
    })
  }

  const filteredMembers = members.filter((m) => {
    const state = playerStates[m.id]
    if (filterStatus === 'all') return true
    return state?.status === filterStatus
  })

  const waitingCount = Object.values(playerStates).filter((s) => s.status === 'waiting').length
  const playingCount = Object.values(playerStates).filter((s) => s.status === 'playing').length

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-24">
      {/* ── Top bar ── */}
      <header className="bg-white border-b border-[#e5e5e5] sticky top-0 z-30">
        <div className="px-4 py-3">
          {/* Row 1: back + title + code + member count */}
          <div className="flex items-center gap-3 mb-2.5">
            <Link href="/club/home" className="text-[#bbb] hover:text-[#111] transition-colors shrink-0">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h1 className="font-bold text-[#111] text-base truncate">{club.name}</h1>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 bg-[#f8f8f8] border border-[#e5e5e5] rounded-lg px-2 py-0.5 text-[11px] text-[#777] hover:border-[#beff00] transition-colors shrink-0"
              >
                {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                <span className="font-mono font-semibold">{club.invite_code}</span>
              </button>
              <span className="flex items-center gap-1 text-[11px] text-[#999] shrink-0">
                <Users size={12} />
                {members.length}명
              </span>
            </div>
          </div>

          {/* Row 2: action buttons (scroll horizontally on mobile) */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            {[
              { icon: UserPlus, label: '플레이어 추가', href: `/club/${club.id}/settings`, color: 'bg-blue-500' },
              { icon: Plus, label: '코트 추가', onClick: addCourt, color: 'bg-indigo-500' },
              { icon: Shuffle, label: '팀 구성', onClick: randomAssign, color: 'bg-violet-500' },
              { icon: Trophy, label: '게임 결과', href: `/club/${club.id}/ranking`, color: 'bg-green-500' },
              { icon: X, label: '게임 종료', onClick: () => setShowEndConfirm(true), color: 'bg-red-500' },
              { icon: LogOut, label: '나가기', href: '/club/home', color: 'bg-[#555]' },
            ].map(({ icon: Icon, label, href, onClick, color }) => {
              const cls = `flex items-center gap-1.5 ${color} text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap hover:opacity-90 transition-opacity shrink-0`
              return href ? (
                <Link key={label} href={href} className={cls}>
                  <Icon size={13} />
                  {label}
                </Link>
              ) : (
                <button key={label} onClick={onClick} className={cls}>
                  <Icon size={13} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <div className="lg:flex lg:gap-5 lg:px-5 lg:py-5 max-w-6xl mx-auto">
        {/* ── Main content ── */}
        <div className="flex-1 space-y-4 px-4 py-4 lg:px-0 lg:py-0">

          {/* Courts section */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courts.map((court) => (
                <div
                  key={court.number}
                  className={`bg-white rounded-2xl border-2 p-4 transition-colors ${
                    court.status === 'playing'
                      ? 'border-[#beff00]'
                      : 'border-[#e5e5e5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#111] text-sm">코트 {court.number}</h3>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        court.status === 'playing'
                          ? 'bg-[#beff00]/20 text-[#6a8800]'
                          : 'bg-[#f0f0f0] text-[#777]'
                      }`}
                    >
                      {court.status === 'playing' ? '경기 중' : '사용 가능'}
                    </span>
                  </div>

                  {court.status === 'playing' ? (
                    <div className="space-y-2 mb-3">
                      {/* Team A */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5">
                        <p className="text-[10px] font-bold text-blue-500 mb-1.5">팀 A</p>
                        <div className="flex flex-wrap gap-1.5">
                          {court.teamA.map((id) => {
                            const m = members.find((mem) => mem.id === id || mem.user_id === id)
                            return m ? (
                              <span key={id} className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-lg">
                                {getDisplayName(m)}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                      {/* Team B */}
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-2.5">
                        <p className="text-[10px] font-bold text-orange-500 mb-1.5">팀 B</p>
                        <div className="flex flex-wrap gap-1.5">
                          {court.teamB.map((id) => {
                            const m = members.find((mem) => mem.id === id || mem.user_id === id)
                            return m ? (
                              <span key={id} className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-lg">
                                {getDisplayName(m)}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-16 mb-3">
                      <div className="text-center">
                        <Swords size={22} className="text-[#ddd] mx-auto mb-1" />
                        <p className="text-xs text-[#bbb]">플레이어 배정 대기</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1.5">
                    {court.status === 'available' ? (
                      <button
                        onClick={randomAssign}
                        className="flex-1 py-2 bg-[#111] text-white text-xs font-semibold rounded-xl hover:bg-[#333] transition-colors"
                      >
                        플레이어 배정
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setCourts((prev) =>
                            prev.map((c) => c.number === court.number ? { ...c, teamA: [], teamB: [], status: 'available' } : c)
                          )
                        }}
                        className="flex-1 py-2 bg-[#beff00] text-[#111] text-xs font-bold rounded-xl hover:brightness-95 transition-all"
                      >
                        경기 완료
                      </button>
                    )}
                    <button
                      onClick={() => removeCourt(court.number)}
                      className="py-2 px-3 bg-red-50 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add court placeholder */}
              <button
                onClick={addCourt}
                className="bg-white border-2 border-dashed border-[#e5e5e5] rounded-2xl p-4 h-36 flex flex-col items-center justify-center gap-2 text-[#bbb] hover:border-[#beff00] hover:text-[#beff00] transition-colors"
              >
                <Plus size={22} />
                <span className="text-xs font-semibold">코트 추가</span>
              </button>
            </div>
          </section>

          {/* Player list */}
          <section>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#111] to-[#333] rounded-2xl px-4 py-3 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#beff00]" />
                <span className="font-bold text-white text-sm">
                  조회된 인원 <span className="text-[#beff00]">{members.length}</span>명
                </span>
              </div>
              <div className="flex gap-2 text-[11px] text-white/60">
                <span>대기 <span className="text-[#beff00] font-bold">{waitingCount}</span></span>
                <span>·</span>
                <span>경기 중 <span className="text-white font-bold">{playingCount}</span></span>
              </div>
            </div>

            {/* Status filter */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {([
                { key: 'all', label: '전체' },
                { key: 'waiting', label: '대기중' },
                { key: 'playing', label: '경기중' },
                { key: 'done', label: '완료' },
              ] as { key: FilterStatus; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                    filterStatus === key
                      ? 'bg-[#111] text-white'
                      : 'bg-white border border-[#e5e5e5] text-[#777] hover:border-[#111]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Player cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredMembers.map((member) => {
                const state = playerStates[member.id]
                const inQueue = waitingQueue.includes(member.id)
                return (
                  <div
                    key={member.id}
                    className={`bg-white border rounded-xl p-3 transition-colors ${
                      inQueue ? 'border-[#beff00] bg-[#beff00]/5' : 'border-[#e5e5e5]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-[#111] text-sm leading-snug">{getDisplayName(member)}</p>
                        <p className="text-[10px] text-[#999]">{getRoleLabel(member.role)}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          state?.status === 'playing'
                            ? 'bg-[#beff00]/20 text-[#6a8800]'
                            : state?.status === 'done'
                            ? 'bg-[#f0f0f0] text-[#bbb]'
                            : 'bg-blue-50 text-blue-500'
                        }`}
                      >
                        {state?.status === 'playing' ? '경기중' : state?.status === 'done' ? '완료' : '대기'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#999] mb-2.5">
                      <span>점수 {member.skill_score}</span>
                      <span>게임 {state?.gameCount ?? 0}회</span>
                    </div>
                    <button
                      onClick={() => toggleWaiting(member.id)}
                      className={`w-full py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                        inQueue
                          ? 'bg-red-50 text-red-400 hover:bg-red-100'
                          : 'bg-[#111] text-white hover:bg-[#333]'
                      }`}
                    >
                      {inQueue ? '대기 취소' : '+ 대기'}
                    </button>
                  </div>
                )
              })}

              {filteredMembers.length === 0 && (
                <div className="col-span-2 sm:col-span-3 text-center py-10 text-sm text-[#bbb]">
                  해당 상태의 플레이어가 없어요
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Right sidebar (waiting queue) ── */}
        <aside className="lg:w-64 shrink-0">
          {/* Mobile: fixed bottom bar */}
          <div className="fixed bottom-0 inset-x-0 lg:hidden bg-white border-t border-[#e5e5e5] z-20 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#111] text-sm">
                대기열 <span className="text-[#beff00]">{waitingQueue.length}</span>
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={randomAssign}
                  disabled={waitingQueue.length < 4}
                  className="flex items-center gap-1 bg-[#beff00] text-[#111] font-bold text-xs px-3 py-1.5 rounded-lg disabled:opacity-40"
                >
                  <Shuffle size={13} />
                  랜덤 배정
                </button>
                <button
                  onClick={() => setWaitingQueue([])}
                  className="text-xs font-semibold bg-[#f0f0f0] text-[#777] px-3 py-1.5 rounded-lg hover:bg-[#e5e5e5]"
                >
                  초기화
                </button>
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
              {waitingQueue.length === 0 ? (
                <span className="text-xs text-[#bbb] py-1">플레이어 카드에서 + 대기 버튼을 눌러주세요</span>
              ) : (
                waitingQueue.map((id) => {
                  const m = members.find((mem) => mem.id === id)
                  return m ? (
                    <span
                      key={id}
                      className="bg-[#111] text-white text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap"
                    >
                      {getDisplayName(m)}
                    </span>
                  ) : null
                })
              )}
            </div>
          </div>

          {/* Desktop: sticky sidebar */}
          <div className="hidden lg:block sticky top-24 bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#111] to-[#333] px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                대기열 <span className="text-[#beff00]">{waitingQueue.length}</span>
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setWaitingQueue([])}
                  className="text-[11px] font-semibold bg-white/10 text-white px-2 py-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  초기화
                </button>
              </div>
            </div>

            {/* Queue slots */}
            <div className="p-3 grid grid-cols-2 gap-2 min-h-[140px]">
              {waitingQueue.length === 0 ? (
                <div className="col-span-2 flex items-center justify-center text-xs text-[#bbb] text-center py-4">
                  플레이어 카드에서<br />+ 대기를 눌러주세요
                </div>
              ) : (
                waitingQueue.map((id, idx) => {
                  const m = members.find((mem) => mem.id === id)
                  const teamColor = idx < 2 ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-orange-200 bg-orange-50 text-orange-700'
                  return m ? (
                    <div key={id} className={`border rounded-xl p-2 text-center ${teamColor}`}>
                      <p className="text-xs font-bold">{getDisplayName(m)}</p>
                      <p className="text-[10px] opacity-60">{idx < 2 ? '팀 A' : '팀 B'}</p>
                    </div>
                  ) : null
                })
              )}
            </div>

            <div className="px-3 pb-3 flex gap-1.5">
              <button
                onClick={randomAssign}
                disabled={waitingQueue.length < 4}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#beff00] text-[#111] font-bold text-xs py-2.5 rounded-xl disabled:opacity-40 hover:brightness-95 transition-all"
              >
                <Shuffle size={13} />
                랜덤 배정
              </button>
              <button
                disabled={waitingQueue.length < 4}
                className="flex-1 bg-[#111] text-white font-bold text-xs py-2.5 rounded-xl disabled:opacity-40 hover:bg-[#333] transition-colors"
              >
                배정
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Game end confirm modal ── */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
            <h3 className="font-bold text-[#111] text-base mb-2">게임을 종료할까요?</h3>
            <p className="text-sm text-[#777] mb-6">오늘의 게임이 종료되고 결과가 저장됩니다.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl"
              >
                취소
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-colors"
              >
                종료하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
