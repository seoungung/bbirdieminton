import Link from 'next/link'
import { Users, KeyRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { JoinClient } from './JoinClient'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return {
    title: `모임 초대 | 버디모아`,
    description: `초대코드 ${code}로 배드민턴 모임에 참여하세요.`,
  }
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isLoggedIn = !!user && !user.is_anonymous

  // 초대코드로 클럽 정보 조회 (clubs 테이블에 invite_code 컬럼 가정)
  const { data: club } = await supabase
    .from('clubs')
    .select('id, name, location, member_count:memberships(count)')
    .eq('invite_code', code)
    .single()

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-16 bg-[#f8f8f8]">
      <div className="w-full max-w-sm">

        {/* 버디모아 로고 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] flex items-center justify-center">
              <ShuttlecockIcon size={20} className="text-[#beff00]" strokeWidth={2} />
            </div>
          </div>
          <p className="text-[13px] text-[#999]">배드민턴 모임 초대</p>
        </div>

        {/* 카드 */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">

          {club ? (
            /* 클럽 정보 표시 */
            <>
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#f0f0f0]">
                <div className="w-12 h-12 rounded-xl bg-[#beff00] flex items-center justify-center shrink-0">
                  <ShuttlecockIcon size={22} className="text-[#0a0a0a]" strokeWidth={1.7} />
                </div>
                <div className="min-w-0">
                  <p className="text-[16px] font-extrabold text-[#111] truncate">{club.name}</p>
                  {club.location && (
                    <p className="text-[13px] text-[#999] mt-0.5">{club.location}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[13px] text-[#555] mb-6">
                <Users size={14} className="text-[#bbb]" />
                <span>현재 멤버</span>
                <span className="font-bold text-[#111]">{Array.isArray(club.member_count) ? club.member_count[0]?.count ?? 0 : 0}명</span>
              </div>

              {isLoggedIn ? (
                <JoinClient code={code} />
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(`/join/${code}`)}`}
                  className="block w-full text-center py-3.5 px-6 bg-[#FEE500] text-[#191919] font-bold text-[15px] rounded-xl hover:bg-[#F7DC00] transition-colors"
                >
                  카카오로 로그인하고 참여하기
                </Link>
              )}
            </>
          ) : (
            /* 유효하지 않은 코드 */
            <>
              <div className="text-center py-4">
                <KeyRound size={40} className="text-[#ddd] mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-bold text-[#333] mb-1">유효하지 않은 초대코드입니다</p>
                <p className="text-[13px] text-[#999]">
                  코드를 다시 확인하거나 운영자에게 문의하세요.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#f0f0f0]">
                <Link
                  href="/"
                  className="block w-full text-center py-2.5 text-[13px] font-semibold text-[#555] hover:text-[#111] transition-colors"
                >
                  홈으로 돌아가기
                </Link>
              </div>
            </>
          )}
        </div>

        {/* 초대코드 표시 */}
        <p className="text-center mt-4 text-[12px] text-[#bbb]">
          초대코드: <span className="font-mono font-bold">{code.toUpperCase()}</span>
        </p>

      </div>
    </div>
  )
}
