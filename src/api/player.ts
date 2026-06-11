import { getClient, isRealMode } from '@/api/erClient'
import type { ApiResult } from '@/types/api'
import type { MatchSummary, MatchSummaryDTO, Paginated } from '@/types/match'
import type { PlayerStats, PlayerStatsDTO, PlayerSummary } from '@/types/player'
import { throwApiError } from '@/utils/apiError'
import { toMatchSummaryDTO, toStatsDTO } from '@/utils/dto'

const PAGE_SIZE = 10
// 통계 DTO 집계용 최근 경기 수 — 백엔드 pageSize 상한(50)과 동일하게 유지
const DTO_MATCH_FETCH_SIZE = 50

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

export async function fetchPlayerStats(nickname: string): Promise<ApiResult<PlayerStats>> {
  const data = await getClient().fetchPlayerStats(nickname)
  return wrap(data)
}

export async function fetchMatchHistory(
  nickname: string,
  page: number,
): Promise<ApiResult<Paginated<MatchSummary>>> {
  const data = await getClient().fetchMatchHistory(nickname, page, PAGE_SIZE)
  return wrap(data)
}

export async function fetchPlayerStatsDTO(
  nickname: string,
  options?: { tier?: string },
): Promise<ApiResult<PlayerStatsDTO>> {
  const client = getClient()
  const stats = await client.fetchPlayerStats(nickname)

  let tier = options?.tier
  if (!tier) {
    // tier 미전달 시에만 요약 조회
    const summary = await client.fetchPlayerByNickname(nickname)
    if (!summary) {
      throwApiError('PLAYER_NOT_FOUND', 'Player stats not found')
    }
    tier = summary.tier
  }

  const history = await client.fetchMatchHistory(nickname, 0, DTO_MATCH_FETCH_SIZE)
  return wrap(toStatsDTO(stats, history.items, tier))
}

export async function fetchMatchDTOHistory(
  nickname: string,
  page: number,
): Promise<ApiResult<Paginated<MatchSummaryDTO>>> {
  const history = await getClient().fetchMatchHistory(nickname, page, PAGE_SIZE)
  return wrap({
    ...history,
    items: history.items.map((m) => toMatchSummaryDTO(m)),
  })
}
