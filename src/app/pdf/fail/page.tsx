import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '결제 실패 | 버디민턴' }

interface FailPageProps {
  searchParams: Promise<{ code?: string; message?: string }>
}

export default async function PdfFailPage({ searchParams }: FailPageProps) {
  const { code, message } = await searchParams

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-10 text-center max-w-md w-full">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl">😔</span>
        </div>
        <h1 className="text-xl font-extrabold text-[#111] mb-2">결제에 실패했습니다</h1>
        {message && (
          <p className="text-sm text-[#999] mb-1">{message}</p>
        )}
        {code && (
          <p className="text-xs text-[#bbb] mb-6 font-mono">에러코드: {code}</p>
        )}
        <Link
          href="/pdf"
          className="inline-block px-6 py-3 bg-[#0a0a0a] text-white rounded-xl text-sm font-bold hover:bg-[#222] transition-colors"
        >
          다시 결제하기
        </Link>
      </div>
    </div>
  )
}
