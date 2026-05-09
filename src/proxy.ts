import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next()
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname, searchParams } = request.nextUrl

  // 데모 클럽 경로는 비로그인 허용
  const isDemoPath = /^\/club\/demo-/.test(pathname)
  // /club 루트는 인증 없이 허용 (내부에서 분기)
  const isClubRoot = pathname === '/club' || pathname === '/club/'
  // /club/create?demo=1 — 데모 미리보기 모드 (UI 만 노출, submit 차단됨)
  const isCreateDemoPreview =
    pathname === '/club/create' && searchParams.get('demo') === '1'

  // 익명 세션은 비로그인과 동일 취급 — RPC 가드 통과를 노린 우회 차단
  const isAuthed = user && user.is_anonymous !== true

  if (!isClubRoot && !isDemoPath && !isCreateDemoPreview && !isAuthed) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  /*
   * 클럽 앱 경로에만 인증 미들웨어 적용.
   * 마케팅(/), /features, /pricing, /demo 등 공개 페이지는 제외.
   */
  matcher: ['/club/(.*)'],
}
