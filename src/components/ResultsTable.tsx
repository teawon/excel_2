import { useState } from 'react'
import type { ExcelRow } from '../types/excel'
import styles from './ResultsTable.module.css'

const COLUMNS: { key: string; label: string }[] = [
  { key: '연번', label: '연번' },
  { key: '신문사', label: '신문사' },
  { key: '고객명', label: '고객명' },
  { key: '주소', label: '주소' },
  { key: '분류', label: '분류' },
  { key: '납부방법', label: '납부방법' },
  { key: '부수', label: '부수' },
  { key: '신문값', label: '신문값' },
  { key: '신청일', label: '신청일' },
  { key: '중지일', label: '중지일' },
  { key: '전화번호', label: '전화번호' },
  { key: '휴대폰', label: '휴대폰' },
  { key: '비고', label: '비고' },
]

const PAGE_SIZE = 50

interface Props {
  rows: ExcelRow[]
  total: number
}

export function ResultsTable({ rows, total }: Props) {
  const [page, setPage] = useState(1)
  const pageCount = Math.ceil(rows.length / PAGE_SIZE)
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className={styles.wrapper}>
      <div className={styles.meta}>
        <span>
          전체 <strong>{total}</strong>건 중 <strong>{rows.length}</strong>건 검색됨
        </span>
        {pageCount > 1 && (
          <div className={styles.pagination}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
            <span>{page} / {pageCount}</span>
            <button disabled={page === pageCount} onClick={() => setPage(page + 1)}>›</button>
          </div>
        )}
      </div>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className={styles.empty}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr key={i}>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className={col.key === '주소' ? styles.address : undefined}>
                      {col.key === '신문값' && typeof row[col.key] === 'number'
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
    </div>
  )
}
