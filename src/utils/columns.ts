import type { ExcelRow } from '../types/excel'

// 헤더가 비어있던 컬럼에 이름 부여
export const COLUMN_LABELS: Record<string, string> = {
  __EMPTY: '비고3',
  __EMPTY_1: '명단구분',
}

export interface Column {
  key: string
  label: string
}

// 엑셀 정리 시트의 원래 컬럼 순서를 그대로 유지
export function buildColumns(headers: string[]): Column[] {
  return headers.map((h) => ({ key: h, label: COLUMN_LABELS[h] ?? h }))
}

const NUMERIC_WON = new Set(['신문값'])

export function formatCell(key: string, value: ExcelRow[string]): string {
  if (NUMERIC_WON.has(key) && typeof value === 'number') {
    return `${value.toLocaleString()}원`
  }
  return String(value ?? '')
}

export function isStopped(row: ExcelRow): boolean {
  return Number(row['부수']) <= 0
}

// 신청일을 필터용 값으로 변환.
// - 날짜('YYYY.MM.DD')면 연도('YYYY')
// - 날짜가 아닌 입력값('기존' 등)이면 그 값 그대로
// - 비어있으면 null (필터 옵션에서 제외)
export function dateFilterKey(value: ExcelRow[string]): string | null {
  const s = String(value ?? '').trim()
  if (!s) return null
  const m = /^(\d{4})\./.exec(s)
  return m ? m[1] : s
}
