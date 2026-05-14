import Link from 'next/link'
import { getAuthUser } from '@/lib/supabase/server'

export default async function Home() {
  const user = await getAuthUser()

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-sm">
        <div>
          <h1 className="text-4xl font-bold mb-2">🏸 버디민턴</h1>
          <p className="text-sm text-gray-500">v3.0 — 백지에서 다시</p>
        </div>

        {user ? (
          <div className="space-y-2">
            <p className="text-sm">
              로그인됨: <strong>{user.email ?? user.id}</strong>
            </p>
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
