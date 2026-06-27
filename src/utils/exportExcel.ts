import * as XLSX from 'xlsx'
import type { ExcelRow } from '../types/excel'
import { buildColumns } from './columns'

// 현재 결과(필터된 행)를 엑셀 파일로 다운로드.
// 컬럼 순서/라벨은 화면 표와 동일하게 유지 (__EMPTY → 비고3 등).
export function downloadExcel(rows: ExcelRow[], headers: string[], fileName = '검색결과.xlsx') {
  const columns = buildColumns(headers)

  const data = rows.map((row) => {
    const obj: Record<string, ExcelRow[string]> = {}
    for (const col of columns) obj[col.label] = row[col.key]
    return obj
  })

  const worksheet = XLSX.utils.json_to_sheet(data, { header: columns.map((c) => c.label) })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '검색결과')
  XLSX.writeFile(workbook, fileName)
}
