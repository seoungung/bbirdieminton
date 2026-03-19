'use client'

import { createContext, useContext, useState } from 'react'

export interface CompareItem { slug: string; name: string }

interface Ctx {
  items: CompareItem[]
  toggle: (item: CompareItem) => void
  isSelected: (slug: string) => boolean
  clear: () => void
  isFull: boolean
}

const CompareContext = createContext<Ctx | null>(null)

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([])

  const toggle = (item: CompareItem) =>
    setItems(prev =>
      prev.some(i => i.slug === item.slug)
        ? prev.filter(i => i.slug !== item.slug)
        : prev.length >= 2 ? prev : [...prev, item]
    )

  const isSelected = (slug: string) => items.some(i => i.slug === slug)
  const clear = () => setItems([])

  return (
    <CompareContext.Provider value={{ items, toggle, isSelected, clear, isFull: items.length >= 2 }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
