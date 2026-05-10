/**
 * 버디민턴 샘플 임포트 파일 생성 스크립트
 * Usage: node scripts/generate-sample-import.mjs
 *
 * 출력: C:\Users\skyyo\Downloads\birdminton-sample-import\
 *   - 회원_샘플.xlsx
 *   - 회비이력_샘플.xlsx
 */

import ExcelJS from 'exceljs'
import path from 'path'
import { fileURLToPath } from 'url'

const OUTPUT_DIR = 'C:/Users/skyyo/Downloads/birdminton-sample-import'

// ── 컬럼 정의 (types.ts 와 완전 동일) ─────────────────────
const MEMBER_COLUMNS = [
  { key: 'name',        header: '이름',      required: true,  width: 15 },
  { key: 'phone',       header: '전화번호',  required: false, width: 18, note: '010-0000-0000 형식 권장 (중복 매칭용)' },
  { key: 'role',        header: '역할',      required: false, width: 10, note: 'owner / manager / member (기본: member)' },
  { key: 'skill_score', header: '실력점수',  required: false, width: 10, note: '0~2000 (기본: 1000)' },
  { key: 'joined_at',   header: '가입일',    required: false, width: 14, note: 'YYYY-MM-DD' },
  { key: 'quiz_level',  header: '레벨',      required: false, width: 10, note: '왕초보 / 초심자 / D조 / C조' },
]

const DUES_COLUMNS = [
  { key: 'name',    header: '이름',     required: true,  width: 15 },
  { key: 'year',    header: '연도',     required: true,  width: 8,  note: '예: 2026' },
  { key: 'month',   header: '월',       required: true,  width: 6,  note: '1~12' },
  { key: 'amount',  header: '금액',     required: true,  width: 12, note: '원 단위 숫자 (예: 30000)' },
  { key: 'paid',    header: '납부여부', required: true,  width: 10, note: 'Y 또는 N' },
  { key: 'paid_at', header: '납부일',   required: false, width: 14, note: 'YYYY-MM-DD (납부한 경우)' },
  { key: 'note',    header: '메모',     required: false, width: 20 },
]

// ── 가상 회원 데이터 (18명) ────────────────────────────────
// 이름, 전화번호, 역할, 실력점수, 가입일, 레벨
const MEMBERS = [
  ['김태양', '010-1001-2001', 'owner',   1450, '2022-03-10', 'C조'],
  ['박지현', '010-1002-2002', 'manager', 1280, '2022-05-22', 'C조'],
  ['이서준', '010-1003-2003', 'manager', 1150, '2022-08-15', 'D조'],
  ['최민아', '010-1004-2004', 'member',  1100, '2023-01-07', 'D조'],
  ['정우진', '010-1005-2005', 'member',  980,  '2023-03-19', '초심자'],
  ['강하은', '010-1006-2006', 'member',  950,  '2023-06-02', '초심자'],
  ['윤성현', '010-1007-2007', 'member',  870,  '2023-09-11', '초심자'],
  ['임지수', '010-1008-2008', 'member',  820,  '2024-01-30', '왕초보'],
  ['한동훈', '010-1009-2009', 'member',  1050, '2023-11-14', 'D조'],
  ['오수빈', '010-1010-2010', 'member',  760,  '2024-04-05', '왕초보'],
  ['신예린', '010-1011-2011', 'member',  1200, '2023-02-28', 'C조'],
  ['조민규', '010-1012-2012', 'member',  1080, '2024-02-17', 'D조'],
  ['권나래', '010-1013-2013', 'member',  900,  '2024-05-09', '초심자'],
  ['백승우', '010-1014-2014', 'member',  1320, '2022-11-03', 'C조'],
  ['남지훈', '010-1015-2015', 'member',  690,  '2024-07-22', '왕초보'],
  ['문소연', '010-1016-2016', 'member',  1010, '2024-08-01', 'D조'],
  ['전하늘', '010-1017-2017', 'member',  880,  '2024-10-13', '초심자'],
  ['류민준', '010-1018-2018', 'member',  750,  '2025-01-06', '왕초보'],
]

