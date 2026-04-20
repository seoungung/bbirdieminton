/**
 * 급수(Grade) 시스템
 *
 * 한국 배드민턴 동호회의 일반적인 급수 체계(자강~왕초보)를 7단계로 매핑.
 * skill_score 는 0~100 범위를 기준으로 합니다.
 */

export type Grade = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S'

/**
 * skill_score → 급수 변환
 * - S (90+)   : 자강조 / 전문가 수준
 * - A (80-89) : A조
 * - B (65-79) : B조
 * - C (50-64) : C조
 * - D (35-49) : D조
 * - E (20-34) : 초심
 * - F (<20)   : 왕초보
 */
export function scoreToGrade(score: number): Grade {
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 65) return 'B'
  if (score >= 50) return 'C'
  if (score >= 35) return 'D'
  if (score >= 20) return 'E'
  return 'F'
}

export const GRADE_LABEL: Record<Grade, string> = {
  S: '자강조',
  A: 'A조',
  B: 'B조',
  C: 'C조',
  D: 'D조',
  E: '초심',
  F: '왕초보',
}

/** 급수별 Tailwind 색상 클래스 (밝은 배경용) */
export const GRADE_COLOR: Record<Grade, { bg: string; text: string; border: string }> = {
  S: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  A: { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300'    },
  B: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  C: { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-300'  },
  D: { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300'  },
  E: { bg: 'bg-sky-100',    text: 'text-sky-700',    border: 'border-sky-300'    },
  F: { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-300'   },
}

/** 클럽 멤버 목록에서 skill_score 기준 순위 맵 생성 (1-based) */
export function buildRankMap<T extends { id: string; skill_score: number }>(
  members: T[]
): Map<string, number> {
  const sorted = [...members].sort((a, b) => b.skill_score - a.skill_score)
  const map = new Map<string, number>()
  sorted.forEach((m, i) => map.set(m.id, i + 1))
  return map
}
