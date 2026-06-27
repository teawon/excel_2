import { useMemo, useState } from 'react'
import type { ExcelRow } from '../types/excel'
import { ResultsTable } from './ResultsTable'
import styles from './DataExplorer.module.css'

interface Props {
  rows: ExcelRow[]
}

interface Filters {
  query: string
  newspaper: string
  category: string
  payment: string
}

const EMPTY: Filters = { query: '', newspaper: '', category: '', payment: '' }

export function DataExplorer({ rows }: Props) {
  const [filters, setFilters] = useState<Filters>(EMPTY)

  const uniq = (field: string) =>
    [...new Set(rows.map((r) => String(r[field] ?? '')).filter(Boolean))].sort()

  const newspapers = useMemo(() => uniq('신문사'), [rows])
  const categories = useMemo(() => uniq('분류'), [rows])
  const payments = useMemo(() => uniq('납부방법'), [rows])

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (filters.newspaper && String(row['신문사'] ?? '') !== filters.newspaper) return false
      if (filters.category && String(row['분류'] ?? '') !== filters.category) return false
      if (filters.payment && String(row['납부방법'] ?? '') !== filters.payment) return false
      if (filters.query) {
        const q = filters.query.toLowerCase()
        const name = String(row['고객명'] ?? '').toLowerCase()
        const addr = String(row['주소'] ?? '').toLowerCase()
        if (!name.includes(q) && !addr.includes(q)) return false
      }
      return true
    })
  }, [rows, filters])

  const update = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }))
  const hasFilter = filters.query || filters.newspaper || filters.category || filters.payment

  return (
    <div className={styles.wrapper}>
      <div className={styles.head}>
        <h2>데이터 조회</h2>
        <p>전체 엑셀 데이터를 원하는 조건으로 필터링해서 확인합니다.</p>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.search}
          type="text"
          placeholder="고객명 / 주소 검색..."
          value={filters.query}
          onChange={(e) => update({ query: e.target.value })}
        />
        <select value={filters.newspaper} onChange={(e) => update({ newspaper: e.target.value })}>
          <option value="">신문사 전체</option>
          {newspapers.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <select value={filters.category} onChange={(e) => update({ category: e.target.value })}>
          <option value="">분류 전체</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={filters.payment} onChange={(e) => update({ payment: e.target.value })}>
          <option value="">납부방법 전체</option>
          {payments.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {hasFilter && (
          <button className={styles.clear} onClick={() => setFilters(EMPTY)}>
            필터 초기화
          </button>
        )}
      </div>

      <ResultsTable rows={filtered} total={rows.length} />
    </div>
  )
}
