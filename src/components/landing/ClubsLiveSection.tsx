import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { ClubsLiveCarousel, type ClubsLiveItem } from './ClubsLiveCarousel'

/**
 * 랜딩 라이브 모임 섹션 — Founder Note 다음.
 *
 * list_public_clubs RPC (created_at DESC) 최근 6개를 가로 캐러셀로.
 * 데스크톱은 좌우 화살표, 모바일은 swipe.
 *
 * 데이터 fetch는 서버에서, 슬라이드 인터랙션만 client (ClubsLiveCarousel).
 */

export async function ClubsLiveSection() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_public_clubs', { p_limit: 6 })

  if (error || !data || (data as ClubsLiveItem[]).length === 0) return null

  const clubs = data as ClubsLiveItem[]

  return (
    <section
      aria-labelledby="clubs-live-heading"
      className="border-t border-[#ebebeb] bg-white"
    >
      <div className="py-20 sm:py-24">
        {/* 섹션 헤더 — 좌측 정렬 */}
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="mb-10 max-w-[640px] sm:mb-12">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#666]">
              최근 만들어진 모임
            </p>
            <h2
              id="clubs-live-heading"
              className="text-[26px] font-extrabold leading-[1.2] tracking-[-0.02em] text-[#0a0a0a] sm:text-[36px] sm:leading-[1.15]"
              style={{ wordBreak: 'keep-all' }}
            >
              이 모임 가도 될까?
              <span className="text-[#666]">
                {' '}분위기·실력·운영을 미리 보고 결정.
              </span>
            </h2>
          </div>
        </div>

        {/* 가로 슬라이드 — 풀-블리드 + 좌우 화살표 */}
        <ClubsLiveCarousel clubs={clubs} />

        {/* "전체 모임 둘러보기" — 좌측 정렬 */}
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="mt-10">
            <Link
              href="/clubs"
              className="group inline-flex items-center gap-1.5 rounded-full border border-[#0a0a0a]/15 bg-white px-5 py-2.5 text-[13px] font-bold text-[#0a0a0a] transition-colors hover:border-[#0a0a0a]/40"
            >
              전체 모임 둘러보기
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
