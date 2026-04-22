'use client'

import { useEffect, useRef, useState } from 'react'
import type { TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk'

const AMOUNT = 3900
const ORDER_NAME = '배린이 라켓 완전정복 가이드 PDF'

export function PdfPaymentClient() {
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function init() {
      const { loadTossPayments, ANONYMOUS } = await import('@tosspayments/tosspayments-sdk')
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      if (!clientKey) {
        console.warn('[Toss] NEXT_PUBLIC_TOSS_CLIENT_KEY not set')
        return
      }
      const tossPayments = await loadTossPayments(clientKey)
      const widgets = tossPayments.widgets({ customerKey: ANONYMOUS })
      await widgets.setAmount({ currency: 'KRW', value: AMOUNT })
      await Promise.all([
        widgets.renderPaymentMethods({ selector: '#payment-widget', variantKey: 'DEFAULT' }),
        widgets.renderAgreement({ selector: '#payment-agreement' }),
      ])
      widgetsRef.current = widgets
      setReady(true)
    }
    init()
  }, [])

  async function handlePay() {
    if (!widgetsRef.current) return
    setLoading(true)
    try {
      const orderId = `PDF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      await widgetsRef.current.requestPayment({
        orderId,
        orderName: ORDER_NAME,
        successUrl: `${window.location.origin}/pdf/success`,
        failUrl: `${window.location.origin}/pdf/fail`,
      })
    } catch (err) {
      console.error('[Toss] requestPayment error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
      <div id="payment-widget" className="px-4" />
      <div id="payment-agreement" className="px-4" />

      {!ready && (
        <div className="px-6 py-10 text-center text-sm text-[#999]">결제 수단 불러오는 중...</div>
      )}

      {ready && (
        <div className="px-6 pb-6 pt-4">
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full py-4 bg-[#beff00] text-[#0a0a0a] font-extrabold text-base rounded-xl hover:bg-[#a8e600] disabled:opacity-50 transition-colors"
          >
            {loading ? '결제 처리 중...' : `${AMOUNT.toLocaleString()}원 결제하기`}
          </button>
          <p className="text-xs text-[#999] text-center mt-3">
            결제 완료 후 PDF 다운로드 링크가 제공됩니다.
          </p>
        </div>
      )}
    </div>
  )
}
