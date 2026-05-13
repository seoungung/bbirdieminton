import Link from 'next/link'
import { ArrowLeft, MapPin, Users, Trophy } from 'lucide-react'
import { GradeBadge } from '@/components/club/gameboard/setup/GradeBadge'
import { scoreToGrade, type Grade } from '@/lib/club/grade'
import { cn } from '@/lib/utils'

interface AttendeeRow {
  memberId: string
  name: string
  skillScore: number
  isGuest?: boolean
}

interface MatchTeamMember {
  memberId: string
  name: string
}

interface MatchRow {
  id: string
  courtNumber: number
  teamAScore: number | null
  teamBScore: number | null
  teamA: MatchTeamMember[]
  teamB: MatchTeamMember[]
}

interface Props {
  clubId: string
  sessionDate: string
  eventTitle: string | null
  eventPlace: string | null
  attendees: AttendeeRow[]
  matches: MatchRow[]
}

/** YYYY-MM-DD → 'M월 D일 (요일)' */
function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`
}

/** 매치 결과 디코딩 — W2 dummy score 호환 (PRD §3.3).
 *  · a > b → A 승
 *  · b > a → B 승
 *  · a === b (양쪽 모두 non-null) → 무승부
 *  · a === null || b === null → 미완료
 *  T0-3-3 마이그 이후엔 matches.winning_team 컬럼 직독으로 교체 예정. */
type MatchOutcome = 'A' | 'B' | 'DRAW' | 'INCOMPLETE'

function getOutcome(a: number | null, b: number | null): MatchOutcome {
  if (a === null || b === null) return 'INCOMPLETE'
  if (a > b) return 'A'
  if (b > a) return 'B'
  return 'DRAW'
}

export function ClosedSessionClient({
  clubId,
  sessionDate,
  eventTitle,
  eventPlace,
  attendees,
  matches,
}: Props) {
  const sortedAttendees = [...attendees].sort((a, b) => b.skillScore - a.skillScore)
  const sortedMatches = [...matches].sort((a, b) => a.courtNumber - b.courtNumber)

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between h-14">
          <Link
            href={`/club/${clubId}/gameboard`}
            className="flex items-center gap-1.5 text-[#555] hover:text-[#111] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">목록으로</span>
          </Link>
          <span className="text-base font-bold text-[#111]">종료된 게임</span>
          <span className="text-xs font-bold text-[var(--color-brand-text-muted)] bg-[var(--color-surface-muted)] px-2 py-1 rounded-full">
            종료
          </span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-5 space-y-5">
        {/* 이벤트 정보 카드 */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
          <p className="text-xs font-semibold text-[#999] mb-2">정기 모임</p>
          <p className="text-base font-bold text-[#111] truncate">
            {eventTitle ?? '정기 모임 없음'}
          </p>
          <p className="text-sm text-[#555] mt-1">{formatEventDate(sessionDate)}</p>
          {eventPlace && (
            <p className="text-xs text-[#999] mt-0.5 inline-flex items-center gap-1">
              <MapPin size={11} strokeWidth={2.2} />
              {eventPlace}
            </p>
          )}
        </div>

        {/* 참가자 */}
        <section>
          <p className="text-xs font-semibold text-[#999] mb-3 inline-flex items-center gap-1">
            <Users size={12} strokeWidth={2.4} />
            참가자 ({sortedAttendees.length}명)
          </p>
          {sortedAttendees.length === 0 ? (
            <p className="text-xs text-[#bbb] text-center py-6">참가자 정보가 없습니다</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sortedAttendees.map(a => {
                const grade: Grade | null = a.isGuest ? null : scoreToGrade(a.skillScore)
                return (
                  <div
                    key={a.memberId}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--color-brand-border)] bg-white"
                  >
                    <GradeBadge grade={grade} />
                    <span className="flex-1 text-sm font-semibold text-[#111] truncate">
                      {a.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface-muted)] text-[var(--color-brand-text-sub)] shrink-0">
                      {a.isGuest ? '게스트' : '회원'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* 경기 결과 */}
        <section>
          <p className="text-xs font-semibold text-[#999] mb-3 inline-flex items-center gap-1">
            <Trophy size={12} strokeWidth={2.4} />
            경기 결과 ({sortedMatches.length}경기)
          </p>
          {sortedMatches.length === 0 ? (
            <p className="text-xs text-[#bbb] text-center py-6">기록된 경기가 없습니다</p>
          ) : (
            <div className="space-y-2">
              {sortedMatches.map(m => {
                const outcome = getOutcome(m.teamAScore, m.teamBScore)
                const winner: 'A' | 'B' | null =
                  outcome === 'A' ? 'A' : outcome === 'B' ? 'B' : null
                return (
                  <div
                    key={m.id}
                    className="bg-white rounded-xl border border-[var(--color-brand-border)] p-3 sm:p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded bg-[var(--color-brand-court)] px-2 py-0.5 text-[11px] font-bold text-white">
                        {m.courtNumber}코트
                      </span>
                      {outcome === 'INCOMPLETE' ? (
                        <span className="text-[11px] text-[var(--color-brand-text-muted)]">미완료</span>
                      ) : outcome === 'DRAW' ? (
                        <span className="text-[11px] font-bold text-[var(--color-brand-text-sub)]">무승부</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-brand-streak)]">
                          <Trophy size={10} strokeWidth={2.4} />
                          {outcome}팀 승
                        </span>
                      )}
                    </div>

                    {/* PRD §3.3 — 점수 표시 폐기. 결과 라벨(승/무/미완료)만 노출. */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      {/* 팀 A */}
                      <div
                        className={cn(
                          'rounded-lg px-3 py-2 border',
                          winner === 'A'
                            ? 'border-[var(--color-brand-streak)] bg-amber-50'
                            : 'border-[var(--color-brand-border)] bg-[var(--color-surface-sub)]',
                        )}
                      >
                        <p className="text-[10px] font-bold text-[var(--color-brand-team-a)] mb-1 uppercase tracking-widest">
                          A팀
                        </p>
                        <p className="text-sm font-semibold text-[#111] truncate">
                          {m.teamA.map(p => p.name).join(' / ') || '—'}
                        </p>
                      </div>

                      {/* 중앙 결과 마커 — 점수 숫자 대신 라벨/심볼 */}
                      <div className="flex items-center justify-center w-12">
                        {outcome === 'INCOMPLETE' ? (
                          <span className="text-[var(--color-brand-text-muted)] text-sm">–</span>
                        ) : outcome === 'DRAW' ? (
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-brand-text-sub)]">
                            무
                          </span>
                        ) : (
                          <Trophy
                            size={18}
                            strokeWidth={2.6}
                            className={cn(
                              winner === 'A'
                                ? 'text-[var(--color-brand-team-a)]'
                                : 'text-[var(--color-brand-team-b)]',
                            )}
                          />
                        )}
                      </div>

                      {/* 팀 B */}
                      <div
                        className={cn(
                          'rounded-lg px-3 py-2 border text-right',
                          winner === 'B'
                            ? 'border-[var(--color-brand-streak)] bg-amber-50'
                            : 'border-[var(--color-brand-border)] bg-[var(--color-surface-sub)]',
                        )}
                      >
                        <p className="text-[10px] font-bold text-[var(--color-brand-team-b)] mb-1 uppercase tracking-widest">
                          B팀
                        </p>
                        <p className="text-sm font-semibold text-[#111] truncate">
                          {m.teamB.map(p => p.name).join(' / ') || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
