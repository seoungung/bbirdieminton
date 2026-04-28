'use client'

const CATEGORIES = ['동호회', '클럽'] as const
export type Category = (typeof CATEGORIES)[number]

interface CategoryChipsProps {
  value: Category
  onChange: (cat: Category) => void
}

export function CategoryChips({ value, onChange }: CategoryChipsProps) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-[#666] mb-2 block">카테고리</label>
      <div className="flex gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors ${
              value === cat
                ? 'bg-[#111] text-white border-[#111]'
                : 'bg-white text-[#888] border-[#e5e5e5] hover:border-[#aaa] hover:text-[#555]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
