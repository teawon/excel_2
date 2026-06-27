import styles from './FilterChips.module.css'

interface Props {
  label: string
  options: string[]
  selected: string[] // 빈 배열 = 전체
  onChange: (selected: string[]) => void
  multi?: boolean // true=다중선택, false=단일선택
  emphasize?: boolean // 강조 스타일 (신문사 등 핵심 필터)
  counts?: Record<string, number> // 옵션별 건수 (선택)
}

export function FilterChips({ label, options, selected, onChange, multi = true, emphasize = false, counts }: Props) {
  const isAll = selected.length === 0

  const toggle = (value: string) => {
    if (multi) {
      onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
    } else {
      onChange(selected.includes(value) ? [] : [value])
    }
  }

  return (
    <div className={`${styles.row} ${emphasize ? styles.emphasize : ''}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.chips}>
        <button
          className={`${styles.chip} ${styles.allChip} ${isAll ? styles.active : ''}`}
          onClick={() => onChange([])}
        >
          전체
        </button>
        {options.map((opt) => (
          <button
            key={opt}
            className={`${styles.chip} ${selected.includes(opt) ? styles.active : ''}`}
            onClick={() => toggle(opt)}
          >
            {opt}
            {counts && counts[opt] != null && <span className={styles.count}>{counts[opt]}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
