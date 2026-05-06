/**
 * 클럽 프로필 태그 — Phase A
 *
 * 자유 입력 X. 사전 정의된 칩에서 선택만 가능.
 * 그룹은 UI 의 multi-select picker 에서 사용한다.
 */

export const CLUB_TAGS = {
  // 시간대
  '#아침':       '아침 운동 (6~10시)',
  '#점심':       '점심 시간',
  '#저녁':       '평일 저녁 (18~22시)',
  '#주말':       '주말 모임',

  // 대상
  '#직장인':     '직장인 위주',
  '#학생':       '학생 위주',
  '#주부':       '주부 모임',
  '#시니어':     '50대+ 시니어',

  // 분위기
  '#초심환영':   '초심자 환영',
  '#자강조':     '자강조 위주',
  '#여성환영':   '여성 회원 환영',
  '#남녀혼성':   '남녀 혼성',
  '#친목중심':   '친목 중심',
  '#실력향상':   '실력 향상 중심',

  // 운영
  '#정기모임':   '정기 모임 운영',
  '#이벤트':     '대회/이벤트 다수',
  '#소규모':     '소규모 (10명 이하)',
  '#대규모':     '대규모 (30명 이상)',
} as const

export type ClubTag = keyof typeof CLUB_TAGS

export const ALL_CLUB_TAGS = Object.keys(CLUB_TAGS) as ClubTag[]

export const TAG_GROUPS: Array<{ label: string; tags: ClubTag[] }> = [
  {
    label: '시간대',
    tags: ['#아침', '#점심', '#저녁', '#주말'],
  },
  {
    label: '대상',
    tags: ['#직장인', '#학생', '#주부', '#시니어'],
  },
  {
    label: '분위기',
    tags: ['#초심환영', '#자강조', '#여성환영', '#남녀혼성', '#친목중심', '#실력향상'],
  },
  {
    label: '운영',
    tags: ['#정기모임', '#이벤트', '#소규모', '#대규모'],
  },
]

/** 입력값에서 사전 정의된 태그만 통과 (저장 직전 sanitize). */
export function sanitizeClubTags(raw: unknown): ClubTag[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: ClubTag[] = []
  for (const t of raw) {
    if (typeof t !== 'string') continue
    if (!(t in CLUB_TAGS)) continue
    if (seen.has(t)) continue
    seen.add(t)
    out.push(t as ClubTag)
  }
  return out
}

/** 라벨 조회 — 예: '#아침' → '아침 운동 (6~10시)'. 미등록 태그는 자기 자신 반환. */
export function getTagLabel(tag: string): string {
  if (tag in CLUB_TAGS) return CLUB_TAGS[tag as ClubTag]
  return tag
}
