'use client'

import { useState, useCallback } from 'react'
import { updateRacketField, type RacketRow } from './actions'

interface Props {
  racket: RacketRow
  onToast: (msg: string, ok: boolean) => void
}

const WEIGHT_OPTIONS = ['6U', '5U', '4U', '3U', '2U']
const BALANCE_OPTIONS = ['head-heavy', 'even', 'head-light']
const FLEX_OPTIONS = ['stiff', 'medium', 'flexible']
const STATUS_OPTIONS = ['active', 'discontinued', 'limited']

const BALANCE_KO: Record<string, string> = {
  'head-heavy': '헤드헤비',
  even: '균형형',
  'head-light': '헤드라이트',
}
const FLEX_KO: Record<string, string> = {
  stiff: '하드',
  medium: '미디엄',
  flexible: '소프트',
}
const STATUS_KO: Record<string, string> = {
  active: '판매중',
  discontinued: '단종',
  limited: '한정',
}

const LEVEL_COLOR: Record<string, string> = {
  왕초보: 'bg-blue-50 text-blue-600',
  초심자: 'bg-green-50 text-green-600',
  D조: 'bg-yellow-50 text-yellow-700',
  C조: 'bg-orange-50 text-orange-600',
}

const TYPE_COLOR: Record<string, string> = {
  공격형: 'bg-red-50 text-red-600',
  수비형: 'bg-indigo-50 text-indigo-600',
  올라운드: 'bg-purple-50 text-purple-600',
}

export default function RacketTableRow({ racket, onToast }: Props) {
  const [saving, setSaving] = useState(false)
  const [localRacket, setLocalRacket] = useState(racket)

  const save = useCallback(
    async (field: string, value: unknown) => {
      setSaving(true)
      setLocalRacket((prev) => ({ ...prev, [field]: value }))
      const result = await updateRacketField(racket.id, field, value)
      setSaving(false)
      onToast(
        result.success ? `저장됨: ${racket.name}` : `오류: ${result.error ?? '저장 실패'}`,
        result.success,
      )
      if (!result.success) {
        // rollback optimistic update
        setLocalRacket((prev) => ({ ...prev, [field]: racket[field as keyof RacketRow] }))
      }
    },
    [racket, onToast],
  )

  const selectCls =
    'bg-transparent border-none outline-none text-[#111111] text-xs cursor-pointer focus:ring-1 focus:ring-[#beff00] rounded px-1 py-0.5 -mx-1 -my-0.5 w-full'

  return (
    <tr
      className={`border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors ${saving ? 'bg-[#fffde7]' : ''}`}
    >
      {/* 브랜드 */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <span className="inline-block bg-[#f0f0f0] text-[#555] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
          {localRacket.brand}
        </span>
      </td>

      {/* 라켓명 */}
      <td className="px-3 py-2.5 text-sm font-medium text-[#111111] whitespace-nowrap min-w-[160px]">
        {localRacket.name}
      </td>

      {/* 무게 */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <select
          value={localRacket.weight ?? ''}
          onChange={(e) => save('weight', e.target.value || null)}
          className={selectCls}
        >
          <option value="">-</option>
          {WEIGHT_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </td>

      {/* 밸런스 */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <select
          value={localRacket.balance ?? ''}
          onChange={(e) => save('balance', e.target.value || null)}
          className={selectCls}
        >
          <option value="">-</option>
          {BALANCE_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {BALANCE_KO[o]}
            </option>
          ))}
        </select>
      </td>

      {/* 강성 */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <select
          value={localRacket.flex ?? ''}
          onChange={(e) => save('flex', e.target.value || null)}
          className={selectCls}
        >
          <option value="">-</option>
          {FLEX_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {FLEX_KO[o]}
            </option>
          ))}
        </select>
      </td>

      {/* 레벨 */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {(localRacket.level ?? []).map((lv) => (
            <span
              key={lv}
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${LEVEL_COLOR[lv] ?? 'bg-[#f0f0f0] text-[#555]'}`}
            >
              {lv}
            </span>
          ))}
        </div>
      </td>

      {/* 타입 */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {(localRacket.type ?? []).map((t) => (
            <span
              key={t}
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TYPE_COLOR[t] ?? 'bg-[#f0f0f0] text-[#555]'}`}
            >
              {t}
            </span>
          ))}
        </div>
      </td>

      {/* 가격대 */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <input
          type="text"
          defaultValue={localRacket.price_range ?? ''}
          onBlur={(e) => save('price_range', e.target.value || null)}
          placeholder="-"
          className="bg-transparent border-none outline-none text-xs text-[#111111] w-24 focus:bg-[#f8f8f8] focus:ring-1 focus:ring-[#beff00] rounded px-1 py-0.5"
        />
      </td>

      {/* 인기순위 */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <input
          type="number"
          defaultValue={localRacket.popular_rank ?? ''}
          onBlur={(e) => {
            const val = e.target.value === '' ? null : Number(e.target.value)
            save('popular_rank', val)
          }}
          placeholder="-"
          className="bg-transparent border-none outline-none text-xs text-[#111111] w-16 focus:bg-[#f8f8f8] focus:ring-1 focus:ring-[#beff00] rounded px-1 py-0.5"
        />
      </td>

      {/* 에디터픽 */}
      <td className="px-3 py-2.5 whitespace-nowrap text-center">
        <button
          type="button"
          onClick={() => save('editor_pick', !localRacket.editor_pick)}
          className={`w-9 h-5 rounded-full transition-colors relative ${
            localRacket.editor_pick ? 'bg-[#beff00]' : 'bg-[#e5e5e5]'
          }`}
          aria-label="에디터픽 토글"
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
              localRacket.editor_pick ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </td>

      {/* 인기여부 */}
      <td className="px-3 py-2.5 whitespace-nowrap text-center">
        <button
          type="button"
          onClick={() => save('is_popular', !localRacket.is_popular)}
          className={`w-9 h-5 rounded-full transition-colors relative ${
            localRacket.is_popular ? 'bg-[#beff00]' : 'bg-[#e5e5e5]'
          }`}
          aria-label="인기여부 토글"
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
              localRacket.is_popular ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </td>

      {/* 상태 */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <select
          value={localRacket.status ?? 'active'}
          onChange={(e) => save('status', e.target.value)}
          className={selectCls}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {STATUS_KO[o]}
            </option>
          ))}
        </select>
      </td>
    </tr>
  )
}
