import { useState } from 'react'
import { parseExcelFile } from '../utils/parseExcel'
import type { ParsedData } from '../types/excel'

export function useExcelParser() {
  const [data, setData] = useState<ParsedData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parse = async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const result = await parseExcelFile(file)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
  }

  return { data, loading, error, parse, reset }
}