// ── 회비 이력 생성 (2025-12 ~ 2026-05) ────────────────────
// 6개월치 × 18명 = 최대 108행. 정상/미납/부분 mix.
// 부분납부는 note 로 표현 (dues 스키마에 별도 partial 필드 없음)
function buildDues() {
  const months = [
    { year: 2025, month: 12 },
    { year: 2026, month: 1 },
    { year: 2026, month: 2 },
    { year: 2026, month: 3 },
    { year: 2026, month: 4 },
    { year: 2026, month: 5 },
  ]

  // 회원별 납부 성향 시뮬레이션 (index 기반)
  // 성향: 0=항상납부, 1=가끔미납, 2=잦은미납
  const tendency = [0,0,0,0,1,0,1,2,0,2,0,1,2,0,2,1,2,2]

  // 납부일 생성 헬퍼
  function paidDate(year, month, day) {
    return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  }

  const rows = []

  for (const [mi, member] of MEMBERS.entries()) {
    const name = member[0]
    const t = tendency[mi]

    for (const { year, month } of months) {
      // 미래 달(2026-05) 미납 처리
      const isFuture = (year === 2026 && month === 5)

      let paid, paid_at, amount, note

      // 금액: owner/manager 는 면제(0), 일반 30000
      const role = member[2]
      if (role === 'owner') {
        amount = 0
        paid = 'Y'
        paid_at = paidDate(year, month, 1)
        note = '운영자 면제'
      } else if (t === 0) {
        // 항상 납부
        amount = 30000
        paid = isFuture ? 'N' : 'Y'
        paid_at = isFuture ? '' : paidDate(year, month, Math.floor(Math.random() * 5) + 1)
        note = ''
      } else if (t === 1) {
        // 가끔 미납 — 짝수 달 미납
        const isLate = (month % 2 === 0) || isFuture
        amount = 30000
        paid = isLate ? 'N' : 'Y'
        paid_at = isLate ? '' : paidDate(year, month, Math.floor(Math.random() * 8) + 3)
        note = isLate ? (isFuture ? '' : '연체') : ''
      } else {
        // 잦은 미납 — 부분납부 or 완전미납
        const rand = (mi * 7 + month) % 3  // 0,1,2 순환
        if (rand === 0) {
          // 완전 미납
          amount = 30000
          paid = 'N'
          paid_at = ''
          note = isFuture ? '' : '미납'
        } else if (rand === 1 && !isFuture) {
          // 부분 납부 (15000원)
          amount = 15000
          paid = 'Y'
          paid_at = paidDate(year, month, 10 + (mi % 10))
          note = '부분납부'
        } else {
          // 납부
          amount = 30000
          paid = isFuture ? 'N' : 'Y'
          paid_at = isFuture ? '' : paidDate(year, month, 5 + (mi % 7))
          note = ''
        }
      }

      rows.push([name, year, month, amount, paid, paid_at, note])
    }
  }

  return rows
}

// ── 검증 함수 (validate.ts 인라인) ────────────────────────
const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

function validateMember(row) {
  const errors = []
  const [name, phone, role, skill_score, joined_at, quiz_level] = row

  if (!name) errors.push('이름 필수')
  if (name && name.length > 20) errors.push('이름 20자 초과')
  if (phone && !PHONE_REGEX.test(phone)) errors.push(`전화번호 형식 오류: ${phone}`)
  if (role && !['owner','manager','member'].includes(role)) errors.push(`역할 오류: ${role}`)
  if (skill_score !== undefined && (skill_score < 0 || skill_score > 2000)) errors.push(`실력점수 범위 오류: ${skill_score}`)
  if (joined_at && !DATE_REGEX.test(joined_at)) errors.push(`가입일 형식 오류: ${joined_at}`)
  if (quiz_level && !['왕초보','초심자','D조','C조'].includes(quiz_level)) errors.push(`레벨 오류: ${quiz_level}`)

  return errors
}

function validateDues(row) {
  const errors = []
  const [name, year, month, amount, paid, paid_at, note] = row

  if (!name) errors.push('이름 필수')
  if (year === null || year === undefined) errors.push('연도 필수')
  else if (year < 2000 || year > 2100) errors.push(`연도 범위 오류: ${year}`)
  if (month === null || month === undefined) errors.push('월 필수')
  else if (month < 1 || month > 12) errors.push(`월 범위 오류: ${month}`)
  if (amount === null || amount === undefined) errors.push('금액 필수')
  else if (amount < 0) errors.push(`금액 음수: ${amount}`)
  if (!paid || !['Y','N'].includes(paid)) errors.push(`납부여부 오류: ${paid}`)
  if (paid_at && !DATE_REGEX.test(paid_at) && paid_at !== '') errors.push(`납부일 형식 오류: ${paid_at}`)

  return errors
}

