'use client'

const SWATCHES = [
  { value: '#DBE64C', label: 'lime' },
  { value: '#00804C', label: 'court' },
  { value: '#1E488F', label: 'team-a' },
  { value: '#ee433f', label: 'team-b' },
  { value: '#ee433f', label: 'streak' },
  { value: '#001F3F', label: 'elite' },
  { value: '#e5e5e5', label: 'neutral' },
] as const

export type SwatchColor = (typeof SWATCHES)[number]['value']

interface ColorSwatchPickerProps {
  value: SwatchColor
  onChange: (color: SwatchColor) => void
  /** hidden input name forwarded to FormData */
  inputName?: string
}

export function ColorSwatchPicker({
  value,
  onChange,
  inputName = 'thumbnail_color',
}: ColorSwatchPickerProps) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-[#666] mb-2 block">썸네일 색상</label>
      <div className="flex items-center gap-2 flex-wrap">
        {SWATCHES.map((s) => (
          <button
            key={s.value}
            type="button"
            aria-label={s.label}
            onClick={() => onChange(s.value)}
            style={{ backgroundColor: s.value }}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              value === s.value
                ? 'border-[#0a0a0a] scale-110 shadow-sm'
                : 'border-transparent hover:border-[#aaa] hover:scale-105'
            }`}
          />
        ))}
      </div>
      <input type="hidden" name={inputName} value={value} />
    </div>
  )
}
