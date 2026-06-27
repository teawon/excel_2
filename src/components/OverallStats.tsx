import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { ExcelRow } from '../types/excel'
import { CATEGORIES, computeOverallStats } from '../utils/statistics'
import styles from './OverallStats.module.css'

interface Props {
  rows: ExcelRow[]
}

export function OverallStats({ rows }: Props) {
  const stats = useMemo(() => computeOverallStats(rows), [rows])

  const totals = useMemo(() => {
    const byCat: Record<string, number> = {}
    let total = 0
    let sum = 0
    for (const cat of CATEGORIES) byCat[cat.key] = 0
    for (const s of stats) {
      total += s.total
      sum += s.sum
      for (const cat of CATEGORIES) byCat[cat.key] += s.byCategory[cat.key]
    }
    return { total, sum, byCat, diff: sum - total }
  }, [stats])

  const chartData = useMemo(
    () => stats.map((s) => ({ name: s.newspaper, 총부수: s.total })).sort((a, b) => b.총부수 - a.총부수),
    [stats],
  )

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>전체 통계표</h2>
      <p className={styles.desc}>신문사별 부수를 분류 카테고리로 집계합니다. (값 = 부수 합계)</p>

      <div className={styles.chartBox}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="총부수" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.sticky}>신문사</th>
              <th>총부수</th>
              {CATEGORIES.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              <th>합계</th>
              <th>차</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.newspaper}>
                <td className={styles.sticky}>{s.newspaper}</td>
                <td className={styles.num}>{s.total.toLocaleString()}</td>
                {CATEGORIES.map((c) => (
                  <td key={c.key} className={styles.num}>
                    {s.byCategory[c.key] || ''}
                  </td>
                ))}
                <td className={styles.num}>{s.sum.toLocaleString()}</td>
                <td className={`${styles.num} ${s.diff !== 0 ? styles.diff : ''}`}>{s.diff || ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className={styles.sticky}>합계</td>
              <td className={styles.num}>{totals.total.toLocaleString()}</td>
              {CATEGORIES.map((c) => (
                <td key={c.key} className={styles.num}>
                  {totals.byCat[c.key] || ''}
                </td>
              ))}
              <td className={styles.num}>{totals.sum.toLocaleString()}</td>
              <td className={`${styles.num} ${totals.diff !== 0 ? styles.diff : ''}`}>{totals.diff || ''}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className={styles.note}>
        ※ <strong>차</strong> = 합계 − 총부수. 중지·향토지 등 9개 카테고리에 속하지 않는 부수입니다.
      </p>
    </div>
  )
}
