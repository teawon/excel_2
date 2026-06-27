import type { ExcelRow } from '../types/excel'
import { REGIONS, REGION_GROUPS } from '../data/regions'

// 통계표 카테고리 = 정리!분류(E) 값에 대한 SUMIFS 패턴.
// '*' 는 와일드카드 (본사* → 본사/본사수금/본사이체, 지로* → 지로/지로1년선납...).
export interface CategoryDef {
  key: string // 매칭 패턴 (와일드카드 포함)
  label: string // 화면 표시용
}

export const CATEGORIES: CategoryDef[] = [
  { key: '발행', label: '발행' },
  { key: '배달', label: '배달' },
  { key: '본사*', label: '본사' },
  { key: '우편', label: '우편' },
  { key: '이체', label: '이체' },
  { key: '지로*', label: '지로' },
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

// Excel SUMIFS 와일드카드 매칭: "*"&pattern&"*" 와 동일하게 동작.
// pattern 을 '*' 기준으로 나눠, 각 조각이 순서대로 포함되는지 확인.
export function wildcardMatch(value: unknown, pattern: string): boolean {
  const str = String(value ?? '')
  const segs = pattern.split('*').filter(Boolean)
  if (segs.length === 0) return true
  let idx = 0
  for (const seg of segs) {
    const found = str.indexOf(seg, idx)
    if (found < 0) return false
    idx = found + seg.length
  }
  return true
}

function busu(row: ExcelRow): number {
  const v = Number(row[FIELD.count])
  return Number.isFinite(v) ? v : 0
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
    const byCategory: Record<string, number> = {}
    let sum = 0
    for (const cat of CATEGORIES) {
      const v = prs
        .filter((r) => wildcardMatch(r[FIELD.category], cat.key))
        .reduce((a, r) => a + busu(r), 0)
      byCategory[cat.key] = v
      sum += v
    }
    return { newspaper: paper, total, byCategory, sum, diff: sum - total }
  })
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

  const calcRow = (filterFn: (r: ExcelRow) => boolean): { byCategory: Record<string, number>; sum: number } => {
    const subset = prs.filter(filterFn)
    const byCategory: Record<string, number> = {}
    let sum = 0
    for (const cat of CATEGORIES) {
      const v = subset
        .filter((r) => wildcardMatch(r[FIELD.category], cat.key))
        .reduce((a, r) => a + busu(r), 0)
      byCategory[cat.key] = v
      sum += v
    }
    return { byCategory, sum }
  }

  const national: RegionStatRow = { group: '전국', name: '전국', ...calcRow(() => true) }

  const regionRows: RegionStatRow[] = REGIONS.map((region) => {
    const { byCategory, sum } = calcRow((r) => wildcardMatch(r[FIELD.address], region.pattern))
    return { group: region.group, name: region.name, byCategory, sum }
  }).filter((r) => r.sum > 0) // 데이터 있는 지역만

  const groupOrder = REGION_GROUPS.filter((g) => regionRows.some((r) => r.group === g))

  return { national, rows: regionRows, groupOrder }
}
