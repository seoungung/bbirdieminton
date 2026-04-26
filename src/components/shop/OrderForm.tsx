'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk'
import { CheckCircle2, Mail, User } from 'lucide-react'

const AMOUNT = 3900
const ORDER_NAME = '배린이 라켓 완전정복 가이드 PDF'

/**
 * 결제 일시 비활성화 — PDF 발송·주문 저장·멱등성 미구현 상태에서
 * 실결제가 들어오면 환불 분쟁 위험. 정식 출시 전까지 결제 버튼 disable.
 * 활성화하려면 `LAUNCH_ENABLED = true`로 변경 + confirm 라우트의 TODO 구현.
 */
const LAUNCH_ENABLED = false

export function OrderForm() {
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null)
  const [ready, setReady] = useState(false)
  const [keyMissing, setKeyMissing] = useState(false)
  const [loading, setLoading] = useState(false)

  // 주문자 정보
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [agreeAll, setAgreeAll] = useState(false)
  const [agreeService, setAgreeService] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeRefund, setAgreeRefund] = useState(false)

  // 전체 동의 동기화
  useEffect(() => {
    if (agreeAll) {
      setAgreeService(true)
      setAgreePrivacy(true)
      setAgreeRefund(true)
    }
  }, [agreeAll])

  useEffect(() => {
    const allChecked = agreeService && agreePrivacy && agreeRefund
    if (agreeAll !== allChecked) setAgreeAll(allChecked)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agreeService, agreePrivacy, agreeRefund])

  // Toss 위젯 초기화
  useEffect(() => {
    if (!LAUNCH_ENABLED) {
      setKeyMissing(true)
      return
    }
    async function init() {
      const { loadTossPayments, ANONYMOUS } = await import('@tosspayments/tosspayments-sdk')
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      if (!clientKey || clientKey.includes('여기에')) {
        setKeyMissing(true)
        return
      }
      try {
        const tossPayments = await loadTossPayments(clientKey)
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS })
        await widgets.setAmount({ currency: 'KRW', value: AMOUNT })
        await Promise.all([
          widgets.renderPaymentMethods({ selector: '#payment-widget', variantKey: 'DEFAULT' }),
          widgets.renderAgreement({ selector: '#payment-agreement' }),
        ])
        widgetsRef.current = widgets
        setReady(true)
      } catch (err) {
        console.error('[Toss] widget init error:', err)
        setKeyMissing(true)
      }
    }
    init()
  }, [])

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canPay = emailValid && name.trim().length > 0 && agreeService && agreePrivacy && agreeRefund && ready

  async function handlePay() {
    if (!widgetsRef.current || !canPay) return
    setLoading(true)
    try {
      const orderId = `PDF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      await widgetsRef.current.requestPayment({
        orderId,
        orderName: ORDER_NAME,
        customerEmail: email,
        customerName: name,
        successUrl: `${window.location.origin}/pdf/success`,
        failUrl: `${window.location.origin}/pdf/fail`,
      })
    } catch (err) {
      console.error('[Toss] requestPayment error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[720px] mx-auto space-y-5">
      {/* 주문 상품 */}
      <section className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
        <h2 className="text-[15px] font-extrabold text-[#111] mb-4">주문 상품</h2>
        <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f0]">
          <div>
            <p className="font-semibold text-sm text-[#111]">{ORDER_NAME}</p>
            <p className="text-xs text-[#999] mt-1">PDF · 즉시 다운로드 · 1개</p>
          </div>
          <p className="font-bold text-[#111]">{AMOUNT.toLocaleString()}원</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm font-bold text-[#111]">총 결제 금액</p>
          <p className="text-xl font-extrabold text-[#111]">{AMOUNT.toLocaleString()}원</p>
        </div>
      </section>

      {/* 주문자 정보 */}
      <section className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
        <h2 className="text-[15px] font-extrabold text-[#111] mb-1">주문자 정보</h2>
        <p className="text-xs text-[#999] mb-5">
          입력하신 이메일로 PDF 다운로드 링크가 발송됩니다. 정확히 입력해주세요.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="order-email" className="block text-xs font-semibold text-[#555] mb-1.5">
              이메일 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb]" />
              <input
                id="order-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@birdieminton.com"
                className="w-full pl-10 pr-3 py-3 text-sm border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0a0a0a] transition-colors"
              />
            </div>
            {email && !emailValid && (
              <p className="text-[11px] text-red-500 mt-1">이메일 형식이 올바르지 않습니다.</p>
            )}
          </div>

          <div>
            <label htmlFor="order-name" className="block text-xs font-semibold text-[#555] mb-1.5">
              이름 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb]" />
              <input
                id="order-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full pl-10 pr-3 py-3 text-sm border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0a0a0a] transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 약관 동의 */}
      <section className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
        <h2 className="text-[15px] font-extrabold text-[#111] mb-4">약관 동의</h2>

        <label className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#f0f0f0] cursor-pointer">
          <input
            type="checkbox"
            checked={agreeAll}
            onChange={(e) => setAgreeAll(e.target.checked)}
            className="w-5 h-5 accent-[#0a0a0a]"
          />
          <span className="text-sm font-bold text-[#111]">전체 동의</span>
        </label>

        <div className="space-y-2.5">
          <AgreeRow
            checked={agreeService}
            onChange={setAgreeService}
            label="[필수] 이용약관 동의"
            href="/terms"
          />
          <AgreeRow
            checked={agreePrivacy}
            onChange={setAgreePrivacy}
            label="[필수] 개인정보 수집·이용 동의 (이메일·이름: 상품 발송·문의 응대)"
            href="/privacy"
          />
          <AgreeRow
            checked={agreeRefund}
            onChange={setAgreeRefund}
            label="[필수] 환불정책 확인 및 동의 (다운로드 전 7일 이내)"
            href="/policy/refund"
          />
        </div>
      </section>

      {/* 결제수단 선택 (토스 위젯) */}
      <section className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-[15px] font-extrabold text-[#111]">결제수단 선택</h2>
        </div>

        {keyMissing ? (
          <div className="px-6 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#fef3c7] flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🚧</span>
            </div>
            <p className="text-sm font-bold text-[#111] mb-1">정식 출시 준비 중입니다</p>
            <p className="text-xs text-[#999] leading-relaxed">
              PDF 본문·발송 시스템 점검 중입니다.<br />
              출시되면 가장 먼저 알려드릴게요.
            </p>
            <Link
              href="/contact"
              className="inline-flex mt-4 items-center justify-center gap-1.5 px-4 py-2 bg-[#0a0a0a] text-white font-semibold text-[12px] rounded-full hover:bg-[#222] transition-colors"
            >
              출시 알림 신청
            </Link>
          </div>
        ) : (
          <>
            <div id="payment-widget" className="px-4" />
            <div id="payment-agreement" className="px-4" />
            {!ready && (
              <div className="px-6 py-10 text-center text-sm text-[#999]">결제 수단 불러오는 중...</div>
            )}
          </>
        )}
      </section>

      {/* 결제하기 버튼 */}
      <div className="sticky bottom-4 pt-2">
        <button
          onClick={handlePay}
          disabled={!canPay || loading || keyMissing}
          className="w-full py-4 bg-[#beff00] text-[#0a0a0a] font-extrabold text-base rounded-xl hover:bg-[#a8e600] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          {loading ? '결제 처리 중...' : `${AMOUNT.toLocaleString()}원 결제하기`}
        </button>
        {!canPay && !loading && !keyMissing && (
          <p className="text-[11px] text-[#999] text-center mt-2">
            이메일·이름 입력 및 필수 약관에 모두 동의해주세요.
          </p>
        )}
      </div>
    </div>
  )
}

function AgreeRow({
  checked,
  onChange,
  label,
  href,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  href: string
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <label className="flex items-start gap-2.5 cursor-pointer flex-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 mt-0.5 accent-[#0a0a0a] shrink-0"
        />
        <span className="text-[13px] text-[#333] leading-snug">{label}</span>
        {checked && <CheckCircle2 size={13} className="text-[#10b981] shrink-0 mt-0.5" />}
      </label>
      <Link
        href={href}
        target="_blank"
        className="text-[12px] text-[#999] underline hover:text-[#111] shrink-0"
      >
        보기
      </Link>
    </div>
  )
}
