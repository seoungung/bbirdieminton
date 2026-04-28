import type { BlogPost } from './posts'

/** 카테고리별 배지 Tailwind 클래스 (Team A/Elite/Court/Streak 색상 매핑) */
export const CATEGORY_BADGE: Record<BlogPost['category'], string> = {
  '총무 노하우': 'bg-blue-50 text-blue-700 border-blue-100',
  '인사이트':   'bg-violet-50 text-violet-700 border-violet-100',
  '업데이트':   'bg-emerald-50 text-emerald-700 border-emerald-100',
  '사례 공유':  'bg-amber-50 text-amber-700 border-amber-100',
}

export function getCategoryBadge(category: BlogPost['category']): string {
  return CATEGORY_BADGE[category]
}
