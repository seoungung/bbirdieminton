export type Brand = 'YONEX' | 'VICTOR' | 'LI-NING' | 'MIZUNO' | 'KAWASAKI' | 'FLEET' | 'RSL'
export type Level = '왕초보' | '초심자' | 'D조' | 'C조'
export type PlayType = '공격형' | '수비형' | '올라운드'
export type Balance = 'head-heavy' | 'even' | 'head-light'
export type Flex = 'stiff' | 'medium' | 'flexible'

export interface Racket {
  id: string
  slug: string
  name: string
  brand: Brand
  image_url: string | null
  image_urls: string[] | null
  price_min: number | null
  price_max: number | null
  price_range: string | null
  weight: string | null
  balance: Balance | null
  flex: Flex | null
  level: Level[]
  type: PlayType[]
  stat_power: number
  stat_control: number
  stat_speed: number
  stat_durability: number
  stat_repulsion: number
  stat_maneuver: number
  description: string | null
  editor_pick: boolean
  is_popular: boolean
  recommended_for: string | null
  pros: string[] | null
  cons: string[] | null
  editor_comment: string | null
  review_summary: string | null
  review_links: { title: string; url: string }[] | null
  created_at: string
  updated_at: string
}

export const BRANDS: Brand[] = ['YONEX', 'VICTOR', 'LI-NING', 'MIZUNO', 'KAWASAKI', 'FLEET', 'RSL']
export const LEVELS: Level[] = ['왕초보', '초심자', 'D조', 'C조']
export const PLAY_TYPES: PlayType[] = ['공격형', '수비형', '올라운드']
export const WEIGHTS = ['6U', '5U', '4U', '3U', '2U']
export const PRICE_RANGES = ['~5만원', '5~10만원', '10~15만원']
export const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'newest', label: '최신순' },
  { value: 'editor', label: '에디터 픽' },
] as const

export const BALANCE_KO: Record<Balance, string> = {
  'head-heavy': '헤드헤비',
  'even': '균형형',
  'head-light': '헤드라이트',
}

export const FLEX_KO: Record<Flex, string> = {
  stiff: '하드',
  medium: '미디엄',
  flexible: '소프트',
}
