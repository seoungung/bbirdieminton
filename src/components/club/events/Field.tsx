'use client'

interface Props {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}

export function Field({ label, required, hint, children }: Props) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[#555] mb-1">
        {label}
        {required && <span className="text-[var(--color-brand-streak)] ml-0.5">*</span>}
        {hint && <span className="text-[#999] font-normal ml-1.5">· {hint}</span>}
      </span>
      {children}
    </label>
  )
}
