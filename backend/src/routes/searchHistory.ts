import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { authMiddleware, resolveStubUserId } from '../middleware/auth.js'
import { createSearchHistoryBody, searchHistoryListQuery } from '../schemas.js'
import { apiResult } from '../types/api.js'

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 20

const searchHistoryRoutes: FastifyPluginAsync = async (app) => {
  const withZod = app.withTypeProvider<ZodTypeProvider>()

  withZod.post(
    '/search-history',
    {
      preHandler: authMiddleware,
      schema: { body: createSearchHistoryBody },
    },
    async (request, reply) => {
      const { query, matchedUserNum } = request.body

      const userDbId = await resolveStubUserId(app.prisma, request.userId)
      await app.prisma.searchHistory.create({
        data: {
          userId: userDbId,
          query: query.trim(),
          matchedUserNum:
            matchedUserNum !== undefined && matchedUserNum !== null
              ? BigInt(matchedUserNum)
              : null,
        },
      })
      return reply.code(204).send()
    },
  )

  withZod.get(
    '/search-history',
    {
      preHandler: authMiddleware,
      schema: { querystring: searchHistoryListQuery },
    },
    async (request, reply) => {
      const { limit: rawLimit } = request.query
      const limit = rawLimit ? Math.min(MAX_LIMIT, rawLimit) : DEFAULT_LIMIT

      const userDbId = await resolveStubUserId(app.prisma, request.userId)
      const rows = await app.prisma.searchHistory.findMany({
        where: { userId: userDbId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      return reply.send(
        apiResult(
          rows.map((r) => ({
            query: r.query,
            ...(r.matchedUserNum !== null ? { matchedUserNum: Number(r.matchedUserNum) } : {}),
            createdAt: r.createdAt.toISOString(),
          })),
        ),
      )
    },
  )
}

export default searchHistoryRoutes
