import { useMemo, useState } from 'react'
import type { ExcelRow } from '../types/excel'
import { ResultsTable } from './ResultsTable'
import { ListModal } from './ListModal'
import { FilterChips } from './FilterChips'
import { downloadExcel } from '../utils/exportExcel'
import { dateFilterKey, dateToNumber, isoToNumber } from '../utils/columns'
import { resolveRegion } from '../utils/region'
import { REGION_GROUPS } from '../data/regions'
import styles from './DataExplorer.module.css'

interface Props {
  rows: ExcelRow[]
  headers: string[]
}

interface RowWithRegion {
  row: ExcelRow
  group: string | null
  sigungu: string | null
  year: string | null
  dateNum: number | null // 신청일 (YYYYMMDD)
  endDateNum: number | null // 종료 일자 (YYYYMMDD)
}

type DateMode = 'chips' | 'range'

export function DataExplorer({ rows, headers }: Props) {
  const [newspapers, setNewspapers] = useState<string[]>([])
  const [sido, setSido] = useState<string[]>([]) // 단일 선택 (배열로 관리)
  const [sigungu, setSigungu] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [years, setYears] = useState<string[]>([])
  const [dateMode, setDateMode] = useState<DateMode>('range')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [endFrom, setEndFrom] = useState('') // 종료일자 범위
  const [endTo, setEndTo] = useState('')
  const [status, setStatus] = useState<string[]>([]) // [] 전체 / ['정상'] / ['중지']
  const [query, setQuery] = useState('')
  const [listOpen, setListOpen] = useState(false)

  // 각 행의 지역(주소→시도/시군구) + 신청일(연도키/숫자)을 1회 계산
  const enriched = useMemo<RowWithRegion[]>(
    () =>
      rows.map((row) => {
        const r = resolveRegion(row['주소'])
        return {
          row,
          group: r?.group ?? null,
          sigungu: r?.name ?? null,
          year: dateFilterKey(row['신청일']),
          dateNum: dateToNumber(row['신청일']),
          endDateNum: dateToNumber(row['종료 일자']),
        }
      }),
    [rows],
  )

  // 옵션 목록 + 건수
  const newspaperOpts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const { row } of enriched) {
      const n = String(row['신문사'] ?? '')
      if (n) counts[n] = (counts[n] || 0) + 1
    }
    return { list: Object.keys(counts).sort(), counts }
  }, [enriched])

  const sidoOpts = useMemo(() => {
    const present = new Set(enriched.map((e) => e.group).filter(Boolean) as string[])
    return REGION_GROUPS.filter((g) => present.has(g))
  }, [enriched])

  const sigunguOpts = useMemo(() => {
    if (sido.length === 0) return []
    const set = new Set<string>()
    for (const e of enriched) {
      if (e.group && sido.includes(e.group) && e.sigungu) set.add(e.sigungu)
    }
    return [...set].sort()
  }, [enriched, sido])

  const categoryOpts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const { row } of enriched) {
      const c = String(row['분류'] ?? '')
      if (c) counts[c] = (counts[c] || 0) + 1
    }
    // 자주 쓰는 분류부터
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])
  }, [enriched])

  const yearOpts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of enriched) {
      if (e.year) counts[e.year] = (counts[e.year] || 0) + 1
    }
    // 연도(4자리 숫자)를 먼저 오름차순, 그 뒤에 '기존' 등 텍스트 값을 가나다순
    const list = Object.keys(counts).sort((a, b) => {
      const na = /^\d{4}$/.test(a)
      const nb = /^\d{4}$/.test(b)
      if (na && nb) return Number(a) - Number(b)
      if (na) return -1
      if (nb) return 1
      return a.localeCompare(b, 'ko')
    })
    return { list, counts }
  }, [enriched])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return enriched
      .filter((e) => {
        const { row } = e
        if (newspapers.length && !newspapers.includes(String(row['신문사'] ?? ''))) return false
        if (sido.length && !(e.group && sido.includes(e.group))) return false
        if (sigungu.length && !(e.sigungu && sigungu.includes(e.sigungu))) return false
        if (categories.length && !categories.includes(String(row['분류'] ?? ''))) return false
        // 신청일: 칩(연도/값) 모드 vs 기간 지정 모드
        if (dateMode === 'chips') {
          if (years.length && !(e.year && years.includes(e.year))) return false
        } else {
          // 신청일 범위
          const f = isoToNumber(dateFrom)
          const t = isoToNumber(dateTo)
          if (f !== null && (e.dateNum === null || e.dateNum < f)) return false
          if (t !== null && (e.dateNum === null || e.dateNum > t)) return false
          // 종료일자 범위 (독립적으로 조합)
          const ef = isoToNumber(endFrom)
          const et = isoToNumber(endTo)
          if (ef !== null && (e.endDateNum === null || e.endDateNum < ef)) return false
          if (et !== null && (e.endDateNum === null || e.endDateNum > et)) return false
        }
        if (status.length) {
          const stopped = Number(row['부수']) <= 0
          if (status[0] === '중지' && !stopped) return false
          if (status[0] === '정상' && stopped) return false
        }
        if (q) {
          const name = String(row['고객명'] ?? '').toLowerCase()
          const addr = String(row['주소'] ?? '').toLowerCase()
          const phone = String(row['휴대폰'] ?? '') + String(row['전화번호'] ?? '')
          if (!name.includes(q) && !addr.includes(q) && !phone.includes(q)) return false
        }
        return true
      })
      .map((e) => e.row)
  }, [enriched, newspapers, sido, sigungu, categories, years, dateMode, dateFrom, dateTo, endFrom, endTo, status, query])

  const stoppedCount = useMemo(() => enriched.filter((e) => Number(e.row['부수']) <= 0).length, [enriched])

  // 검색 결과 신문값 총액
  const totalAmount = useMemo(
    () => filtered.reduce((sum, row) => sum + (Number(row['신문값']) || 0), 0),
    [filtered],
  )

  // 시도 변경 시 시군구 초기화
  const onSidoChange = (next: string[]) => {
    setSido(next)
    setSigungu([])
  }

  const dateActive =
    dateMode === 'chips'
      ? years.length
      : (dateFrom ? 1 : 0) + (dateTo ? 1 : 0) + (endFrom ? 1 : 0) + (endTo ? 1 : 0)
  const activeCount =
    newspapers.length + sido.length + sigungu.length + categories.length + dateActive + status.length + (query ? 1 : 0)

  const resetAll = () => {
    setNewspapers([])
    setSido([])
    setSigungu([])
    setCategories([])
    setYears([])
    setDateFrom('')
    setDateTo('')
    setEndFrom('')
    setEndTo('')
    setStatus([])
    setQuery('')
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.head}>
        <h2>데이터 조회</h2>
        <p>원하는 조건을 눌러서 데이터를 찾아보세요. 여러 개를 함께 선택할 수 있습니다.</p>
      </div>

      <div className={styles.panel}>
        <FilterChips
          label="신문사"
          options={newspaperOpts.list}
          counts={newspaperOpts.counts}
          selected={newspapers}
          onChange={setNewspapers}
          multi
          emphasize
        />

        <FilterChips label="지역" options={sidoOpts} selected={sido} onChange={onSidoChange} multi={false} />

        {sido.length > 0 && sigunguOpts.length > 0 && (
          <FilterChips
            label="시군구"
            options={sigunguOpts}
            selected={sigungu}
            onChange={setSigungu}
            multi
          />
        )}

        <FilterChips label="분류" options={categoryOpts} selected={categories} onChange={setCategories} multi />

        <div className={styles.dateBlock}>
          <div className={styles.dateHead}>
            <span className={styles.dateTitle}>날짜</span>
            <div className={styles.modeToggle}>
              <button
                className={dateMode === 'range' ? styles.modeOn : ''}
                onClick={() => setDateMode('range')}
              >
                기간 지정
              </button>
              <button
                className={dateMode === 'chips' ? styles.modeOn : ''}
                onClick={() => setDateMode('chips')}
              >
                신청연도 선택
              </button>
            </div>
          </div>

          {dateMode === 'chips' ? (
            yearOpts.list.length > 0 ? (
              <FilterChips
                label="신청연도"
                options={yearOpts.list}
                counts={yearOpts.counts}
                selected={years}
                onChange={setYears}
                multi
              />
            ) : (
              <p className={styles.dateEmpty}>신청일 데이터가 없습니다.</p>
            )
          ) : (
            <div className={styles.rangeGroup}>
              <div className={styles.rangeRow}>
                <span className={styles.rangeLabel}>신청일</span>
                <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => setDateFrom(e.target.value)} />
                <span className={styles.tilde}>~</span>
                <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div className={styles.rangeRow}>
                <span className={styles.rangeLabel}>종료일</span>
                <input type="date" value={endFrom} max={endTo || undefined} onChange={(e) => setEndFrom(e.target.value)} />
                <span className={styles.tilde}>~</span>
                <input type="date" value={endTo} min={endFrom || undefined} onChange={(e) => setEndTo(e.target.value)} />
              </div>
              {(dateFrom || dateTo || endFrom || endTo) && (
                <button
                  className={styles.rangeClear}
                  onClick={() => { setDateFrom(''); setDateTo(''); setEndFrom(''); setEndTo('') }}
                >
                  날짜 지우기
                </button>
              )}
            </div>
          )}
        </div>

        <FilterChips
          label="상태"
          options={['정상', '중지']}
          counts={{ 정상: rows.length - stoppedCount, 중지: stoppedCount }}
          selected={status}
          onChange={setStatus}
          multi={false}
        />

        <div className={styles.searchRow}>
          <div className={styles.searchLabel}>검색</div>
          <input
            className={styles.search}
            type="text"
            placeholder="고객명 · 주소 · 전화번호로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.statusBar}>
        <div className={styles.resultCount}>
          전체 <strong>{rows.length.toLocaleString()}</strong>건 중{' '}
          <strong className={styles.hl}>{filtered.length.toLocaleString()}</strong>건
          <span className={styles.amount}>
            신문값 합계 <strong>{totalAmount.toLocaleString()}원</strong>
          </span>
        </div>
        <div className={styles.statusActions}>
          <button className={styles.bigView} onClick={() => setListOpen(true)} disabled={filtered.length === 0}>
            🔍 크게 보기
          </button>
          <button
            className={styles.download}
            onClick={() => downloadExcel(filtered, headers)}
            disabled={filtered.length === 0}
          >
            ⬇ 엑셀 다운로드
          </button>
          {activeCount > 0 && (
            <button className={styles.reset} onClick={resetAll}>
              ✕ 필터 초기화 ({activeCount})
            </button>
          )}
        </div>
      </div>

      <ResultsTable rows={filtered} headers={headers} />

      {listOpen && (
        <ListModal rows={filtered} headers={headers} onClose={() => setListOpen(false)} />
      )}
    </div>
  )
}
