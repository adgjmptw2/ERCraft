import type { MatchSummary, Paginated } from '@/types/match'
import type { PlayerStats, PlayerSummary } from '@/types/player'

import { MockEternalReturnClient } from '@/api/erClient.mock'
import { RealEternalReturnClient } from '@/api/erClient.real'

export interface EternalReturnClient {
  searchPlayers(nickname: string): Promise<PlayerSummary[]>
  fetchPlayerByNickname(nickname: string): Promise<PlayerSummary | null>
  /** userNum → tier까지 포함된 요약. DTO 합성용. 실 API 붙으면 /players/by-user/{num} 쪽 */
  fetchPlayerByUserNum(userNum: number): Promise<PlayerSummary | null>
  fetchPlayerStats(userNum: number): Promise<PlayerStats>
  fetchMatchHistory(
    userNum: number,
    page: number,
    pageSize: number,
  ): Promise<Paginated<MatchSummary>>
}

function hasApiKey(): boolean {
  return Boolean(import.meta.env.VITE_BSER_API_KEY?.trim())
}

export function isRealMode(): boolean {
  return hasApiKey()
}

export function getClient(): EternalReturnClient {
  return hasApiKey() ? new RealEternalReturnClient() : new MockEternalReturnClient()
}
