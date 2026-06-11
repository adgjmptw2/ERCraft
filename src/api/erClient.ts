import type { MatchSummary, Paginated } from '@/types/match'
import type { PlayerStats, PlayerSummary } from '@/types/player'

import { MockEternalReturnClient } from '@/api/erClient.mock'
import { RealEternalReturnClient } from '@/api/erClient.real'

// BSER OpenAPI v11부터 userNum 조회가 폐지되어(닉네임 → uid는 백엔드에서만 해석)
// 클라이언트 인터페이스는 닉네임 키로 통일한다.
export interface EternalReturnClient {
  searchPlayers(nickname: string): Promise<PlayerSummary[]>
  fetchPlayerByNickname(nickname: string): Promise<PlayerSummary | null>
  fetchPlayerStats(nickname: string): Promise<PlayerStats>
  fetchMatchHistory(
    nickname: string,
    page: number,
    pageSize: number,
  ): Promise<Paginated<MatchSummary>>
}

/** VITE_API_BASE_URL 있으면 Real, 없으면 mock */
function hasBackendUrl(): boolean {
  return Boolean(import.meta.env.VITE_API_BASE_URL?.trim())
}

export function isRealMode(): boolean {
  return hasBackendUrl()
}

export function getClient(): EternalReturnClient {
  return hasBackendUrl() ? new RealEternalReturnClient() : new MockEternalReturnClient()
}
