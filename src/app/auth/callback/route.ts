import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Open-redirect 방지: next 파라미터는 반드시 상대 경로여야 함
  const rawNext = searchParams.get('next') ?? '/'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      let finalNext = next
      // next가 기본값(/, /club/home, /clubs)일 때만 스마트 라우팅 적용
      // 사용자가 명시적 경로를 보낸 경우엔 그대로 존중
      if (next === '/' || next === '/club/home' || next === '/clubs') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // 1) last_visited_club_id 우선
          const { data: userRow } = await supabase
            .from('users')
            .select('last_visited_club_id')
            .eq('birdieminton_user_id', user.id)
            .maybeSingle()
          if (userRow?.last_visited_club_id) {
            finalNext = `/club/${userRow.last_visited_club_id}`
          } else {
            // 2) 가입한 첫 모임으로 진입 (단일 모임이면 자동 진입)
            const { data: clubUserRow } = await supabase
              .from('users')
              .select('id')
              .eq('birdieminton_user_id', user.id)
              .maybeSingle()
            if (clubUserRow?.id) {
              const { data: firstMembership } = await supabase
                .from('club_members')
                .select('club_id')
                .eq('user_id', clubUserRow.id)
                .is('removed_at', null)
                .order('joined_at', { ascending: true })
                .limit(1)
                .maybeSingle()
              if (firstMembership?.club_id) {
                finalNext = `/club/${firstMembership.club_id}`
              } else {
                // 3) 가입 모임 0개 → 둘러보기로
                finalNext = '/clubs'
              }
            } else {
              finalNext = '/clubs'
            }
          }
        }
      }
      return NextResponse.redirect(`${origin}${finalNext}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
