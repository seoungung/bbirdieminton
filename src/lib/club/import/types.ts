/**
 * Excel 임포트 공통 타입 + 컬럼 정의
 */

export type ImportType = 'members' | 'dues'

export type MemberRow = {
  name: string
  phone?: string
  role?: 'owner' | 'manager' | 'member'
  skill_score?: number
  joined_at?: string // YYYY-MM-DD
  quiz_level?: '왕초보' | '초심자' | 'D조' | 'C조'
}

export type DuesRow = {
  name: string
  year: number
  month: number
  amount: number
  paid: boolean
  paid_at?: string // YYYY-MM-DD
  note?: string
}

export type ValidatedRow<T> = {
  row: T
  rowIndex: number // 1-based original Excel 행 번호 (헤더 제외)
  errors: string[]
  warnings: string[]
}

export type ImportResult = {
  success: boolean
  added: number
  skipped: number
  failed: number
  message?: string
  errorDetail?: string
}

// ── 컬럼 정의 ─────────────────────────────────────────

export type ColumnDef = {
  key: string
  header: string
  required: boolean
  width: number
  note?: string
}

export const MEMBER_COLUMNS: ColumnDef[] = [
  { key: 'name',        header: '이름',      required: true,  width: 15 },
  { key: 'phone',       header: '전화번호',  required: false, width: 18, note: '010-0000-0000 형식 권장 (중복 매칭용)' },
  { key: 'role',        header: '역할',      required: false, width: 10, note: 'owner / manager / member (기본: member)' },
  { key: 'skill_score', header: '실력점수',  required: false, width: 10, note: '0~2000 (기본: 1000)' },
  { key: 'joined_at',   header: '가입일',    required: false, width: 14, note: 'YYYY-MM-DD' },
  { key: 'quiz_level',  header: '레벨',      required: false, width: 10, note: '왕초보 / 초심자 / D조 / C조' },
]

export const DUES_COLUMNS: ColumnDef[] = [
  { key: 'name',    header: '이름',     required: true,  width: 15 },
  { key: 'year',    header: '연도',     required: true,  width: 8,  note: '예: 2026' },
  { key: 'month',   header: '월',       required: true,  width: 6,  note: '1~12' },
  { key: 'amount',  header: '금액',     required: true,  width: 12, note: '원 단위 숫자 (예: 30000)' },
  { key: 'paid',    header: '납부여부', required: true,  width: 10, note: 'Y 또는 N' },
  { key: 'paid_at', header: '납부일',   required: false, width: 14, note: 'YYYY-MM-DD (납부한 경우)' },
  { key: 'note',    header: '메모',     required: false, width: 20 },
]
