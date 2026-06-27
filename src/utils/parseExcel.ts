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
      let workbook: XLSX.WorkBook
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        workbook = XLSX.read(data, { type: 'array' })
      } catch {
        reject(new Error('엑셀 파일을 읽을 수 없습니다. 올바른 엑셀(.xlsx/.xls/.xlsm) 파일인지 확인해 주세요.'))
        return
      }

      // '정리' 시트가 반드시 있어야 함
      if (!workbook.SheetNames.includes(PREFERRED_SHEET)) {
        const found = workbook.SheetNames.length
          ? `(이 파일의 시트: ${workbook.SheetNames.join(', ')})`
          : ''
        reject(
          new Error(`'${PREFERRED_SHEET}' 시트를 찾을 수 없습니다. '${PREFERRED_SHEET}' 탭이 있는 엑셀 파일을 올려주세요. ${found}`),
        )
        return
      }

      const sheet = workbook.Sheets[PREFERRED_SHEET]
      const raw = XLSX.utils.sheet_to_json(sheet, { defval: null }) as Record<string, unknown>[]
      const rows = raw.map(normalizeRow).filter((r) => r['고객명'] || r['신문사'])

      if (rows.length === 0) {
        reject(new Error(`'${PREFERRED_SHEET}' 시트에 데이터가 없습니다. 내용을 확인해 주세요.`))
        return
      }

      const headers = Object.keys(rows[0])
      resolve({ headers, rows, fileName: file.name, sheetName: PREFERRED_SHEET })
    }
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
    reader.readAsArrayBuffer(file)
  })
}
