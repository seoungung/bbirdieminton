import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Minus } from 'lucide-react'
import type { Racket } from '@/types/racket'
import { BALANCE_KO, FLEX_KO } from '@/types/racket'
import { RacketRadarChart } from '@/components/racket/RacketRadarChart'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '라켓 비교 | 버드민턴',
}

async function getRacket(slug: string): Promise<Racket | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('rackets').select('*').eq('slug', slug).single()
    return data as Racket | null
  } catch { return null }
}

interface Props { searchParams: Promise<{ a?: string; b?: string }> }

export default async function ComparePage({ searchParams }: Props) {
  const { a, b } = await searchParams
  if (!a || !b) notFound()
  const [ra, rb] = await Promise.all([getRacket(a), getRacket(b)])
  if (!ra || !rb) notFound()

  const STATS: { label: string; va: number; vb: number }[] = [
    { label: '파워',   va: ra.stat_power,      vb: rb.stat_power },
    { label: '컨트롤', va: ra.stat_control,    vb: rb.stat_control },
    { label: '스피드', va: ra.stat_speed,      vb: rb.stat_speed },
    { label: '내구성', va: ra.stat_durability, vb: rb.stat_durability },
    { label: '반발력', va: ra.stat_repulsion,  vb: rb.stat_repulsion },
    { label: '조작성', va: ra.stat_maneuver,   vb: rb.stat_maneuver },
  ]

  const SPECS = [
    { label: '브랜드',  va: ra.brand,                          vb: rb.brand },
    { label: '무게',    va: ra.weight ?? '-',                  vb: rb.weight ?? '-' },
    { label: '밸런스',  va: ra.balance ? BALANCE_KO[ra.balance] : '-', vb: rb.balance ? BALANCE_KO[rb.balance] : '-' },
    { label: '강성',    va: ra.flex    ? FLEX_KO[ra.flex]      : '-', vb: rb.flex    ? FLEX_KO[rb.flex]      : '-' },
    { label: '가격대',  va: ra.price_range ?? '-',             vb: rb.price_range ?? '-' },
    { label: '레벨',    va: ra.level.join(', '),               vb: rb.level.join(', ') },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">

        <Link
          href="/rackets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> 라켓 목록
        </Link>

        <h1 className="text-[22px] font-bold mb-8 tracking-[-0.025em]">라켓 비교</h1>

        {/* 제품명 헤더 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[ra, rb].map(r => (
            <div key={r.slug} className="text-center">
              <p className="text-xs text-muted-foreground font-medium mb-1">{r.brand}</p>
              <Link href={'/rackets/' + r.slug} className="font-bold text-[14px] sm:text-[16px] leading-snug hover:underline line-clamp-2">
                {r.name}
              </Link>
              {r.price_range && (
                <p className="text-xs text-muted-foreground mt-1">{r.price_range}</p>
              )}
            </div>
          ))}
        </div>

        {/* 레이더 차트 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[ra, rb].map(r => (
            <div key={r.slug} className="rounded-2xl border border-border p-4 flex justify-center">
              <RacketRadarChart
                power={r.stat_power}
                control={r.stat_control}
                speed={r.stat_speed}
                durability={r.stat_durability}
                repulsion={r.stat_repulsion}
                maneuver={r.stat_maneuver}
              />
            </div>
          ))}
        </div>

        {/* 스탯 비교 */}
        <div className="rounded-2xl border border-border p-5 mb-6">
          <h2 className="text-[16px] font-semibold mb-4 tracking-[-0.01em]">성능 수치 비교</h2>
          <div className="space-y-3">
            {STATS.map(({ label, va, vb }) => {
              const aWins = va > vb
              const bWins = vb > va
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span className={aWins ? 'font-bold text-foreground' : ''}>{va}</span>
                    <span className="font-medium">{label}</span>
                    <span className={bWins ? 'font-bold text-foreground' : ''}>{vb}</span>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div className="flex-1 bg-muted rounded-full overflow-hidden flex justify-end">
                      <div
                        className={'h-full rounded-full ' + (aWins ? 'bg-black' : 'bg-muted-foreground/40')}
                        style={{ width: va + '%' }}
                      />
                    </div>
                    <div className="w-px bg-border shrink-0" />
                    <div className="flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className={'h-full rounded-full ' + (bWins ? 'bg-black' : 'bg-muted-foreground/40')}
                        style={{ width: vb + '%' }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 스펙 비교 */}
        <div className="rounded-2xl border border-border overflow-hidden mb-8">
          <h2 className="text-[16px] font-semibold p-5 pb-3 tracking-[-0.01em]">스펙 비교</h2>
          <table className="w-full text-sm">
            <tbody>
              {SPECS.map(({ label, va, vb }, i) => (
                <tr key={label} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-5 py-2.5 text-xs text-muted-foreground font-medium w-20">{label}</td>
                  <td className={'px-5 py-2.5 text-xs text-center ' + (va === vb ? '' : 'font-semibold')}>{va}</td>
                  <td className="px-2 py-2.5 text-center w-6">
                    {va === vb ? (
                      <Minus size={12} className="text-muted-foreground mx-auto" />
                    ) : (
                      <Check size={12} className="text-green-500 mx-auto" />
                    )}
                  </td>
                  <td className={'px-5 py-2.5 text-xs text-center ' + (va === vb ? '' : 'font-semibold')}>{vb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 상세 페이지 링크 */}
        <div className="grid grid-cols-2 gap-4">
          {[ra, rb].map(r => (
            <Link
              key={r.slug}
              href={'/rackets/' + r.slug}
              className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              {r.brand} 상세 보기
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
