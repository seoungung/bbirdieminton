/**
 * 표준 input/textarea 클래스 — 모든 폼에서 일관되게 사용.
 *
 * 디자인 토큰:
 *   - 테두리: #ebebeb (옅은 회색)
 *   - 모서리: rounded-xl (12px)
 *   - 패딩: px-4 py-2.5
 *   - 배경: #fafafa (살짝 음영) → focus 시 흰색
 *   - placeholder: #bbb (흐림)
 *   - focus border: #0a0a0a (진검정)
 *   - transition-colors
 *
 * 사용 예:
 *   import { inputCls, textareaCls } from '@/lib/forms/inputClassName'
 *   <input className={inputCls} ... />
 *   <textarea className={textareaCls} ... />
 *
 * 부가 클래스 추가 시:
 *   <input className={`${inputCls} text-center`} ... />
 */
export const inputCls =
  'w-full border border-[#ebebeb] rounded-xl px-4 py-2.5 text-sm text-[#111] ' +
  'placeholder:text-[#bbb] bg-[#fafafa] focus:outline-none focus:border-[#0a0a0a] ' +
  'focus:bg-white transition-colors'

/**
 * Textarea 전용 — input 스타일 + resize-none + leading-relaxed.
 */
export const textareaCls = `${inputCls} resize-none leading-relaxed`
