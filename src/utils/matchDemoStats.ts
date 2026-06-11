// MOCK — 매치 행 데모 수치 (API 연동 전)

import type { MatchSummary } from '@/types/match'
import {
  fineGradeColor,
  type CharacterFineGrade,
} from '@/utils/characterGrade'

export type TeamLuckRating = 'good' | 'normal' | 'bad'

export interface MatchRecordDemoStats {
  teamKill: number
  playerDamage: number
  monsterDamage: number
  credit: number
  rpDeltaValue: number
  matchGrade: CharacterFineGrade
  teamLuck: TeamLuckRating
  routeNumber: number
  characterLevel: number
}

const FINE_GRADES: CharacterFineGrade[] = [
  'S+',
  'S',
  'S-',
  'A+',
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'C-',
  'D+',
  'D',
  'D-',
]

const TEAM_LUCK: { id: TeamLuckRating; label: string; icon: string }[] = [
  { id: 'good', label: '좋음', icon: '☀' },
  { id: 'normal', label: '보통', icon: '🌤' },
  { id: 'bad', label: '나쁨', icon: '☁' },
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function seedFor(match: MatchSummary, salt: number): number {
  return hashString(match.matchId) + salt * 17 + match.userNum
}

export function getDemoMatchFineGrade(matchId: string): CharacterFineGrade {
  const index = Math.floor(pseudoRandom(hashString(matchId) + 3) * FINE_GRADES.length)
  return FINE_GRADES[index] ?? 'B'
}

export function getTeamLuckLabel(luck: TeamLuckRating): string {
  return TEAM_LUCK.find((t) => t.id === luck)?.label ?? '보통'
}

export function getTeamLuckIcon(luck: TeamLuckRating): string {
  return TEAM_LUCK.find((t) => t.id === luck)?.icon ?? '🌤'
}

export function matchGradeColor(grade: CharacterFineGrade): string {
  return fineGradeColor(grade)
}

export function buildMatchRecordDemoStats(match: MatchSummary): MatchRecordDemoStats {
  const s0 = seedFor(match, 0)
  const s1 = seedFor(match, 1)
  const s2 = seedFor(match, 2)
  const s3 = seedFor(match, 3)
  const s4 = seedFor(match, 4)

  const teamKill =
    match.kills + Math.floor(pseudoRandom(s0) * 4) + (match.assists > 0 ? 1 : 0)

  const playerDamage =
    match.playerDamage ??
    Math.floor(5000 + pseudoRandom(s1) * 25000)

  const monsterDamage =
    match.monsterDamage ??
    Math.floor(30000 + pseudoRandom(s2) * 150000)

  const credit =
    match.credit ??
    Math.floor(800 + pseudoRandom(s3) * 1000)

  const demoRp = Math.floor(-150 + pseudoRandom(s4) * 451)
  const rpDeltaValue = match.rpDelta ?? demoRp

  const luckIndex = Math.floor(pseudoRandom(s0 + 5) * TEAM_LUCK.length)
  const teamLuck = TEAM_LUCK[luckIndex]?.id ?? 'normal'

  return {
    teamKill,
    playerDamage,
    monsterDamage,
    credit,
    rpDeltaValue,
    matchGrade: getDemoMatchFineGrade(match.matchId),
    teamLuck,
    routeNumber: 1 + Math.floor(pseudoRandom(s1 + 7) * 8),
    characterLevel: 10 + Math.floor(pseudoRandom(s2 + 11) * 11),
  }
}

export function formatMatchNumber(value: number): string {
  return value.toLocaleString('ko-KR')
}

export function formatRpDelta(value: number): string {
  if (value > 0) return `+${value}`
  return String(value)
}
