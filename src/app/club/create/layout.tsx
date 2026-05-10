import { SaaSShell } from '@/components/layout/saas/SaaSShell'
import { getSaaSShellData } from '@/components/layout/saas/getSaaSShellData'

/**
 * /club/create — 새 모임 만들기 (SaaSShell)
 *
 * page.tsx에서 비로그인은 /login으로 redirect 처리되므로 여기서는 user 항상 존재.
 * 단 SaaSShell은 user=null도 허용하므로 별도 분기 불필요.
 */
export default async function ClubCreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, myClubs, isMaster } = await getSaaSShellData()

  return (
    <SaaSShell pageTitle="새 모임 만들기" myClubs={myClubs} user={user} isMaster={isMaster}>
      {children}
    </SaaSShell>
  )
}
