import type {
  MatchSummaryContract,
  PlayerStatsContract,
  PlayerSummaryContract,
} from '../contracts/player.js'
import type { BserUser, BserUserGame, BserUserRank, BserUserStat } from './bserClient.js'

// BSER 원본 → 프론트 계약(contracts/player.ts) 매핑

/**
 * uid(문자열, 닉변 시 변경됨)를 32bit 양수로 축약.
 * 프론트는 userNum을 키/데모 조회용으로만 쓰므로 세션 내 안정성만 보장하면 됨.
 */
export function uidToUserNum(uid: string): number {
  let hash = 0
  for (let i = 0; i < uid.length; i++) {
    hash = (hash << 5) - hash + uid.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) || 1
}

// RP → 티어 근사 테이블 (시즌마다 컷이 달라질 수 있어 근사치, 필요 시 조정)
// 데미갓/이터니티는 리더보드 컷 기반이라 RP만으로는 미스릴까지만 판정
const TIER_STEPS: ReadonlyArray<{ floor: number; name: string; divisions: boolean }> = [
  { floor: 5800, name: 'Mithril', divisions: false },
  { floor: 5000, name: 'Meteorite', divisions: true },
  { floor: 4200, name: 'Diamond', divisions: true },
  { floor: 3400, name: 'Platinum', divisions: true },
  { floor: 2600, name: 'Gold', divisions: true },
  { floor: 1800, name: 'Silver', divisions: true },
  { floor: 1000, name: 'Bronze', divisions: true },
  { floor: 0, name: 'Iron', divisions: true },
]

const DIVISION_LABELS = ['IV', 'III', 'II', 'I'] as const

export function tierFromMmr(mmr: number | null | undefined): string {
  if (mmr === null || mmr === undefined || mmr <= 0) return 'Unranked'
  const step = TIER_STEPS.find((s) => mmr >= s.floor) ?? TIER_STEPS[TIER_STEPS.length - 1]
  if (!step.divisions) return step.name

  const span = 800 / DIVISION_LABELS.length
  const idx = Math.min(Math.floor((mmr - step.floor) / span), DIVISION_LABELS.length - 1)
  return `${step.name} ${DIVISION_LABELS[idx]}`
}

export function mapToPlayerSummary(
  user: BserUser,
  rank: BserUserRank | null,
  accountLevel?: number,
): PlayerSummaryContract {
  return {
    userNum: uidToUserNum(user.uid),
    nickname: user.nickname,
    level: accountLevel ?? 1,
    tier: tierFromMmr(rank?.mmr),
  }
}

export function mapToPlayerStats(
  uid: string,
  seasonId: number,
  stat: BserUserStat | null,
): PlayerStatsContract {
  const games = stat?.totalGames ?? 0
  return {
    userNum: uidToUserNum(uid),
    seasonId,
    games,
    wins: stat?.totalWins ?? 0,
    losses: Math.max(games - (stat?.totalWins ?? 0), 0),
    kills: Math.round((stat?.averageKills ?? 0) * games),
    deaths: stat?.totalDeaths ?? 0,
    assists: Math.round((stat?.averageAssistants ?? 0) * games),
    top3: Math.round((stat?.top3 ?? 0) * games),
    mmr: stat?.mmr ?? 0,
  }
}

function mapGameMode(matchingMode: number): MatchSummaryContract['gameMode'] {
  switch (matchingMode) {
    case 3:
      return 'rank'
    case 6:
      return 'cobalt'
    case 2:
    default:
      return 'normal'
  }
}

export function mapToMatchSummary(
  uid: string,
  game: BserUserGame,
  characterNames: ReadonlyMap<number, string>,
): MatchSummaryContract {
  const kills = game.playerKill ?? 0
  return {
    matchId: String(game.gameId),
    userNum: uidToUserNum(uid),
    characterNum: game.characterNum,
    characterName: characterNames.get(game.characterNum) ?? `실험체 #${game.characterNum}`,
    placement: game.gameRank,
    kills,
    deaths: game.playerDeaths ?? (game.victory === 1 ? 0 : 1),
    assists: game.playerAssistant ?? 0,
    gameStartedAt: new Date(game.startDtm).toISOString(),
    victory: game.victory === 1,
    seasonNumber: game.seasonId,
    rpAfter: game.mmrAfter,
    rpDelta: game.mmrGain,
    gameDuration: game.playTime,
    playerDamage: game.damageToPlayer,
    credit: game.totalGainVFCredit,
    teamKills: game.teamKill,
    damageToPlayers: game.damageToPlayer,
    visionScore: game.viewContribution,
    animalKills: game.monsterKill,
    gameMode: mapGameMode(game.matchingMode),
  }
}
