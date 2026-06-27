import { useEffect, useMemo, useState } from 'react'
import type { ExcelRow } from '../types/excel'
import { buildColumns, formatCell, isStopped } from '../utils/columns'
import styles from './ListModal.module.css'

interface Props {
  rows: ExcelRow[]
  headers: string[]
  onClose: () => void
}

// 카드 제목/태그로 따로 빼는 컬럼 (본문 그리드에서는 제외)
const TITLE_KEY = '고객명'
const TAG_KEY = '신문사'

export function ListModal({ rows, headers, onClose }: Props) {
  const [query, setQuery] = useState('')
  const columns = useMemo(
    () => buildColumns(headers).filter((c) => c.key !== TITLE_KEY && c.key !== TAG_KEY),
    [headers],
  )

  // 모달 내 빠른 검색 (고객명/주소)
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const name = String(r[TITLE_KEY] ?? '').toLowerCase()
      const addr = String(r['주소'] ?? '').toLowerCase()
      return name.includes(q) || addr.includes(q)
    })
  }, [rows, query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            전체 목록 <span className={styles.count}>{visible.length.toLocaleString()}건</span>
          </h3>
          <input
            className={styles.search}
            type="text"
            placeholder="이 목록에서 고객명·주소 빠른 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className={styles.close} onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <div className={styles.body}>
          {visible.length === 0 ? (
            <p className={styles.empty}>결과가 없습니다.</p>
          ) : (
            visible.map((row, i) => (
              <div key={i} className={`${styles.card} ${isStopped(row) ? styles.stopped : ''}`}>
                <div className={styles.cardHead}>
                  <span className={styles.cardTitle}>{String(row[TITLE_KEY] ?? '—')}</span>
                  {row[TAG_KEY] && <span className={styles.tag}>{String(row[TAG_KEY])}</span>}
                  {isStopped(row) && <span className={`${styles.tag} ${styles.stopTag}`}>중지</span>}
                </div>
                <dl className={styles.grid}>
                  {columns.map((col) => {
                    const value = formatCell(col.key, row[col.key])
                    return (
                      <div key={col.key} className={styles.field}>
                        <dt className={styles.label}>{col.label}</dt>
                        <dd className={styles.value}>
                          {value || <span className={styles.muted}>—</span>}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
