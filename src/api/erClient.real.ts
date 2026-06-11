import { isAxiosError } from 'axios'

import { apiClient } from '@/api/client'
import type { EternalReturnClient } from '@/api/erClient'
import type { ApiErrorCode, ApiResult } from '@/types/api'
import type { MatchSummary, Paginated } from '@/types/match'
import type { PlayerStats, PlayerSummary } from '@/types/player'
import { ApiError, throwApiError } from '@/utils/apiError'

// 백엔드 BSER 프록시(backend/src/routes/players.ts) 클라이언트.
// BSER 직접 호출 금지 — API 키는 백엔드에만 존재한다.

const KNOWN_ERROR_CODES: ReadonlySet<string> = new Set([
  'PLAYER_NOT_FOUND',
  'NOT_IMPLEMENTED',
  'UNAUTHORIZED',
  'DUPLICATE_FAVORITE',
  'INVALID_REQUEST',
  'INTERNAL_ERROR',
  'NOT_FOUND',
  'RATE_LIMITED',
  'UPSTREAM_ERROR',
])

function parseErrorPayload(data: unknown): { code: ApiErrorCode; message: string } | null {
  if (typeof data !== 'object' || data === null) return null
  const error = (data as { error?: unknown }).error
  if (typeof error !== 'object' || error === null) return null
  const { code, message } = error as { code?: unknown; message?: unknown }
  if (typeof code !== 'string' || !KNOWN_ERROR_CODES.has(code)) return null
  return {
    code: code as ApiErrorCode,
    message: typeof message === 'string' ? message : 'Request failed',
  }
}

/** 백엔드 { error: { code, message } } 응답을 ApiError로 변환 */
function toApiError(e: unknown): never {
  if (e instanceof ApiError) throw e
  if (isAxiosError(e)) {
    const payload = parseErrorPayload(e.response?.data)
    if (payload) throwApiError(payload.code, payload.message)
    if (e.response) {
      throwApiError('UPSTREAM_ERROR', `백엔드 요청 실패 (HTTP ${e.response.status})`)
    }
    throwApiError('UPSTREAM_ERROR', '백엔드 서버에 연결할 수 없습니다')
  }
  throw e
}

async function getData<T>(url: string, params?: Record<string, string | number>): Promise<T> {
  try {
    const res = await apiClient.get<ApiResult<T>>(url, { params })
    return res.data.data
  } catch (e) {
    toApiError(e)
  }
}

export class RealEternalReturnClient implements EternalReturnClient {
  async searchPlayers(nickname: string): Promise<PlayerSummary[]> {
    return getData<PlayerSummary[]>('/api/players/search', { q: nickname })
  }

  async fetchPlayerByNickname(nickname: string): Promise<PlayerSummary | null> {
    try {
      return await getData<PlayerSummary>(
        `/api/players/${encodeURIComponent(nickname)}/summary`,
      )
    } catch (e) {
      if (e instanceof ApiError && e.code === 'PLAYER_NOT_FOUND') return null
      throw e
    }
  }

  async fetchPlayerStats(nickname: string): Promise<PlayerStats> {
    return getData<PlayerStats>(`/api/players/${encodeURIComponent(nickname)}/stats`)
  }

  async fetchMatchHistory(
    nickname: string,
    page: number,
    pageSize: number,
  ): Promise<Paginated<MatchSummary>> {
    return getData<Paginated<MatchSummary>>(
      `/api/players/${encodeURIComponent(nickname)}/matches`,
      { page, pageSize },
    )
  }
}
