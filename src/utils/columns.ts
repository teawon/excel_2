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
