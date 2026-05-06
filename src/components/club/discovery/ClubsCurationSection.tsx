import type { LucideIcon } from 'lucide-react'
import { ClubsMiniCard } from './ClubsMiniCard'
import type { ClubDiscoveryItem } from './types'

interface Props {
  title: string
  subtitle?: string
  Icon: LucideIcon
  iconColor: string
  clubs: ClubDiscoveryItem[]
}

export function ClubsCurationSection({ title, subtitle, Icon, iconColor, clubs }: Props) {
  if (clubs.length === 0) return null

  return (
    <section className="max-w-[1088px] mx-auto px-4 pt-6 first-of-type:pt-8">
      <header className="mb-3 flex items-baseline gap-2">
        <Icon size={18} strokeWidth={2.4} style={{ color: iconColor }} aria-hidden />
        <h2 className="text-lg font-bold text-[var(--color-text-strong)]">{title}</h2>
        {subtitle && (
          <span className="text-xs text-[var(--color-brand-text-muted)] truncate">{subtitle}</span>
        )}
      </header>
      <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="flex gap-3">
          {clubs.map((club) => (
            <ClubsMiniCard key={club.id} club={club} />
          ))}
        </div>
      </div>
    </section>
  )
}
