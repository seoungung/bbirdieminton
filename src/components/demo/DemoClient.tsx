'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Share2, Check } from 'lucide-react'

// ── 목 데이터 ─────────────────────────────────────

const CLUB = { name: '화요일 배드민턴 클럽', courtCount: 3, memberCount: 16 }

const MEMBERS = [
  { id: '1', name: '김민준', role: 'owner',   skill: 72, level: 'C조',  games: 48, wins: 31, attending: true,  waiting: false },
  { id: '2', name: '이서연', role: 'manager', skill: 68, level: 'C조',  games: 42, wins: 26, attending: true,  waiting: true  },
  { id: '3', name: '박지호', role: 'member',  skill: 55, level: 'D조',  games: 38, wins: 20, attending: true,  waiting: false },
  { id: '4', name: '최유나', role: 'member',  skill: 61, level: 'D조',  games: 35, wins: 19, attending: true,  waiting: false },
  { id: '5', name: '정태양', role: 'member',  skill: 48, level: 'D조',  games: 29, wins: 14, attending: true,  waiting: true  },
  { id: '6', name: '한소희', role: 'member',  skill: 44, level: 'D조',  games: 22, wins: 10, attending: true,  waiting: false },
  { id: '7', name: '오준서', role: 'member',  skill: 38, level: '초심자', games: 18, wins: 7,  attending: true,  waiting: true  },
  { id: '8', name: '윤하늘', role: 'member',  skill: 35, level: '초심자', games: 15, wins: 5,  attending: false, waiting: false },
  { id: '9', name: '강다현', role: 'member',  skill: 65, level: 'C조',  games: 40, wins: 24, attending: true,  waiting: false },
  { id: '10', name: '임지훈', role: 'member', skill: 52, level: 'D조',  games: 33, wins: 17, attending: true,  waiting: false },
  { id: '11', name: '배은서', role: 'member', skill: 29, level: '초심자', games: 11, wins: 3,  attending: false, waiting: false },
  { id: '12', name: '신현우', role: 'member', skill: 58, level: 'D조',  games: 31, wins: 16, attending: true,  waiting: true  },
]

const COURTS = [
  {
    id: 1, status: 'playing' as const,
    teamA: ['김민준', '최유나'], teamB: ['박지호', '강다현'],
  },
  {
    id: 2, status: 'playing' as const,
    teamA: ['이서연', '임지훈'], teamB: ['한소희', '신현우'],
  },
  {
    id: 3, status: 'waiting' as const,
    teamA: [], teamB: [],
  },
]

const DUES = [
  { name: '김민준', paid: true,  amount: 30000 },
  { name: '이서연', paid: true,  amount: 30000 },
  { name: '박지호', paid: true,  amount: 30000 },
  { name: '최유나', paid: false, amount: 30000 },
  { name: '정태양', paid: true,  amount: 30000 },
  { name: '한소희', paid: false, amount: 30000 },
  { name: '오준서', paid: true,  amount: 30000 },
  { name: '윤하늘', paid: false, amount: 30000 },
  { name: '강다현', paid: true,  amount: 30000 },
  { name: '임지훈', paid: true,  amount: 30000 },
  { name: '배은서', paid: false, amount: 30000 },
  { name: '신현우', paid: true,  amount: 30000 },
]

const ROLE_LABEL: Record<string, string> = { owner: '회장', manager: '운영진', member: '회원' }
const SKILL_COLOR: Record<string, string> = {
  'C조': 'text-purple-500', 'D조': 'text-blue-500',
  '초심자': 'text-green-500', '왕초보': 'text-gray-400',
}

// ── 컴포넌트 ─────────────────────────────────────

