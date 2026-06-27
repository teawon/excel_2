import * as XLSX from 'xlsx'
import type { ParsedData } from '../types/excel'

const PREFERRED_SHEET = '정리'

function excelSerialToDate(serial: number): string {
  const date = new Date(Math.round((serial - 25569) * 86400 * 1000))
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const DATE_COLUMNS = new Set(['신청일', '중지일', '종료 일자'])

function normalizeRow(row: Record<string, unknown>): Record<string, string | number | boolean | null> {
  const result: Record<string, string | number | boolean | null> = {}
  for (const [key, val] of Object.entries(row)) {
    if (DATE_COLUMNS.has(key) && typeof val === 'number') {
      result[key] = excelSerialToDate(val)
    } else {
      result[key] = val as string | number | boolean | null
    }
  }
  return result
}

export function parseExcelFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames.includes(PREFERRED_SHEET)
          ? PREFERRED_SHEET
          : workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const raw = XLSX.utils.sheet_to_json(sheet, { defval: null }) as Record<string, unknown>[]
        const rows = raw.map(normalizeRow).filter(r => r['고객명'] || r['신문사'])
        const headers = rows.length > 0 ? Object.keys(rows[0]) : []
        resolve({ headers, rows, fileName: file.name, sheetName })
      } catch {
        reject(new Error('엑셀 파일을 파싱할 수 없습니다.'))
      }
    }
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
    reader.readAsArrayBuffer(file)
  })
}
