export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: '총무 노하우' | '인사이트' | '업데이트' | '사례 공유'
  date: string
  author: string
  coverGradient: string
  /** 본문 컴포넌트가 작성되어 있는지 (기본 false → ComingSoon) */
  hasContent?: boolean
}

/* placeholder 글 (실제 콘텐츠 작성 전) */
export const POSTS: BlogPost[] = [
  {
    slug: 'beyond-tournament-tools',
    title: '배드민턴 클럽 운영, 대회용 도구로는 부족했다',
    excerpt:
      '배드민턴 동호회 운영자라면 한 번쯤 본 대회 운영 도구. 큰 대회는 자동으로 굴러가지만, 매주 일상 운영은 다른 이야기였습니다.',
    category: '인사이트',
    date: '2026-04-29',
    author: '버디민턴',
    coverGradient: 'from-emerald-200 via-amber-100 to-emerald-50',
    hasContent: true,
  },
  {
    slug: 'admin-guide-fees',
    title: '총무가 꼭 알아야 할 회비 정산 5가지',
    excerpt:
      '엑셀 지옥에서 탈출하는 첫 걸음. 정산 마감일·미납자 독촉·환불·이월·세금계산서 처리까지 한번에 정리합니다.',
    category: '총무 노하우',
    date: '2026.04.20',
    author: '버디민턴 팀',
    coverGradient: 'from-[#0a0a0a] via-[#1a1a1a] to-[#DBE64C]/20',
  },
  {
    slug: 'fair-team-matching',
    title: '공정한 팀 배정, 어떻게 만들까?',
    excerpt:
      '실력 기반·랜덤·중복 방지·직접 배정 — 4가지 방식의 장단점과 선택 기준. 30명 동호회 데이터 기반 분석.',
    category: '인사이트',
    date: '2026.04.15',
    author: '버디민턴 팀',
    coverGradient: 'from-[#00804C] via-[#005A35] to-[#0a0a0a]',
  },
  {
    slug: 'kakao-vs-app',
    title: '카톡 단체방을 떠나야 하는 이유',
    excerpt:
      '30명 넘으면 무조건 무너지는 카톡 운영. 무엇이 문제이고, 어떤 도구가 대안인지 솔직하게.',
    category: '인사이트',
    date: '2026.04.10',
    author: '버디민턴 팀',
    coverGradient: 'from-[#DBE64C] via-[#BAC633] to-[#0a0a0a]',
  },
  {
    slug: 'newbie-onboarding',
    title: '신입 회원 온보딩 체크리스트',
    excerpt:
      '첫 모임 첫인상이 모든 것. 환영 메시지·실력 진단·파트너 매칭·다음 모임 안내 — 신입 적응률 2배 노하우.',
    category: '총무 노하우',
    date: '2026.04.05',
    author: '버디민턴 팀',
    coverGradient: 'from-[#001F3F] via-[#1E488F] to-[#0a0a0a]',
  },
  {
    slug: 'club-200-case',
    title: '200명 클럽 운영 사례 — 김민준 클럽장 인터뷰',
    excerpt:
      '대형 클럽이 어떻게 카오스 없이 굴러가는지. 운영진 3명이 매주 200명을 관리하는 시스템 공개.',
    category: '사례 공유',
    date: '2026.03.28',
    author: '버디민턴 팀',
    coverGradient: 'from-[#1E488F] via-[#001F3F] to-[#0a0a0a]',
  },
  {
    slug: 'v2-release',
    title: 'v2.0 출시 — 카톡 단체방을 대체하는 방법',
    excerpt:
      '게임보드·자동 정산·실시간 랭킹까지. 6개월간 250개 동호회의 피드백을 담은 v2.0 핵심 변화.',
    category: '업데이트',
    date: '2026.03.20',
    author: '버디민턴 팀',
    coverGradient: 'from-[#ee433f] via-[#c0302d] to-[#0a0a0a]',
  },
]

/** 최신 N개 반환 (배열이 이미 날짜 내림차순이라고 가정) */
export function getLatestPosts(n: number = 3): BlogPost[] {
  return POSTS.slice(0, n)
}

/** slug로 포스트 단건 조회 */
export function getPost(slug: string): BlogPost | null {
  return POSTS.find((p) => p.slug === slug) ?? null
}
