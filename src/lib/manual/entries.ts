export type ManualCategory =
  | '시작하기'
  | '게임보드'
  | '정산'
  | '회원 관리'
  | '공지·일정'
  | '고급 설정'

export interface ManualEntry {
  slug: string
  title: string
  excerpt: string
  category: ManualCategory
  date: string
  author: string
  coverGradient: string
  /** 본문이 작성되어 있는지 */
  hasContent: boolean
}

export const MANUAL_CATEGORIES = [
  '전체',
  '시작하기',
  '게임보드',
  '정산',
  '회원 관리',
  '공지·일정',
  '고급 설정',
] as const

export type ManualCategoryFilter = (typeof MANUAL_CATEGORIES)[number]

export const MANUAL_ENTRIES: ManualEntry[] = [
  {
    slug: 'create-club',
    title: '5분 만에 첫 모임 만들기',
    excerpt:
      '카카오 가입 → 클럽 생성 → 회원 초대까지. 신규 총무를 위한 가장 빠른 시작 가이드.',
    category: '시작하기',
    date: '2026.04.20',
    author: '버디민턴 팀',
    coverGradient: 'from-[#10b981] via-[#059669] to-[#0a0a0a]',
    hasContent: true,
  },
  {
    slug: 'invite-members',
    title: '초대코드로 회원 초대하기',
    excerpt:
      '클럽 설정에서 초대코드 발급 → 카톡으로 공유. 신입 회원이 가입하기까지의 전체 흐름.',
    category: '시작하기',
    date: '2026.04.18',
    author: '버디민턴 팀',
    coverGradient: 'from-[#beff00] via-[#a8e600] to-[#0a0a0a]',
    hasContent: true,
  },
  {
    slug: 'gameboard-basics',
    title: '게임보드 기본 사용법',
    excerpt:
      '출석 체크 → 자동 팀 배정 → 경기 진행 → 결과 입력. 현장에서 바로 쓰는 핵심 플로우.',
    category: '게임보드',
    date: '2026.04.15',
    author: '버디민턴 팀',
    coverGradient: 'from-[#0a0a0a] via-[#1a1a1a] to-[#beff00]/20',
    hasContent: false,
  },
  {
    slug: 'team-matching-modes',
    title: '4가지 팀 배정 모드 완벽 가이드',
    excerpt:
      '랜덤·실력 균형·중복 방지·직접 배정. 각 모드의 특징과 어떤 상황에 어떤 모드를 쓸지.',
    category: '게임보드',
    date: '2026.04.13',
    author: '버디민턴 팀',
    coverGradient: 'from-[#2563eb] via-[#1d4ed8] to-[#0a0a0a]',
    hasContent: false,
  },
  {
    slug: 'fee-settlement',
    title: '월 회비 자동 정산 설정',
    excerpt:
      '회비 금액·주기·납부 계좌 설정. 미납자에게 자동 알림 보내는 방법.',
    category: '정산',
    date: '2026.04.10',
    author: '버디민턴 팀',
    coverGradient: 'from-[#f59e0b] via-[#d97706] to-[#0a0a0a]',
    hasContent: false,
  },
  {
    slug: 'shuttlecock-settlement',
    title: '셔틀콕비 세션별 정산',
    excerpt:
      '게임 종료 시 자동으로 셔틀콕비 계산. 카톡 공유 메시지로 미납자 빠르게 정리.',
    category: '정산',
    date: '2026.04.08',
    author: '버디민턴 팀',
    coverGradient: 'from-[#10b981] via-[#047857] to-[#0a0a0a]',
    hasContent: false,
  },
  {
    slug: 'excel-import',
    title: '기존 엑셀 회원 일괄 임포트',
    excerpt:
      '엑셀 템플릿 다운로드 → 회원 정보 채우기 → 업로드. 카카오 가입 안 한 placeholder 회원도 사전 등록.',
    category: '회원 관리',
    date: '2026.04.05',
    author: '버디민턴 팀',
    coverGradient: 'from-[#8b5cf6] via-[#7c3aed] to-[#0a0a0a]',
    hasContent: false,
  },
  {
    slug: 'roles-permissions',
    title: '권한 시스템: 모임장·총무·회원',
    excerpt:
      '각 역할이 무엇을 할 수 있는지. 모임장 이관·총무 승격 시나리오.',
    category: '회원 관리',
    date: '2026.04.02',
    author: '버디민턴 팀',
    coverGradient: 'from-[#dc2626] via-[#991b1b] to-[#0a0a0a]',
    hasContent: false,
  },
  {
    slug: 'notice-share',
    title: '공지사항 작성과 카톡 공유',
    excerpt:
      '이미지 첨부·고정 공지·카톡 단체방으로 자동 공유까지. 공지 도달률 높이는 노하우.',
    category: '공지·일정',
    date: '2026.03.30',
    author: '버디민턴 팀',
    coverGradient: 'from-[#fb923c] via-[#ea580c] to-[#0a0a0a]',
    hasContent: false,
  },
  {
    slug: 'regular-events',
    title: '정기모임 일정·참석 투표',
    excerpt:
      '주간 정기모임·이벤트·친선전 등록. 참석 투표로 실제 인원 미리 파악.',
    category: '공지·일정',
    date: '2026.03.28',
    author: '버디민턴 팀',
    coverGradient: 'from-[#06b6d4] via-[#0891b2] to-[#0a0a0a]',
    hasContent: false,
  },
  {
    slug: 'web-push',
    title: '웹 푸시 알림 활성화',
    excerpt:
      '브라우저에 푸시 권한 부여하기. 어떤 알림이 오고 어떻게 끄는지.',
    category: '고급 설정',
    date: '2026.03.25',
    author: '버디민턴 팀',
    coverGradient: 'from-[#a855f7] via-[#7e22ce] to-[#0a0a0a]',
    hasContent: false,
  },
  {
    slug: 'multi-club',
    title: '여러 모임 동시 운영 (Team 플랜)',
    excerpt:
      '한 계정으로 최대 5개 모임 관리. 클럽 간 전환·통합 통계.',
    category: '고급 설정',
    date: '2026.03.20',
    author: '버디민턴 팀',
    coverGradient: 'from-[#14b8a6] via-[#0d9488] to-[#0a0a0a]',
    hasContent: false,
  },
]

export function getManualEntry(slug: string): ManualEntry | undefined {
  return MANUAL_ENTRIES.find((entry) => entry.slug === slug)
}
