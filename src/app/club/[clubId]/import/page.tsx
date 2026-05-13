import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileSpreadsheet } from 'lucide-react'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
// T0-1-3: ImportClient import 제거 (코드 파일 보존, Stage E 재논의 시 부활)
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '엑셀 임포트 | 버디민턴' }

export default async function ImportPage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params

  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase, user)
  if (!clubUserId) redirect('/login')

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()

  if (!membership) redirect('/clubs')
  if (!['owner', 'manager'].includes(membership.role)) {
    redirect(`/club/${clubId}`)
  }

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <FileSpreadsheet size={16} strokeWidth={2} />
              엑셀 임포트
            </h1>
            <p className="text-xs text-[#999] mt-0.5">엑셀 파일로 회원 일괄 등록</p>
          </div>
        </div>
      </header>
      {/* T0-1-3: ImportClient 렌더 대신 "준비 중" 카드 표시. Stage E 에서 재논의. */}
      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <div className="bg-white rounded-3xl border border-[#e5e5e5] p-8 text-center max-w-[520px] mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#f5f5f5] flex items-center justify-center mx-auto mb-5">
            <FileSpreadsheet size={28} strokeWidth={1.5} className="text-[#999]" />
          </div>
          <h2 className="text-lg font-extrabold text-[#111] mb-2">엑셀 임포트</h2>
          <p className="text-sm text-[#555] leading-relaxed mb-1">
            엑셀로 회원·회비를 한 번에 가져오는 기능을 준비하고 있습니다.
          </p>
          <p className="text-sm text-[#999] leading-relaxed mb-6">
            안정화 작업 후 베타 단계에서 다시 열어드릴 예정이에요.
          </p>
          <Link
            href={`/club/${clubId}/settings`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-bold rounded-xl hover:bg-[#222] transition-colors"
          >
            돌아가기
          </Link>
        </div>
      </main>
    </div>
  )
}
