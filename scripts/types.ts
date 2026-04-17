import { z } from 'zod'

// Racket enum values — src/types/racket.ts 와 100% 일치해야 함
export const BRAND_VALUES = [
  'YONEX', 'VICTOR', 'LI-NING', 'MIZUNO', 'KAWASAKI', 'FLEET', 'RSL',
  'APEX', 'MAXBOLT', 'PULSE', 'TRICORE', 'RIDER', 'APACS', 'REDSON',
  'JOOBONG', 'TRION', 'TECHNIST',
] as const

export const LEVEL_VALUES = ['왕초보', '초심자', 'D조', 'C조'] as const
export const PLAY_TYPE_VALUES = ['공격형', '수비형', '올라운드'] as const
export const BALANCE_VALUES = ['head-heavy', 'even', 'head-light'] as const
export const FLEX_VALUES = ['stiff', 'medium', 'flexible'] as const
export const FRAME_BODY_VALUES = ['wide', 'slim', 'medium'] as const
export const HEAD_SHAPE_VALUES = ['isometric', 'oval'] as const
export const STATUS_VALUES = ['active', 'discontinued', 'limited'] as const
export const WEIGHT_VALUES = ['6U', '5U', '4U', '3U', '2U'] as const
export const PRICE_RANGE_VALUES = ['~5만원', '5~10만원', '10~15만원', '15만원+'] as const

const reviewLinkSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
})

const stat = z.number().int().min(0).max(100)

// 프론트매터 스키마 (id, created_at, updated_at 는 DB 관리이므로 optional)
export const RacketFrontmatterSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slug must be kebab-case'),
  name: z.string().min(1),
  brand: z.enum(BRAND_VALUES),
  status: z.enum(STATUS_VALUES),

  image_url: z.string().url().nullable().optional(),
  image_urls: z.array(z.string().url()).nullable().optional(),

  price_min: z.number().int().nonnegative().nullable().optional(),
  price_max: z.number().int().nonnegative().nullable().optional(),
  price_range: z.enum(PRICE_RANGE_VALUES).nullable().optional(),

  weight: z.enum(WEIGHT_VALUES).nullable().optional(),
  balance: z.enum(BALANCE_VALUES).nullable().optional(),
  flex: z.enum(FLEX_VALUES).nullable().optional(),
  max_tension: z.number().nullable().optional(),
  frame_body: z.enum(FRAME_BODY_VALUES).nullable().optional(),
  head_shape: z.enum(HEAD_SHAPE_VALUES).nullable().optional(),

  level: z.array(z.enum(LEVEL_VALUES)).default([]),
  type: z.array(z.enum(PLAY_TYPE_VALUES)).default([]),

  stat_power: stat,
  stat_control: stat,
  stat_speed: stat,
  stat_durability: stat,
  stat_repulsion: stat,
  stat_maneuver: stat,

  description: z.string().nullable().optional(),
  editor_pick: z.boolean().default(false),
  is_popular: z.boolean().default(false),

  recommended_for: z.string().nullable().optional(),
  pros: z.array(z.string()).nullable().optional(),
  cons: z.array(z.string()).nullable().optional(),
  editor_comment: z.string().nullable().optional(),
  review_summary: z.string().nullable().optional(),
  review_links: z.array(reviewLinkSchema).nullable().optional(),
})

export type RacketFrontmatter = z.infer<typeof RacketFrontmatterSchema>
