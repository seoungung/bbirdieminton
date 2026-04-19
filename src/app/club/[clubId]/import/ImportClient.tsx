'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import ExcelJS from 'exceljs'
import { validateMemberRow, validateDuesRow } from '@/lib/club/import/validate'
import { MEMBER_COLUMNS, DUES_COLUMNS, type ImportType, type ValidatedRow, type MemberRow, type DuesRow } from '@/lib/club/import/types'
import { importMembersAction, importDuesAction } from './actions'

interface LogItem {
  id: string
  import_type: 'members' | 'dues'
  rows_added: number
  rows_skipped: number
  rows_failed: number
  created_at: string
}

interface Props {
  clubId: string
  clubName: string
  isDemo?: boolean
  recentLogs?: LogItem[]
}

type PreviewState<T> = {
  type: ImportType
  rows: ValidatedRow<T>[]
  fileName: string
}

export function ImportClient({ clubId, clubName, isDemo = false, recentLogs = [] }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [memberPreview, setMemberPreview] = useState<PreviewState<MemberRow> | null>(null)
  const [duesPreview, setDuesPreview] = useState<PreviewState<DuesRow> | null>(null)
  const [result, setResult] = useState<{ type: ImportType; added: number; skipped: number; failed: number; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ── 템플릿 다운로드 ─────────────────────────────
  const downloadTemplate = (type: ImportType) => {
    if (isDemo) {
      setError('체험 모드에서는 템플릿을 실제로 다운받을 수 없어요 (실제 가입 후 이용 가능)')
      return
    }
    window.location.href = `/api/club/${clubId}/import/template?type=${type}`
  }

  // ── 파일 업로드 → 파싱 + 검증 ────────────────────
  const handleFile = async (type: ImportType, file: File) => {
    setError(null)
    try {
      const buffer = await file.arrayBuffer()
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)
      const sheet = workbook.worksheets[0]
      if (!sheet) throw new Error('시트를 찾을 수 없어요')

      // 1행 = 헤더 — 키 매핑
      const headerRow = sheet.getRow(1)
      const headers: string[] = []
      headerRow.eachCell((cell, colNumber) => {
        const raw = String(cell.value ?? '').replace(/\*/g, '').trim()
        headers[colNumber - 1] = raw
      })

      // 2행부터 데이터
      const rawRows: Record<string, unknown>[] = []
      for (let r = 2; r <= sheet.rowCount; r++) {
        const row = sheet.getRow(r)
        const obj: Record<string, unknown> = {}
        let hasValue = false
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const key = headers[colNumber - 1]
          if (!key) return
          // ExcelJS cell.value 는 object(date, formula 등)일 수 있음 — toString/Date 처리
          let v: unknown = cell.value
          if (v && typeof v === 'object' && 'text' in v) v = (v as { text: string }).text
          if (v && typeof v === 'object' && 'result' in v) v = (v as { result: unknown }).result
          obj[key] = v
          if (v !== null && v !== undefined && v !== '') hasValue = true
        })
        if (hasValue) rawRows.push(obj)
      }

      if (type === 'members') {
        const validated = rawRows.map((r, i) => validateMemberRow(r, i + 2))
        setMemberPreview({ type, rows: validated, fileName: file.name })
      } else {
        const validated = rawRows.map((r, i) => validateDuesRow(r, i + 2))
        setDuesPreview({ type, rows: validated, fileName: file.name })
      }
    } catch (e) {
      setError(e instanceof Error ? `파일 파싱 실패: ${e.message}` : '파일 파싱 실패')
    }
  }

  // ── 서버로 전송 ──────────────────────────────────
  const confirmImport = (type: ImportType) => {
    setError(null)
    const preview = type === 'members' ? memberPreview : duesPreview
    if (!preview) return

    // 에러 없는 행만 전송
    const validRows = preview.rows.filter(r => r.errors.length === 0).map(r => r.row)
    if (validRows.length === 0) {
      setError('임포트할 유효한 행이 없어요')
      return
    }

    startTransition(async () => {
      const action = type === 'members' ? importMembersAction : importDuesAction
      const res = await action(clubId, validRows as MemberRow[] & DuesRow[])
      if (!res.success) {
        setError(res.errorDetail ?? '임포트 실패')
        return
      }
      setResult({
        type,
        added: res.added,
        skipped: res.skipped,
        failed: res.failed,
        message: res.message ?? '완료',
      })
      if (type === 'members') setMemberPreview(null)
      else setDuesPreview(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      {/* 안내 */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5">
        <h2 className="text-base font-bold text-[#111] mb-1.5">📥 기존 데이터 옮겨오기</h2>
        <p className="text-sm text-[#666] leading-relaxed">
          지금 엑셀로 관리 중인 <strong>{clubName}</strong>의 회원·회비 데이터를 버디민턴으로 가져올 수 있어요.
          템플릿을 다운받아 형식에 맞게 입력한 뒤 업로드하세요.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <XCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="flex items-start gap-2 px-4 py-3 bg-[#f0fff0] border border-[#beff00] rounded-xl text-sm text-[#2d6a00]">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">임포트 완료</p>
            <p className="text-xs mt-0.5">{result.message}</p>
          </div>
        </div>
      )}

      {/* 회원 임포트 카드 */}
      <ImportCard
        title="회원 명부 임포트"
        description="회원 이름·전화번호·역할·실력·가입일·레벨"
        type="members"
        preview={memberPreview}
        columns={MEMBER_COLUMNS}
        onDownload={() => downloadTemplate('members')}
        onFile={f => handleFile('members', f)}
        onConfirm={() => confirmImport('members')}
        onCancel={() => setMemberPreview(null)}
        isPending={isPending}
      />

      {/* 회비 임포트 카드 */}
      <ImportCard
        title="회비 이력 임포트"
        description="월별 회비 납부 내역 (이름으로 기존 회원과 매칭)"
        type="dues"
        preview={duesPreview}
        columns={DUES_COLUMNS}
        onDownload={() => downloadTemplate('dues')}
        onFile={f => handleFile('dues', f)}
        onConfirm={() => confirmImport('dues')}
        onCancel={() => setDuesPreview(null)}
        isPending={isPending}
      />

      {/* 최근 임포트 이력 */}
      {recentLogs.length > 0 && (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-[#111] mb-3">최근 임포트 기록</h3>
          <div className="space-y-2">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#555]">
                  <FileSpreadsheet size={13} className="text-[#999]" />
                  <span className="font-semibold">
                    {log.import_type === 'members' ? '회원' : '회비'}
                  </span>
                  <span className="text-[#999]">
                    {new Date(log.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[#555]">
                  <span className="text-[#2d6a00]">+{log.rows_added}</span>
                  {log.rows_skipped > 0 && <span className="text-[#999] ml-2">skip {log.rows_skipped}</span>}
                  {log.rows_failed > 0 && <span className="text-red-500 ml-2">fail {log.rows_failed}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 하위 컴포넌트: 임포트 카드 ─────────────────────────

interface CardProps<T> {
  title: string
  description: string
  type: ImportType
  preview: PreviewState<T> | null
  columns: typeof MEMBER_COLUMNS
  onDownload: () => void
  onFile: (file: File) => void
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

function ImportCard<T extends MemberRow | DuesRow>({
  title, description, preview, columns, onDownload, onFile, onConfirm, onCancel, isPending,
}: CardProps<T>) {
  const errorCount = preview?.rows.filter(r => r.errors.length > 0).length ?? 0
  const warningCount = preview?.rows.filter(r => r.warnings.length > 0).length ?? 0
  const validCount = (preview?.rows.length ?? 0) - errorCount

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#111] mb-1">{title}</h3>
          <p className="text-xs text-[#888]">{description}</p>
        </div>
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 px-3 py-2 border border-[#e5e5e5] text-[#555] text-xs font-semibold rounded-xl hover:border-[#beff00] hover:text-[#111] transition-colors"
        >
          <Download size={13} />
          템플릿
        </button>
      </div>

      {!preview ? (
        <label className="block">
          <input
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) onFile(f)
              e.target.value = ''
            }}
          />
          <div className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-6 text-center cursor-pointer hover:border-[#beff00] hover:bg-[#f8fff0] transition-colors">
            <Upload size={24} className="mx-auto text-[#bbb] mb-2" />
            <p className="text-sm text-[#555] font-semibold">엑셀 파일 선택</p>
            <p className="text-xs text-[#bbb] mt-1">.xlsx 파일만 지원</p>
          </div>
        </label>
      ) : (
        <div className="space-y-3">
          {/* 요약 */}
          <div className="flex items-center justify-between text-xs bg-[#f8f8f8] rounded-xl px-3 py-2.5">
            <span className="text-[#555] truncate">
              <FileSpreadsheet size={12} className="inline mr-1" />
              {preview.fileName}
            </span>
            <div className="flex gap-2 shrink-0">
              <span className="text-[#2d6a00] font-bold">유효 {validCount}</span>
              {errorCount > 0 && <span className="text-red-500 font-bold">에러 {errorCount}</span>}
              {warningCount > 0 && <span className="text-amber-600 font-bold">경고 {warningCount}</span>}
            </div>
          </div>

          {/* 테이블 */}
          <div className="max-h-80 overflow-auto border border-[#e5e5e5] rounded-xl">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#f8f8f8] border-b border-[#e5e5e5]">
                <tr>
                  <th className="px-2 py-2 text-left font-bold text-[#999] w-12">#</th>
                  {columns.map(c => (
                    <th key={c.key} className="px-2 py-2 text-left font-bold text-[#555]">
                      {c.header}{c.required && <span className="text-red-500 ml-0.5">*</span>}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-left font-bold text-[#555] w-40">검증</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r, i) => {
                  const hasError = r.errors.length > 0
                  const hasWarning = r.warnings.length > 0
                  return (
                    <tr
                      key={i}
                      className={`border-b border-[#f0f0f0] ${hasError ? 'bg-red-50' : hasWarning ? 'bg-amber-50' : ''}`}
                    >
                      <td className="px-2 py-1.5 text-[#999]">{r.rowIndex}</td>
                      {columns.map(c => {
                        const row = r.row as unknown as Record<string, unknown>
                        const val = row[c.key]
                        return (
                          <td key={c.key} className="px-2 py-1.5 text-[#333] truncate max-w-32">
                            {val === undefined || val === null || val === '' ? '-' : String(val)}
                          </td>
                        )
                      })}
                      <td className="px-2 py-1.5">
                        {hasError && (
                          <div className="flex items-start gap-1 text-red-600 text-[10px]">
                            <XCircle size={10} className="mt-0.5 shrink-0" />
                            <span>{r.errors.join(', ')}</span>
                          </div>
                        )}
                        {hasWarning && !hasError && (
                          <div className="flex items-start gap-1 text-amber-700 text-[10px]">
                            <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                            <span>{r.warnings.join(', ')}</span>
                          </div>
                        )}
                        {!hasError && !hasWarning && (
                          <div className="flex items-center gap-1 text-[#2d6a00] text-[10px]">
                            <CheckCircle2 size={10} />
                            <span>OK</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={isPending}
              className="flex-1 py-2.5 border border-[#e5e5e5] text-[#555] text-sm font-semibold rounded-xl hover:bg-[#f8f8f8] transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending || validCount === 0}
              className="flex-1 py-2.5 bg-[#beff00] text-[#111] text-sm font-bold rounded-xl hover:brightness-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  임포트 중...
                </>
              ) : (
                `${validCount}건 임포트`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
