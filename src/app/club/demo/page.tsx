import { DemoClient } from '@/components/demo/DemoClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '게임보드 체험 | 버디민턴' }

export default function ClubDemoPage() {
  return <DemoClient />
}
