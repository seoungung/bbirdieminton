interface FormSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, children, className = '' }: FormSectionProps) {
  return (
    <div className={className}>
      <p className="text-[11px] font-bold text-[#bbb] uppercase tracking-wider mb-4">{title}</p>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