// ── 공통 워크북 빌드 함수 ──────────────────────────────────
function buildSheet(workbook, sheetName, columns, headerStyle, dataRows) {
  const sheet = workbook.addWorksheet(sheetName)

  // 헤더 (template.ts 와 동일: 필수는 * 표시)
  const headerValues = columns.map(c => c.required ? `${c.header} *` : c.header)
  sheet.addRow(headerValues)

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, size: 11, color: { argb: 'FF111111' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBEFF00' } }
  headerRow.height = 28
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

  columns.forEach((col, i) => {
    const columnObj = sheet.getColumn(i + 1)
    columnObj.width = col.width
    if (col.note) {
      headerRow.getCell(i + 1).note = col.note
    }
  })

  // 데이터 행
  for (const rowData of dataRows) {
    sheet.addRow(rowData)
  }

  // 헤더 고정
  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  return sheet
}

// ── 메인 ──────────────────────────────────────────────────
async function main() {
  console.log('샘플 임포트 파일 생성 시작...\n')

  // 1. 회원 파일
  const memberRows = MEMBERS.map(m => [m[0], m[1], m[2], m[3], m[4], m[5]])

  // 검증
  let memberErrors = 0
  for (const [i, row] of memberRows.entries()) {
    const errs = validateMember(row)
    if (errs.length > 0) {
      console.error(`  [회원 행 ${i+2}] 오류: ${errs.join(', ')}`)
      memberErrors++
    }
  }

  // 전화번호 중복 체크
  const phones = memberRows.map(r => r[1]).filter(Boolean)
  const phoneSet = new Set(phones)
  if (phoneSet.size !== phones.length) {
    console.error('  [회원] 전화번호 중복 있음!')
    memberErrors++
  }

  if (memberErrors === 0) {
    console.log(`  [회원] 검증 통과 ✓  (${memberRows.length}행 모두 유효)`)
  }

  const memberWorkbook = new ExcelJS.Workbook()
  memberWorkbook.creator = '버디민턴'
  memberWorkbook.created = new Date()
  buildSheet(memberWorkbook, '회원 명부', MEMBER_COLUMNS, null, memberRows)

  const memberPath = `${OUTPUT_DIR}/회원_샘플.xlsx`
  await memberWorkbook.xlsx.writeFile(memberPath)
  console.log(`  저장됨: ${memberPath}`)

  // 2. 회비 이력 파일
  const duesRows = buildDues()

  let duesErrors = 0
  for (const [i, row] of duesRows.entries()) {
    const errs = validateDues(row)
    if (errs.length > 0) {
      console.error(`  [회비 행 ${i+2}] 오류: ${errs.join(', ')} | 데이터: ${JSON.stringify(row)}`)
      duesErrors++
    }
  }

  if (duesErrors === 0) {
    console.log(`  [회비] 검증 통과 ✓  (${duesRows.length}행 모두 유효)`)
  }

  // 통계 출력
  const paidCount = duesRows.filter(r => r[4] === 'Y').length
  const unpaidCount = duesRows.filter(r => r[4] === 'N').length
  const partialCount = duesRows.filter(r => r[6] === '부분납부').length
  console.log(`    납부 ${paidCount}건 / 미납 ${unpaidCount}건 / 부분납부 ${partialCount}건`)

  const duesWorkbook = new ExcelJS.Workbook()
  duesWorkbook.creator = '버디민턴'
  duesWorkbook.created = new Date()
  buildSheet(duesWorkbook, '회비 이력', DUES_COLUMNS, null, duesRows)

  const duesPath = `${OUTPUT_DIR}/회비이력_샘플.xlsx`
  await duesWorkbook.xlsx.writeFile(duesPath)
  console.log(`  저장됨: ${duesPath}`)

  console.log('\n완료!')
  console.log('='.repeat(50))
  console.log(`회원_샘플.xlsx  : ${memberRows.length}행`)
  console.log(`회비이력_샘플.xlsx: ${duesRows.length}행`)
  console.log('')
  console.log('테스트 방법:')
  console.log('  1. /club/{클럽ID}/import 접속')
  console.log('  2. [회원 명부 임포트] 카드에서 회원_샘플.xlsx 업로드 → 18건 임포트')
  console.log('  3. [회비 이력 임포트] 카드에서 회비이력_샘플.xlsx 업로드')
  console.log('     ※ 회원 임포트 먼저 해야 이름 매칭됨')
}

main().catch(e => {
  console.error('오류:', e)
  process.exit(1)
})
