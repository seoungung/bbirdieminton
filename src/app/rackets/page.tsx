import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { RacketsView } from '@/components/racket/RacketsView'
import { RacketGridSkeleton } from '@/components/racket/RacketCardSkeleton'
import type { Metadata } from 'next'
import type { Racket } from '@/types/racket'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '라켓 도감 | 버드민턴',
  description: '배드민턴 라켓을 브랜드, 레벨, 플레이 타입별로 검색하고 비교해보세요.',
}

async function fetchRackets(): Promise<Racket[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('rackets')
      .select('*')
      .order('is_popular', { ascending: false })
    if (error) return []
    return (data ?? []) as Racket[]
  } catch {
    return []
  }
}

function SkeletonLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4 sm:py-6">
          <div className="h-7 w-24 bg-muted rounded animate-pulse mb-1" />
          <div className="h-4 w-40 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="h-10 bg-muted rounded-lg animate-pulse mb-5" />
        <div className="flex gap-1.5 mb-5">
          {[1,2,3].map(i => <div key={i} className="h-7 w-16 bg-muted rounded-full animate-pulse" />)}
        </div>
        <RacketGridSkeleton count={8} />
      </div>
    </div>
  )
}

async function RacketsContent() {
  const rackets = await fetchRackets()
  return <RacketsView rackets={rackets} />
}

export default function RacketsPage() {
  return (
    <Suspense fallback={<SkeletonLayout />}>
      <RacketsContent />
    </Suspense>
  )
}
