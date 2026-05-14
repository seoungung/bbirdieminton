import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { COVER_PRESETS, FREE_PLAN_MEMBER_LIMIT } from '@/lib/club/constants'
import { cn } from '@/lib/utils'

/**
 * /club/{clubId} — 임시 클럽 정보 페이지.
 * Step 8 에서 4탭 셸 (일정/멤버/스탯/관리) 로 확장 예정.
 */
export default async function ClubPage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params
  const admin = createAdminClient()

  const { data: club } = await admin
    .from('clubs')
    .select('id, custom_url_id, name, description, cover_image_url, logo_image_url, region, gym, plan_type, created_at')
    .eq('id', clubId)
    .maybeSingle()

  if (!club) notFound()

  const coverKey = parsePresetKey(club.cover_image_url)
  const logoKey = parsePresetKey(club.logo_image_url)
  const cover = COVER_PRESETS.find((p) => p.key === coverKey) ?? COVER_PRESETS[0]
  const logo = COVER_PRESETS.find((p) => p.key === logoKey) ?? COVER_PRESETS[1]
  const initials = (club.name as string).trim().slice(0, 2) || '모임'

  return (
    <main className="min-h-screen bg-beige">
      {/* 헤더 */}
      <header className="border-b border-beige-50 bg-beige/80 backdrop-blur supports-[backdrop-filter]:bg-beige/60">
        <div className="mx-auto max-w-2xl px-5 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-forest transition-colors"
          >
            ← 홈
          </Link>
          <Badge variant="lime">FREE 플랜</Badge>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-8 space-y-6">
        {/* 커버 + 로고 비주얼 */}
        <div className={cn('relative h-40 rounded-2xl overflow-hidden', cover.bgClass)}>
          <div
            className={cn(
              'absolute left-5 -bottom-7 w-16 h-16 rounded-full shadow-[0_4px_12px_-2px_rgb(0_58_11_/_0.25)] flex items-center justify-center text-base font-bold',
              logo.bgClass,
              logo.textOnDark ? 'text-beige' : 'text-forest'
            )}
          >
            {initials}
          </div>
        </div>
        <div className="h-3" />

        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-2xl">{club.name}</CardTitle>
            {club.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {club.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            <Row label="URL"      value={`/club/${club.custom_url_id ?? club.id}`} mono />
            <Row label="지역"     value={club.region ?? '미설정'} />
            <Row label="체육관"   value={club.gym ?? '미설정'} />
            <Row label="플랜"     value={`${(club.plan_type as string).toUpperCase()} · 최대 ${FREE_PLAN_MEMBER_LIMIT}명`} />
          </CardContent>
        </Card>

        <Card variant="filled">
          <CardContent className="py-5">
            <div className="flex items-start gap-3">
              <Badge variant="secondary">NEXT</Badge>
              <div className="text-sm text-forest leading-relaxed">
                모임 상세 페이지의 <strong>일정 / 멤버 / 스탯 / 관리</strong> 4탭 셸은 다음 단계에서 신설됩니다.
                <br />
                <span className="text-muted-foreground">
                  지금은 개설이 정상적으로 완료되었는지 확인하는 임시 화면이에요.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <Link href="/">
            <Button variant="ghost">홈으로</Button>
          </Link>
          <Link href="/club/create">
            <Button variant="secondary">또 다른 모임 만들기</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 py-1.5 border-b border-beige-50 last:border-b-0">
      <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn('text-sm text-foreground', mono && 'font-mono tabular')}>
        {value}
      </span>
    </div>
  )
}

function parsePresetKey(raw: string | null | undefined): string | null {
  if (!raw) return null
  if (raw.startsWith('preset:')) return raw.slice('preset:'.length)
  return null
}
