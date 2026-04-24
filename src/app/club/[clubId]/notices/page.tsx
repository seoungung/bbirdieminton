import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import { getNoticesAction } from '@/app/club/[clubId]/notices/actions'
import { NoticesClient } from '@/components/club/NoticesClient'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import { Megaphone } from 'lucide-react'
import type { Metadata } from 'next'
import type { NoticeRow } from '@/app/club/[clubId]/notices/actions'

interface PageProps {
  params: Promise<{ clubId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find((c) => c.id === clubId)
  if (demo) return { title: `공지사항 | ${demo.name}`, description: '모임 소식 및 알림' }
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return {
    title: club ? `공지사항 | ${club.name}` : '공지사항 | 버디민턴',
    description: '모임 소식 및 알림',
  }
}

export default async function NoticesPage({ params }: PageProps) {
  const { clubId } = await params

  // 데모 클럽 처리
  if (clubId.startsWith('demo-')) {
    const DEMO_NOTICES: NoticeRow[] = [
      // 고정 공지 2개
      {
        id: 'demo-n1',
        club_id: clubId,
        author_member_id: null,
        title: '⚠️ 이번 주 모임 장소 변경 안내',
        body: '이번 주 토요일은 체육관 공사로 인해 옆 건물 B동 2층으로 변경됩니다.\n혼란 없도록 미리 공유드립니다. 질문 있으시면 총무에게 연락주세요.',
        type: 'announcement',
        is_pinned: true,
        image_urls: [],
        created_at: '2026-04-20T09:00:00Z',
        updated_at: '2026-04-20T09:00:00Z',
        author_name: '김민준',
      },
      {
        id: 'demo-n2',
        club_id: clubId,
        author_member_id: null,
        title: '📌 4월 회비 납부 안내 (D-3)',
        body: '4월 회비 납부 마감이 3일 남았습니다.\n아직 미납자 분들은 오늘까지 납부 부탁드려요.\n납부 계좌: 국민 123-456-789 (김민준)',
        type: 'announcement',
        is_pinned: true,
        image_urls: [],
        created_at: '2026-04-18T14:00:00Z',
        updated_at: '2026-04-18T14:00:00Z',
        author_name: '이서연',
      },
      // 일반 공지 8개
      {
        id: 'demo-n3',
        club_id: clubId,
        author_member_id: null,
        title: '5월 정기 시합 참가자 모집 🏸',
        body: '5월 10일(토) 오전 10시, 정기 시합을 개최합니다!\n선착순 16명 마감이니 참가 희망자는 이름 댓글로 달아주세요.\n\n- 장소: 국사봉체육관\n- 참가비: 10,000원 (간식 포함)\n- 대진 방식: 더블 엘리미네이션',
        type: 'event',
        is_pinned: false,
        image_urls: [],
        created_at: '2026-04-15T10:00:00Z',
        updated_at: '2026-04-15T10:00:00Z',
        author_name: '김민준',
      },
      {
        id: 'demo-n4',
        club_id: clubId,
        author_member_id: null,
        title: '🎉 신규 회원 환영합니다!',
        body: '이번 달 새로 가입하신 분들 환영합니다! 👏\n\n- 전수아 (왕초보)\n- 백건우 (왕초보)\n- 노하린 (왕초보)\n\n모임에서 편하게 인사 나눠주세요. 첫 참가 시 네임카드 만들어드려요.',
        type: 'general',
        is_pinned: false,
        image_urls: [],
        created_at: '2026-04-12T18:30:00Z',
        updated_at: '2026-04-12T18:30:00Z',
        author_name: '이서연',
      },
      {
        id: 'demo-n5',
        club_id: clubId,
        author_member_id: null,
        title: '☕ 4월 뒷풀이 장소 투표',
        body: '이번 주 토요일 모임 후 뒷풀이 장소 정해요!\n\n1️⃣ 서울대입구 호프 (치킨·맥주)\n2️⃣ 낙성대 고기집 (삼겹살)\n3️⃣ 사당동 피자집\n\n댓글로 번호 달아주세요. 화요일까지 집계할게요!',
        type: 'general',
        is_pinned: false,
        image_urls: [],
        created_at: '2026-04-08T20:00:00Z',
        updated_at: '2026-04-08T20:00:00Z',
        author_name: '박지호',
      },
      {
        id: 'demo-n6',
        club_id: clubId,
        author_member_id: null,
        title: '🏸 셔틀콕 공동 구매 공지',
        body: '요넥스 AS-50 셔틀콕 공동 구매 진행합니다.\n\n- 가격: 1통(12개) 13,000원 (정가 18,000원)\n- 주문 마감: 4월 25일 금요일\n- 배송: 다음 주 토요일 모임 때 수령\n\n필요하신 분 회비 납부 계좌로 입금 부탁드려요.',
        type: 'general',
        is_pinned: false,
        image_urls: [],
        created_at: '2026-04-05T15:00:00Z',
        updated_at: '2026-04-05T15:00:00Z',
        author_name: '김민준',
      },
      {
        id: 'demo-n7',
        club_id: clubId,
        author_member_id: null,
        title: '📢 경기장 에어컨 고장 → 수리 완료',
        body: '그동안 불편드렸던 B코트 에어컨이 수리 완료되었습니다.\n이번 주말부터는 쾌적하게 운동하실 수 있어요. 감사합니다 🙏',
        type: 'general',
        is_pinned: false,
        image_urls: [],
        created_at: '2026-04-01T11:00:00Z',
        updated_at: '2026-04-01T11:00:00Z',
        author_name: '이서연',
      },
      {
        id: 'demo-n8',
        club_id: clubId,
        author_member_id: null,
        title: '🎾 봄맞이 클럽 친선전 in 서초구',
        body: '서초구 "셔틀러스" 클럽과 친선전 개최 확정!\n\n- 일시: 5월 18일 (일) 오후 2시\n- 장소: 서초체육관\n- 참가비: 무료 (간식 제공)\n- 모집: 10명 (실력 조 균등 배분)\n\n참가 희망자는 운영진 카톡 오픈채팅에 연락 부탁드려요.',
        type: 'event',
        is_pinned: false,
        image_urls: [],
        created_at: '2026-03-28T09:00:00Z',
        updated_at: '2026-03-28T09:00:00Z',
        author_name: '김민준',
      },
      {
        id: 'demo-n9',
        club_id: clubId,
        author_member_id: null,
        title: '📊 3월 월간 결산 리포트',
        body: '3월 한 달 결산 공유드려요!\n\n- 총 출석: 155회\n- 총 경기: 284건\n- 회비 납부율: 95% (1명 미납)\n- MVP: 김민준 (승률 78%)\n\n모두 수고하셨습니다. 4월도 활기차게 가요! 🔥',
        type: 'general',
        is_pinned: false,
        image_urls: [],
        created_at: '2026-04-01T09:00:00Z',
        updated_at: '2026-04-01T09:00:00Z',
        author_name: '이서연',
      },
      {
        id: 'demo-n10',
        club_id: clubId,
        author_member_id: null,
        title: '📚 초보 분들을 위한 셔틀콕 그립법 가이드',
        body: '새로 오신 분들이 많아서, 기본 그립법 가이드 공유합니다.\n\n1. 이스턴 포핸드 (기본)\n2. 백핸드 그립\n3. 패닉 모먼트 그립 전환\n\n영상 자료는 단톡방에 올려놨어요. 궁금한 점 언제든 질문!',
        type: 'general',
        is_pinned: false,
        image_urls: [],
        created_at: '2026-03-25T19:00:00Z',
        updated_at: '2026-03-25T19:00:00Z',
        author_name: '박지호',
      },
    ]

    return (
      <div>
        <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
          <div className="max-w-[1088px] mx-auto flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
                <Megaphone size={16} strokeWidth={2} />
                공지사항
              </h1>
              <p className="text-xs text-[#999] mt-0.5">모임 소식 및 알림</p>
            </div>
          </div>
        </header>
        <main className="max-w-[1088px] mx-auto px-4 py-5">
          <NoticesClient
            clubId={clubId}
            initialNotices={DEMO_NOTICES}
            isOwner={false}
            myMemberId="demo"
          />
        </main>
      </div>
    )
  }

  // 실제 클럽 처리
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/login')

  const notices = await getNoticesAction(clubId)

  const isOwner = membership.role === 'owner'
  const myMemberId = membership.id

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <Megaphone size={16} strokeWidth={2} />
              공지사항
            </h1>
            <p className="text-xs text-[#999] mt-0.5">모임 소식 및 알림</p>
          </div>
        </div>
      </header>
      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <NoticesClient
          clubId={clubId}
          initialNotices={notices}
          isOwner={isOwner}
          myMemberId={myMemberId}
        />
      </main>
    </div>
  )
}
