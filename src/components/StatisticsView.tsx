import { useMemo, useState } from 'react'
import type { ExcelRow } from '../types/excel'
import { OverallStats } from './OverallStats'
import { RegionStatsTable } from './RegionStatsTable'
import styles from './StatisticsView.module.css'

interface Props {
  rows: ExcelRow[]
}

const OVERALL = '__overall__'

export function StatisticsView({ rows }: Props) {
  const [view, setView] = useState<string>(OVERALL)

  const newspapers = useMemo(
    () => [...new Set(rows.map((r) => String(r['신문사'] ?? '')).filter(Boolean))].sort(),
    [rows],
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.subtabs}>
        <button
          className={`${styles.subtab} ${view === OVERALL ? styles.active : ''}`}
          onClick={() => setView(OVERALL)}
        >
          📈 전체 통계
        </button>
        <div className={styles.divider} />
        {newspapers.map((paper) => (
          <button
            key={paper}
            className={`${styles.subtab} ${view === paper ? styles.active : ''}`}
            onClick={() => setView(paper)}
          >
            {paper}
          </button>
        ))}
      </div>

      {view === OVERALL ? (
        <OverallStats rows={rows} />
      ) : (
        <div className={styles.regionBox}>
          <div className={styles.regionHead}>
            <h2>{view}</h2>
            <span className={styles.regionDesc}>지역(시군구)별 분류 부수 집계</span>
          </div>
          <RegionStatsTable rows={rows} newspaper={view} />
        </div>
      )}
    </div>
  )
}
