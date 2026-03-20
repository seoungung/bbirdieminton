'use client'

import { useState, useCallback } from 'react'

const LEVEL_ORDER = ['beginner', 'novice', 'd_class', 'c_class']
const LEVEL_LABELS: Record<string, string> = {
  beginner: '왕초보', novice: '초심자', d_class: 'D조', c_class: 'C조',
}
const LEVEL_COLORS: Record<string, string> = {
  beginner: '#60a5fa', novice: '#facc15', d_class: '#fb923c', c_class: '#f87171',
}
const GENDER_ORDER = ['male', 'female', 'other']
const GENDER_LABELS: Record<string, string> = {
  male: '남성', female: '여성', other: '기타',
}

interface Stats {
  total: number
  todayCount: number
  weekCount: number
  byLevel: Record<string, number>
  byGender: Record<string, number>
  crossTable: Record<string, Record<string, number>>
  recent: { email: string; level: string; gender: string; createdAt: string }[]
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: pct + '%', backgroundColor: color }}
        />
      </div>
      <span className="text-white text-sm font-bold w-6 text-right">{value}</span>
    </div>
  )
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [stats, setStats]       = useState<Stats | null>(null)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (!res.ok) { setError('비밀번호가 틀렸습니다.'); return }
    setStats(await res.json())
  }, [password])

  // ── 로그인 화면 ──────────────────────────────
  if (!stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <p className="text-[#beff00] text-xs font-bold uppercase tracking-widest mb-2">Admin</p>
          <h1 className="text-2xl font-extrabold text-white mb-6">관리자 대시보드</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="관리자 비밀번호"
              className="h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 text-sm outline-none focus:border-[#beff00]/60"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="h-12 bg-[#beff00] text-black font-extrabold text-sm rounded-xl hover:brightness-110 disabled:opacity-50"
            >
              {loading ? '확인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── 대시보드 ─────────────────────────────────
  const maxLevel  = Math.max(...Object.values(stats.byLevel), 1)
  const maxGender = Math.max(...Object.values(stats.byGender), 1)

  return (
    <div className="min-h-screen bg-background text-white px-4 py-10 pb-28 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#beff00] text-xs font-bold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-2xl font-extrabold">퀴즈 결과 대시보드</h1>
        </div>
        <button
          onClick={() => setStats(null)}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          로그아웃
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: '총 구독자', value: stats.total },
          { label: '오늘 신규',  value: stats.todayCount },
          { label: '이번 주',    value: stats.weekCount },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
            <p className="text-[28px] font-extrabold text-[#beff00]">{value}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* 레벨별 분포 */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4">
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">레벨별 분포</h2>
        <div className="flex flex-col gap-3">
          {LEVEL_ORDER.map(key => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-white/70 w-14 shrink-0">{LEVEL_LABELS[key]}</span>
              <Bar value={stats.byLevel[key] ?? 0} max={maxLevel} color={LEVEL_COLORS[key]} />
            </div>
          ))}
        </div>
      </div>

      {/* 성별 분포 */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4">
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">성별 분포</h2>
        <div className="flex flex-col gap-3">
          {GENDER_ORDER.map(key => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-white/70 w-14 shrink-0">{GENDER_LABELS[key]}</span>
              <Bar value={stats.byGender[key] ?? 0} max={maxGender} color="#beff00" />
            </div>
          ))}
        </div>
      </div>

      {/* 레벨 × 성별 크로스 테이블 */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4 overflow-x-auto">
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">레벨 × 성별</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs">
              <th className="text-left pb-2 pr-4">레벨</th>
              {GENDER_ORDER.map(g => <th key={g} className="text-right pb-2 px-3">{GENDER_LABELS[g]}</th>)}
              <th className="text-right pb-2 pl-3">합계</th>
            </tr>
          </thead>
          <tbody>
            {LEVEL_ORDER.map(lv => {
              const row = stats.crossTable[lv] ?? {}
              const rowTotal = Object.values(row).reduce((s, v) => s + v, 0)
              return (
                <tr key={lv} className="border-t border-white/5">
                  <td className="py-2 pr-4 text-white/80 font-medium">{LEVEL_LABELS[lv]}</td>
                  {GENDER_ORDER.map(g => (
                    <td key={g} className="py-2 px-3 text-right text-white/60">{row[g] ?? 0}</td>
                  ))}
                  <td className="py-2 pl-3 text-right font-bold text-white">{rowTotal}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 최근 구독자 */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">최근 구독자 10명</h2>
        <div className="flex flex-col gap-2">
          {stats.recent.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
              <span className="text-white/70 truncate max-w-[180px]">{r.email}</span>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">{r.level}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">{r.gender}</span>
                <span className="text-[11px] text-white/30">{r.createdAt}</span>
              </div>
            </div>
          ))}
          {stats.recent.length === 0 && (
            <p className="text-white/30 text-sm">아직 구독자가 없어요.</p>
          )}
        </div>
      </div>
    </div>
  )
}
