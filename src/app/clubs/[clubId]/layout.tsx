import { SaaSShell } from '@/components/layout/saas/SaaSShell'
import { getSaaSShellData } from '@/components/layout/saas/getSaaSShellData'

/**
 * /clubs/[clubId] — 클럽 미리보기 (SaaSShell)
 *
 * pageTitle 없음 — 페이지 자체에 ClubPreviewHeader (sub-header) 가 있음.
 * 비로그인 가능 — user=null이면 사이드바 빈 상태 + 헤더 우측에 "로그인" 버튼.
 */
export default async function ClubPreviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, myClubs, isMaster } = await getSaaSShellData()

  return (
    <SaaSShell myClubs={myClubs} user={user} isMaster={isMaster}>
      {children}
    </SaaSShell>
  )
}
