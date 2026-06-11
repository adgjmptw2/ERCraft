export interface PlayerSummaryContract {
  userNum: number
  nickname: string
  level: number
  tier: string
  profileImageUrl?: string
}

export interface PlayerStatsContract {
  userNum: number
  seasonId: number
  games: number
  wins: number
  losses: number
  kills: number
  deaths: number
  assists: number
  top3: number
  mmr: number
}

export interface MatchSummaryContract {
  matchId: string
  userNum: number
  characterNum?: number
  characterName: string
  placement: number
  kills: number
  deaths: number
  assists: number
  gameStartedAt: string
  victory: boolean
  // 프론트 MatchSummary와 동일한 optional 확장 필드
  seasonNumber?: number
  rpAfter?: number
  rpDelta?: number
  gameDuration?: number
  playerDamage?: number
  credit?: number
  teamKills?: number
  damageToPlayers?: number
  visionScore?: number
  animalKills?: number
  gameMode?: 'rank' | 'cobalt' | 'union' | 'normal'
}

export interface PaginatedContract<T> {
  items: T[]
  page: number
  pageSize: number
  hasNext: boolean
}
