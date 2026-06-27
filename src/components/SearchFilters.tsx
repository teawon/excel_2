import styles from './SearchFilters.module.css'

export interface Filters {
  query: string
  category: string
  payment: string
}

interface Props {
  filters: Filters
  categories: string[]
  payments: string[]
  onChange: (filters: Filters) => void
}

export function SearchFilters({ filters, categories, payments, onChange }: Props) {
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })

  return (
    <div className={styles.wrapper}>
      <input
        className={styles.search}
        type="text"
        placeholder="고객명 / 주소 검색..."
        value={filters.query}
        onChange={(e) => update({ query: e.target.value })}
      />
      <div className={styles.selects}>
        <select
          value={filters.category}
          onChange={(e) => update({ category: e.target.value })}
        >
          <option value="">분류 전체</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filters.payment}
          onChange={(e) => update({ payment: e.target.value })}
        >
          <option value="">납부방법 전체</option>
          {payments.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
