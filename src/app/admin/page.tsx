'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SummaryStats {
  total: number
  todayCount: number
  weekCount: number
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<SummaryStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const password = localStorage.getItem('admin_password')
        const res = await fetch('/api/admin/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: password ?? '' }),
        })
        if (res.ok) {
          const data = await res.json()
          setStats({ total: data.total, todayCount: data.todayCount, weekCount: data.weekCount })
        }
      } catch {
        // silently fail - stats will show as --
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const summaryCards = [
    { label: '총 구독자', value: stats?.total ?? '--' },
    { label: '오늘 신규', value: stats?.todayCount ?? '--' },
    { label: '이번 주', value: stats?.weekCount ?? '--' },
  ]

  const shortcuts = [
    {
      href: '/admin/quiz',
      title: '퀴즈 통계',
      desc: '레벨별 분포, 성별 통계, 최근 구독자 확인',
      icon: (
        <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      href: '/admin/images',
      title: '이미지 관리',
      desc: '라켓별 이미지 업로드, 삭제, 미리보기',
      icon: (
        <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
      ),
    },
    {
      href: '/admin/guide',
      title: '가이드 관리',
      desc: '가이드북 콘텐츠 작성, 편집, 발행 관리',
      icon: (
        <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto">
      {/* Page title */}
      <h1 className="text-2xl font-extrabold text-[#111111] mb-8">대시보드</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {summaryCards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl bg-white border border-[#e5e5e5] p-4 text-center"
          >
            {loading ? (
              <div className="h-8 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#e5e5e5] border-t-[#beff00] rounded-full animate-spin" />
              </div>
            ) : (
              <p className="text-[28px] font-extrabold text-[#beff00]">{value}</p>
            )}
            <p className="text-xs text-[#999999] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Shortcut cards */}
      <h2 className="text-sm font-bold text-[#555555] uppercase tracking-widest mb-4">바로가기</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shortcuts.map(({ href, title, desc, icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl bg-white border border-[#e5e5e5] p-6 hover:border-[#beff00] transition-colors"
          >
            <div className="text-[#999999] group-hover:text-[#beff00] transition-colors mb-3">
              {icon}
            </div>
            <p className="text-base font-bold text-[#111111]">{title}</p>
            <p className="text-sm text-[#555555] mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
