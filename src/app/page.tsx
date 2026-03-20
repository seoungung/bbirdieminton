import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BRAND_LOGOS } from '@/lib/brandLogos'
import type { Racket } from '@/types/racket'

export const metadata: Metadata = {
  title: 'birdieminton | 배드민턴, 제대로 시작하는 법',
  description: '배린이를 위한 라켓 도감. 레벨 테스트로 내 실력을 진단하고 딱 맞는 라켓을 찾아보세요.',
  openGraph: {
    title: 'birdieminton | 배드민턴, 제대로 시작하는 법',
    description: '배린이를 위한 라켓 도감. 레벨 테스트로 내 실력을 진단하고 딱 맞는 라켓을 찾아보세요.',
  },
}

function parseFirstUrl(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    const match = trimmed.match(/"([^"]+)"/)
    const url = match ? match[1] : null
    return url && (url.startsWith('/') || url.startsWith('http')) ? url : null
  }
  return trimmed.startsWith('/') || trimmed.startsWith('http') ? trimmed : null
}

const LEVELS = [
  { label: '왕초보', desc: '라켓을 처음 잡는 분', point: '6U · 유연한 강성', highlight: false },
  { label: '초심자', desc: '6개월 미만 입문자', point: '5U · 이븐밸런스', highlight: false },
  { label: 'D조', desc: '동호회 D급', point: '4U · 스탠다드', highlight: true },
  { label: 'C조', desc: '동호회 C급', point: '3U~4U · Stiff', highlight: true },
]

