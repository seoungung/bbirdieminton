import { redirect } from 'next/navigation'

// 구 체험 페이지 → 실제 서비스와 동일한 데모 클럽 뷰로 일원화
export default function ClubDemoPage() {
  redirect('/club/demo-1/view')
}
