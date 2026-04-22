import { getClient, isRealMode } from '@/api/erClient'
import type { ApiResult } from '@/types/api'
import type { MatchSummary, MatchSummaryDTO, Paginated } from '@/types/match'
import type { PlayerStats, PlayerStatsDTO, PlayerSummary } from '@/types/player'
import { throwApiError } from '@/utils/apiError'
import { toMatchSummaryDTO, toStatsDTO } from '@/utils/dto'

const PAGE_SIZE = 10
const DTO_MATCH_FETCH_SIZE = 200

function wrap<T>(data: T): ApiResult<T> {
  return {
    data,
    source: isRealMode() ? 'external' : 'cache',
    refreshedAt: new Date().toISOString(),
  }
}

export async function searchPlayers(nickname: string): Promise<ApiResult<PlayerSummary[]>> {
  const data = await getClient().searchPlayers(nickname)
  return wrap(data)
}

export async function fetchPlayerByNickname(
  nickname: string,
): Promise<ApiResult<PlayerSummary | null>> {
  const data = await getClient().fetchPlayerByNickname(nickname)
  return wrap(data)
}

export async function fetchPlayerStats(userNum: number): Promise<ApiResult<PlayerStats>> {
  const data = await getClient().fetchPlayerStats(userNum)
  return wrap(data)
}

export async function fetchMatchHistory(
  userNum: number,
  page: number,
): Promise<ApiResult<Paginated<MatchSummary>>> {
  const data = await getClient().fetchMatchHistory(userNum, page, PAGE_SIZE)
  return wrap(data)
}

export async function fetchPlayerStatsDTO(
  userNum: number,
): Promise<ApiResult<PlayerStatsDTO>> {
  const client = getClient()
  const summary = await client.fetchPlayerByUserNum(userNum)
  if (!summary) {
    throwApiError('PLAYER_NOT_FOUND', 'Player stats not found')
  }
  const stats = await client.fetchPlayerStats(userNum)
  const history = await client.fetchMatchHistory(userNum, 0, DTO_MATCH_FETCH_SIZE)
  return wrap(toStatsDTO(stats, history.items, summary.tier))
}

export async function fetchMatchDTOHistory(
  userNum: number,
  page: number,
): Promise<ApiResult<Paginated<MatchSummaryDTO>>> {
  const client = getClient()
  const summary = await client.fetchPlayerByUserNum(userNum)
  if (!summary) {
    throwApiError('PLAYER_NOT_FOUND', 'Player not found')
  }
  const history = await client.fetchMatchHistory(userNum, page, PAGE_SIZE)
  return wrap({
    ...history,
    items: history.items.map((m) => toMatchSummaryDTO(m)),
  })
}
