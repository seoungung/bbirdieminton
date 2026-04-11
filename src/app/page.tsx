import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BRAND_LOGOS } from '@/lib/brandLogos'
import type { Racket } from '@/types/racket'
import HeroSlider from '@/components/HeroSlider'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'birdieminton | 배드민턴, 제대로 시작하는 법',
  description: '"라켓 쿠팡에서 샀는데 괜찮은 건가요?" 이제 기준이 생겼어요. 레벨 테스트로 내 실력을 진단하고 딱 맞는 라켓을 찾아보세요.',
  openGraph: {
    title: 'birdieminton | 배드민턴, 제대로 시작하는 법',
    description: '"라켓 쿠팡에서 샀는데 괜찮은 건가요?" 이제 기준이 생겼어요. 레벨 테스트로 내 실력을 진단하고 딱 맞는 라켓을 찾아보세요.',
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

const RANK_STYLES = [
  { bg: 'bg-[#FFD700]', text: 'text-black', label: '1위' },
  { bg: 'bg-[#C0C0C0]', text: 'text-black', label: '2위' },
  { bg: 'bg-[#CD7F32]', text: 'text-white', label: '3위' },
  { bg: 'bg-[#f0f0f0]', text: 'text-[#666]', label: '4위' },
  { bg: 'bg-[#f0f0f0]', text: 'text-[#666]', label: '5위' },
]

const GUIDE_PREVIEWS = [
  {
    slug: 'racket-guide',
    category: '라켓 선택',
    title: '라켓 잘 고르는 법 — 배린이 완전정복',
    readTime: '5분',
    emoji: '🏸',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  },
  {
    slug: 'beginner-escape',
    category: '레벨업',
    title: '왕초심 탈출하는 방법 — 6개월 플랜',
    readTime: '7분',
    emoji: '🚀',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
  },
  {
    slug: 'badminton-basics',
    category: '기초 지식',
    title: '배드민턴 기초 지식 모음 — 규칙부터 용어까지',
    readTime: '6분',
    emoji: '📖',
    bg: 'linear-gradient(135deg, #0d2818 0%, #1a4a2e 50%, #0d2818 100%)',
  },
  {
    slug: 'first-gym-guide',
    category: '체육관 입문',
    title: '처음 가는 배드민턴 체육관 생존 가이드',
    readTime: '4분',
    emoji: '🏢',
    bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://birdieminton.com/#organization',
      name: 'birdieminton',
      url: 'https://birdieminton.com',
      logo: 'https://birdieminton.com/symbol_birdieminton-color.png',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://birdieminton.com/#website',
      url: 'https://birdieminton.com',
      name: 'birdieminton',
      description: '배린이를 위한 배드민턴 라켓 추천 플랫폼',
      publisher: { '@id': 'https://birdieminton.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://birdieminton.com/rackets?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default async function HomePage() {
  const supabase = await createClient()

  // 인기 순위 라켓 (popular_rank 1~5)
  const { data: rankedRackets, error: rankError } = await supabase
    .from('rackets')
    .select('slug, name, brand, image_url, weight, price_range, popular_rank, type, level')
    .not('popular_rank', 'is', null)
    .order('popular_rank', { ascending: true })
    .limit(5)

  if (rankError) console.error('[popular_rank query error]', rankError)

  type RankedRacket = Pick<Racket, 'slug' | 'name' | 'brand' | 'image_url' | 'weight' | 'price_range' | 'type' | 'level'> & { popular_rank: number }
  const topRanked = (rankedRackets as RankedRacket[] | null) ?? []

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── 1. HERO SLIDER ───────────────────────────── */}
      <HeroSlider />

      {/* ── 2. 2026 인기 라켓 순위 ──────────────────── */}
      <section className="border-t border-[#ebebeb] bg-white">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-8 py-16 sm:py-20">

          {/* 섹션 헤더 */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#beff00] bg-[#beff00]/10 px-3 py-1 rounded-full">
                2026 랭킹
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 text-[#0a0a0a]">
                가장 인기 있는 라켓 순위
              </h2>
            </div>
            <Link href="/rackets" className="hidden sm:block text-[13px] font-semibold text-[#999] hover:text-[#0a0a0a] transition-colors">
              전체 보기 →
            </Link>
          </div>

          {/* 랭킹 리스트 */}
          <div className="flex flex-col gap-3">
            {topRanked.map((r, i) => {
              const img = parseFirstUrl(r.image_url ?? null)
              const logo = r.brand ? BRAND_LOGOS[r.brand] : null
              const rank = RANK_STYLES[i]
              const priceLabel = (r as RankedRacket).price_range ?? '-'

              return (
                <Link
                  key={r.slug}
                  href={`/rackets/${r.slug}`}
                  className="group flex items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl border border-[#ebebeb] hover:border-[#beff00] hover:shadow-sm bg-white transition-all"
                >
                  {/* 순위 배지 */}
                  <div className={`shrink-0 w-10 h-10 rounded-full ${rank.bg} ${rank.text} flex items-center justify-center font-extrabold text-[13px]`}>
                    {rank.label}
                  </div>

                  {/* 라켓 이미지 */}
                  <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative bg-[#f8f8f8] rounded-xl overflow-hidden">
                    {img ? (
                      <Image
                        src={img}
                        alt={r.name ?? ''}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-2xl">🏸</div>
                    )}
                  </div>

                  {/* 라켓 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="h-5 flex items-center mb-1">
                      {logo ? (
                        <Image src={logo} alt={r.brand ?? ''} width={52} height={16} className="object-contain object-left max-h-[16px] w-auto" unoptimized />
                      ) : (
                        <span className="text-[11px] text-[#999]">{r.brand}</span>
                      )}
                    </div>
                    <p className="text-[15px] sm:text-[16px] font-bold text-[#0a0a0a] leading-snug line-clamp-1">
                      {r.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {r.weight && (
                        <span className="text-[11px] text-[#999] bg-[#f5f5f5] px-2 py-0.5 rounded-full">{r.weight}</span>
                      )}
                      {Array.isArray(r.type) && r.type[0] && (
                        <span className="text-[11px] text-[#999] bg-[#f5f5f5] px-2 py-0.5 rounded-full">{r.type[0]}</span>
                      )}
                    </div>
                  </div>

                  {/* 가격 + 화살표 */}
                  <div className="shrink-0 text-right hidden sm:block">
                    <p className="text-[14px] font-semibold text-[#0a0a0a]">{priceLabel}</p>
                    <p className="text-[12px] text-[#ccc] mt-0.5 group-hover:text-[#beff00] transition-colors">자세히 →</p>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-6 sm:hidden text-center">
            <Link href="/rackets" className="text-[13px] font-semibold text-[#999] hover:text-[#0a0a0a] transition-colors">
              전체 라켓 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. 모임 관리 CTA ──────────────────────────── */}
      <section className="border-t border-[#ebebeb] bg-[#0a0a0a] overflow-hidden">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* 좌: 텍스트 */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#beff00] bg-[#beff00]/10 px-3 py-1 rounded-full mb-5">
                🏸 새 기능 · 모임 관리
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
                동호회 운영,<br />
                이제 스마트하게
              </h2>
              <p className="text-[15px] text-white/50 leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                출석 체크부터 경기 배정, 실력 기반 랭킹까지.<br />
                매주 반복되는 번거로운 운영을 한 번에 해결하세요.
              </p>

              {/* 기능 목록 */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10 justify-center lg:justify-start">
                {[
                  { icon: '✅', label: '출석 체크' },
                  { icon: '🎯', label: '실력 균등 배정' },
                  { icon: '🏆', label: '자동 랭킹' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-white/70 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <span>{icon}</span>
                    <span className="font-medium">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/club"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#beff00] text-[#0a0a0a] font-bold text-[15px] rounded-xl hover:brightness-95 transition-all"
                >
                  🏸 모임 만들기
                </Link>
                <Link
                  href="/club/join"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/20 text-white/70 font-semibold text-[15px] rounded-xl hover:border-white/40 hover:text-white transition-all"
                >
                  초대코드로 참여
                </Link>
              </div>
            </div>

            {/* 우: 목업 카드 */}
            <div className="flex-1 w-full max-w-sm lg:max-w-none">
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 space-y-3">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-white">화요일 배드민턴 모임</p>
                    <p className="text-xs text-white/40 mt-0.5">멤버 12명</p>
                  </div>
                  <span className="text-xs font-bold text-[#beff00] bg-[#beff00]/10 px-2.5 py-1 rounded-lg">진행 중</span>
                </div>
                {/* 코트 배정 미리보기 */}
                <div className="bg-[#111] rounded-xl p-3.5">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2.5">코트 1</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { team: 'A', color: 'text-blue-400', names: ['김민준', '이서연'] },
                      { team: 'B', color: 'text-orange-400', names: ['박지호', '최유나'] },
                    ].map(({ team, color, names }) => (
                      <div key={team} className="bg-white/5 rounded-lg p-2.5">
                        <p className={`text-[10px] font-bold mb-1.5 ${color}`}>팀 {team}</p>
                        {names.map(n => (
                          <div key={n} className="flex items-center gap-1.5 mb-1">
                            <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white/60">{n[0]}</div>
                            <span className="text-[11px] text-white/70">{n}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                {/* 랭킹 미리보기 */}
                <div className="space-y-1.5">
                  {[
                    { rank: '🥇', name: '김민준', pts: 42 },
                    { rank: '🥈', name: '이서연', pts: 38 },
                    { rank: '🥉', name: '박지호', pts: 31 },
                  ].map(({ rank, name, pts }) => (
                    <div key={name} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{rank}</span>
                        <span className="text-sm text-white/80 font-medium">{name}</span>
                      </div>
                      <span className="text-sm font-bold text-[#beff00]">{pts}점</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. 가이드북 콘텐츠 ───────────────────────── */}
      <section className="border-t border-[#ebebeb] bg-[#f7f7f7]">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-8 py-16 sm:py-20">

          {/* 섹션 헤더 */}
          <div className="mb-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0a0a0a]/40 bg-[#0a0a0a]/5 px-3 py-1 rounded-full">
              가이드북
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 text-[#0a0a0a]">
              배린이를 위한 필수 콘텐츠
            </h2>
          </div>

          {/* 커버형 카드 그리드 2×2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GUIDE_PREVIEWS.map((g) => (
              <div
                key={g.slug}
                className="relative aspect-[16/9] rounded-2xl overflow-hidden"
                style={{ background: g.bg }}
              >
                {/* 배경 이모지 (장식) */}
                <div className="absolute inset-0 flex items-center justify-center text-[110px] opacity-[0.08] select-none pointer-events-none">
                  {g.emoji}
                </div>

                {/* 읽는 시간 — 우상단 */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-[11px] font-medium text-white/60 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    {g.readTime} 읽기
                  </span>
                </div>

                {/* 하단 그라데이션 오버레이 */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {/* 하단 텍스트 */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-10">
                  <span className="inline-block text-[12px] font-bold uppercase tracking-wider text-[#beff00] bg-[#beff00]/15 px-3 py-1 rounded-full mb-3">
                    {g.category}
                  </span>
                  <h3 className="text-[20px] sm:text-[22px] font-extrabold text-white leading-snug">
                    {g.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
