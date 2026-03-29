'use client'

import { useState, useEffect } from 'react'

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
      <div className="flex-1 h-5 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: pct + '%', backgroundColor: color }}
        />
      </div>
      <span className="text-[#111111] text-sm font-bold w-6 text-right">{value}</span>
    </div>
  )
}

export default function AdminQuizPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchStats() {
      try {
        const password = localStorage.getItem('admin_password')
        const res = await fetch('/api/admin/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: password ?? '' }),
        })
        if (!res.ok) {
          setError('통계 데이터를 불러올 수 없습니다.')
          return
        }
        setStats(await res.json())
      } catch {
        setError('통계 데이터를 불러올 수 없습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#e5e5e5] border-t-[#beff00] rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto">
        <p className="text-red-500 text-sm">{error || '데이터를 불러올 수 없습니다.'}</p>
      </div>
    )
  }

  const maxLevel = Math.max(...Object.values(stats.byLevel), 1)
  const maxGender = Math.max(...Object.values(stats.byGender), 1)

  return (
    <div className="px-4 md:px-8 py-8 pb-28 max-w-3xl mx-auto">
      <h1 className="text-2xl font-extrabold text-[#111111] mb-8">퀴즈 결과 대시보드</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: '총 구독자', value: stats.total },
          { label: '오늘 신규', value: stats.todayCount },
          { label: '이번 주', value: stats.weekCount },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl bg-white border border-[#e5e5e5] p-4 text-center">
            <p className="text-[28px] font-extrabold text-[#beff00]">{value}</p>
            <p className="text-xs text-[#999999] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Level distribution */}
      <div className="rounded-2xl bg-white border border-[#e5e5e5] p-5 mb-4">
        <h2 className="text-sm font-bold text-[#555555] uppercase tracking-widest mb-4">레벨별 분포</h2>
        <div className="flex flex-col gap-3">
          {LEVEL_ORDER.map(key => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-[#555555] w-14 shrink-0">{LEVEL_LABELS[key]}</span>
              <Bar value={stats.byLevel[key] ?? 0} max={maxLevel} color={LEVEL_COLORS[key]} />
            </div>
          ))}
        </div>
      </div>

      {/* Gender distribution */}
      <div className="rounded-2xl bg-white border border-[#e5e5e5] p-5 mb-4">
        <h2 className="text-sm font-bold text-[#555555] uppercase tracking-widest mb-4">성별 분포</h2>
        <div className="flex flex-col gap-3">
          {GENDER_ORDER.map(key => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-[#555555] w-14 shrink-0">{GENDER_LABELS[key]}</span>
              <Bar value={stats.byGender[key] ?? 0} max={maxGender} color="#beff00" />
            </div>
          ))}
        </div>
      </div>

      {/* Cross table */}
      <div className="rounded-2xl bg-white border border-[#e5e5e5] p-5 mb-4 overflow-x-auto">
        <h2 className="text-sm font-bold text-[#555555] uppercase tracking-widest mb-4">레벨 x 성별</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#999999] text-xs">
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
                <tr key={lv} className="border-t border-[#f0f0f0]">
                  <td className="py-2 pr-4 text-[#555555] font-medium">{LEVEL_LABELS[lv]}</td>
                  {GENDER_ORDER.map(g => (
                    <td key={g} className="py-2 px-3 text-right text-[#555555]">{row[g] ?? 0}</td>
                  ))}
                  <td className="py-2 pl-3 text-right font-bold text-[#111111]">{rowTotal}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Recent subscribers */}
      <div className="rounded-2xl bg-white border border-[#e5e5e5] p-5">
        <h2 className="text-sm font-bold text-[#555555] uppercase tracking-widest mb-4">최근 구독자 10명</h2>
        <div className="flex flex-col gap-2">
          {stats.recent.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-sm border-t border-[#f0f0f0] pt-2">
              <span className="text-[#555555] truncate max-w-[180px]">{r.email}</span>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f0f0f0] text-[#555555]">{r.level}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f0f0f0] text-[#555555]">{r.gender}</span>
                <span className="text-[11px] text-[#999999]">{r.createdAt}</span>
              </div>
            </div>
          ))}
          {stats.recent.length === 0 && (
            <p className="text-[#999999] text-sm">아직 구독자가 없어요.</p>
          )}
        </div>
      </div>
    </div>
  )
}
