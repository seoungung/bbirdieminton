import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { User as UserIcon, Calendar, Users2, Trophy } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import {
  getMyMembership,
  getClubMembers,
  getClubMemberRatings,
  getMemberPartners,
  getClubAttendanceCounts,
} from '@/lib/club/client'
import { GRADE_COLOR, GRADE_LABEL, scoreToGrade, type Grade } from '@/lib/club/grade'
import { muToGrade } from '@/lib/club/glicko2'
import { DEMO_CLUBS, DEMO_MEMBERS } from '@/lib/club/demoData'
import { GenderEditor } from './GenderEditor'

interface PageProps {
  params: Promise<{ clubId: string; memberId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId, memberId } = await params
  const demo = DEMO_CLUBS.find((c) => c.id === clubId)
  if (demo) {
    const m = DEMO_MEMBERS.find((m) => m.id === memberId)
    return {
      title: `${m?.name ?? '회원'} | ${demo.name}`,
      description: '클럽 회원 프로필',
    }
  }
  return { title: '회원 프로필 | 버디민턴', description: '클럽 회원 프로필' }
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { clubId, memberId } = await params

  // 데모: 가짜 데이터
  if (clubId.startsWith('demo-')) {
    return <DemoMemberDetail memberId={memberId} clubId={clubId} />
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/clubs')

  // 본인 페이지면 /me로 redirect (정밀 점수까지 다 보이는 본인 대시보드로)
  if (membership.id === memberId) {
    redirect(`/club/${clubId}/me`)
  }

  const [members, ratingsMap, attendanceCounts, partners] = await Promise.all([
    getClubMembers(supabase, clubId),
    getClubMemberRatings(supabase, clubId),
    getClubAttendanceCounts(supabase, clubId),
    getMemberPartners(supabase, memberId, 3),
  ])

  const member = members.find((m) => m.id === memberId)
  if (!member) notFound()

  const { data: stats } = await supabase
    .from('player_stats')
    .select('wins, losses, draws, games_played, win_rate')
    .eq('member_id', memberId)
    .eq('club_id', clubId)
    .maybeSingle()

  const memberMap = new Map(members.map((m) => [m.id, m]))
  const mu = ratingsMap[memberId]?.mu
  const grade: Grade = mu != null ? muToGrade(mu) : scoreToGrade(member.skill_score)

  const isManager = ['owner', 'manager'].includes(membership.role)

  return (
    <MemberDetailView
      memberName={member.user?.name ?? '이름없음'}
      profileImg={member.user?.profile_img ?? null}
      grade={grade}
      joinedAt={member.joined_at}
      gender={member.gender ?? null}
      memberId={memberId}
      clubId={clubId}
      isManager={isManager}
      stats={stats}
      attendanceCount={attendanceCounts[memberId] ?? 0}
      partners={partners.map((p) => ({
        ...p,
        partnerName: memberMap.get(p.partnerMemberId)?.user?.name ?? '이름없음',
        partnerGrade:
          ratingsMap[p.partnerMemberId]?.mu != null
            ? muToGrade(ratingsMap[p.partnerMemberId].mu)
            : scoreToGrade(memberMap.get(p.partnerMemberId)?.skill_score ?? 50),
      }))}
    />
  )
}

// ── 메인 뷰 ────────────────────────────────────────────────
function MemberDetailView({
  memberName,
  profileImg,
  grade,
  joinedAt,
  gender,
  memberId,
  clubId,
  isManager,
  stats,
  attendanceCount,
  partners,
}: {
  memberName: string
  profileImg: string | null
  grade: Grade
  joinedAt: string
  gender: 'M' | 'F' | null
  memberId: string
  clubId: string
  isManager: boolean
  stats: {
    wins: number
    losses: number
    draws: number
    games_played: number
    win_rate: number
  } | null
  attendanceCount: number
  partners: Array<{
    partnerMemberId: string
    matchesTogether: number
    partnerName: string
    partnerGrade: Grade
  }>
}) {
  const color = GRADE_COLOR[grade]
  const joined = new Date(joinedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[720px] mx-auto flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <UserIcon size={16} strokeWidth={2} />회원 프로필
            </h1>
            <p className="text-xs text-[#999] mt-0.5">회원 정보 · 등급 · 활동</p>
          </div>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-4 py-5 space-y-4">
        {/* 멤버 카드 */}
        <section className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
          <div className="flex items-center gap-4">
            {/* 아바타 */}
            <div className="w-16 h-16 rounded-2xl bg-[#f0f0f0] flex items-center justify-center text-xl font-bold text-[#555] shrink-0 overflow-hidden">
              {profileImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImg} alt="" className="w-full h-full object-cover" />
              ) : (
                memberName.slice(0, 1)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`inline-flex h-6 px-2 rounded-md items-center justify-center text-[11px] font-extrabold ${color.bg} ${color.text}`}
                >
                  {grade} · {GRADE_LABEL[grade]}
                </span>
                {gender === 'F' ? (
                  <span className="inline-flex h-6 px-2 rounded-md items-center justify-center text-[11px] font-extrabold bg-[var(--color-brand-team-b-bg)] text-[var(--color-brand-team-b)]">여자</span>
                ) : gender === 'M' ? (
                  <span className="inline-flex h-6 px-2 rounded-md items-center justify-center text-[11px] font-extrabold bg-[var(--color-brand-team-a-bg)] text-[var(--color-brand-team-a)]">남자</span>
                ) : (
                  <span className="inline-flex h-6 px-2 rounded-md items-center justify-center text-[11px] font-extrabold bg-[#f0f0f0] text-[#999]">미지정</span>
                )}
              </div>
              <p className="text-lg font-extrabold text-[#0a0a0a] truncate">
                {memberName}
              </p>
              <p className="text-[11px] text-[#999] mt-0.5 inline-flex items-center gap-1">
                <Calendar size={11} strokeWidth={2.5} />
                {joined} 가입
              </p>
            </div>
          </div>
        </section>

        {/* 성별 편집 (관리자 전용) */}
        {isManager && (
          <GenderEditor
            memberId={memberId}
            clubId={clubId}
            currentGender={gender}
          />
        )}

        {/* 전적 */}
        <section className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#999] mb-3 inline-flex items-center gap-1.5">
            <Trophy size={11} strokeWidth={2.5} />
            전적
          </p>
          {stats && stats.games_played > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              <Stat label="총 경기" value={`${stats.games_played}`} />
              <Stat label="승" value={`${stats.wins}`} accent="text-[var(--color-brand-court)]" />
              <Stat label="패" value={`${stats.losses}`} accent="text-[var(--color-brand-streak)]" />
              <Stat
                label="승률"
                value={`${(stats.win_rate * 100).toFixed(0)}%`}
                accent="text-[#0a0a0a]"
              />
            </div>
          ) : (
            <p className="text-sm text-[#999] text-center py-4">
              아직 경기 기록이 없어요.
            </p>
          )}
          <p className="text-[10px] text-[#999] mt-3 pt-3 border-t border-[#f0f0f0]">
            다른 회원에겐 등급만 보여요. 내 점수와 변동 이력은 본인만 볼 수 있어요.
          </p>
        </section>

