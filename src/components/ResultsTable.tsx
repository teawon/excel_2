import { useMemo } from 'react'
import type { ExcelRow } from '../types/excel'
import styles from './ResultsTable.module.css'

interface Props {
  rows: ExcelRow[]
  headers: string[]
}

// 헤더가 비어있던 컬럼에 이름 부여
const LABELS: Record<string, string> = {
  __EMPTY: '비고3',
  __EMPTY_1: '명단구분',
}

const NUMERIC_WON = new Set(['신문값'])

function isStopped(row: ExcelRow): boolean {
  return Number(row['부수']) <= 0
}

export function ResultsTable({ rows, headers }: Props) {
  // 엑셀 정리 시트의 원래 컬럼 순서를 그대로 유지
  const columns = useMemo(
    () => headers.map((h) => ({ key: h, label: LABELS[h] ?? h })),
    [headers],
  )

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                검색 결과가 없습니다.
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className={isStopped(row) ? styles.stopped : undefined}>
                {columns.map((col) => (
                  <td key={col.key} className={col.key === '주소' ? styles.address : undefined}>
                    {NUMERIC_WON.has(col.key) && typeof row[col.key] === 'number'
                      ? `${Number(row[col.key]).toLocaleString()}원`
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
