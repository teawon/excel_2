import { useMemo } from 'react'
import type { ExcelRow } from '../types/excel'
import { CATEGORIES, computeRegionStats } from '../utils/statistics'
import styles from './RegionStatsTable.module.css'

interface Props {
  rows: ExcelRow[]
  newspaper: string
}

export function RegionStatsTable({ rows, newspaper }: Props) {
  const { national, rows: regionRows, groupOrder } = useMemo(
    () => computeRegionStats(rows, newspaper),
    [rows, newspaper],
  )

  if (regionRows.length === 0) {
    return <p className={styles.empty}>{newspaper}의 지역별 데이터가 없습니다.</p>
  }

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.stickyGroup}>지역</th>
            <th className={styles.stickyName}>시군구</th>
            {CATEGORIES.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            <th>합계</th>
          </tr>
        </thead>
        <tbody>
          <tr className={styles.national}>
            <td className={styles.stickyGroup} colSpan={2}>전국 (전체)</td>
            {CATEGORIES.map((c) => (
              <td key={c.key} className={styles.num}>{national.byCategory[c.key] || ''}</td>
            ))}
            <td className={styles.num}>{national.sum.toLocaleString()}</td>
          </tr>
          {groupOrder.map((group) => {
            const inGroup = regionRows.filter((r) => r.group === group)
            return inGroup.map((r, i) => (
              <tr key={`${group}-${r.name}`}>
                {i === 0 ? (
                  <td className={styles.stickyGroup} rowSpan={inGroup.length}>{group}</td>
                ) : null}
                <td className={styles.stickyName}>{r.name}</td>
                {CATEGORIES.map((c) => (
                  <td key={c.key} className={styles.num}>{r.byCategory[c.key] || ''}</td>
                ))}
                <td className={styles.num}>{r.sum.toLocaleString()}</td>
              </tr>
            ))
          })}
        </tbody>
      </table>
    </div>
  )
}
