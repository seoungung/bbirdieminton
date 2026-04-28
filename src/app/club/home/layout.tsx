import { SaaSShell } from '@/components/layout/saas/SaaSShell'
import { getSaaSShellData } from '@/components/layout/saas/getSaaSShellData'

/**
 * /club/home — 내 모임 (SaaSShell)
 *
 * 비로그인은 게스트 모드로 SaaSShell 사이드바(빈 클럽 리스트 + 로그인 버튼)와 함께 표시.
 * page.tsx에서는 본문 wrapper(min-h-screen / bg)를 두지 않고 SaaSShell이 담당.
 */
export default async function ClubHomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, myClubs } = await getSaaSShellData()

  return (
    <SaaSShell pageTitle="내 모임" myClubs={myClubs} user={user}>
      {children}
    </SaaSShell>
  )
}
