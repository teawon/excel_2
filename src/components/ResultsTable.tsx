import { useMemo } from 'react'
import type { ExcelRow } from '../types/excel'
import { buildColumns, formatCell, isStopped } from '../utils/columns'
import styles from './ResultsTable.module.css'

interface Props {
  rows: ExcelRow[]
  headers: string[]
}

export function ResultsTable({ rows, headers }: Props) {
  const columns = useMemo(() => buildColumns(headers), [headers])

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
                    {formatCell(col.key, row[col.key])}
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
