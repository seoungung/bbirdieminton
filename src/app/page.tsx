import Link from 'next/link'
import { getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function Home() {
  const user = await getAuthUser()
  let isMaster = false
  if (user) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('users')
      .select('is_master')
      .eq('id', user.id)
      .maybeSingle()
    isMaster = data?.is_master === true
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-sm">
        <div>
          <h1 className="text-4xl font-bold mb-2">🏸 버디민턴</h1>
          <p className="text-sm text-gray-500">v3.0 — 백지에서 다시</p>
        </div>

        {user ? (
          <div className="space-y-3">
            <p className="text-sm">
              로그인됨: <strong>{user.email ?? user.id}</strong>
            </p>
            {isMaster && (
              <Link
                href="/admin"
                className="inline-block text-xs text-red-700 underline hover:text-red-900"
              >
                🔧 관리자
              </Link>
            )}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-xs text-gray-500 underline hover:text-gray-700"
              >
                로그아웃
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800"
          >
            로그인
          </Link>
        )}
      </div>
    </main>
  )
}
