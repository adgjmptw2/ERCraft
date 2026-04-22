import { z } from 'zod'

const integer = z.number().int().finite()

export const createFavoriteBody = z.object({
  playerUserNum: integer,
  nicknameSnapshot: z.string().trim().min(1),
})

export const createSearchHistoryBody = z.object({
  query: z.string().trim().min(1),
  matchedUserNum: integer.optional().nullable(),
})

export const searchHistoryListQuery = z.object({
  limit: z.coerce.number().int().positive().optional(),
})
