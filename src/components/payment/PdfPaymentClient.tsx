'use client'

import { useEffect, useRef, useState } from 'react'
import type { TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk'

const AMOUNT = 3900
const ORDER_NAME = '배린이 라켓 완전정복 가이드 PDF'

export function PdfPaymentClient() {
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null)
  const [ready, setReady] = useState(false)
  const [keyMissing, setKeyMissing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
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

  // 결제위젯 연동 키 미설정 시 안내 UI
  if (keyMissing) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
        <div className="px-6 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">🔑</span>
          </div>
          <p className="text-sm font-bold text-[#111] mb-1">결제 연동 준비 중</p>
          <p className="text-xs text-[#999] mb-4">
            토스페이먼츠 결제위젯 연동 키 발급 후 이용 가능합니다.
          </p>
          <a
            href="https://developers.tosspayments.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-[#0a0a0a] text-white text-xs font-bold rounded-lg hover:bg-[#222] transition-colors"
          >
            토스 대시보드에서 이용 신청하기 →
          </a>
        </div>
      </div>
    )
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
