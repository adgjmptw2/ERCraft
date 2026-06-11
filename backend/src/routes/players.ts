import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { config } from '../config/env.js'
import type { MatchSummaryContract, PaginatedContract } from '../contracts/player.js'
import { BserApiError, BserClient, type BserUser } from '../external/bserClient.js'
import {
  mapToMatchSummary,
  mapToPlayerStats,
  mapToPlayerSummary,
} from '../external/bserMapper.js'
import { matchesQuery, playerNicknameParams, playerSearchQuery } from '../schemas.js'
import { apiResult } from '../types/api.js'
import { HttpError } from '../utils/httpError.js'

// BSER 프록시 라우트.
// uid는 외부로 노출하지 않고(개인정보 정책) 닉네임 키 + 짧은 in-memory 캐시로 처리한다.

const UID_CACHE_TTL_MS = 5 * 60_000
const GAMES_CACHE_TTL_MS = 60_000
const SEASON_CACHE_TTL_MS = 60 * 60_000
/** 페이지네이션 시 BSER next 커서를 따라가는 최대 횟수 (레이트 리미트 보호) */
const MAX_GAME_FETCHES = 5

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

function fromCache<T>(map: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const entry = map.get(key)
  if (!entry || entry.expiresAt < Date.now()) {
    map.delete(key)
    return undefined
  }
  return entry.value
}

function toHttpError(e: unknown): unknown {
  if (e instanceof BserApiError) {
    if (e.status === 404) return new HttpError(404, 'PLAYER_NOT_FOUND', 'Player not found')
    if (e.status === 429 || e.status === 403) {
      return new HttpError(429, 'RATE_LIMITED', 'BSER rate limit exceeded, retry later')
    }
    return new HttpError(502, 'UPSTREAM_ERROR', `BSER upstream error: ${e.message}`)
  }
  return e
}

const playersRoutes: FastifyPluginAsync = async (app) => {
  const bser = new BserClient(config.bserApiKey)

  const uidCache = new Map<string, CacheEntry<BserUser | null>>()
  const gamesCache = new Map<
    string,
    CacheEntry<{ items: MatchSummaryContract[]; next?: number }>
  >()
  let seasonCache: CacheEntry<number> | null = null
  let characterNames: ReadonlyMap<number, string> | null = null

  function requireApiKey(): void {
    if (!bser.isConfigured) {
      throw new HttpError(
        503,
        'UPSTREAM_ERROR',
        'BSER_API_KEY is not configured — set it in backend/.env',
      )
    }
  }

  async function resolveSeasonId(): Promise<number> {
    if (config.bserSeasonId > 0) return config.bserSeasonId
    if (seasonCache && seasonCache.expiresAt > Date.now()) return seasonCache.value
    const detected = await bser.getCurrentSeasonId()
    if (detected === null) {
      throw new HttpError(502, 'UPSTREAM_ERROR', 'Failed to detect current season')
    }
    seasonCache = { value: detected, expiresAt: Date.now() + SEASON_CACHE_TTL_MS }
    return detected
  }

  async function resolveUser(nickname: string): Promise<BserUser> {
    const key = nickname.trim().toLowerCase()
    let user = fromCache(uidCache, key)
    if (user === undefined) {
      user = await bser.getUserByNickname(nickname.trim())
      uidCache.set(key, { value: user, expiresAt: Date.now() + UID_CACHE_TTL_MS })
    }
    if (!user) throw new HttpError(404, 'PLAYER_NOT_FOUND', `Player "${nickname}" not found`)
    return user
  }

  async function resolveCharacterNames(): Promise<ReadonlyMap<number, string>> {
    if (!characterNames) {
      characterNames = await bser.getCharacterNames()
    }
    return characterNames
  }

  /** BSER next 커서를 따라가며 (page+1)*pageSize+1 개까지 수집 */
  async function collectMatches(
    user: BserUser,
    needed: number,
  ): Promise<{ items: MatchSummaryContract[]; next?: number }> {
    const cached = fromCache(gamesCache, user.uid)
    let items = cached?.items ?? []
    const next = cached?.next

    if (items.length >= needed || (cached && next === undefined)) {
      return { items, next }
    }

    const names = await resolveCharacterNames()
    let fetches = 0
    let cursor = next
    let exhausted = cached ? next === undefined : false

    while (items.length < needed && !exhausted && fetches < MAX_GAME_FETCHES) {
      const page = await bser.getUserGames(user.uid, cursor)
      items = items.concat(page.games.map((g) => mapToMatchSummary(user.uid, g, names)))
      cursor = page.next
      exhausted = page.next === undefined || page.games.length === 0
      fetches += 1
    }

    const result = { items, next: exhausted ? undefined : cursor }
    gamesCache.set(user.uid, {
      value: result,
      expiresAt: Date.now() + GAMES_CACHE_TTL_MS,
    })
    return result
  }

  const withZod = app.withTypeProvider<ZodTypeProvider>()

  // 닉네임 검색 — BSER는 정확 일치 조회만 지원하므로 0~1건 반환
  withZod.get('/players/search', { schema: { querystring: playerSearchQuery } }, async (request, reply) => {
    requireApiKey()
    try {
      const user = await bser.getUserByNickname(request.query.q.trim())
      if (!user) return reply.send(apiResult([]))
      const seasonId = await resolveSeasonId()
      const rank = await bser.getUserRank(user.uid, seasonId)
      return reply.send(apiResult([mapToPlayerSummary(user, rank)]))
    } catch (e) {
      throw toHttpError(e)
    }
  })

  withZod.get(
    '/players/:nickname/summary',
    { schema: { params: playerNicknameParams } },
    async (request, reply) => {
      requireApiKey()
      try {
        const user = await resolveUser(request.params.nickname)
        const seasonId = await resolveSeasonId()
        const rank = await bser.getUserRank(user.uid, seasonId)
        return reply.send(apiResult(mapToPlayerSummary(user, rank)))
      } catch (e) {
        throw toHttpError(e)
      }
    },
  )

  withZod.get(
    '/players/:nickname/stats',
    { schema: { params: playerNicknameParams } },
    async (request, reply) => {
      requireApiKey()
      try {
        const user = await resolveUser(request.params.nickname)
        const seasonId = await resolveSeasonId()
        const stats = await bser.getUserStats(user.uid, seasonId)
        const squad = stats.find((s) => s.matchingTeamMode === 3) ?? stats[0] ?? null
        return reply.send(apiResult(mapToPlayerStats(user.uid, seasonId, squad)))
      } catch (e) {
        throw toHttpError(e)
      }
    },
  )

  withZod.get(
    '/players/:nickname/matches',
    { schema: { params: playerNicknameParams, querystring: matchesQuery } },
    async (request, reply) => {
      requireApiKey()
      const { page, pageSize } = request.query
      try {
        const user = await resolveUser(request.params.nickname)
        const offset = page * pageSize
        const collected = await collectMatches(user, offset + pageSize + 1)
        const items = collected.items.slice(offset, offset + pageSize)
        const hasNext =
          collected.items.length > offset + pageSize || collected.next !== undefined
        const body: PaginatedContract<MatchSummaryContract> = { items, page, pageSize, hasNext }
        return reply.send(apiResult(body))
      } catch (e) {
        throw toHttpError(e)
      }
    },
  )
}

export default playersRoutes
