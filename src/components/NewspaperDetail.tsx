import { useMemo, useState } from 'react'
import type { ExcelRow } from '../types/excel'
import { RegionStatsTable } from './RegionStatsTable'
import { SearchFilters } from './SearchFilters'
import type { Filters } from './SearchFilters'
import { ResultsTable } from './ResultsTable'
import styles from './NewspaperDetail.module.css'

interface Props {
  rows: ExcelRow[]
  newspaper: string
}

type SubTab = 'region' | 'data'

export function NewspaperDetail({ rows, newspaper }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('region')
  const [filters, setFilters] = useState<Filters>({ query: '', category: '', payment: '' })

  const paperRows = useMemo(
    () => rows.filter((r) => String(r['신문사'] ?? '') === newspaper),
    [rows, newspaper],
  )

  const categories = useMemo(
    () => [...new Set(paperRows.map((r) => String(r['분류'] ?? '')).filter(Boolean))].sort(),
    [paperRows],
  )
  const payments = useMemo(
    () => [...new Set(paperRows.map((r) => String(r['납부방법'] ?? '')).filter(Boolean))].sort(),
    [paperRows],
  )

  const filtered = useMemo(() => {
    return paperRows.filter((row) => {
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
  }, [paperRows, filters])

  return (
    <div className={styles.wrapper}>
      <div className={styles.head}>
        <h2>{newspaper}</h2>
        <span className={styles.badge}>{paperRows.length.toLocaleString()}건</span>
      </div>

      <div className={styles.subtabs}>
        <button
          className={subTab === 'region' ? styles.active : ''}
          onClick={() => setSubTab('region')}
        >
          지역별 분류 통계
        </button>
        <button
          className={subTab === 'data' ? styles.active : ''}
          onClick={() => setSubTab('data')}
        >
          데이터 검색
        </button>
      </div>

      {subTab === 'region' ? (
        <RegionStatsTable rows={rows} newspaper={newspaper} />
      ) : (
        <div>
          <SearchFilters
            filters={filters}
            categories={categories}
            payments={payments}
            onChange={setFilters}
          />
          <ResultsTable rows={filtered} total={paperRows.length} />
        </div>
      )}
    </div>
  )
}
