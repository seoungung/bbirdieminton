'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { TABS, Tab, UserStatus, ClubViewData, MemberViewItem, RegularSessionItem, GameSessionItem, isNewClub } from './clubview/types'
import { Toast } from './clubview/SharedUI'
import { HomeTab } from './clubview/HomeTab'
import { RegularSessionTab } from './clubview/RegularSessionTab'
import { GameBoardTab } from './clubview/GameBoardTab'
import { ManageTab } from './clubview/ManageTab'
import { SettingsTab } from './clubview/SettingsTab'
import { NoticesTab } from './clubview/NoticesTab'
import { getUnreadCountAction } from '@/app/club/[clubId]/notices/actions'
import { usePushNotification } from '@/hooks/usePushNotification'

// 하위 호환을 위해 타입 재익스포트
export type { UserStatus, ClubViewData, MemberViewItem, RegularSessionItem, GameSessionItem }

interface Props {
  club: ClubViewData
  members: MemberViewItem[]
  regularSessions: RegularSessionItem[]
  userStatus: UserStatus
  clubId: string
  isAuthenticated: boolean
  isOwner: boolean
  isManager: boolean
  gameSessions: GameSessionItem[]
  myMemberId?: string | null
}

export function ClubViewClient({
  club,
  members,
  regularSessions,
  userStatus,
  clubId,
  isAuthenticated,
  isOwner,
  isManager,
  gameSessions,
  myMemberId,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('홈')
  const [isFav, setIsFav] = useState(false)
  const [toast, setToast] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  // Web Push — 멤버에게만 활성화
  const { state: pushState, subscribe: subscribePush, unsubscribe: unsubscribePush } =
    usePushNotification(userStatus === 'member' ? clubId : '')

  const isNew = isNewClub(club.created_at)
  const rankings = [...members].sort((a, b) => (b.skill ?? 0) - (a.skill ?? 0))

  // 즐겨찾기 초기화
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favoriteClubs') || '[]') as string[]
    setIsFav(favs.includes(clubId))
  }, [clubId])

  // 읽지 않은 알림 수 초기 로드 (멤버일 때만)
  useEffect(() => {
    if (userStatus === 'member') {
      getUnreadCountAction(clubId).then(setUnreadCount)
    }
  }, [clubId, userStatus])

  const toggleFav = () => {
    const favs = JSON.parse(localStorage.getItem('favoriteClubs') || '[]') as string[]
    const next = isFav ? favs.filter((id: string) => id !== clubId) : [...favs, clubId]
    localStorage.setItem('favoriteClubs', JSON.stringify(next))
    setIsFav(!isFav)
  }

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }, [])

  const goToSessions = useCallback(() => setActiveTab('정기모임'), [])

  // 공지 탭 이동 + 알림 뱃지 클리어
  const goToNotices = useCallback(() => setActiveTab('공지'), [])
  const handleUnreadCleared = useCallback(() => setUnreadCount(0), [])

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* ── 상단 고정 (헤더 + 탭바) ── */}
      <div className="sticky top-0 z-30 bg-white">
        <div className="border-b border-[#e5e5e5]">
          <div className="max-w-[1088px] mx-auto flex items-center justify-between px-5 h-14">
            <button
              onClick={() => {
                if (userStatus === 'guest' || userStatus === 'non-member') {
                  window.location.href = '/login?next=%2Fclub%2Fhome'
                } else if (
                  typeof document !== 'undefined' &&
                  document.referrer &&
                  document.referrer.startsWith(window.location.origin)
                ) {
                  window.history.back()
                } else {
                  window.location.href = '/club/home'
                }
              }}
              className="text-[#555] hover:text-[#111] transition-colors"
              aria-label="뒤로 가기"
            >
              <span className="text-2xl leading-none">←</span>
            </button>
            <span className="text-base font-bold text-[#111] truncate max-w-[180px]">{club.name}</span>
            <div className="flex items-center gap-2">
              {/* 알림 벨 — 공지 이동 + 푸시 구독 상태 표시 */}
              <button
                onClick={() => {
                  if (userStatus === 'member' && pushState === 'unsubscribed') {
                    subscribePush().then(() => showToast('알림을 허용했어요 🔔'))
                  } else if (userStatus === 'member' && pushState === 'subscribed') {
                    // 구독 상태에서는 공지 탭으로 이동, 길게 누르면 취소 (별도 설정 탭에서 처리)
                    goToNotices()
                  } else {
                    goToNotices()
                  }
                }}
                className={`relative w-9 h-9 flex items-center justify-center transition-colors ${
                  pushState === 'subscribed' ? 'text-[#111]' : 'text-[#555] hover:text-[#111]'
                }`}
                aria-label="공지/알림"
                title={
                  pushState === 'subscribed'
                    ? '알림 켜짐 (탭하면 공지 이동)'
                    : pushState === 'unsubscribed'
                    ? '탭하면 알림 켜기'
                    : '알림'
                }
              >
                <Bell size={20} />
                {/* 읽지 않은 공지 뱃지 */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-extrabold rounded-full px-0.5 leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {/* 푸시 구독 상태 표시 (뱃지 없을 때만) */}
                {unreadCount === 0 && pushState === 'subscribed' && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#beff00] rounded-full border border-white" />
                )}
              </button>
              {/* 즐겨찾기 */}
              <button
                onClick={toggleFav}
                className="text-xl transition-transform active:scale-90 select-none"
                aria-label={isFav ? '찜 취소' : '찜하기'}
              >
                {isFav ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        </div>

        {/* 탭바 — 스크롤 가능 */}
        <div className="border-b border-[#e5e5e5] overflow-x-auto scrollbar-hide">
          <div className="max-w-[1088px] mx-auto flex min-w-max">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-none px-4 py-3.5 text-sm font-bold transition-colors relative whitespace-nowrap ${
                  activeTab === tab ? 'text-[#111]' : 'text-[#bbb]'
                }`}
              >
                {tab}
                {/* 공지 탭 — 읽지 않은 수 뱃지 */}
                {tab === '공지' && unreadCount > 0 && (
                  <span className="absolute top-2 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#111] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 썸네일 히어로 ── */}
      {activeTab !== '게임보드' && activeTab !== '운영' && activeTab !== '설정' && (
        <div
          className="w-full h-[200px] flex items-center justify-center relative"
          style={{ background: club.thumbnailColor }}
        >
          <span className="text-8xl select-none">🏸</span>
          {isNew && (
            <span className="absolute top-4 right-4 text-xs font-extrabold px-2.5 py-1 bg-[#111] text-[#beff00] rounded-lg tracking-wide">
              NEW
            </span>
          )}
        </div>
      )}

      {/* ── 메타 스트립 ── */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-5 py-3 flex items-center gap-2 flex-wrap text-sm text-[#666]">
          {club.location && <span>{club.location}</span>}
          {club.location && <span className="text-[#ddd]">·</span>}
          {club.activityPlace && <span>{club.activityPlace}</span>}
          {club.activityPlace && <span className="text-[#ddd]">·</span>}
          <span className="bg-[#f0f0f0] text-[#555] font-semibold px-2 py-0.5 rounded-md text-xs">
            {club.category || '동호회'}
          </span>
          <span className="text-[#ddd]">·</span>
          <span>멤버 {club.memberCount}명</span>
        </div>
      </div>

      {/* ── 모임명 (게임보드 탭일 때 우측에 입장 버튼) ── */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-5 pt-4 pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-[#111] mb-1 truncate">{club.name}</h1>
              <p className="text-sm text-[#888]">운영자 · {club.leaderName}</p>
            </div>
            {activeTab === '게임보드' && (userStatus === 'member' || userStatus === 'demo') && (
              <Link
                href={`/club/${clubId}/gameboard`}
                className="shrink-0 flex items-center gap-1.5 bg-[#0a0a0a] text-[#beff00] text-sm font-bold px-4 py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition-all whitespace-nowrap mt-0.5"
              >
                🎮 게임보드 만들기
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div className="max-w-[1088px] mx-auto px-5 py-5">
        {activeTab === '홈' && (
          <HomeTab
            club={club}
            members={members}
            rankings={rankings}
            regularSessions={regularSessions}
            onGoToSessions={goToSessions}
          />
        )}
        {activeTab === '공지' && (
          <NoticesTab
            clubId={clubId}
            userStatus={userStatus}
            isManager={isManager}
            myMemberId={myMemberId}
            onUnreadCleared={handleUnreadCleared}
          />
        )}
        {activeTab === '정기모임' && (
          <RegularSessionTab
            regularSessions={regularSessions}
            members={members}
            userStatus={userStatus}
            clubId={clubId}
            onShowToast={showToast}
            myMemberId={myMemberId}
            isManager={isManager}
          />
        )}
        {activeTab === '게임보드' && (
          <GameBoardTab userStatus={userStatus} clubId={clubId} gameSessions={gameSessions} />
        )}
        {activeTab === '운영' && (
          <ManageTab userStatus={userStatus} clubId={clubId} />
        )}
        {activeTab === '설정' && (
          <SettingsTab club={club} userStatus={userStatus} clubId={clubId} isOwner={isOwner} isManager={isManager} />
        )}
      </div>

      {/* ── 토스트 ── */}
      <Toast message={toast} />

      {/* ── 데모 체험 바 ── */}
      {userStatus === 'demo' && isAuthenticated && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#e5e5e5] shadow-lg">
          <div className="max-w-[1088px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">🎮</span>
              <span className="text-sm font-semibold text-[#555] truncate">데모 체험 중입니다</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.open('https://forms.gle/demo', '_blank')}
                className="text-xs font-semibold text-[#555] border border-[#e5e5e5] px-3 py-2 rounded-xl hover:bg-[#f8f8f8] transition-colors whitespace-nowrap"
              >
                설문 참여하기
              </button>
              <button
                onClick={async () => {
                  const url = window.location.href
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: '버디민턴 데모', url })
                    } else {
                      await navigator.clipboard.writeText(url)
                    }
                  } catch { /* ignore */ }
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-[#111] bg-[#beff00] px-3 py-2 rounded-xl hover:brightness-95 transition-all whitespace-nowrap"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                공유하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
