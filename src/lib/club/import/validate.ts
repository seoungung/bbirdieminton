import type { MemberRow, DuesRow, ValidatedRow } from './types'

// ── 공통 파서 헬퍼 ─────────────────────────────────────

const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

function normalizeString(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function normalizePhone(v: unknown): string {
  const s = normalizeString(v).replace(/\s/g, '')
  if (!s) return ''
  // 숫자만 있으면 포맷 자동 추가
  const digits = s.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  return s
}

function normalizeDate(v: unknown): string {
  if (!v) return ''
  if (v instanceof Date) {
    const y = v.getFullYear()
    const m = String(v.getMonth() + 1).padStart(2, '0')
    const d = String(v.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const s = normalizeString(v)
  if (!s) return ''
  // 자주 오는 다른 형식 변환: 2026/04/19 → 2026-04-19
  return s.replace(/[./]/g, '-').slice(0, 10)
}

function parseNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[,\s]/g, ''))
  return Number.isFinite(n) ? n : null
}

function parseBoolean(v: unknown): boolean | null {
  if (v === null || v === undefined) return null
  const s = normalizeString(v).toLowerCase()
  if (!s) return null
  if (['y', 'yes', '1', 'true', 'o', 'ㅇ', '납부', '완료'].includes(s)) return true
  if (['n', 'no', '0', 'false', 'x', 'ㄴ', '미납', '안함'].includes(s)) return false
  return null
}

// ── Member Row 검증 ─────────────────────────────────

export function validateMemberRow(raw: Record<string, unknown>, rowIndex: number): ValidatedRow<MemberRow> {
  const errors: string[] = []
  const warnings: string[] = []

  const name = normalizeString(raw['이름'] ?? raw['name'])
  const phone = normalizePhone(raw['전화번호'] ?? raw['phone'])
  const roleRaw = normalizeString(raw['역할'] ?? raw['role']).toLowerCase()
  const skillRaw = parseNumber(raw['실력점수'] ?? raw['skill_score'])
  const joinedAt = normalizeDate(raw['가입일'] ?? raw['joined_at'])
  const quizLevel = normalizeString(raw['레벨'] ?? raw['quiz_level'])

  if (!name) errors.push('이름은 필수입니다')
  if (name.length > 20) errors.push('이름은 20자 이내')

  if (phone && !PHONE_REGEX.test(phone)) warnings.push('전화번호 형식 확인 (010-0000-0000)')

  let role: MemberRow['role'] = 'member'
  if (roleRaw) {
    if (['owner', 'manager', 'member'].includes(roleRaw)) {
      role = roleRaw as MemberRow['role']
    } else {
      warnings.push(`역할 "${roleRaw}" 인식 불가 → member 로 설정`)
    }
  }

  let skill_score = 1000
  if (skillRaw !== null) {
    if (skillRaw < 0 || skillRaw > 2000) {
      warnings.push(`실력점수 ${skillRaw}은 범위 외 (0~2000) → 1000 으로 조정`)
    } else {
      skill_score = Math.round(skillRaw)
    }
  }

  if (joinedAt && !DATE_REGEX.test(joinedAt)) {
    warnings.push(`가입일 "${joinedAt}" 형식 오류 → 무시`)
  }

  let quiz_level: MemberRow['quiz_level'] | undefined
  if (quizLevel) {
    if (['왕초보', '초심자', 'D조', 'C조'].includes(quizLevel)) {
      quiz_level = quizLevel as MemberRow['quiz_level']
    } else {
      warnings.push(`레벨 "${quizLevel}" 인식 불가 → 비움`)
    }
  }

  return {
    row: {
      name,
      phone: phone || undefined,
      role,
      skill_score,
      joined_at: DATE_REGEX.test(joinedAt) ? joinedAt : undefined,
      quiz_level,
    },
    rowIndex,
    errors,
    warnings,
  }
}

// ── Dues Row 검증 ───────────────────────────────────

export function validateDuesRow(raw: Record<string, unknown>, rowIndex: number): ValidatedRow<DuesRow> {
  const errors: string[] = []
  const warnings: string[] = []

  const name = normalizeString(raw['이름'] ?? raw['name'])
  const year = parseNumber(raw['연도'] ?? raw['year'])
  const month = parseNumber(raw['월'] ?? raw['month'])
  const amount = parseNumber(raw['금액'] ?? raw['amount'])
  const paid = parseBoolean(raw['납부여부'] ?? raw['paid'])
  const paid_at = normalizeDate(raw['납부일'] ?? raw['paid_at'])
  const note = normalizeString(raw['메모'] ?? raw['note'])

  if (!name) errors.push('이름은 필수입니다')
  if (year === null) errors.push('연도는 필수입니다')
  else if (year < 2000 || year > 2100) errors.push(`연도 ${year} 범위 외`)

  if (month === null) errors.push('월은 필수입니다')
  else if (month < 1 || month > 12) errors.push(`월 ${month} 은 1~12 범위여야 합니다`)

  if (amount === null) errors.push('금액은 필수입니다')
  else if (amount < 0) errors.push('금액은 0 이상')

  if (paid === null) errors.push('납부여부는 Y 또는 N')

  if (paid_at && !DATE_REGEX.test(paid_at)) {
    warnings.push(`납부일 "${paid_at}" 형식 오류 → 무시`)
  }

  return {
    row: {
      name,
      year: year ?? 0,
      month: month ?? 0,
      amount: amount ?? 0,
      paid: paid ?? false,
      paid_at: DATE_REGEX.test(paid_at) ? paid_at : undefined,
      note: note || undefined,
    },
    rowIndex,
    errors,
    warnings,
  }
}
