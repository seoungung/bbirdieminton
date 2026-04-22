import { redirect } from 'next/navigation'

// /club/home이 내 클럽 목록 역할을 담당합니다.
// /dashboard는 향후 전용 페이지로 교체 예정
export default function DashboardPage() {
  redirect('/club/home')
}