const STEPS = [
  { num: '01', title: '레벨 진단', desc: '17문항으로 내 배드민턴 레벨을 정확하게 파악해요.' },
  { num: '02', title: '라켓 추천', desc: '레벨·플레이 스타일에 맞는 라켓을 골라드려요.' },
  { num: '03', title: '비교 & 선택', desc: '스펙을 나란히 비교하고 최적의 라켓을 결정해요.' },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: rackets } = await supabase
    .from('rackets')
    .select('slug, name, brand, image_url, weight, price_min, price_max, editor_pick, is_popular, level, type')
    .or('is_popular.eq.true,editor_pick.eq.true')
    .limit(6)
    .returns<Partial<Racket>[]>()

  const topRackets = rackets ?? []

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#beff00]/20 via-[#beff00]/5 to-white">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-8 pt-24 pb-20 text-center relative z-10">
          <span className="inline-block bg-[#beff00] text-black text-[12px] font-bold uppercase tracking-widest rounded-full px-4 py-1.5 mb-6">
            배린이 전용 라켓 플랫폼
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-5 text-[#0a0a0a]">
            내 레벨에 딱 맞는 라켓,<br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="relative z-10">제대로</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-[#beff00] -z-0 rounded" aria-hidden="true" />
            </span>{' '}고르는 법
          </h1>
          <p className="text-[#6b6b6b] text-[16px] sm:text-lg leading-relaxed max-w-lg mx-auto mb-10">
            어떤 라켓을 사야 할지 모르겠다면?<br />
            2분 레벨 테스트로 시작하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/quiz"
              className="px-8 py-4 bg-[#0a0a0a] text-white font-extrabold text-[15px] rounded-2xl hover:bg-[#2a2a2a] transition-all"
            >
              무료 레벨 테스트 시작 →
            </Link>
            <Link
              href="/rackets"
              className="px-8 py-4 border border-[#0a0a0a]/15 text-[#0a0a0a] font-semibold text-[15px] rounded-2xl hover:border-[#0a0a0a]/40 transition-all"
            >
              라켓 도감 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="border-t border-[#ebebeb] bg-[#f7f7f7]">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-8 py-16">
          <h2 className="text-2xl font-bold text-center mb-12 text-[#0a0a0a]">이렇게 사용하세요</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <p className="text-[#0a0a0a] font-extrabold text-3xl mb-3 bg-[#beff00] w-12 h-12 rounded-full flex items-center justify-center mx-auto text-[16px]">
                  {num}
                </p>
                <h3 className="font-bold text-[16px] mb-2 text-[#0a0a0a]">{title}</h3>
                <p className="text-[#6b6b6b] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEVEL SYSTEM ─────────────────────────────── */}
      <section className="border-t border-[#ebebeb]">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-8 py-16">
          <h2 className="text-2xl font-bold text-center mb-3 text-[#0a0a0a]">어떤 레벨이세요?</h2>
          <p className="text-[#6b6b6b] text-sm text-center mb-10">레벨을 모르겠다면 테스트로 확인해보세요</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {LEVELS.map(({ label, desc, point, highlight }) => (
              <div
                key={label}
                className={`rounded-xl border p-5 text-center ${
                  highlight
                    ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                    : 'bg-white border-[#e8e8e8] text-[#0a0a0a]'
                }`}
              >
                <p className={`font-extrabold text-xl mb-1 ${highlight ? 'text-[#beff00]' : 'text-[#0a0a0a]'}`}>
                  {label}
                </p>
                <p className={`text-xs mb-3 ${highlight ? 'text-white/70' : 'text-[#6b6b6b]'}`}>{desc}</p>
                <p className={`text-[11px] border-t pt-2 ${highlight ? 'border-white/10 text-white/40' : 'border-[#ebebeb] text-[#999]'}`}>
                  {point}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/quiz" className="text-[#0a0a0a] text-sm font-semibold underline underline-offset-4 hover:text-[#6b6b6b] transition-colors">
              내 레벨 테스트하기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ── POPULAR RACKETS ──────────────────────────── */}
      {topRackets.length > 0 && (
        <section className="border-t border-[#ebebeb] bg-[#f7f7f7]">
          <div className="max-w-[90rem] mx-auto px-4 sm:px-8 py-16">
            <h2 className="text-2xl font-bold text-center mb-2 text-[#0a0a0a]">인기 라켓</h2>
            <p className="text-[#6b6b6b] text-sm text-center mb-10">에디터가 직접 고른 배린이 추천 라켓</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {topRackets.map((r) => {
                const img = parseFirstUrl(r.image_url ?? null)
                const priceLabel = r.price_min ? `${Math.round(r.price_min / 10000)}만원~` : '-'
                const logo = r.brand ? BRAND_LOGOS[r.brand] : null
                return (
                  <Link
                    key={r.slug}
                    href={`/rackets/${r.slug}`}
                    className="group rounded-xl bg-white border border-[#e8e8e8] hover:border-[#beff00] hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="relative aspect-square bg-[#f5f5f5]">
                      {img ? (
                        <Image
                          src={img}
                          alt={r.name ?? ''}
                          fill
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, 16vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-2xl">🏸</div>
                      )}
                      {r.editor_pick && (
                        <span className="absolute top-2 left-2 bg-[#0a0a0a] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                          에디터 픽
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="h-5 flex items-center mb-1">
                        {logo ? (
                          <Image src={logo} alt={r.brand ?? ''} width={48} height={16} className="object-contain object-left max-h-[16px] w-auto" unoptimized />
                        ) : (
                          <span className="text-[11px] text-[#999]">{r.brand}</span>
                        )}
                      </div>
                      <p className="text-[13px] font-semibold text-[#0a0a0a] leading-snug line-clamp-2 mb-1">
                        {r.name}
                      </p>
                      <p className="text-[12px] text-[#999]">{priceLabel}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
            <div className="text-center mt-8">
              <Link href="/rackets" className="text-[13px] font-semibold text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">
                전체 라켓 보기 →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA ───────────────────────────────── */}
      <section className="border-t border-[#ebebeb] bg-[#0a0a0a]">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-white">
            배드민턴, 제대로 시작하는 법
          </h2>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            레벨 테스트 한 번으로 맞춤 라켓을 추천받고<br />
            배린이 탈출을 시작해보세요.
          </p>
          <Link
            href="/quiz"
            className="inline-block px-10 py-4 bg-[#beff00] text-black font-extrabold text-[16px] rounded-2xl hover:brightness-110 transition-all"
          >
            무료로 시작하기 →
          </Link>
        </div>
      </section>

    </main>
  )
}
