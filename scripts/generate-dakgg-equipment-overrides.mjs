/**
 * dak.gg 샘플 매치의 equipmentPreview → equipmentPreviewOverrides.ts 갱신
 * (gen-dakgg-sample 이후 선택 실행; 기본은 sample*.ts 에 equipmentPreview 내장)
 * 사용: node scripts/generate-dakgg-equipment-overrides.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SAMPLE_MODULES = [
  { importPath: '../src/mocks/sampleJeoldan.ts', exportName: 'SAMPLE_JEOLDAN_MATCHES' },
  { importPath: '../src/mocks/sampleIyurang.ts', exportName: 'SAMPLE_IYURANG_MATCHES' },
  { importPath: '../src/mocks/sampleAgagongju.ts', exportName: 'SAMPLE_AGAGONGJU_MATCHES' },
  { importPath: '../src/mocks/sampleRidajungdok.ts', exportName: 'SAMPLE_RIDAJUNGDOK_MATCHES' },
]

async function main() {
  const overrides = {}
  for (const mod of SAMPLE_MODULES) {
    const loaded = await import(join(ROOT, 'scripts', mod.importPath.replace('../', '')))
    const matches = loaded[mod.exportName] ?? []
    for (const m of matches) {
      if (m.equipmentPreview) overrides[m.matchId] = m.equipmentPreview
    }
  }

  const lines = [
    '// MOCK — 장비/특성 아이콘 데모용 (dak.gg API → erCodeMaps.generated.json)',
    '// 생성: node docs/gen-dakgg-sample.mjs && node scripts/generate-dakgg-equipment-overrides.mjs',
    '// 제거: npm run samples:remove-equipment-preview',
    '',
    "import type { MatchEquipmentPreview } from '@/types/match'",
    '',
    'const DEMO_MINE: MatchEquipmentPreview = {',
    "  weaponTypeSlug: 'weapons/weapon-group/shuriken',",
    "  tacticalSkillSlug: 'tactical-skills/quake',",
    "  mainTraitSlug: 'chaos/stopping-power',",
    "  subTraitSlug: 'havoc/frenzy',",
    '  gear: {',
    "    weapon: 'weapons/shuriken/fuhma-shuriken',",
    "    chest: 'armor/chest/battle-suit',",
    "    head: 'armor/head/tactical-goggles',",
    "    arm: 'armor/arm-accessory/bracelet',",
    "    leg: 'armor/leg/tactical-shoes',",
    '  },',
    '}',
    '',
    'export const MATCH_EQUIPMENT_PREVIEW_OVERRIDES: Record<string, MatchEquipmentPreview> = {',
    "  'demo-mine-001': DEMO_MINE,",
  ]

  for (const [matchId, preview] of Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`  '${matchId}': ${JSON.stringify(preview)},`)
  }
  lines.push('}', '')

  const out = join(ROOT, 'src', 'mocks', 'equipmentPreviewOverrides.ts')
  writeFileSync(out, lines.join('\n'), 'utf8')
  console.log(`Wrote ${out} (${Object.keys(overrides).length} dak.gg previews + demo-mine-001)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
