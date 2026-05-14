import Link from 'next/link'
import { getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
    <main className="min-h-screen flex items-center justify-center p-8 bg-beige">
      <div className="text-center space-y-8 max-w-sm w-full">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-forest">🏸 버디민턴</h1>
          <p className="text-xs text-muted-foreground tabular">v3.0 — 백지에서 다시</p>
          <div className="pt-1">
            <Badge variant="secondary">BETA</Badge>
          </div>
        </div>

        {user ? (
          <div className="space-y-5">
            <p className="text-sm text-foreground">
              로그인됨: <strong className="text-forest">{user.email ?? user.id}</strong>
            </p>

            <Link href="/club/create" className="block">
              <Button variant="accent" size="lg" className="w-full">
                새 모임 만들기
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-4 pt-1">
              {isMaster && (
                <Link
                  href="/admin"
                  className="text-xs text-muted-foreground underline hover:text-forest transition-colors"
                >
                  관리자
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-xs text-muted-foreground underline hover:text-forest transition-colors"
                >
                  로그아웃
                </button>
              </form>
            </div>
          </div>
        ) : (
          <Link href="/login" className="inline-block">
            <Button variant="primary" size="lg">
              로그인
            </Button>
          </Link>
        )}
      </div>
    </main>
  )
}
