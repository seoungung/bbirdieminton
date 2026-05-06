'use client'

import { useActionState } from 'react'
import { CheckCircle2, AlertCircle, Mail, User as UserIcon, MessageSquare } from 'lucide-react'
import { submitContactAction } from '@/app/contact/actions'

const CATEGORIES = [
  '서비스 이용 문의',
  '결제·요금제 문의',
  '버그 신고',
  '기능 제안',
  '제휴·파트너십',
  '기타',
]

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactAction, null)

  // 성공 시 폼 리셋을 위해 상태에 따라 key 변경
  const formKey = state?.success ? 'submitted' : 'empty'

  return (
    <form key={formKey} action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className="block text-[13px] font-semibold text-[#555] mb-2">
            이름 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb]" />
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              className="w-full pl-10 pr-3 py-3 text-sm border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#0a0a0a] transition-colors"
              placeholder="홍길동"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-[13px] font-semibold text-[#555] mb-2">
            이메일 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb]" />
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              className="w-full pl-10 pr-3 py-3 text-sm border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#0a0a0a] transition-colors"
              placeholder="example@mail.com"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="contact-category" className="block text-[13px] font-semibold text-[#555] mb-2">
          문의 카테고리
        </label>
        <select
          id="contact-category"
          name="category"
          defaultValue={CATEGORIES[0]}
          className="w-full px-4 py-3 text-sm border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#0a0a0a] transition-colors bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-[13px] font-semibold text-[#555] mb-2">
          문의 내용 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MessageSquare size={14} className="absolute left-3.5 top-4 text-[#bbb]" />
          <textarea
            id="contact-message"
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={8}
            className="w-full pl-10 pr-3 py-3 text-sm border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#0a0a0a] transition-colors resize-y"
            placeholder="자세한 내용을 입력해주세요. (최소 10자)"
          />
        </div>
        <p className="text-[12px] text-[#999] mt-1.5">
          영업일 기준 1~3일 이내 답변드립니다.
        </p>
      </div>

      {state?.error && (
        <div className="flex items-start gap-2 text-[13px] text-red-500 bg-red-50 px-4 py-3 rounded-lg">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="flex items-start gap-2 text-[13px] text-[var(--color-brand-court)] bg-[var(--color-brand-court-bg)] px-4 py-3 rounded-lg">
          <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" />
          <span>{state.success}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 bg-[#0a0a0a] text-white font-bold text-[14px] rounded-xl hover:bg-[#222] disabled:opacity-50 transition-colors"
      >
        {isPending ? '발송 중...' : '문의 보내기'}
      </button>
    </form>
  )
}
