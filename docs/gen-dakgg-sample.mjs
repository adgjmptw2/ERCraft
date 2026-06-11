/**
 * dak.gg 실데이터 → src/mocks/sample*.ts 변환
 * 사용: node docs/gen-dakgg-sample.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { CHARACTER_NUM_TO_NAME } from '../scripts/bser-character-ids.mjs'
import { mapGameToEquipmentPreview } from '../scripts/lib/equipmentPreviewMapper.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DEMO_SEASON = 11

const TIER_STEPS = [
  { floor: 5800, name: 'Mithril', divisions: false },
  { floor: 5000, name: 'Meteorite', divisions: true },
  { floor: 4200, name: 'Diamond', divisions: true },
  { floor: 3400, name: 'Platinum', divisions: true },
  { floor: 2600, name: 'Gold', divisions: true },
  { floor: 1800, name: 'Silver', divisions: true },
  { floor: 1000, name: 'Bronze', divisions: true },
  { floor: 0, name: 'Iron', divisions: true },
]

const TIER_EN_TO_KO = {
  Mithril: '미스릴',
  Meteorite: '메테오라이트',
  Diamond: '다이아몬드',
  Platinum: '플래티넘',
  Gold: '골드',
  Silver: '실버',
  Bronze: '브론즈',
  Iron: '아이언',
}

const SAMPLES = [
  {
    slug: 'Jeoldan',
    nickname: '절단마술사',
    userNum: 999001,
    dakggSeason: 'SEASON_20',
    rankOnly: true,
    note: 'SEASON_20 랭크 스쿼드 전체',
  },
  {
    slug: 'Agagongju',
    nickname: '아가공주',
    userNum: 999003,
    dakggSeason: 'SEASON_20',
    rankOnly: true,
    note: 'SEASON_20 랭크 스쿼드 전체',
  },
  {
    slug: 'Iyurang',
    nickname: '이유랑',
    userNum: 999002,
    dakggSeason: 'SEASON_20',
    rankOnly: true,
    note: 'SEASON_20 랭크 스쿼드 전체',
  },
  {
    slug: 'Ridajungdok',
    nickname: '리다중독',
    userNum: 999004,
    dakggSeason: 'SEASON_20',
    rankOnly: true,
    note: 'SEASON_20 랭크 스쿼드 전체',
  },
]

function tierEnglish(mmr) {
  if (!mmr || mmr <= 0) return 'Unranked'
  const step = TIER_STEPS.find((s) => mmr >= s.floor) ?? TIER_STEPS.at(-1)
  if (!step.divisions) return step.name
  const span = 800 / 4
  const idx = Math.min(Math.floor((mmr - step.floor) / span), 3)
  return `${step.name} ${['IV', 'III', 'II', 'I'][idx]}`
}

function seasonRankFromMmr(mmr) {
  const en = tierEnglish(mmr)
  const head = en.split(' ')[0]
  const ko = TIER_EN_TO_KO[head] ?? head
  const divMatch = en.match(/\s+(IV|III|II|I)$/)
  const divisionMap = { IV: 4, III: 3, II: 2, I: 1 }
  const rank = { tier: ko, rp: mmr }
  if (divMatch) rank.division = divisionMap[divMatch[1]]
  return rank
}

function mapGameMode(matchingMode) {
  if (matchingMode === 3) return 'rank'
  if (matchingMode === 6) return 'cobalt'
  if (matchingMode === 7) return 'union'
  return 'normal'
}

function parseStartDtm(value) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

function characterName(num) {
  return CHARACTER_NUM_TO_NAME[num] ?? `Character${num}`
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res.json()
}

async function fetchProfile(nickname, season) {
  const enc = encodeURIComponent(nickname)
  return fetchJson(`https://er.dakgg.io/api/v1/players/${enc}/profile?season=${season}`)
}

async function fetchAllMatches(nickname, season, rankOnly) {
  const enc = encodeURIComponent(nickname)
  const all = []
  let page = 1
  while (page <= 50) {
    const data = await fetchJson(
      `https://er.dakgg.io/api/v1/players/${enc}/matches?season=${season}&matchingMode=ALL&teamMode=ALL&page=${page}`,
    )
    const batch = data.matches ?? []
    if (batch.length === 0) break
    all.push(...(rankOnly ? batch.filter((m) => m.matchingMode === 3) : batch))
    if (batch.length < 20) break
    page += 1
  }
  return all.sort((a, b) => new Date(b.startDtm) - new Date(a.startDtm))
}

function toMatchSummary(game, userNum) {
  const kills = game.playerKill ?? 0
  const deaths = game.playerDeaths ?? (game.victory === 1 ? 0 : 1)
  const row = {
    matchId: `dakgg-${game.gameId}`,
    userNum,
    characterNum: game.characterNum,
    characterName: characterName(game.characterNum),
    placement: game.gameRank,
    kills,
    deaths,
    assists: game.playerAssistant ?? 0,
    gameStartedAt: parseStartDtm(game.startDtm),
    victory: game.victory === 1,
    seasonNumber: DEMO_SEASON,
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
  if (game.damageToMonster != null) row.monsterDamage = game.damageToMonster
  const preview = mapGameToEquipmentPreview(game)
  if (preview) row.equipmentPreview = preview
  return row
}

function emitTs(sample, profile, matches) {
  const latest =
    profile.playerSeasons?.find((s) => s.mmr != null && s.mmr > 0) ??
    profile.playerSeasons?.find((s) => s.mmr != null)
  const mmr = latest?.mmr ?? 0
  const finalRank = seasonRankFromMmr(mmr)
  const constPrefix = `SAMPLE_${sample.slug.toUpperCase()}`

  const lines = []
  lines.push('// MOCK — 실 API 붙기 전')
  lines.push(`// TEST SAMPLE(${sample.nickname}) — dak.gg 실데이터 (${sample.note})`)
  lines.push(`// 출처: https://er.dakgg.io/api/v1/players/${encodeURIComponent(sample.nickname)}`)
  lines.push('//')
  lines.push('// ── 제거 방법 ──')
  lines.push('// npm run samples:remove-dakgg  (sample*.ts + loader/seasonHistory/테스트 일괄 정리)')
  lines.push('')
  lines.push("import type { MatchSummary } from '@/types/match'")
  lines.push("import type { SeasonRank } from '@/types/rank'")
  lines.push('')
  lines.push(`export const ${constPrefix}_USER_NUM = ${sample.userNum}`)
  lines.push('')
  lines.push(`export const ${constPrefix}_PLAYER = {`)
  lines.push(`  userNum: ${constPrefix}_USER_NUM,`)
  lines.push(`  nickname: '${sample.nickname}',`)
  lines.push(`  level: ${profile.player?.accountLevel ?? 1},`)
  lines.push(`  tier: '${tierEnglish(mmr)}',`)
  lines.push(`  mmr: ${mmr},`)
  lines.push('}')
  lines.push('')
  lines.push(`export const ${constPrefix}_FINAL_RANK: SeasonRank = ${JSON.stringify(finalRank)}`)
  lines.push('')
  lines.push(`export const ${constPrefix}_MATCHES: MatchSummary[] = ${JSON.stringify(matches, null, 2)}`)
  lines.push('')

  const outPath = join(ROOT, 'src', 'mocks', `sample${sample.slug}.ts`)
  writeFileSync(outPath, lines.join('\n'), 'utf8')
  console.log(`Wrote ${outPath} (${matches.length} matches, mmr=${mmr})`)
}

async function main() {
  for (const sample of SAMPLES) {
    console.log(`Fetching ${sample.nickname}...`)
    const [profile, raw] = await Promise.all([
      fetchProfile(sample.nickname, sample.dakggSeason),
      fetchAllMatches(sample.nickname, sample.dakggSeason, sample.rankOnly),
    ])
    const matches = raw.map((m) => toMatchSummary(m, sample.userNum))
    emitTs(sample, profile, matches)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
