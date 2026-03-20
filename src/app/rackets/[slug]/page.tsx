import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ChevronRight, ExternalLink, ShoppingCart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RacketRadarChart } from '@/components/racket/RacketRadarChart'
import { RacketSpec } from '@/components/racket/RacketSpec'
import { RacketImageGallery } from '@/components/racket/RacketImageGallery'
import { RacketCard } from '@/components/racket/RacketCard'
import { BRAND_LOGOS } from '@/lib/brandLogos'
import type { Metadata } from 'next'
import type { Racket } from '@/types/racket'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ slug: string }> }

async function getRacket(slug: string): Promise<Racket | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('rackets').select('*').eq('slug', slug).single()
    if (error || !data) return null
    return data as Racket
  } catch { return null }
}

async function getRelated(current: Racket): Promise<Racket[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('rackets')
      .select('*')
      .neq('slug', current.slug)
      .order('is_popular', { ascending: false })
      .limit(4)
    return (data ?? []) as Racket[]
  } catch { return [] }
}

function getNaverUrl(name: string): string {
  const match = name.match(/\(([^)]+)\)/)
  const query = match ? match[1] : name
  return 'https://search.shopping.naver.com/search/all?query=' + encodeURIComponent(query)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const racket = await getRacket(slug)
  if (!racket) return {}
  return {
    title: racket.name + ' | 버드민턴 라켓 도감',
    description: racket.brand + ' ' + racket.name + ' 상세 스펙 — ' + racket.type.join(', ') + ' / ' + racket.level.join(', ') + ' 추천',
    openGraph: {
      title: racket.name,
      description: racket.type.join(', ') + ' · ' + racket.level.join(', '),
    },
  }
}

const LEVEL_COLORS: Record<string, string> = {
  '왕초보': 'bg-blue-50 text-blue-600 border border-blue-200',
  '초심자': 'bg-yellow-50 text-yellow-600 border border-yellow-200',
  'D조':   'bg-orange-50 text-orange-600 border border-orange-200',
  'C조':   'bg-red-50 text-red-600 border border-red-200',
}

const TYPE_COLORS: Record<string, string> = {
  '공격형':  'bg-red-50 text-red-600 border border-red-200',
  '수비형':  'bg-blue-50 text-blue-600 border border-blue-200',
  '올라운드': 'bg-purple-50 text-purple-600 border border-purple-200',
}

