import { redirect } from 'next/navigation'

// 클럽 생성 플로우는 /club/create에 구현되어 있습니다
export default function ClubNewPage() {
  redirect('/club/create')
}
