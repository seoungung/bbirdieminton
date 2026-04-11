import { createClient } from '@/lib/supabase/server'
import { GameBoardLanding } from '@/components/club/GameBoardLanding'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '게임보드 | 버디민턴',
  description: '배드민턴 모임을 만들고 당일 게임을 스마트하게 관리하세요.',
}

export default async function ClubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <GameBoardLanding isLoggedIn={!!user} />
}
