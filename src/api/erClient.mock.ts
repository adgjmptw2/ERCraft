import type { EternalReturnClient } from '@/api/erClient'
import {
  buildMockStatsForUser,
  getMockPlayerSummaryByNickname,
  searchMockPlayersByNickname,
  sliceMockMatchHistory,
} from '@/mocks/loader'
import type { MatchSummary, Paginated } from '@/types/match'
import type { PlayerStats, PlayerSummary } from '@/types/player'
import { throwApiError } from '@/utils/apiError'

export class MockEternalReturnClient implements EternalReturnClient {
  async searchPlayers(nickname: string): Promise<PlayerSummary[]> {
    return searchMockPlayersByNickname(nickname)
  }

  async fetchPlayerByNickname(nickname: string): Promise<PlayerSummary | null> {
    return getMockPlayerSummaryByNickname(nickname) ?? null
  }

  async fetchPlayerStats(nickname: string): Promise<PlayerStats> {
    const player = getMockPlayerSummaryByNickname(nickname)
    const stats = player ? buildMockStatsForUser(player.userNum) : null
    if (!stats) {
      throwApiError('PLAYER_NOT_FOUND', 'Player stats not found')
    }
    return stats
  }

  async fetchMatchHistory(
    nickname: string,
    page: number,
    pageSize: number,
  ): Promise<Paginated<MatchSummary>> {
    const player = getMockPlayerSummaryByNickname(nickname)
    if (!player) {
      return { items: [], page, pageSize, hasNext: false }
    }
    return sliceMockMatchHistory(player.userNum, page, pageSize)
  }
}
