import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { SessionItem } from './GameboardListClient'

interface Props {
  session: SessionItem
  href: string | null
  cta: string | null
  variant: 'in_progress' | 'closed'
}

function formatDateActive(dateStr: string): string {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(d)
}

function formatDateClosed(dateStr: string): string {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(d)
}

const borderAccent = {
  in_progress: 'border-l-4 border-l-[var(--color-brand-court)]',
  closed: 'border-l-4 border-l-[var(--color-brand-border)] opacity-80',
} as const

export function SessionCard({ session, href, cta, variant }: Props) {
  const date =
    variant === 'closed'
      ? formatDateClosed(session.session_date)
      : formatDateActive(session.session_date)

  const title = session.event?.title ?? null

  const inner = (
    <div
      className={`bg-white border border-[var(--color-brand-border)] rounded-xl p-4 hover:border-[var(--color-brand-border)] transition-colors flex items-center justify-between gap-3 ${borderAccent[variant]}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold text-[var(--color-brand-text)]">
            {date}
          </span>
          {variant === 'closed' && (
            <span className="text-[10px] font-bold text-[var(--color-brand-text-muted)] bg-[var(--color-surface-muted)] px-2 py-0.5 rounded-full">
              종료
            </span>
          )}
        </div>
        {title && (
          <p className="mt-0.5 text-[12px] text-[var(--color-brand-text-sub)] truncate">
            {title}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-2.5 text-[12px] text-[var(--color-brand-text-muted)]">
          <span>{session.attendance_count}명 참여</span>
          <span>·</span>
          <span>코트 {session.court_count}면</span>
        </div>
      </div>

      {cta && (
        <div className="shrink-0 flex items-center gap-0.5 text-[13px] font-semibold text-[var(--color-brand-text-sub)]">
          {cta}
          <ChevronRight size={14} />
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{inner}</Link>
  }
  return <div>{inner}</div>
}
