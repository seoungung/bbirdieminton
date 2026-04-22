import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  accent?: 'court' | 'streak' | 'lime' | 'default'
}

const accentStyles: Record<NonNullable<StatCardProps['accent']>, string> = {
  court:   'text-[#10b981]',
  streak:  'text-[#f59e0b]',
  lime:    'text-[#beff00]',
  default: 'text-[#111]',
}

export function StatCard({ label, value, sub, icon, accent = 'default' }: StatCardProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-xl p-4">
      {icon && <div className="mb-2 text-[#999]">{icon}</div>}
      <p className="text-[12px] font-semibold text-[#999] uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${accentStyles[accent]}`}>{value}</p>
      {sub && <p className="text-[12px] text-[#bbb] mt-0.5">{sub}</p>}
    </div>
  )
}
