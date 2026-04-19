'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { updateClubProfileAction } from '@/app/club/[clubId]/settings/actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { ClubViewData, UserStatus } from './types'
import { THUMB_COLORS } from './types'

// ── AccordionSection ─────────────────────────────────────

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f8f8f8] transition-colors"
      >
        <span className="text-sm font-bold text-[#111]">{title}</span>
        <ChevronDown
          size={16}
          className={`text-[#bbb] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-[#f0f0f0] px-5 py-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ── SettingsTab ──────────────────────────────────────────

interface Props {
  club: ClubViewData
  userStatus: UserStatus
  clubId: string
  isOwner: boolean
  isManager: boolean
}

const NOTIF_OPTIONS: { value: 'push' | 'silent' | 'off'; label: string; desc: string }[] = [
  { value: 'push', label: '푸시 알림', desc: '새 소식을 알림으로 받아요' },
  { value: 'silent', label: '무음 알림 (팝업)', desc: '앱 내 팝업으로만 표시돼요' },
  { value: 'off', label: '알림 없음', desc: '어떠한 알림도 받지 않아요' },
]

type AssignMode = 'random' | 'skill_balance' | 'game_count' | 'smart'
const ASSIGN_OPTIONS: { value: AssignMode; label: string; desc: string }[] = [
  { value: 'random',        label: '랜덤',        desc: '완전 무작위로 팀을 구성해요' },
  { value: 'skill_balance', label: '실력 균형',   desc: '실력 점수 기반 스네이크 분배' },
  { value: 'game_count',    label: '게임수 균등', desc: '게임 적게 한 플레이어 우선 배정' },
  { value: 'smart',         label: '🧠 스마트',   desc: '게임수 균등 + 파트너 중복 회피' },
]

export function SettingsTab({ club, userStatus, clubId, isOwner, isManager }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [editName, setEditName] = useState(club.name)
  const [editDesc, setEditDesc] = useState(club.description ?? '')
  const [editLocation, setEditLocation] = useState(club.location ?? '')
  const [editPlace, setEditPlace] = useState(club.activityPlace ?? '')
  const [editColor, setEditColor] = useState(club.thumbnailColor)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)

  const [notifMode, setNotifMode] = useState<'push' | 'silent' | 'off'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(`notif-${clubId}`) as 'push' | 'silent' | 'off') || 'push'
    }
    return 'push'
  })

  const [defaultAssignMode, setDefaultAssignMode] = useState<AssignMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(`gameboard-assign-${clubId}`) as AssignMode) || 'random'
    }
    return 'random'
  })

  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)

  const [dialog, setDialog] = useState<{
    title: string
    description: string
    confirmText?: string
    variant?: 'default' | 'destructive'
    onConfirm: () => void
  } | null>(null)

  const handleNotif = (v: 'push' | 'silent' | 'off') => {
    setNotifMode(v)
    if (typeof window !== 'undefined') localStorage.setItem(`notif-${clubId}`, v)
  }

  const handleDefaultAssignMode = (v: AssignMode) => {
    setDefaultAssignMode(v)
    if (typeof window !== 'undefined') localStorage.setItem(`gameboard-assign-${clubId}`, v)
  }

  const handleSaveProfile = () => {
    if (!editName.trim()) { setSaveError('모임 이름을 입력해주세요'); return }
    setSaveError(null)
    startTransition(async () => {
      const result = await updateClubProfileAction(clubId, {
        name: editName,
        description: editDesc,
        location: editLocation,
        activity_place: editPlace,
        thumbnail_color: editColor,
      })
      if (result.error) { setSaveError(result.error); return }
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 2000)
      router.refresh()
    })
  }

  const handleDeleteClub = () => {
    setDialog({
      title: '모임 삭제',
      description: `'${club.name}' 모임을 삭제하시겠어요?\n\n모든 멤버, 경기 기록, 랭킹이 영구 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`,
      confirmText: '삭제',
      variant: 'destructive',
      onConfirm: () => {
        setDialog(null)
        startTransition(async () => {
          const supabase = createClient()
          const { error } = await supabase.rpc('delete_club_cascade', { p_club_id: clubId })
          if (error) { alert('모임 삭제에 실패했습니다'); return }
          router.push('/club/home')
        })
      },
    })
  }

  const handleReport = () => {
    if (!reportReason.trim()) return
    setReportSent(true)
    setTimeout(() => { setShowReport(false); setReportSent(false); setReportReason('') }, 1800)
  }

  return (
    <div className="space-y-3">
      {/* 모임 프로필 */}
      <AccordionSection title="모임 프로필" defaultOpen={true}>
        {isManager ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-[#999] mb-2">썸네일 색상</p>
              <div className="flex gap-2 flex-wrap mb-2">
                {THUMB_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setEditColor(c)}
                    className="w-9 h-9 rounded-xl border-2 transition-all shrink-0"
                    style={{
                      background: c,
                      borderColor: editColor === c ? '#111' : 'transparent',
                      outline: editColor === c ? '2px solid #111' : 'none',
                      outlineOffset: '1px',
                    }}
                  />
                ))}
              </div>
              <div className="w-full h-12 rounded-xl flex items-center justify-center text-2xl transition-colors" style={{ background: editColor }}>
                🏸
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#999] mb-1.5 block">모임명</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} maxLength={30}
                className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#999] mb-1.5 block">소개</label>
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} maxLength={300} rows={3}
                className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] resize-none focus:outline-none focus:border-[#beff00] transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#999] mb-1.5 block">지역</label>
                <input value={editLocation} onChange={e => setEditLocation(e.target.value)} maxLength={20}
                  className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#999] mb-1.5 block">장소</label>
                <input value={editPlace} onChange={e => setEditPlace(e.target.value)} maxLength={30}
                  className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] focus:outline-none focus:border-[#beff00] transition-colors" />
              </div>
            </div>
            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
            <button onClick={handleSaveProfile} disabled={isPending}
              className="w-full py-3 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 transition-all disabled:opacity-50">
              {saveOk ? '✓ 저장됨' : isPending ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: '모임명', value: club.name },
              { label: '소개', value: club.description },
              { label: '지역', value: club.location },
              { label: '장소', value: club.activityPlace },
              { label: '멤버', value: `${club.memberCount}명` },
              { label: '운영자', value: club.leaderName },
            ]
              .filter(row => !!row.value)
              .map(row => (
                <div key={row.label} className="flex items-start justify-between gap-4">
                  <span className="text-sm text-[#999] shrink-0 w-14">{row.label}</span>
                  <span className="text-sm font-semibold text-[#111] text-right leading-relaxed">{row.value}</span>
                </div>
              ))}
          </div>
        )}
      </AccordionSection>

      {/* 게임보드 설정 */}
      <AccordionSection title="게임보드 설정">
        <div className="space-y-4">
          {/* 기본 팀 배정 방식 */}
          <div>
            <p className="text-xs font-bold text-[#999] mb-1">기본 팀 배정 방식</p>
            <p className="text-xs text-[#bbb] mb-3">게임보드 진입 시 자동으로 선택돼요</p>
            <div className="space-y-2">
              {ASSIGN_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleDefaultAssignMode(opt.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                    defaultAssignMode === opt.value
                      ? 'border-[#111] bg-[#f8f8f8]'
                      : 'border-[#e5e5e5] hover:border-[#ccc]'
                  }`}
                >
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${defaultAssignMode === opt.value ? 'text-[#111]' : 'text-[#555]'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-[#999] mt-0.5">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    defaultAssignMode === opt.value ? 'border-[#111] bg-[#111]' : 'border-[#ddd]'
                  }`}>
                    {defaultAssignMode === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* 코트 정보 */}
          <div>
            <p className="text-xs font-bold text-[#999] mb-2">코트 정보</p>
            <div className="bg-[#f8f8f8] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-[#555]">등록된 코트 수</span>
              <span className="text-sm font-bold text-[#111]">{club.court_count}면</span>
            </div>
            <p className="text-xs text-[#bbb] mt-2">코트 수는 모임 프로필에서 변경할 수 있어요</p>
          </div>
          {/* 임시 참가자 안내 */}
          <div>
            <p className="text-xs font-bold text-[#999] mb-2">임시 참가자</p>
            <div className="bg-[#f8f8f8] rounded-xl px-4 py-3">
              <p className="text-sm text-[#555]">게임 설정 화면에서 이름을 입력해</p>
              <p className="text-sm text-[#555]">클럽 외 인원도 참여시킬 수 있어요</p>
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* 알림 설정 */}
      <AccordionSection title="알림 설정">
        <div className="space-y-2">
          {NOTIF_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleNotif(opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                notifMode === opt.value ? 'border-[#111] bg-[#f8f8f8]' : 'border-[#e5e5e5] hover:border-[#ccc]'
              }`}
            >
              <div className="text-left">
                <p className={`text-sm font-semibold ${notifMode === opt.value ? 'text-[#111]' : 'text-[#555]'}`}>{opt.label}</p>
                <p className="text-xs text-[#999] mt-0.5">{opt.desc}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${notifMode === opt.value ? 'border-[#111] bg-[#111]' : 'border-[#ddd]'}`}>
                {notifMode === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* 기타 액션 */}
      <div className="space-y-2.5 pt-1">
        {userStatus === 'member' && !isOwner && (
          <Link
            href={`/club/${clubId}/settings`}
            className="w-full flex items-center justify-center gap-2 py-3.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl hover:bg-[#f8f8f8] transition-colors"
          >
            모임 나가기
          </Link>
        )}
        <button
          onClick={() => setShowReport(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl hover:bg-[#f8f8f8] transition-colors"
        >
          🚨 모임 신고하기
        </button>
        {isOwner && (
          <button
            onClick={handleDeleteClub}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 border border-red-200 text-red-500 font-semibold text-sm rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            모임 삭제하기
          </button>
        )}
      </div>

      {dialog && (
        <ConfirmDialog
          open
          title={dialog.title}
          description={dialog.description}
          confirmText={dialog.confirmText}
          variant={dialog.variant}
          onConfirm={dialog.onConfirm}
          onCancel={() => setDialog(null)}
        />
      )}

      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
            {reportSent ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-3">✅</p>
                <p className="font-bold text-[#111]">신고가 접수되었습니다</p>
                <p className="text-sm text-[#999] mt-1">검토 후 조치하겠습니다</p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-[#111] text-base mb-1">모임 신고하기</h3>
                <p className="text-sm text-[#999] mb-4">신고 사유를 간단히 적어주세요</p>
                <textarea
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="예: 허위 정보, 부적절한 콘텐츠 등"
                  className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[#beff00] transition-colors mb-4"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowReport(false)} className="flex-1 py-2.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl">취소</button>
                  <button onClick={handleReport} disabled={!reportReason.trim()} className="flex-1 py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl disabled:opacity-40">신고하기</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
