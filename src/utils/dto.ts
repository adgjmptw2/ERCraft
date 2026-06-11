import type { MatchSummary, MatchSummaryDTO } from '@/types/match'
import type { PlayerStats, PlayerStatsDTO } from '@/types/player'
import { localizeCharacter, localizeTier } from '@/utils/gameLabels'
import { localizeGameMode, resolveGameMode } from '@/utils/gameMode'
import {
  buildMatchRecordDemoStats,
  getTeamLuckIcon,
  getTeamLuckLabel,
} from '@/utils/matchDemoStats'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function kdaRatio(kills: number, deaths: number, assists: number): number {
  const d = deaths === 0 ? 1 : deaths
  return (kills + assists) / d
}

function ordinal(n: number): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`
  const mod10 = n % 10
  if (mod10 === 1) return `${n}st`
  if (mod10 === 2) return `${n}nd`
  if (mod10 === 3) return `${n}rd`
  return `${n}th`
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function demoGameDurationSeconds(matchId: string): number {
  return 1200 + (hashString(matchId) % 1201)
}

export function formatGameDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function relativeTime(fromIso: string, now: Date): string {
  const diffMs = now.getTime() - new Date(fromIso).getTime()
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day

  if (diffMs < minute) return '방금 전'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}분 전`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}시간 전`
  if (diffMs < week) return `${Math.floor(diffMs / day)}일 전`
  return `${Math.floor(diffMs / week)}주 전`
}

export function toMatchSummaryDTO(match: MatchSummary, now: Date = new Date()): MatchSummaryDTO {
  const kdaNum = round2(kdaRatio(match.kills, match.deaths, match.assists))
  const gameDuration = match.gameDuration ?? demoGameDurationSeconds(match.matchId)
  const demo = buildMatchRecordDemoStats(match)
  const gameMode = resolveGameMode(match)

  return {
    ...match,
    characterName: localizeCharacter(match.characterName),
    gameMode,
    gameModeLabel: localizeGameMode(gameMode),
    kdaString: kdaNum.toFixed(2),
    placementLabel: ordinal(match.placement),
    relativeTime: relativeTime(match.gameStartedAt, now),
    gameDuration,
    gameDurationLabel: formatGameDuration(gameDuration),
    teamKill: demo.teamKill,
    playerDamage: demo.playerDamage,
    rpDeltaValue: demo.rpDeltaValue,
    matchGrade: demo.matchGrade,
    teamLuck: demo.teamLuck,
    teamLuckLabel: getTeamLuckLabel(demo.teamLuck),
    teamLuckIcon: getTeamLuckIcon(demo.teamLuck),
    routeNumber: demo.routeNumber,
    characterLevel: demo.characterLevel,
  }
}

export function toStatsDTO(
  stats: PlayerStats,
  matches: MatchSummary[],
  tier: string,
): PlayerStatsDTO {
  const games = stats.games
  const winRate = games > 0 ? (stats.wins / games) * 100 : 0
  const avgKills = games > 0 ? stats.kills / games : 0
  const avgPlacement =
    matches.length > 0 ? matches.reduce((s, m) => s + m.placement, 0) / matches.length : 0
  const kda = round2(kdaRatio(stats.kills, stats.deaths, stats.assists))

  const counts = new Map<string, number>()
  for (const m of matches) {
    counts.set(m.characterName, (counts.get(m.characterName) ?? 0) + 1)
  }
  // 동률: 이름 오름차순
  const names = [...counts.keys()].sort()
  let best: { name: string; count: number } = { name: '', count: 0 }
  for (const name of names) {
    const count = counts.get(name) ?? 0
    if (count > best.count) best = { name, count }
  }

  return {
    games,
    winRate: round2(winRate),
    avgKills: round2(avgKills),
    avgPlacement: round2(avgPlacement),
    kda,
    kdaString: kda.toFixed(2),
    mostPlayedCharacter: { name: localizeCharacter(best.name), count: best.count },
    tier: localizeTier(tier),
    mmr: stats.mmr,
  }
}
