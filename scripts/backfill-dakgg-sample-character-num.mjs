/**
 * dak.gg sample*.ts 매치에 characterNum 주입 (Open API 기준)
 * 사용: npm run samples:backfill-character-num
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolveCharacterNumByName } from './bser-character-ids.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MOCKS = join(__dirname, '..', 'src', 'mocks')

const SAMPLE_FILES = [
  'sampleJeoldan.ts',
  'sampleIyurang.ts',
  'sampleAgagongju.ts',
  'sampleRidajungdok.ts',
]

function resolveMatchCharacterNum(match) {
  if (match.characterNum != null) return match.characterNum
  const byName = resolveCharacterNumByName(match.characterName)
  if (byName != null) return byName
  const placeholder = match.characterName?.match(/^Character(\d+)$/)
  if (placeholder) return Number(placeholder[1])
  return null
}

function orderMatchFields(match) {
  const num = resolveMatchCharacterNum(match)
  const ordered = {}
  const keys = [
    'matchId',
    'userNum',
    'characterNum',
    'characterName',
    'placement',
    'kills',
    'deaths',
    'assists',
    'gameStartedAt',
    'victory',
  ]
  for (const k of keys) {
    if (k === 'characterNum') {
      if (num != null) ordered.characterNum = num
      continue
    }
    if (match[k] !== undefined) ordered[k] = match[k]
  }
  for (const [k, v] of Object.entries(match)) {
    if (!(k in ordered)) ordered[k] = v
  }
  return ordered
}

function patchFile(path) {
  const text = readFileSync(path, 'utf8')
  const marker = text.match(/export const SAMPLE_\w+_MATCHES: MatchSummary\[\] = /)
  if (!marker) {
    console.warn(`스킵 (MATCHES 없음): ${path}`)
    return { updated: 0, missing: 0 }
  }

  const assignEnd = marker.index + marker[0].length
  const jsonStart = text.indexOf('[', assignEnd)
  const jsonEnd = text.lastIndexOf(']')
  const head = text.slice(0, jsonStart)
  const tail = text.slice(jsonEnd + 1)

  const matches = JSON.parse(text.slice(jsonStart, jsonEnd + 1))
  let missing = 0
  const next = matches.map((m) => {
    const row = orderMatchFields(m)
    if (row.characterNum == null) {
      missing += 1
      console.warn(`  characterNum 없음: ${m.matchId} (${m.characterName})`)
    }
    return row
  })

  writeFileSync(path, `${head}${JSON.stringify(next, null, 2)}${tail}`, 'utf8')
  return { updated: next.length, missing }
}

let total = 0
for (const file of SAMPLE_FILES) {
  const path = join(MOCKS, file)
  const { updated, missing } = patchFile(path)
  console.log(`${file}: ${updated}경기, 미매핑 ${missing}`)
  total += updated
}
console.log(`\n완료: ${total}경기`)
