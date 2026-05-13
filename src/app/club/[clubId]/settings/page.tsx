import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers } from '@/lib/club/client'
import { Settings as SettingsIcon } from 'lucide-react'
import { SettingsClubInfoClient } from '@/components/club/settings/SettingsClubInfoClient'
import { SettingsMembersClient } from '@/components/club/settings/SettingsMembersClient'
import { FinanceClient } from '@/components/club/FinanceClient'
import { NoticesClient } from '@/components/club/NoticesClient'
import { JoinRequestsClient } from '@/app/club/[clubId]/join-requests/JoinRequestsClient'
import { SettingsTabsNav, type SettingsTabKey } from '@/components/club/settings/SettingsTabsNav'
import { getNoticesAction, getUnreadCountAction } from '@/app/club/[clubId]/notices/actions'
import { getJoinRequestsAction } from '@/app/club/[clubId]/join-requests/actions'
import type { Metadata } from 'next'

interface SettingsMetadataProps {
  params: Promise<{ clubId: string }>
}

export async function generateMetadata({ params }: SettingsMetadataProps): Promise<Metadata> {
  const { clubId } = await params
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return {
    title: club ? `관리 | ${club.name}` : '관리 | 버디민턴',
    description: '클럽 정보·회원·회비·공지 관리',
  }
}

function normalizeTab(raw: string | string[] | undefined): SettingsTabKey {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v === 'members' || v === 'finance' || v === 'notices') return v
  return 'info'
}

const TAB_LABEL: Record<SettingsTabKey, string> = {
  info: '클럽 정보·게임 규칙·위험 영역',
  members: '회원 목록·역할·코트 수',
  finance: '월 회비 납부 현황',
  notices: '공지사항·가입 신청 관리',
}

/**
 * PRD §2.2 [관리] 탭 본체.
 *
 * 상단 탭 4분할:
 *   1) [클럽 정보]      — 멤버십 필수 (수정은 owner/manager)
 *   2) [회원·권한]      — 멤버십 필수 (수정은 owner/manager)
 *   3) [회비]           — 멤버십 필수 (수정은 owner/manager)
 *   4) [공지·가입신청]  — 공지: 멤버십 필수 / 가입 신청 섹션: owner/manager 만
 *
 * 권한 분기:
 *   - 페이지 진입 자체는 멤버십만 검사 — 모든 탭이 회원에게 의미 있음.
 *   - 가입 신청 데이터(`getJoinRequestsAction`) 는 isManager 인 경우에만 fetch +
 *     하단 섹션도 isManager 일 때만 노출. (R-1a 위험 완화: server-side 분기)
 *   - 활성 탭에 필요한 데이터만 lazy fetch (R-1b 완화).
 */
export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clubId: string }>
  searchParams: Promise<{ tab?: string | string[] }>
}) {
  const { clubId } = await params
  const { tab: rawTab } = await searchParams
  const activeTab = normalizeTab(rawTab)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/clubs')

  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single()
  if (!club) notFound()

  const isOwner = membership.role === 'owner'
  const isManager = ['owner', 'manager'].includes(membership.role)
  const myMemberId = membership.id

  /* ── 활성 탭별 데이터 fetch (lazy) ──
   * 모든 탭에서 사용하는 members 만 공통으로 미리 fetch.
   * 나머지는 활성 탭에서만 fetch (서버 단위 lazy 효과). */
  const needsMembers = activeTab === 'info' || activeTab === 'members' || activeTab === 'finance'
  const members = needsMembers ? await getClubMembers(supabase, clubId) : []

  const unreadCount = await getUnreadCountAction(clubId).catch(() => 0)

  /* finance 탭 데이터 */
  let financeYear = new Date().getFullYear()
  let financeMonth = new Date().getMonth() + 1
  let duesData: Array<{
    id: string
    member_id: string
    amount: number
    paid: boolean
    paid_at: string | null
  }> = []
  if (activeTab === 'finance') {
    const now = new Date()
    financeYear = now.getFullYear()
    financeMonth = now.getMonth() + 1
    const { data } = await supabase
      .from('dues')
      .select('*')
      .eq('club_id', clubId)
      .eq('year', financeYear)
      .eq('month', financeMonth)
    duesData = data ?? []
  }

  /* notices 탭 데이터 — 공지(전체) + 가입 신청(manager 전용) */
  const noticesPromise = activeTab === 'notices' ? getNoticesAction(clubId) : null
  const joinRequestsPromise =
    activeTab === 'notices' && isManager ? getJoinRequestsAction(clubId) : null
  const [notices, joinRequests] = await Promise.all([
    noticesPromise ?? Promise.resolve([]),
    joinRequestsPromise ?? Promise.resolve([]),
  ])

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <SettingsIcon size={16} strokeWidth={2} />
              관리
            </h1>
            <p className="text-xs text-[#999] mt-0.5">{TAB_LABEL[activeTab]}</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <SettingsTabsNav
          clubId={clubId}
          activeTab={activeTab}
          unreadNoticeCount={unreadCount}
        />

        {activeTab === 'info' && (
          <SettingsClubInfoClient club={club} isOwner={isOwner} isManager={isManager} />
        )}

        {activeTab === 'members' && (
          <SettingsMembersClient
            club={club}
            members={members}
            myMemberId={myMemberId}
            isOwner={isOwner}
            isManager={isManager}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceClient
            clubId={clubId}
            members={members}
            duesData={duesData}
            isManager={isManager}
            year={financeYear}
            month={financeMonth}
          />
        )}

        {activeTab === 'notices' && (
          <div className="space-y-6">
            {/* 공지사항 — 전체 멤버 (작성은 owner) */}
            <section>
              <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[var(--color-text-strong)] mb-3">
                공지사항
              </h2>
              <NoticesClient
                clubId={clubId}
                initialNotices={notices}
                isOwner={isOwner}
                myMemberId={myMemberId}
              />
            </section>

            {/* 가입 신청 관리 — owner/manager 만 노출 (server-side 분기) */}
            {isManager && (
              <section>
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[var(--color-text-strong)]">
                    가입 신청
                  </h2>
                  <span className="text-xs text-[#999]">대기 중 {joinRequests.length}건</span>
                </div>
                <JoinRequestsClient clubId={clubId} initialRequests={joinRequests} />
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
