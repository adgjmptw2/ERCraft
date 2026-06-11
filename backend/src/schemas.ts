import { z } from 'zod'

export const createFavoriteBody = z.object({
  playerUserNum: z.number().int().positive(),
  nicknameSnapshot: z.string().trim().min(1).max(50),
})

export const createSearchHistoryBody = z.object({
  query: z.string().trim().min(1),
  matchedUserNum: z.number().int().positive().optional().nullable(),
})

export const searchHistoryListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
})

export const playerSearchQuery = z.object({
  q: z.string().trim().min(1).max(50),
})

export const playerNicknameParams = z.object({
  nickname: z.string().trim().min(1).max(50),
})

export const matchesQuery = z.object({
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
})
