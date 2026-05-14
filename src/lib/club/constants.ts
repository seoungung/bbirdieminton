/**
 * 클럽 생성 (PRD §3.2) 도메인 상수
 *
 * - 시/도 17개 행정구역 (PRD: 시/도 → 시/군/구 드롭다운, 이번 step 은 시/도만)
 * - 성향 태그 12개 (PRD §3.2 Step 3 — 10~15개 사전 정의)
 * - 커버 컬러 프리셋 6종 (PRD: 3D 일러스트 5~6종 대용 — 디자인 시스템 v2 컬러)
 */

export const REGIONS = [
  '서울',
  '부산',
  '대구',
  '인천',
  '광주',
  '대전',
  '울산',
  '세종',
  '경기',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
] as const

export type Region = (typeof REGIONS)[number]

/**
 * 성향 태그 (PRD §3.2 Step 3 예시 6개 + 보강 6개 = 12개)
 * 커스텀 입력 X. 최대 5개 선택.
 */
export const CLUB_TAGS = [
  '#2030',
  '#4050',
  '#빡겜러',
  '#초심환영',
  '#여성위주',
  '#가족동반OK',
  '#회비없음',
  '#정모3회이상',
  '#아침형',
  '#저녁형',
  '#주말',
  '#평일',
] as const

export type ClubTag = (typeof CLUB_TAGS)[number]

export const MAX_TAGS = 5

/**
 * 커버 컬러 프리셋 — 디자인 시스템 v2 토큰 직접 활용.
 * Step E 에서 실제 일러스트 5~6종으로 대체될 자리.
 * value 는 DB cover_image_url 에 `preset:{key}` 형태로 저장.
 */
export const COVER_PRESETS = [
  { key: 'forest', label: '딥 포레스트', bgClass: 'bg-forest',    textOnDark: true  },
  { key: 'olive',  label: '올리브',       bgClass: 'bg-olive',     textOnDark: true  },
  { key: 'lime',   label: '라임',         bgClass: 'bg-lime',      textOnDark: false },
  { key: 'coral',  label: '코랄',         bgClass: 'bg-coral',     textOnDark: true  },
  { key: 'sea',    label: '시 블루',       bgClass: 'bg-sea',       textOnDark: true  },
  { key: 'orchid', label: '오키드',        bgClass: 'bg-orchid',    textOnDark: true  },
] as const

export type CoverPresetKey = (typeof COVER_PRESETS)[number]['key']

export const COVER_PRESET_KEYS = COVER_PRESETS.map((p) => p.key) as CoverPresetKey[]

/** custom_url_id : 영문 소문자/숫자/하이픈, 3~30자 (PRD §3.2) */
export const CUSTOM_URL_REGEX = /^[a-z0-9-]{3,30}$/

/** PRD §5.1 Free 플랜 누적 인원 한도 */
export const FREE_PLAN_MEMBER_LIMIT = 50

/** PRD §3.2 글자 수 제한 */
export const CLUB_NAME_MAX = 20
export const CLUB_DESCRIPTION_MAX = 40
