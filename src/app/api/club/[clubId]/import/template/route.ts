import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { generateTemplate, templateFilename } from '@/lib/club/import/template'
import type { ImportType } from '@/lib/club/import/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params
  const url = new URL(request.url)
  const type = url.searchParams.get('type') as ImportType | null

  if (!type || (type !== 'members' && type !== 'dues')) {
    return NextResponse.json({ error: 'type=members|dues 필요' }, { status: 400 })
  }

  // 인증 — 해당 모임의 운영진만 다운로드 가능
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) {
    return NextResponse.json({ error: '로그인 필요' }, { status: 401 })
  }

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return NextResponse.json({ error: '운영진만 가능' }, { status: 403 })
  }

  // 모임명 조회 (파일명에 사용)
  const { data: club } = await supabase
    .from('clubs')
    .select('name')
    .eq('id', clubId)
    .single()

  const buffer = await generateTemplate(type, club?.name)
  const filename = templateFilename(type, club?.name)

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Cache-Control': 'no-store',
    },
  })
}
