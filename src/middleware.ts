import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // x-pathname을 request 헤더에 주입 — layout.tsx의 headers()에서 읽기 위해
  // response 헤더는 브라우저로 가고, request 헤더가 서버 컴포넌트로 전달됨
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })

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
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 비로그인 허용 경로 — 공개 view 페이지만 허용 (나머지는 로그인 필요)
  const isClubPath = pathname.startsWith('/club')
  const isClubRoot = pathname === '/club' || pathname === '/club/'
  const isGuestAllowed = /^\/club\/[^/]+\/view$/.test(pathname)

  if (isClubPath && !isClubRoot && !isGuestAllowed && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  /*
   * 미들웨어 실행 범위를 최소화:
   * - /club/* (auth·redirect·x-pathname 주입 필요)
   * - /mypage, /admin (auth 필요)
   * 제외: /, /rackets, /quiz, /api 등 공개 페이지
   * → 라켓 도감·퀴즈 등에서 불필요한 Supabase auth 호출 제거
   */
  matcher: [
    '/club/(.*)',
    '/mypage/:path*',
    '/admin/:path*',
  ],
}
