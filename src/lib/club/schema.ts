import { z } from 'zod'
import {
  CLUB_NAME_MAX,
  CLUB_DESCRIPTION_MAX,
  CUSTOM_URL_REGEX,
  REGIONS,
  CLUB_TAGS,
  COVER_PRESET_KEYS,
  MAX_TAGS,
} from './constants'

/**
 * 클럽 생성 입력 스키마 (PRD §3.2).
 * Server action 진입 시 검증, 클라이언트 폼도 동일 스키마 재사용 가능.
 */
export const clubCreateSchema = z.object({
  // Step 1. 브랜딩
  coverPreset: z.enum(COVER_PRESET_KEYS as [string, ...string[]]),
  logoPreset: z.enum(COVER_PRESET_KEYS as [string, ...string[]]),
  name: z
    .string()
    .trim()
    .min(1, '모임 이름을 입력해 주세요')
    .max(CLUB_NAME_MAX, `모임 이름은 최대 ${CLUB_NAME_MAX}자입니다`),
  description: z
    .string()
    .trim()
    .max(CLUB_DESCRIPTION_MAX, `한 줄 소개는 최대 ${CLUB_DESCRIPTION_MAX}자입니다`)
    .optional()
    .or(z.literal('')),
  customUrlId: z
    .string()
    .trim()
    .regex(
      CUSTOM_URL_REGEX,
      'URL ID 는 영문 소문자/숫자/하이픈만 사용 가능 (3~30자)'
    ),

  // Step 2. 정보
  region: z.enum(REGIONS as readonly string[] as [string, ...string[]]),
  regionDetail: z
    .string()
    .trim()
    .max(40, '시/군/구는 최대 40자입니다')
    .optional()
    .or(z.literal('')),
  gym: z
    .string()
    .trim()
    .max(60, '체육관 이름은 최대 60자입니다')
    .optional()
    .or(z.literal('')),

  // Step 3. 태그
  tags: z
    .array(z.enum(CLUB_TAGS as readonly string[] as [string, ...string[]]))
    .max(MAX_TAGS, `태그는 최대 ${MAX_TAGS}개까지 선택할 수 있습니다`)
    .default([]),
})

export type ClubCreateInput = z.infer<typeof clubCreateSchema>
