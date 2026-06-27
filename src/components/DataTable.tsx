import type { ParsedData } from '../types/excel'
import styles from './DataTable.module.css'

interface Props {
  data: ParsedData
}

export function DataTable({ data }: Props) {
  const preview = data.rows.slice(0, 50)

  return (
    <div className={styles.wrapper}>
      <p className={styles.meta}>
        총 <strong>{data.rows.length}</strong>행 · {data.headers.length}열
        {data.rows.length > 50 && ' (상위 50행 미리보기)'}
      </p>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {data.headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i}>
                {data.headers.map((h) => (
                  <td key={h}>{String(row[h] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
