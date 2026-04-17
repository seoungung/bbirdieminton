import { redirect } from 'next/navigation'

// /club/login → 온보딩 페이지로 통합
export default function ClubLoginPage() {
  redirect('/login')
}
