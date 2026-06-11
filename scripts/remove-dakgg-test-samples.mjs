/**
 * dak.gg TEST SAMPLE 일괄 제거
 * 사용: npm run samples:remove-dakgg
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SAMPLE_FILES = [
  'src/mocks/sampleJeoldan.ts',
  'src/mocks/sampleIyurang.ts',
  'src/mocks/sampleAgagongju.ts',
  'src/mocks/sampleRidajungdok.ts',
]

const PATCH_TARGETS = [
  'src/mocks/loader.ts',
  'src/mocks/seasonHistory.ts',
  'src/mocks/loader.test.ts',
]

const OVERRIDE_FILE = 'src/mocks/equipmentPreviewOverrides.ts'

const DEMO_EQUIPMENT_ONLY = `// MOCK — 장비/특성 아이콘 데모용 (검증된 Fankit slug만)
// 제거: npm run samples:remove-equipment-preview

import type { MatchEquipmentPreview } from '@/types/match'

export const MATCH_EQUIPMENT_PREVIEW_OVERRIDES: Record<string, MatchEquipmentPreview> = {
  'demo-mine-001': {
    weaponTypeSlug: 'weapons/weapon-group/shuriken',
    tacticalSkillSlug: 'tactical-skills/quake',
    mainTraitSlug: 'chaos/stopping-power',
    subTraitSlug: 'havoc/frenzy',
    gear: {
      weapon: 'weapons/shuriken/fuhma-shuriken',
      chest: 'armor/chest/battle-suit',
      head: 'armor/head/tactical-goggles',
      arm: 'armor/arm-accessory/bracelet',
      leg: 'armor/leg/tactical-shoes',
    },
  },
}
`

function stripMarkedBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker)
  if (start === -1) return source
  const end = source.indexOf(endMarker, start)
  if (end === -1) throw new Error(`종료 마커 없음: ${endMarker}`)
  return source.slice(0, start) + source.slice(end + endMarker.length)
}

function patchFile(relPath, blocks) {
  const path = join(ROOT, relPath)
  let text = readFileSync(path, 'utf8')
  for (const [start, end] of blocks) {
    text = stripMarkedBlock(text, start, end)
  }
  writeFileSync(path, text, 'utf8')
}

function stripDakggEquipmentOverrides() {
  const path = join(ROOT, OVERRIDE_FILE)
  if (!existsSync(path)) return
  writeFileSync(path, `${DEMO_EQUIPMENT_ONLY}\n`, 'utf8')
  console.log(`패치: ${OVERRIDE_FILE} (dakgg 항목 제거, demo-mine 유지)`)
}

for (const rel of SAMPLE_FILES) {
  const path = join(ROOT, rel)
  if (existsSync(path)) {
    rmSync(path)
    console.log(`삭제: ${rel}`)
  }
}

patchFile('src/mocks/loader.ts', [
  ['// TEST SAMPLE(dak.gg) — START imports', '// END TEST SAMPLE(dak.gg) imports'],
  ['// TEST SAMPLE(dak.gg) — START inject', '// END TEST SAMPLE(dak.gg) inject'],
])

patchFile('src/mocks/seasonHistory.ts', [
  ['// TEST SAMPLE(dak.gg) — START imports', '// END TEST SAMPLE(dak.gg) imports'],
  ['  // TEST SAMPLE(dak.gg) — START tier', '  // END TEST SAMPLE(dak.gg) tier'],
])

patchFile('src/mocks/loader.test.ts', [
  ['    // TEST SAMPLE(dak.gg) — START nicknames', '    // END TEST SAMPLE(dak.gg) nicknames'],
  ['  // TEST SAMPLE(dak.gg) — START tests', '  // END TEST SAMPLE(dak.gg) tests'],
])

stripDakggEquipmentOverrides()

for (const rel of PATCH_TARGETS) {
  console.log(`패치: ${rel}`)
}

console.log('\n완료 — npm run typecheck && npm run test:run 으로 확인하세요.')
