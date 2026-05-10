import Link from 'next/link'
import type { Metadata } from 'next'
import { Upload } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: '임포트 로그 | 버디민턴 어드민',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface ImportLogRow {
  id: string
  club_id: string
  import_type: string
  rows_added: number
  rows_skipped: number
  rows_failed: number
  imported_by: string | null
  created_at: string
  club: { name: string } | { name: string }[] | null
  importer:
    | { user: { name: string } | { name: string }[] | null }
    | { user: { name: string } | { name: string }[] | null }[]
    | null
}

/**
 * /admin/imports — 전체 임포트 로그 (최근 100건).
 *
 * 클럽 / 운영자 / 타입 / 행 수 / 시각 표 형태.
 */
export default async function AdminImportsPage() {
  const admin = createAdminClient()

  const { data: logsRaw } = await admin
    .from('import_logs')
    .select(
      `
      id, club_id, import_type, rows_added, rows_skipped, rows_failed, imported_by, created_at,
      club:clubs(name),
      importer:club_members!import_logs_imported_by_fkey(
        user:users(name)
      )
      `
    )
    .order('created_at', { ascending: false })
    .limit(100)

  const logs = (logsRaw ?? []) as unknown as ImportLogRow[]

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center gap-2">
          <Upload size={18} strokeWidth={2} className="text-[#0a0a0a]" />
          <h1 className="text-xl font-bold text-[#0a0a0a]">임포트 로그</h1>
          <span className="text-[12px] font-bold text-[#999] tabular-nums">
            ({logs.length})
          </span>
        </div>
        <p className="text-[13px] text-[#999] mt-1">
          최근 100건. 모든 클럽의 회원/회비 임포트 기록.
        </p>
      </header>

      <section className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
        {logs.length === 0 ? (
          <p className="px-5 py-12 text-center text-[13px] text-[#999]">
            기록된 임포트가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12.5px]">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-wide text-[#999] text-left bg-[#fafafa] border-b border-[#f0f0f0]">
                  <th className="font-bold px-5 py-2">시각</th>
                  <th className="font-bold px-5 py-2">클럽</th>
                  <th className="font-bold px-5 py-2">운영자</th>
                  <th className="font-bold px-5 py-2">타입</th>
                  <th className="font-bold px-5 py-2 tabular-nums">추가</th>
                  <th className="font-bold px-5 py-2 tabular-nums">건너뜀</th>
                  <th className="font-bold px-5 py-2 tabular-nums">실패</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {logs.map((log) => {
                  const clubName = Array.isArray(log.club)
                    ? log.club[0]?.name ?? '(삭제됨)'
                    : log.club?.name ?? '(삭제됨)'
                  const importerWrap = Array.isArray(log.importer) ? log.importer[0] : log.importer
                  const importerName = importerWrap?.user
                    ? Array.isArray(importerWrap.user)
                      ? importerWrap.user[0]?.name ?? '(알 수 없음)'
                      : importerWrap.user.name
                    : '(알 수 없음)'
                  return (
                    <tr key={log.id}>
                      <td className="px-5 py-2.5 text-[#999] tabular-nums whitespace-nowrap">
                        {log.created_at.slice(0, 16).replace('T', ' ')}
                      </td>
                      <td className="px-5 py-2.5 font-semibold text-[#0a0a0a] truncate max-w-[200px]">
                        <Link
                          href={`/admin/clubs/${log.club_id}`}
                          className="hover:underline"
                        >
                          {clubName}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5 text-[#555] truncate max-w-[160px]">
                        {importerName}
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="text-[10.5px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-[#f5f5f5] text-[#555]">
                          {log.import_type}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 tabular-nums font-semibold text-[#0a0a0a]">
                        +{log.rows_added}
                      </td>
                      <td className="px-5 py-2.5 tabular-nums text-[#999]">
                        {log.rows_skipped}
                      </td>
                      <td className="px-5 py-2.5 tabular-nums">
                        {log.rows_failed > 0 ? (
                          <span className="text-[#b91c1c] font-bold">{log.rows_failed}</span>
                        ) : (
                          <span className="text-[#999]">0</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
