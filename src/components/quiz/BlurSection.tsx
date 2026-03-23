'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { EmailSqueezeForm } from './EmailSqueezeForm'

interface BlurSectionProps {
  level: string
  children: React.ReactNode
}

export function BlurSection({ level, children }: BlurSectionProps) {
  const [unlocked, setUnlocked] = useState(false)

  return (
    <div className="relative">
      <div
        className={
          'transition-all duration-700 ' +
          (unlocked ? 'filter-none' : 'blur-md pointer-events-none select-none')
        }
      >
        {children}
      </div>

      {!unlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-[#0a0a0a]/90 backdrop-blur-sm border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock size={16} className="text-[#beff00]" />
              <span className="text-sm font-semibold text-white">이메일로 전체 결과 보기</span>
            </div>
            <EmailSqueezeForm level={level} onUnlock={() => setUnlocked(true)} />
          </div>
        </div>
      )}
    </div>
  )
}