export default async function RacketDetailPage({ params }: Props) {
  const { slug } = await params
  const [racket, related] = await Promise.all([
    getRacket(slug),
    getRacket(slug).then(r => r ? getRelated(r) : []),
  ])
  if (!racket) notFound()

  const reviewLinks = Array.isArray(racket.review_links) ? racket.review_links : []
  const pros = racket.pros ?? []
  const cons = racket.cons ?? []
  const naverUrl = getNaverUrl(racket.name)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-lg mx-auto px-4 py-6">

        {/* 브레드크럼 */}
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-5">
          <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
          <ChevronRight size={12} />
          <Link href="/rackets" className="hover:text-foreground transition-colors">라켓 도감</Link>
          <ChevronRight size={12} />
          <span className="text-foreground font-medium truncate max-w-[180px]">{racket.name}</span>
        </nav>

        {/* 4:6 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8 lg:gap-12">

          {/* ── 왼쪽: 이미지 + 스펙 + 구매 버튼 ── */}
          <div className="md:sticky md:top-6 md:self-start space-y-4">
            <RacketImageGallery
              imageUrl={racket.image_url}
              imageUrls={racket.image_urls}
              name={racket.name}
            />
            <RacketSpec racket={racket} />

            {/* 구매 버튼 */}
            <a
              href={naverUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#03C75A] text-white font-bold text-sm rounded-xl hover:brightness-105 transition-all"
            >
              <ShoppingCart size={16} />
              네이버 최저가 보기
              <ExternalLink size={13} className="opacity-70" />
            </a>
          </div>

          {/* ── 오른쪽: 정보 영역 ── */}
          <div className="space-y-6">

            {/* 섹션 1: 브랜드 + 제품명 */}
            <div>
              <div className="mb-2 h-8 flex items-center">
                {BRAND_LOGOS[racket.brand] ? (
                  <Image
                    src={BRAND_LOGOS[racket.brand]}
                    alt={racket.brand}
                    width={100}
                    height={32}
                    className="object-contain object-left max-h-8 w-auto"
                    unoptimized
                  />
                ) : (
                  <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                    {racket.brand}
                  </p>
                )}
              </div>
              <div className="flex items-start gap-2 flex-wrap">
                <h1 className="text-[28px] sm:text-[32px] font-bold leading-tight tracking-[-0.025em]">
                  {racket.name}
                </h1>
                {racket.editor_pick && (
                  <span className="mt-1 shrink-0 bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wide">
                    에디터 픽
                  </span>
                )}
                <span className="mt-1 shrink-0 bg-white/5 text-white/40 text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/10">
                  2026 상반기 기준
                </span>
              </div>
            </div>

            {/* 섹션 2: 키워드 태그 */}
            <div className="flex flex-wrap gap-1.5">
              {racket.type.map(t => (
                <span key={t} className={'text-xs font-medium px-2.5 py-1 rounded-full ' + (TYPE_COLORS[t] ?? 'bg-secondary text-secondary-foreground')}>
                  {t}
                </span>
              ))}
              {racket.level.map(l => (
                <span key={l} className={'text-xs font-medium px-2.5 py-1 rounded-full ' + (LEVEL_COLORS[l] ?? 'bg-secondary text-secondary-foreground')}>
                  {l}
                </span>
              ))}
            </div>

            {/* 섹션 3: 라켓 소개 */}
            {racket.description && (
              <div className="rounded-2xl border border-border p-5">
                <h3 className="text-[17px] font-semibold mb-3 tracking-[-0.01em]">라켓 소개</h3>
                <p className="text-[15px] text-muted-foreground leading-[1.8] whitespace-pre-wrap">
                  {racket.description}
                </p>
              </div>
            )}

            {/* 섹션 4: 성능 차트 */}
            <div className="rounded-2xl border border-border p-5">
              <h3 className="text-[17px] font-semibold mb-4 tracking-[-0.01em]">성능 차트</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="shrink-0">
                  <RacketRadarChart
                    power={racket.stat_power}
                    control={racket.stat_control}
                    speed={racket.stat_speed}
                    durability={racket.stat_durability}
                    repulsion={racket.stat_repulsion}
                    maneuver={racket.stat_maneuver}
                  />
                </div>
                <div className="flex-1 w-full space-y-2.5">
                  {[
                    { label: '파워',   value: racket.stat_power },
                    { label: '컨트롤', value: racket.stat_control },
                    { label: '스피드', value: racket.stat_speed },
                    { label: '내구성', value: racket.stat_durability },
                    { label: '반발력', value: racket.stat_repulsion },
                    { label: '조작성', value: racket.stat_maneuver },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground text-xs w-14 shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: value + '%' }} />
                      </div>
                      <span className="text-xs font-medium w-6 text-right tabular-nums">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 섹션 5: 이런 분께 추천 */}
            {racket.recommended_for && (
              <div className="rounded-2xl bg-green-50 border border-green-100 p-5">
                <h3 className="text-[17px] font-semibold text-green-800 mb-2.5 tracking-[-0.01em]">🎯 이런 분께 추천해요</h3>
                <p className="text-[15px] text-green-700 leading-[1.8]">{racket.recommended_for}</p>
              </div>
            )}

            {/* 섹션 6: 장점 / 단점 */}
            {(pros.length > 0 || cons.length > 0) && (
              <div className="rounded-2xl border border-border p-5">
                <h3 className="text-[17px] font-semibold mb-4 tracking-[-0.01em]">장점 &amp; 단점</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
                      <span>✅</span> 장점
                    </p>
                    <ul className="space-y-1.5">
                      {pros.map((pro, i) => (
                        <li key={i} className="text-[13px] text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                          <span className="text-green-500 mt-0.5 shrink-0">·</span>{pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-500 mb-2 flex items-center gap-1">
                      <span>❌</span> 단점
                    </p>
                    <ul className="space-y-1.5">
                      {cons.map((con, i) => (
                        <li key={i} className="text-[13px] text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                          <span className="text-red-400 mt-0.5 shrink-0">·</span>{con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 섹션 7: 에디터 한마디 */}
            {racket.editor_comment && (
              <div className="rounded-2xl border border-border p-5">
                <h3 className="text-[17px] font-semibold mb-3 tracking-[-0.01em]">💬 에디터 한마디</h3>
                <blockquote className="text-[15px] text-muted-foreground leading-[1.8] italic border-l-2 border-foreground/20 pl-4">
                  &ldquo;{racket.editor_comment}&rdquo;
                </blockquote>
              </div>
            )}

            {/* 섹션 8: 실제 후기 종합 */}
            {racket.review_summary && (
              <div className="rounded-2xl border border-border p-5">
                <h3 className="text-[17px] font-semibold mb-3 tracking-[-0.01em]">📝 실제 후기 종합</h3>
                <p className="text-[15px] text-muted-foreground leading-[1.8] whitespace-pre-wrap mb-4">
                  {racket.review_summary}
                </p>
                {reviewLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                    {reviewLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground rounded-full px-3 py-1.5 transition-colors"
                      >
                        <ExternalLink size={11} />
                        {link.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* 이 라켓도 봐요 */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-[18px] font-bold mb-5 tracking-[-0.02em]">이 라켓도 봐요</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {related.slice(0, 4).map(r => (
                <RacketCard key={r.id} racket={r} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
