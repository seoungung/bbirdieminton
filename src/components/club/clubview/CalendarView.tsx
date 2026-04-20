'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, Wallet } from 'lucide-react'
import type { RegularSessionItem } from './types'
import { startTime } from './types'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface Props {
  sessions: RegularSessionItem[]
}

export function CalendarView({ sessions }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // ── 이번 달 날짜 계산 ────────────────────────────────
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const firstWeekday = firstDay.getDay() // 0=일 ~ 6=토
  const totalDays = lastDay.getDate()

  // 빈 셀 + 날짜 셀로 구성된 배열
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  // 6행이 되도록 패딩
  while (cells.length % 7 !== 0) cells.push(null)

  // ── 세션 → 날짜 맵 ────────────────────────────────────
  // key: 'YYYY-MM-DD', value: sessions on that day
  const sessionMap = new Map<string, RegularSessionItem[]>()
  sessions.forEach(s => {
    const existing = sessionMap.get(s.nextDate) ?? []
    sessionMap.set(s.nextDate, [...existing, s])
  })

  const formatDateKey = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }
  const goToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDate(null)
  }

  const selectedSessions = selectedDate ? (sessionMap.get(selectedDate) ?? []) : []

  return (
    <div className="space-y-3">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#f0f0f0] text-[#555] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-base font-extrabold text-[#111] min-w-[100px] text-center">
            {year}년 {month + 1}월
          </span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#f0f0f0] text-[#555] transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          onClick={goToday}
          className="text-xs font-bold text-[#555] border border-[#e5e5e5] px-3 py-1.5 rounded-xl hover:bg-[#f8f8f8] transition-colors"
        >
          오늘
        </button>
      </div>

      {/* 달력 그리드 */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-[#f0f0f0]">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`py-2 text-center text-xs font-bold ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#999]'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />
            }
            const dateKey = formatDateKey(day)
            const daySessions = sessionMap.get(dateKey) ?? []
            const isToday = dateKey === todayKey
            const isSelected = dateKey === selectedDate
            const colIdx = idx % 7

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                className={`relative flex flex-col items-center pt-1.5 pb-1 min-h-[48px] transition-colors ${
                  isSelected
                    ? 'bg-[#beff00]/20'
                    : 'hover:bg-[#f8f8f8]'
                } ${idx !== 0 && idx % 7 !== 0 ? 'border-l border-[#f8f8f8]' : ''}`}
              >
                {/* 날짜 숫자 */}
                <span
                  className={`text-[13px] font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                    isToday
                      ? 'bg-[#0a0a0a] text-white'
                      : isSelected
                      ? 'bg-[#beff00] text-[#111]'
                      : colIdx === 0
                      ? 'text-red-400'
                      : colIdx === 6
                      ? 'text-blue-400'
                      : 'text-[#333]'
                  }`}
                >
                  {day}
                </span>

                {/* 이벤트 닷 */}
                {daySessions.length > 0 && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {daySessions.slice(0, 3).map((_, di) => (
                      <span
                        key={di}
                        className="w-1.5 h-1.5 rounded-full bg-[#beff00] border border-[#a8e600]"
                      />
                    ))}
                    {daySessions.length > 3 && (
                      <span className="text-[8px] text-[#999] font-bold">+</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 선택된 날짜의 이벤트 */}
      {selectedDate && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#888] px-1">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </p>
          {selectedSessions.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#e5e5e5] px-4 py-5 text-center">
              <p className="text-xs text-[#bbb]">이날 일정이 없어요</p>
            </div>
          ) : (
            selectedSessions.map(s => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-[#e5e5e5] px-4 py-3.5 space-y-2"
              >
                <p className="text-sm font-bold text-[#111]">{s.title}</p>
                <div className="space-y-1.5 text-xs text-[#666]">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-[#bbb] shrink-0" />
                    <span>{startTime(s.time)}{s.time.includes('~') ? ` ~ ${s.time.split('~')[1].trim()}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#bbb] shrink-0" />
                    <span>{s.place}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-[#bbb] shrink-0" />
                    <span>
                      {s.currentAttend}/{s.maxAttend}명 참석
                      {s.isAttending && (
                        <span className="ml-1.5 text-[#beff00] font-bold bg-[#0a0a0a] px-1.5 py-0.5 rounded-md">참석</span>
                      )}
                    </span>
                  </div>
                  {s.fee && (
                    <div className="flex items-center gap-1.5">
                      <Wallet size={13} className="text-[#bbb] shrink-0" strokeWidth={2} />
                      <span>{s.fee}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 이번 달 이벤트 없음 */}
      {!selectedDate && sessions.filter(s => {
        const d = new Date(s.nextDate)
        return d.getFullYear() === year && d.getMonth() === month
      }).length === 0 && (
        <div className="text-center py-6 text-xs text-[#bbb]">
          이번 달 등록된 일정이 없어요
        </div>
      )}
    </div>
  )
}
