import type { EternalReturnClient } from '@/api/erClient'
import {
  buildMockStatsForUser,
  getMockPlayerByUserNum,
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

  async fetchPlayerByUserNum(userNum: number): Promise<PlayerSummary | null> {
    return getMockPlayerByUserNum(userNum) ?? null
  }

  async fetchPlayerStats(userNum: number): Promise<PlayerStats> {
    const stats = buildMockStatsForUser(userNum)
    if (!stats) {
      throwApiError('PLAYER_NOT_FOUND', 'Player stats not found')
    }
    return stats
  }

  async fetchMatchHistory(
    userNum: number,
    page: number,
    pageSize: number,
  ): Promise<Paginated<MatchSummary>> {
    return sliceMockMatchHistory(userNum, page, pageSize)
  }
}
