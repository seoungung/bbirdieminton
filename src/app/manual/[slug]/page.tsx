import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  MANUAL_ENTRIES,
  getManualEntry,
  type ManualEntry,
} from '@/lib/manual/entries'
import { GuideShell } from '@/components/manual/GuideShell'
import { ComingSoonBody } from '@/components/manual/ComingSoonBody'
import { CreateClubGuide } from '@/lib/manual/guides/create-club'
import { InviteMembersGuide } from '@/lib/manual/guides/invite-members'

const GUIDE_BODIES: Record<string, () => React.ReactElement> = {
  'create-club': CreateClubGuide,
  'invite-members': InviteMembersGuide,
}

interface RouteProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return MANUAL_ENTRIES.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const entry = getManualEntry(slug)
  if (!entry) {
    return {
      title: '사용설명서 | 버디민턴',
    }
  }
  return {
    title: `${entry.title} | 사용설명서`,
    description: entry.excerpt,
    openGraph: {
      title: `${entry.title} | 버디민턴 사용설명서`,
      description: entry.excerpt,
    },
  }
}

function pickRelated(entry: ManualEntry): ManualEntry[] {
  const sameCategory = MANUAL_ENTRIES.filter(
    (e) => e.category === entry.category && e.slug !== entry.slug,
  )
  if (sameCategory.length >= 3) return sameCategory.slice(0, 3)
  const others = MANUAL_ENTRIES.filter(
    (e) => e.category !== entry.category && e.slug !== entry.slug,
  )
  return [...sameCategory, ...others].slice(0, 3)
}

export default async function ManualEntryPage({ params }: RouteProps) {
  const { slug } = await params
  const entry = getManualEntry(slug)
  if (!entry) notFound()

  const Body = GUIDE_BODIES[entry.slug]
  const related = pickRelated(entry)

  return (
    <GuideShell entry={entry} related={related}>
      {Body ? <Body /> : <ComingSoonBody />}
    </GuideShell>
  )
}
