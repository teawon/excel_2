import type { ParsedData } from '../types/excel'
import styles from './SummaryStats.module.css'

interface Props {
  data: ParsedData
}

function getNumericStats(values: number[]) {
  if (!values.length) return null
  const sum = values.reduce((a, b) => a + b, 0)
  const avg = sum / values.length
  const sorted = [...values].sort((a, b) => a - b)
  return {
    count: values.length,
    sum: sum.toFixed(2),
    avg: avg.toFixed(2),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  }
}

export function SummaryStats({ data }: Props) {
  const numericColumns = data.headers.filter((h) => {
    const vals = data.rows.map((r) => r[h]).filter((v) => typeof v === 'number')
    return vals.length > 0
  })

  if (!numericColumns.length) return null

  return (
    <div className={styles.wrapper}>
      <h2>통계 요약</h2>
      <div className={styles.grid}>
        {numericColumns.map((col) => {
          const values = data.rows
            .map((r) => r[col])
            .filter((v) => typeof v === 'number') as number[]
          const stats = getNumericStats(values)
          if (!stats) return null
          return (
            <div key={col} className={styles.card}>
              <h3>{col}</h3>
              <ul>
                <li><span>개수</span><strong>{stats.count}</strong></li>
                <li><span>합계</span><strong>{stats.sum}</strong></li>
                <li><span>평균</span><strong>{stats.avg}</strong></li>
                <li><span>최솟값</span><strong>{stats.min}</strong></li>
                <li><span>최댓값</span><strong>{stats.max}</strong></li>
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
