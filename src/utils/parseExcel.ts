import * as XLSX from 'xlsx'
import type { ParsedData } from '../types/excel'

export function parseExcelFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: null })
        const headers = rows.length > 0 ? Object.keys(rows[0] as object) : []
        resolve({ headers, rows: rows as ParsedData['rows'], fileName: file.name })
      } catch {
        reject(new Error('엑셀 파일을 파싱할 수 없습니다.'))
      }
    }
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
    reader.readAsArrayBuffer(file)
  })
}
