import { Gamepad2, Wallet, Trophy, Megaphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Features data — 이전 페이지(commit 5566539)의 FEATURES 배열 복원.
 * 카피·bullet 한 글자도 변경 금지.
 */
export type FeatureTone = 'lime' | 'court' | 'amber' | 'neutral'

export type Feature = {
  Icon: LucideIcon
  eyebrow: string
  title: string // \n 으로 줄바꿈 (whitespace-pre-line)
  desc: string
  bullets: string[]
  imageAlt: string
  tone: FeatureTone
}

export const FEATURES: Feature[] = [
  {
    Icon: Gamepad2,
    eyebrow: '현장 게임보드',
    title: '현장에서 바로,\n자동 팀배정',
    desc: '실력 기반으로 균등하게 팀을 자동 매칭합니다. 총무가 머리 쥐어뜯을 일 없어요. 경기 결과도 원탭으로 기록되고, 랭킹에 즉시 반영됩니다.',
    bullets: [
      '실력 등급 기반 자동 팀 매칭',
      '출석·대기열 실시간 관리',
      '경기 결과 원탭 입력',
    ],
    imageAlt: '게임보드 화면',
    tone: 'lime',
  },
  {
    Icon: Wallet,
    eyebrow: '회비 정산',
    title: '매월 1분 만에\n정산 완료',
    desc: '출석 횟수·셔틀콕비·코트비·레슨비까지 자동 계산. 납부 현황은 한눈에 보이고, 독촉 알림은 자동 발송. 카톡에서 "OO님 회비 아직 안 내셨어요" 할 일 없어요.',
    bullets: [
      '출석 연동 자동 계산',
      '납부 현황 실시간 확인',
      '독촉 알림 자동화',
    ],
    imageAlt: '회비 정산 화면',
    tone: 'court',
  },
  {
    Icon: Trophy,
    eyebrow: '랭킹 & 통계',
    title: '내 실력이\n숫자로 보일 때',
    desc: '전적·승률·포인트가 자동 누적됩니다. 시즌별 순위와 개인 성장 곡선까지. 회원들은 동기부여, 운영진은 공정한 팀 배정 근거를 얻습니다.',
    bullets: [
      '전적·승률·포인트 자동 집계',
      '시즌별 랭킹 시스템',
      '개인 성장 곡선',
    ],
    imageAlt: '랭킹 화면',
    tone: 'amber',
  },
  {
    Icon: Megaphone,
    eyebrow: '공지 & 일정',
    title: '카톡에 묻히지 않는\n중요한 소식',
    desc: '공지·이벤트·정기모임 일정을 한 곳에서. 읽지 않은 회원은 자동 알림. 카톡 공유 버튼으로 기존 단체방에도 동시 노출됩니다.',
    bullets: [
      '공지·이벤트·일정 통합',
      '미확인 회원 자동 알림',
      '카톡 단체방 공유',
    ],
    imageAlt: '공지사항 화면',
    tone: 'neutral',
  },
]

export const TONE_GRADIENT: Record<FeatureTone, string> = {
  lime: 'linear-gradient(135deg, rgba(190,255,0,0.32) 0%, #ecfdf5 55%, #fafafa 100%)',
  court: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 55%, #fafafa 100%)',
  amber: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 55%, #fafafa 100%)',
  neutral:
    'linear-gradient(135deg, #f0f0f0 0%, #f8f8f8 50%, #fafafa 100%)',
}

export const TONE_EYEBROW: Record<FeatureTone, string> = {
  lime: 'text-[#0a0a0a]',
  court: 'text-[#059669]',
  amber: 'text-[#d97706]',
  neutral: 'text-[#0a0a0a]',
}
