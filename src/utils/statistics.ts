import type { ExcelRow } from '../types/excel'
import { REGIONS, REGION_GROUPS } from '../data/regions'

// 통계표 카테고리 = 정리!분류(E) 값에 대한 SUMIFS 기준.
// '*' 는 와일드카드. (본사* → 본사/본사수금/본사이체, 지로* → 지로/지로1년선납...)
// 유가는 현재 데이터엔 없지만(분류값에 정확히 "유가" 없음) 추후 생길 수 있어 컬럼을 유지.
export interface CategoryDef {
  key: string // 매칭 패턴 (와일드카드 포함 가능)
  label: string // 화면 표시용
}

export const CATEGORIES: CategoryDef[] = [
  { key: '발행', label: '발행' },
  { key: '배달', label: '배달' },
  { key: '본사*', label: '본사' },
  { key: '우편', label: '우편' },
  { key: '이체', label: '이체' },
  { key: '지로*', label: '지로' },
  { key: '유가', label: '유가' },
  { key: '투입*유*', label: '투입(유)' },
  { key: '투입*무*', label: '투입(무)' },
  { key: '카드*', label: '카드' },
]

const FIELD = {
  newspaper: '신문사',
  category: '분류',
  count: '부수',
  address: '주소',
} as const

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 분류 카테고리 매칭 = Excel SUMIFS 텍스트 기준 의미.
// 와일드카드 없으면 정확 일치(예: '이체'는 '본사이체'를 잡지 않음),
// '*' 가 있으면 해당 위치에 임의 문자열 허용하고 앞뒤로 앵커링(예: '본사*' = 본사로 시작).
export function categoryMatch(value: unknown, pattern: string): boolean {
  const str = String(value ?? '')
  const re = new RegExp('^' + pattern.split('*').map(escapeRegex).join('.*') + '$')
  return re.test(str)
}

// 주소(지역) 매칭 = 원본 수식 "*"&패턴&"*" 의미 = 부분 포함.
// 패턴 내부의 '*' 도 와일드카드(예: '서울*중구' = 주소에 '서울' 다음 '중구' 포함).
export function addressMatch(value: unknown, pattern: string): boolean {
  const str = String(value ?? '')
  const re = new RegExp(pattern.split('*').map(escapeRegex).join('.*'))
  return re.test(str)
}

function busu(row: ExcelRow): number {
  const v = Number(row[FIELD.count])
  return Number.isFinite(v) ? v : 0
}

function sumByCategories(rows: ExcelRow[]): { byCategory: Record<string, number>; sum: number } {
  const byCategory: Record<string, number> = {}
  let sum = 0
  for (const cat of CATEGORIES) {
    const v = rows
      .filter((r) => categoryMatch(r[FIELD.category], cat.key))
      .reduce((a, r) => a + busu(r), 0)
    byCategory[cat.key] = v
    sum += v
  }
  return { byCategory, sum }
}

export interface NewspaperStat {
  newspaper: string
  total: number // 총부수 (분류 무관 부수 합계)
  byCategory: Record<string, number>
  sum: number // 카테고리 합계
  diff: number // 합계 - 총부수 (중지 등 미분류분)
}

/** 신문사 × 카테고리 전체 통계표 */
export function computeOverallStats(rows: ExcelRow[]): NewspaperStat[] {
  const papers = [...new Set(rows.map((r) => String(r[FIELD.newspaper] ?? '')).filter(Boolean))].sort()
  return papers.map((paper) => {
    const prs = rows.filter((r) => String(r[FIELD.newspaper] ?? '') === paper)
    const total = prs.reduce((a, r) => a + busu(r), 0)
    const { byCategory, sum } = sumByCategories(prs)
    return { newspaper: paper, total, byCategory, sum, diff: sum - total }
  })
}

export interface UnclassifiedGroup {
  category: string // 분류 값 (없으면 '(분류 없음)')
  count: number // 행 수
  busuSum: number // 부수 합계 (통계에서 누락된 양)
}

export interface UnclassifiedResult {
  groups: UnclassifiedGroup[]
  rows: ExcelRow[]
  totalCount: number
  totalBusu: number
}

// 어떤 카테고리에도 속하지 않는(통계에 집계되지 않는) 분류값을 찾는다.
// '중지'처럼 부수 0인 값은 통계에 영향이 없지만, 부수>0 인데 미분류면 데이터 오류 가능성.
export function findUnclassified(rows: ExcelRow[]): UnclassifiedResult {
  const isClassified = (row: ExcelRow) =>
    CATEGORIES.some((c) => categoryMatch(row[FIELD.category], c.key))

  const bad = rows.filter((r) => !isClassified(r))

  const map = new Map<string, { count: number; busu: number }>()
  for (const r of bad) {
    const raw = r[FIELD.category]
    const key = raw == null || String(raw).trim() === '' ? '(분류 없음)' : String(raw)
    const g = map.get(key) ?? { count: 0, busu: 0 }
    g.count += 1
    g.busu += busu(r)
    map.set(key, g)
  }

  const groups = [...map.entries()]
    .map(([category, v]) => ({ category, count: v.count, busuSum: v.busu }))
    .sort((a, b) => b.busuSum - a.busuSum || b.count - a.count)

  return {
    groups,
    rows: bad,
    totalCount: bad.length,
    totalBusu: bad.reduce((a, r) => a + busu(r), 0),
  }
}

export interface RegionStatRow {
  group: string
  name: string
  byCategory: Record<string, number>
  sum: number
}

export interface RegionStats {
  national: RegionStatRow // 전국 (이 신문사 전체)
  rows: RegionStatRow[] // 지역별 (값이 있는 지역만)
  groupOrder: string[]
}

/** 특정 신문사의 지역(시군구) × 카테고리 통계 */
export function computeRegionStats(rows: ExcelRow[], newspaper: string): RegionStats {
  const prs = rows.filter((r) => String(r[FIELD.newspaper] ?? '') === newspaper)

  const nat = sumByCategories(prs)
  const national: RegionStatRow = { group: '전국', name: '전국', byCategory: nat.byCategory, sum: nat.sum }

  const regionRows: RegionStatRow[] = REGIONS.map((region) => {
    const subset = prs.filter((r) => addressMatch(r[FIELD.address], region.pattern))
    const { byCategory, sum } = sumByCategories(subset)
    return { group: region.group, name: region.name, byCategory, sum }
  }).filter((r) => r.sum > 0) // 데이터 있는 지역만

  const groupOrder = REGION_GROUPS.filter((g) => regionRows.some((r) => r.group === g))

  return { national, rows: regionRows, groupOrder }
}
