import { useMemo, useState } from 'react'
import type { ExcelRow } from '../types/excel'
import { findUnclassified } from '../utils/statistics'
import { ListModal } from './ListModal'
import styles from './DataQualityPanel.module.css'

interface Props {
  rows: ExcelRow[]
  headers: string[]
}

export function DataQualityPanel({ rows, headers }: Props) {
  const [open, setOpen] = useState(false)
  const result = useMemo(() => findUnclassified(rows), [rows])

  // 부수>0 인데 미분류 = 통계에서 실제로 누락된(점검 필요) 건
  const affecting = result.groups.filter((g) => g.busuSum > 0)

  if (result.totalCount === 0) {
    return (
      <div className={`${styles.panel} ${styles.ok}`}>
        ✓ 모든 분류값이 정상적으로 통계에 집계되었습니다.
      </div>
    )
  }

  return (
    <div className={`${styles.panel} ${styles.warn}`}>
      <div className={styles.head}>
        <span className={styles.title}>⚠ 데이터 점검</span>
        <button className={styles.viewBtn} onClick={() => setOpen(true)}>
          해당 행 보기 ({result.totalCount}건)
        </button>
      </div>

      <p className={styles.desc}>
        통계 카테고리에 속하지 않아 <strong>집계에서 빠진 분류값</strong>입니다.
        {affecting.length > 0 && (
          <> 특히 부수가 있는 값은 <strong>오타·입력 오류</strong>일 수 있으니 원본을 확인해 보세요.</>
        )}
      </p>

      <div className={styles.chips}>
        {result.groups.map((g) => (
          <span
            key={g.category}
            className={`${styles.chip} ${g.busuSum > 0 ? styles.chipAlert : ''}`}
            title={g.busuSum > 0 ? '부수가 있어 통계에서 누락됨' : '부수 0 (통계 영향 없음)'}
          >
            {g.category}
            <span className={styles.chipCount}>
              {g.count}건{g.busuSum > 0 ? ` · ${g.busuSum}부` : ''}
            </span>
          </span>
        ))}
      </div>

      {open && (
        <ListModal
          rows={result.rows}
          headers={headers}
          title="점검 대상 (미분류 데이터)"
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
