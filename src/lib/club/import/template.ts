import ExcelJS from 'exceljs'
import { MEMBER_COLUMNS, DUES_COLUMNS, type ImportType, type ColumnDef } from './types'

const SAMPLE_MEMBERS = [
  ['홍길동', '010-1234-5678', 'member',  '1000', '2024-01-15', 'D조'],
  ['김영희', '010-2345-6789', 'manager', '1200', '2023-03-01', 'C조'],
  ['이민수', '010-3456-7890', 'member',  '900',  '2025-06-10', '초심자'],
]

const SAMPLE_DUES = [
  ['홍길동', 2026, 4, 30000, 'Y', '2026-04-03', ''],
  ['김영희', 2026, 4, 30000, 'N', '',           '연체 중'],
  ['이민수', 2026, 4, 20000, 'Y', '2026-04-05', '신입 할인'],
]

/**
 * 서버 측에서 Excel 템플릿 파일 버퍼 생성
 */
export async function generateTemplate(type: ImportType, clubName?: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = '버디민턴'
  workbook.created = new Date()

  const sheetName = type === 'members' ? '회원 명부' : '회비 이력'
  const sheet = workbook.addWorksheet(sheetName)

  const columns: ColumnDef[] = type === 'members' ? MEMBER_COLUMNS : DUES_COLUMNS
  const samples = type === 'members' ? SAMPLE_MEMBERS : SAMPLE_DUES

  // 헤더 — 필수는 * 표시
  const headerValues = columns.map(c => c.required ? `${c.header} *` : c.header)
  sheet.addRow(headerValues)

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, size: 11, color: { argb: 'FF111111' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBEFF00' } }
  headerRow.height = 28
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

  // 컬럼 폭 설정
  columns.forEach((col, i) => {
    const columnObj = sheet.getColumn(i + 1)
    columnObj.width = col.width
    // 노트 추가
    if (col.note) {
      headerRow.getCell(i + 1).note = col.note
    }
  })

  // 예시 데이터 행
  samples.forEach(s => sheet.addRow(s))

  // 예시 행 스타일 (회색 + 기울임)
  for (let i = 2; i <= 1 + samples.length; i++) {
    const row = sheet.getRow(i)
    row.font = { italic: true, color: { argb: 'FF999999' } }
  }

  // 빈 줄 + 안내 문구
  sheet.addRow([])
  const noteRow1 = sheet.addRow([
    '※ * 표시된 항목은 필수입니다. 예시 행은 삭제하고 실제 데이터를 입력해주세요.',
  ])
  const noteRow2 = sheet.addRow([
    type === 'members'
      ? '※ 전화번호는 중복 매칭에 사용되므로 정확히 입력하면 좋습니다.'
      : '※ 이름은 현재 모임에 등록된 회원과 정확히 일치해야 합니다.',
  ])
  noteRow1.font = { italic: true, color: { argb: 'FF666666' }, size: 10 }
  noteRow2.font = { italic: true, color: { argb: 'FF666666' }, size: 10 }
  sheet.mergeCells(`A${noteRow1.number}:${String.fromCharCode(64 + columns.length)}${noteRow1.number}`)
  sheet.mergeCells(`A${noteRow2.number}:${String.fromCharCode(64 + columns.length)}${noteRow2.number}`)

  // 헤더 고정
  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

/**
 * 파일명 생성
 */
export function templateFilename(type: ImportType, clubName?: string): string {
  const base = type === 'members' ? '회원명부' : '회비이력'
  const safe = (clubName ?? '').replace(/[\\/:*?"<>|]/g, '').slice(0, 20)
  return safe ? `${safe}_${base}_템플릿.xlsx` : `${base}_템플릿.xlsx`
}
