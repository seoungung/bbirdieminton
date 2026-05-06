import Link from 'next/link'
import { Plus } from 'lucide-react'

interface Props {
  isGuest?: boolean
}

export function ClubsBottomCTA({ isGuest }: Props) {
  return (
    <section className="max-w-[1088px] mx-auto px-4 pb-12 pt-4">
      <div className="rounded-2xl bg-[var(--color-brand-ink)] text-white px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-lime)]">
            우리 모임도 등록하세요
          </p>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
            5분이면 충분해요
          </h3>
          <p className="text-sm text-white/70">
            회원 관리·게임보드·회비까지 한 번에. {isGuest && '로그인하면 바로 시작할 수 있어요.'}
          </p>
        </div>
        <Link
          href={isGuest ? '/login' : '/club/create'}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-brand-lime)] text-[var(--color-brand-ink)] px-6 py-3 text-base font-extrabold hover:bg-[var(--color-brand-lime-dim)] active:scale-[0.98] transition-all"
        >
          <Plus size={18} strokeWidth={2.8} />
          {isGuest ? '로그인 후 시작하기' : '모임 만들기'}
        </Link>
      </div>
    </section>
  )
}
