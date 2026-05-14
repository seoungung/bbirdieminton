import { notFound, redirect } from 'next/navigation'
import { assertMaster } from '@/lib/auth/master'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const guard = await assertMaster()
  if ('error' in guard) {
    if (guard.error === 'unauthenticated') {
      redirect('/login')
    }
    // 비마스터 — 존재 은닉
    notFound()
  }

  return (
    <div className="min-h-screen bg-red-50">
      <div className="bg-red-700 text-white text-center text-sm py-2 font-semibold">
        🔧 마스터 모드 (read-only / dogfooding)
      </div>
      <main className="max-w-4xl mx-auto p-8">{children}</main>
    </div>
  )
}
