export type ExcelRow = Record<string, string | number | boolean | null>

export interface ParsedData {
  headers: string[]
  rows: ExcelRow[]
  fileName: string
}
