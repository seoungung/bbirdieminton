import Link from 'next/link'
import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: '디지털 상품 | 버디민턴',
  description: '배드민턴 입문자를 위한 PDF 가이드북. 레벨별 라켓 선택·첫 체육관 생존 가이드.',
}

interface Product {
  slug: string
  name: string
  priceCurrent: number
  priceOriginal: number
  description: string
  badge: string
  coverBg: string
  coverText: string
}

const PRODUCTS: Product[] = [
  {
    slug: 'starter-guide',
    name: '배린이 라켓 완전정복 가이드',
    priceCurrent: 3900,
    priceOriginal: 9900,
    description: '왕초보부터 C조까지, 레벨별 라켓 선택 완벽 가이드 PDF (약 30~40p)',
    badge: 'PDF · 즉시 다운로드',
    coverBg: '#0a0a0a',
    coverText: '#beff00',
  },
]

export default function ShopPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 헤더 */}
      <header className="bg-[#0a0a0a] py-14">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#beff00] bg-[#beff00]/10 px-3 py-1.5 rounded-full mb-4">
            <BookOpen size={13} /> SHOP
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            디지털 상품
          </h1>
          <p className="text-white/50 text-base mt-2">
            배드민턴을 제대로 시작하는 데 도움이 되는 가이드북
          </p>
        </div>
      </header>

      {/* 상품 목록 */}
      <section className="max-w-[1088px] mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => (
            <Link
              key={p.slug}
              href={`/shop/${p.slug}`}
              className="group block rounded-2xl border border-[#e5e5e5] overflow-hidden hover:border-[#0a0a0a] hover:shadow-sm transition-all"
            >
              {/* 커버 */}
              <div
                className="aspect-[4/3] flex flex-col items-center justify-center text-center px-6"
                style={{ background: p.coverBg }}
              >
                <BookOpen size={48} style={{ color: p.coverText }} strokeWidth={1.5} />
                <p
                  className="mt-4 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: p.coverText }}
                >
                  {p.badge}
                </p>
              </div>

              {/* 정보 */}
              <div className="p-5">
                <h2 className="font-bold text-[15px] text-[#111] leading-tight mb-1.5 group-hover:text-[#0a0a0a]">
                  {p.name}
                </h2>
                <p className="text-[13px] text-[#777] leading-relaxed line-clamp-2 mb-3">
                  {p.description}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold text-[#111]">
                    {p.priceCurrent.toLocaleString()}원
                  </span>
                  <span className="text-[13px] text-[#bbb] line-through">
                    {p.priceOriginal.toLocaleString()}원
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
