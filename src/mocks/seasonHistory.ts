// MOCK — 실 API 붙기 전

import playersData from '@/mocks/players.json'
import { localizeTier } from '@/utils/gameLabels'

export interface DemoSeasonRecord {
  seasonNumber: number
  tier: string
  wins: number
  losses: number
  avgPlacement: number
  kda: number
  top3Rate: number
  avgSurvivalSeconds: number
  avgDamage: number
  avgHeal: number
  objectiveContribution: number
}

export interface DemoSeasonSnapshot extends DemoSeasonRecord {
  games: number
  winRate: number
  kdaString: string
  avgSurvivalLabel: string
}

interface PlayerRecord {
  userNum: number
  tier: string
}

interface PlayersFile {
  players: PlayerRecord[]
}

const playersFile = playersData as PlayersFile

const MID_TIERS = [
  '아이언 2',
  '브론즈 3',
  '브론즈 1',
  '실버 4',
  '실버 2',
  '골드 3',
  '골드 1',
  '플래티넘 4',
  '플래티넘 2',
  '다이아몬드 4',
  '다이아몬드 2',
]

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function buildSeasonRecord(
  userNum: number,
  seasonNumber: number,
  tier: string,
): DemoSeasonRecord {
  const seed = userNum * 31 + seasonNumber * 17
  const games = 18 + Math.floor(pseudoRandom(seed) * 72)
  const winRate = 0.32 + pseudoRandom(seed + 1) * 0.36
  const wins = Math.max(0, Math.min(games, Math.round(games * winRate)))
  const losses = games - wins
  const avgPlacement = round2(3.5 + pseudoRandom(seed + 2) * 8)
  const kda = round2(1.2 + pseudoRandom(seed + 3) * 3.5)
  const top3Rate = round2(15 + pseudoRandom(seed + 4) * 55)
  const survivalTotalSec = Math.floor((8 + pseudoRandom(seed + 5) * 7) * 60)
  const avgDamage = Math.floor(3000 + pseudoRandom(seed + 6) * 5000)
  const avgHeal = Math.floor(500 + pseudoRandom(seed + 7) * 2500)
  const objectiveContribution = round2(20 + pseudoRandom(seed + 8) * 40)

  return {
    seasonNumber,
    tier,
    wins,
    losses,
    avgPlacement,
    kda,
    top3Rate,
    avgSurvivalSeconds: survivalTotalSec,
    avgDamage,
    avgHeal,
    objectiveContribution,
  }
}

function historyForPlayer(userNum: number, currentTier: string): DemoSeasonRecord[] {
  const startSeason = 3 + (userNum % 4)
  const finalTier = localizeTier(currentTier)
  const span = 10 - startSeason + 1
  const records: DemoSeasonRecord[] = []

  for (let i = 0; i < span; i++) {
    const seasonNumber = startSeason + i
    const isFinal = seasonNumber === 10
    const tier = isFinal
      ? finalTier
      : MID_TIERS[Math.floor(pseudoRandom(userNum * 7 + seasonNumber) * MID_TIERS.length)]!
    records.push(buildSeasonRecord(userNum, seasonNumber, tier))
  }

  return records
}

const seasonHistoryCache = new Map<number, DemoSeasonRecord[]>()

function getHistory(userNum: number): DemoSeasonRecord[] {
  const cached = seasonHistoryCache.get(userNum)
  if (cached) return cached

  const player = playersFile.players.find((p) => p.userNum === userNum)
  if (!player) return []

  const history = historyForPlayer(userNum, player.tier)
  seasonHistoryCache.set(userNum, history)
  return history
}

export function getDemoPlayerSeasonHistory(userNum: number): DemoSeasonRecord[] {
  return getHistory(userNum)
}

export function getDemoSeasonSnapshot(
  userNum: number,
  seasonNumber: number,
): DemoSeasonSnapshot | null {
  const record = getHistory(userNum).find((s) => s.seasonNumber === seasonNumber)
  if (!record) return null

  const games = record.wins + record.losses
  const winRate = games > 0 ? round2((record.wins / games) * 100) : 0
  const minutes = Math.floor(record.avgSurvivalSeconds / 60)
  const seconds = record.avgSurvivalSeconds % 60

  return {
    ...record,
    games,
    winRate,
    kdaString: record.kda.toFixed(2),
    avgSurvivalLabel: `${minutes}분 ${seconds}초`,
  }
}

export const DEMO_LATEST_SEASON = 10