        {/* 출석 + 파트너 (2 카드 grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#999] mb-3 inline-flex items-center gap-1.5">
              <Calendar size={11} strokeWidth={2.5} />
              누적 출석
            </p>
            <p className="text-3xl font-extrabold text-[#0a0a0a] tabular-nums">
              {attendanceCount}
              <span className="text-base text-[#999] font-medium ml-1">회</span>
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#999] mb-3 inline-flex items-center gap-1.5">
              <Users2 size={11} strokeWidth={2.5} />
              자주 같이 뛰는 파트너
            </p>
            {partners.length === 0 ? (
              <p className="text-sm text-[#999] py-2">아직 데이터가 부족해요.</p>
            ) : (
              <ul className="space-y-2">
                {partners.map((p) => {
                  const c = GRADE_COLOR[p.partnerGrade]
                  return (
                    <li key={p.partnerMemberId} className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-extrabold ${c.bg} ${c.text}`}
                      >
                        {p.partnerGrade}
                      </span>
                      <span className="text-sm font-bold text-[#111] flex-1 truncate">
                        {p.partnerName}
                      </span>
                      <span className="text-[11px] text-[#666] tabular-nums">
                        {p.matchesTogether}경기
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

function Stat({
  label,
  value,
  accent = 'text-[#0a0a0a]',
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="bg-[#fafafa] rounded-xl p-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#999]">
        {label}
      </p>
      <p className={`mt-1 text-lg font-extrabold tabular-nums ${accent}`}>{value}</p>
    </div>
  )
}

// ── 데모 ──────────────────────────────────────────────────
function DemoMemberDetail({
  memberId,
  clubId,
}: {
  memberId: string
  clubId: string
}) {
  const m = DEMO_MEMBERS.find((m) => m.id === memberId)
  if (!m) {
    return (
      <div className="p-8 text-center text-sm text-[#999]">
        <p className="font-bold text-[#111] mb-2">회원을 찾을 수 없어요</p>
        <a
          href={`/club/${clubId}/members`}
          className="text-[12px] text-[var(--color-brand-court)] hover:underline"
        >
          ← 회원 목록으로
        </a>
      </div>
    )
  }
  const grade = scoreToGrade(m.skill)
  const wins = 14
  const losses = 6
  const games = wins + losses
  const partners = DEMO_MEMBERS.slice(0, 3)
    .filter((p) => p.id !== memberId)
    .slice(0, 3)
    .map((p, i) => ({
      partnerMemberId: p.id,
      matchesTogether: 8 - i * 2,
      partnerName: p.name,
      partnerGrade: scoreToGrade(p.skill),
    }))

  return (
    <MemberDetailView
      memberName={m.name}
      profileImg={null}
      grade={grade}
      joinedAt="2026-01-15T00:00:00Z"
      gender={null}
      memberId={memberId}
      clubId={clubId}
      isManager={false}
      stats={{
        wins,
        losses,
        draws: 0,
        games_played: games,
        win_rate: wins / games,
      }}
      attendanceCount={12}
      partners={partners}
    />
  )
}
