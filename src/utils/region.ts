import { REGIONS } from '../data/regions'
import { addressMatch } from './statistics'

export interface ResolvedRegion {
  group: string // 시도 (서울/경기도/강원도...)
  name: string // 시군구
}

// 주소 문자열을 전국 시군구 마스터와 대조해 (시도, 시군구) 로 분류.
// REGIONS 순서대로 첫 매칭을 채택 ('서울*중구' 같은 중복명 패턴 우선 처리됨).
export function resolveRegion(address: unknown): ResolvedRegion | null {
  for (const r of REGIONS) {
    if (addressMatch(address, r.pattern)) return { group: r.group, name: r.name }
  }
  return null
}
