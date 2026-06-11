/**
 * dak.gg + er-gamedata → src/assets/erCodeMaps.generated.json
 * 사용: npm run code-maps:sync
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MANIFEST_PATH = join(ROOT, 'public', 'assets', 'manifest.json')
const OUT_PATH = join(ROOT, 'src', 'assets', 'erCodeMaps.generated.json')

const ER_GAMEDATA = 'https://raw.githubusercontent.com/pypy-vrc/er-gamedata/master'
const DAKGG = 'https://er.dakgg.io/api/v1/data'

const WEAPON_TYPE_KEY_TO_GROUP = {
  Glove: 'glove',
  Tonfa: 'tonfa',
  Bat: 'bat',
  Whip: 'whip',
  HighAngleFire: 'throwing',
  DirectFire: 'shuriken',
  Bow: 'bow',
  CrossBow: 'crossbow',
  Pistol: 'pistol',
  AssaultRifle: 'assault-rifle',
  SniperRifle: 'sniper-rifle',
  Hammer: 'hammer',
  Axe: 'axe',
  OneHandSword: 'dagger',
  TwoHandSword: 'twohanded-sword',
  DualSword: 'dual-sword',
  Spear: 'spear',
  Nunchaku: 'nunchaku',
  Rapier: 'rapier',
  Guitar: 'guitar',
  Camera: 'camera',
  Arcana: 'arcana',
  VFArm: 'vf-prosthetic',
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseL10nLines(text, prefix) {
  const map = new Map()
  for (const line of text.split('\n')) {
    if (!line.startsWith(prefix)) continue
    const sep = line.indexOf('┃')
    if (sep === -1) continue
    const key = line.slice(prefix.length, sep)
    const code = Number(key)
    if (!Number.isInteger(code)) continue
    map.set(code, line.slice(sep + 1).trim())
  }
  return map
}

function findItemSlug(englishName, manifestItems) {
  const base = slugify(englishName)
  if (!base) return null
  const exact = manifestItems.find((s) => s === base || s.endsWith(`/${base}`))
  if (exact) return exact
  const partial = manifestItems.filter((s) => s.split('/').pop() === base)
  return partial.length === 1 ? partial[0] : null
}

function findLoadoutSlug(englishName, traitGroup, manifestLoadout) {
  const group = traitGroup?.toLowerCase()
  const base = slugify(englishName)
  if (!base) return null
  const candidates = [
    group && group !== 'none' && group !== 'cobalt' ? `${group}/${base}` : null,
    base,
    group === 'chaos' ? `chaos/${base}` : null,
    group === 'havoc' ? `havoc/${base}` : null,
    group === 'fortification' ? `fortification/${base}` : null,
    group === 'support' ? `support/${base}` : null,
  ].filter(Boolean)
  for (const c of candidates) {
    if (manifestLoadout.includes(c)) return c
  }
  const partial = manifestLoadout.filter((s) => s.split('/').pop() === base)
  return partial.length === 1 ? partial[0] : null
}

async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res.text()
}

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  const manifestItems = manifest.items ?? []
  const manifestLoadout = manifest.loadout ?? []
  const weaponGroupSlugs = new Set(
    (manifest.items ?? []).filter((s) => s.startsWith('weapons/weapon-group/')),
  )

  const [englishL10n, traits, dakggItems, dakggTactical] = await Promise.all([
    fetchText(`${ER_GAMEDATA}/l10n/English.txt`),
    fetch(`${ER_GAMEDATA}/data/Trait.json`).then((r) => r.json()),
    fetch(`${DAKGG}/items`).then((r) => r.json()),
    fetch(`${DAKGG}/tactical-skills`).then((r) => r.json()),
  ])

  const itemNames = parseL10nLines(englishL10n, 'Item/Name/')
  const traitNames = parseL10nLines(englishL10n, 'Trait/Name/')

  const DAKGG_GRADE_TO_UI = { Legend: 'legend', Epic: 'epic', Mythic: 'blood' }

  const itemCodeToSlug = {}
  const itemCodeToGrade = {}
  for (const item of dakggItems.items ?? []) {
    const en = itemNames.get(item.id)
    if (!en) continue
    const slug = findItemSlug(en, manifestItems)
    if (slug) itemCodeToSlug[item.id] = slug
    const grade = DAKGG_GRADE_TO_UI[item.grade]
    if (grade) itemCodeToGrade[item.id] = grade
  }

  const TRAIT_GROUP_TO_SLUG = {
    Havoc: 'havoc/havoc1',
    Fortification: 'fortification/fortification1',
    Chaos: 'chaos/stopping-power',
    Support: 'support/support1',
  }
  const traitGroupToSlug = {}
  for (const [group, slug] of Object.entries(TRAIT_GROUP_TO_SLUG)) {
    if (manifestLoadout.includes(slug)) traitGroupToSlug[group] = slug
  }

  const traitCodeToSlug = {}
  const traitCodeToGroup = {}
  const traitMeta = {}
  for (const row of traits) {
    if (!row.active || row.traitType === 'None' || row.traitType === 'Cobalt') continue
    traitCodeToGroup[row.code] = row.traitGroup
    const en = traitNames.get(row.code)
    if (!en) continue
    const slug = findLoadoutSlug(en, row.traitGroup, manifestLoadout)
    if (slug) {
      traitCodeToSlug[row.code] = slug
      traitMeta[row.code] = { name: en, group: row.traitGroup, type: row.traitType }
    }
  }

  const weaponTypeIdToSlug = {}
  const chars = await fetch(`${DAKGG}/characters`).then((r) => r.json())
  for (const c of chars.characters ?? []) {
    for (const wt of c.weaponTypes ?? []) {
      const group = WEAPON_TYPE_KEY_TO_GROUP[wt.key]
      if (!group) continue
      const full = `weapons/weapon-group/${group}`
      if (weaponGroupSlugs.has(full)) weaponTypeIdToSlug[wt.id] = full
    }
  }

  const skillGroupNames = parseL10nLines(englishL10n, 'Skill/Group/Name/')
  const tacticalGroups = await fetch(`${ER_GAMEDATA}/data/TacticalSkillSetGroup.json`).then((r) =>
    r.json(),
  )
  const tacticalSkillGroupToSlug = {}
  for (const row of tacticalGroups) {
    if (!row.active || row.modeType === 4) continue
    const iconCode = String(row.icon ?? '').match(/(\d{7})/)?.[1]
    if (!iconCode) continue
    const en = skillGroupNames.get(Number(iconCode))
    if (!en) continue
    const slug = `tactical-skills/${slugify(en)}`
    if (manifestLoadout.includes(slug)) {
      tacticalSkillGroupToSlug[row.group] = slug
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    sources: {
      items: `${DAKGG}/items`,
      traits: `${ER_GAMEDATA}/data/Trait.json`,
      l10n: `${ER_GAMEDATA}/l10n/English.txt`,
      tacticalSkills: `${DAKGG}/tactical-skills`,
    },
    itemCodeToSlug,
    itemCodeToGrade,
    traitCodeToSlug,
    traitCodeToGroup,
    traitGroupToSlug,
    weaponTypeIdToSlug,
    tacticalSkillGroupToSlug,
    traitMeta,
  }

  writeFileSync(OUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${OUT_PATH}`)
  console.log(
    `  items: ${Object.keys(itemCodeToSlug).length}, traits: ${Object.keys(traitCodeToSlug).length}, weapons: ${Object.keys(weaponTypeIdToSlug).length}, tactical: ${Object.keys(tacticalSkillGroupToSlug).length}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
