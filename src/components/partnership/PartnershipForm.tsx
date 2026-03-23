'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

export function PartnershipForm() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    type: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError('이름, 이메일, 문의 내용은 필수입니다.')
      return
    }
    setLoading(true)
    setError('')
    try {
      // mailto fallback
      const subject = encodeURIComponent(`[제휴 문의] ${form.company ? form.company + ' - ' : ''}${form.name}`)
      const body = encodeURIComponent(
        `이름: ${form.name}\n회사/브랜드: ${form.company || '-'}\n이메일: ${form.email}\n협업 유형: ${form.type || '-'}\n\n문의 내용:\n${form.message}`
      )
      window.location.href = `mailto:hello@birdieminton.com?subject=${subject}&body=${body}`
      setDone(true)
    } catch {
      setError('잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle size={40} className="text-[#beff00]" />
        <div>
          <p className="text-white font-semibold text-lg mb-1">감사합니다!</p>
          <p className="text-white/50 text-sm">
            이메일 앱이 열렸습니다. 전송 후 1~2 영업일 내 답변드릴게요.
          </p>
        </div>
      </div>
    )
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#beff00]/40 transition-colors"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/50 mb-1.5">이름 *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="홍길동" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1.5">회사 / 브랜드</label>
          <input name="company" value={form.company} onChange={handleChange} placeholder="(주)버디민턴" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1.5">이메일 *</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="hello@example.com" className={inputClass} />
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1.5">협업 유형</label>
        <select name="type" value={form.type} onChange={handleChange} className={inputClass + " cursor-pointer"}>
          <option value="" className="bg-[#1a1a1a]">선택해주세요</option>
          <option value="제품 리뷰" className="bg-[#1a1a1a]">제품 리뷰 / 도감 등록</option>
          <option value="광고 협업" className="bg-[#1a1a1a]">광고 협업</option>
          <option value="이벤트 제휴" className="bg-[#1a1a1a]">이벤트 / 클럽 제휴</option>
          <option value="기타" className="bg-[#1a1a1a]">기타</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1.5">문의 내용 *</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="제휴 목적, 제안 내용, 원하는 진행 방식 등을 자유롭게 적어주세요."
          className={inputClass + " resize-none"}
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#beff00] text-[#0a0a0a] font-bold text-sm rounded-xl hover:brightness-105 transition-all disabled:opacity-50"
      >
        <Send size={15} />
        문의 보내기
      </button>
    </form>
  )
}
