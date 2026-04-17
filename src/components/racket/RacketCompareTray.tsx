'use client'

import { useCompare } from '@/context/CompareContext'
import Link from 'next/link'
import { X, ArrowLeftRight } from 'lucide-react'

export function RacketCompareTray() {
  const { items, toggle, clear } = useCompare()
  if (items.length === 0) return null

  const href =
    items.length === 2
      ? '/rackets/compare?a=' + items[0].slug + '&b=' + items[1].slug
      : null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black text-white border-t border-white/20 shadow-2xl">
      <div className="max-w-[1088px] mx-auto px-4 py-2.5 flex items-center gap-3">
        <ArrowLeftRight size={15} className="shrink-0 text-[#BEFF00]" />
        <span className="text-xs font-semibold shrink-0 hidden sm:block">라켓 비교</span>

        <div className="flex gap-2 flex-1 min-w-0">
          {[0, 1].map(i => (
            <div
              key={i}
              className="flex-1 flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5 min-w-0"
            >
              {items[i] ? (
                <>
                  <span className="text-xs truncate flex-1">{items[i].name}</span>
                  <button
                    onClick={() => toggle(items[i])}
                    className="shrink-0 text-white/50 hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <span className="text-xs text-white/40 italic">라켓 선택...</span>
              )}
            </div>
          ))}
        </div>

        {href ? (
          <Link
            href={href}
            className="shrink-0 bg-[#BEFF00] text-black text-xs font-bold px-4 py-2 rounded-full hover:brightness-110 transition-all"
          >
            비교하기
          </Link>
        ) : (
          <span className="shrink-0 text-xs text-white/40">1개 더 선택</span>
        )}

        <button onClick={clear} className="shrink-0 text-white/40 hover:text-white text-xs transition-colors">
          초기화
        </button>
      </div>
    </div>
  )
}