export function DemoClient() {
  const [tab, setTab] = useState<'game' | 'members' | 'finance'>('game')
  const [courts, setCourts] = useState(COURTS)
  const [dues, setDues] = useState(DUES)
  const [guestName, setGuestName] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const attendingCount = MEMBERS.filter(m => m.attending).length
  const waitingQueue = MEMBERS.filter(m => m.attending && m.waiting)

  useEffect(() => {
    const stored = localStorage.getItem('guestName')
    if (stored && stored !== '게스트') setGuestName(stored)
  }, [])

  const handleShare = async () => {
    const url = window.location.origin + '/club/home'
    if (navigator.share) {
      await navigator.share({ title: '버디민턴 게임보드', text: '배드민턴 동호회 운영을 더 스마트하게!', url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleAssign(courtId: number) {
    setCourts(prev => prev.map(c =>
      c.id === courtId
        ? { ...c, status: 'playing' as const, teamA: ['정태양', '오준서'], teamB: ['이서연', '신현우'] }
        : c
    ))
  }

  function handleEndGame(courtId: number) {
    setCourts(prev => prev.map(c =>
      c.id === courtId ? { ...c, status: 'waiting' as const, teamA: [], teamB: [] } : c
    ))
  }

  function handleToggleDue(name: string) {
    setDues(prev => prev.map(d => d.name === name ? { ...d, paid: !d.paid } : d))
  }

  const paidCount = dues.filter(d => d.paid).length
  const paidAmount = dues.filter(d => d.paid).reduce((s, d) => s + d.amount, 0)

  return (
    <div className="min-h-screen bg-[#f8f8f8]">

      {/* 클럽 헤더 */}
      <div className="bg-white border-b border-[#e5e5e5] px-4 py-4">
        <div className="max-w-[1088px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-[#111]">{CLUB.name}</h1>
            <p className="text-sm text-[#999] mt-0.5">출석 {attendingCount}명 · 코트 {CLUB.courtCount}개</p>
          </div>
          <span className="text-xs font-bold text-[#beff00] bg-[#0a0a0a] px-2.5 py-1 rounded-lg">진행 중</span>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-4 flex gap-0">
          {([
            { key: 'game',    label: '🏸 게임보드' },
            { key: 'members', label: '👥 회원 관리' },
            { key: 'finance', label: '💰 회비 관리' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === key
                  ? 'border-[#111] text-[#111]'
                  : 'border-transparent text-[#999] hover:text-[#555]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="max-w-[1088px] mx-auto px-4 py-6 pb-24">

        {/* ─── 게임보드 탭 ─── */}
        {tab === 'game' && (
          <div className="space-y-5">
            {/* 코트 그리드 */}
            <div>
              <p className="text-sm font-bold text-[#999] uppercase tracking-wider mb-3">코트 현황</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {courts.map(court => (
                  <div key={court.id} className={`bg-white rounded-2xl border p-4 ${court.status === 'playing' ? 'border-[#beff00]' : 'border-[#e5e5e5]'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-base font-bold text-[#111]">코트 {court.id}</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${court.status === 'playing' ? 'bg-[#beff00] text-[#111]' : 'bg-[#f0f0f0] text-[#999]'}`}>
                        {court.status === 'playing' ? '경기 중' : '대기'}
                      </span>
                    </div>
                    {court.status === 'playing' ? (
                      <div className="space-y-2">
                        <div className="bg-blue-50 rounded-xl p-3">
                          <p className="text-sm font-bold text-blue-500 mb-1.5">팀 A</p>
                          {court.teamA.map(n => <p key={n} className="text-sm text-[#333] font-medium">{n}</p>)}
                        </div>
                        <div className="bg-orange-50 rounded-xl p-3">
                          <p className="text-sm font-bold text-orange-500 mb-1.5">팀 B</p>
                          {court.teamB.map(n => <p key={n} className="text-sm text-[#333] font-medium">{n}</p>)}
                        </div>
                        <button onClick={() => handleEndGame(court.id)}
                          className="w-full text-sm py-2 bg-[#f0f0f0] text-[#555] rounded-xl font-semibold hover:bg-[#e0e0e0] transition-colors">
                          경기 완료
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleAssign(court.id)}
                        className="w-full text-sm py-3 bg-[#beff00] text-[#111] rounded-xl font-bold hover:brightness-95 transition-all">
                        🎯 자동 배정
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 대기 중 */}
            <div>
              <p className="text-sm font-bold text-[#999] uppercase tracking-wider mb-3">대기 중 ({waitingQueue.length}명)</p>
              <div className="flex flex-wrap gap-2">
                {waitingQueue.map(m => (
                  <div key={m.id} className="flex items-center gap-2 bg-white border border-[#e5e5e5] rounded-full px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-[#f0f0f0] flex items-center justify-center text-xs font-bold text-[#555]">{m.name[0]}</div>
                    <span className="text-sm font-medium text-[#333]">{m.name}</span>
                    <span className={`text-xs font-semibold ${SKILL_COLOR[m.level] ?? 'text-gray-400'}`}>{m.level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 출석 현황 */}
            <div>
              <p className="text-sm font-bold text-[#999] uppercase tracking-wider mb-3">출석 현황 ({attendingCount}/{MEMBERS.length}명)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MEMBERS.map(m => (
                  <div key={m.id} className={`flex items-center gap-2 p-3 rounded-xl border ${m.attending ? 'bg-white border-[#e5e5e5]' : 'bg-[#fafafa] border-[#f0f0f0]'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${m.attending ? 'bg-[#beff00] text-[#111]' : 'bg-[#f0f0f0] text-[#bbb]'}`}>
                      {m.name[0]}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${m.attending ? 'text-[#111]' : 'text-[#bbb]'}`}>{m.name}</p>
                      <p className={`text-xs ${SKILL_COLOR[m.level] ?? 'text-gray-400'}`}>{m.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── 회원 관리 탭 ─── */}
        {tab === 'members' && (
          <div className="space-y-3">
            {MEMBERS.map((m, i) => (
              <div key={m.id} className="bg-white rounded-2xl border border-[#e5e5e5] p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-bold text-[#555] shrink-0">
                  {m.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-[#111]">{m.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      m.role === 'owner' ? 'bg-[#beff00] text-[#111]' :
                      m.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                      'bg-[#f0f0f0] text-[#555]'
                    }`}>{ROLE_LABEL[m.role]}</span>
                    {i === 0 && <span className="text-xs text-[#beff00] font-bold">나</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-sm font-semibold ${SKILL_COLOR[m.level] ?? 'text-gray-400'}`}>{m.level}</span>
                    <span className="text-sm text-[#999]">점수 {m.skill}</span>
                    <span className="text-sm text-[#999]">{m.games}경기 · {m.wins}승</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#111]">{Math.round((m.wins / Math.max(m.games, 1)) * 100)}%</p>
                  <p className="text-xs text-[#999]">승률</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── 회비 관리 탭 ─── */}
        {tab === 'finance' && (
          <div className="space-y-4">
            {/* 요약 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 text-center">
                <p className="text-2xl font-extrabold text-[#111]">{paidCount}<span className="text-base font-normal text-[#999]">/{dues.length}</span></p>
                <p className="text-sm text-[#999] mt-1">납부 완료</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 text-center">
                <p className="text-2xl font-extrabold text-orange-500">{dues.length - paidCount}</p>
                <p className="text-sm text-[#999] mt-1">미납</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 text-center">
                <p className="text-lg font-extrabold text-[#111]">{(paidAmount / 10000).toFixed(0)}<span className="text-xs font-normal text-[#999]">만원</span></p>
                <p className="text-sm text-[#999] mt-1">수납액</p>
              </div>
            </div>

            {/* 납부율 바 */}
            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
              <div className="flex justify-between text-sm text-[#999] mb-2">
                <span>4월 납부율</span>
                <span>{Math.round((paidCount / dues.length) * 100)}%</span>
              </div>
              <div className="w-full bg-[#f0f0f0] rounded-full h-2.5">
                <div className="bg-[#beff00] h-2.5 rounded-full transition-all" style={{ width: `${(paidCount / dues.length) * 100}%` }} />
              </div>
            </div>

            {/* 회원별 */}
            <div className="space-y-2">
              {[...dues].sort((a, b) => Number(a.paid) - Number(b.paid)).map(due => (
                <div key={due.name} className={`bg-white rounded-2xl border p-4 flex items-center gap-3 ${due.paid ? 'border-[#e5e5e5]' : 'border-orange-200'}`}>
                  <div className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-bold text-[#555] shrink-0">
                    {due.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-[#111]">{due.name}</p>
                    <p className="text-sm text-[#999] mt-0.5">{due.amount.toLocaleString()}원</p>
                  </div>
                  {due.paid
                    ? <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">✓ 완료</span>
                    : <span className="text-sm font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full">미납</span>
                  }
                  <button
                    onClick={() => handleToggleDue(due.name)}
                    className={`text-sm px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      due.paid ? 'bg-[#f0f0f0] text-[#555] hover:bg-[#e0e0e0]' : 'bg-[#beff00] text-[#111] hover:brightness-95'
                    }`}
                  >
                    {due.paid ? '취소' : '납부확인'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 고정 띠 */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[#e5e5e5] px-4 py-3 z-50">
        <div className="max-w-[1088px] mx-auto flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#111] truncate">
            {guestName ? `👋 ${guestName}님, 체험 중입니다` : '🎮 데모 체험 중입니다'}
          </p>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/survey"
              className="text-sm px-4 py-2 border border-[#e5e5e5] rounded-xl text-[#555] font-semibold hover:border-[#111] transition-colors"
            >
              설문 참여하기
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-sm px-4 py-2 bg-[#beff00] text-[#111] rounded-xl font-bold hover:brightness-95 transition-all"
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? '복사됨!' : '공유하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
