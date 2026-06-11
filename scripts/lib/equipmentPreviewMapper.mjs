/**
 * gen-dakgg-sample.mjs용 — src/utils/equipmentPreviewMapper.ts 와 동일 규칙
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const maps = JSON.parse(
  readFileSync(join(ROOT, 'src', 'assets', 'erCodeMaps.generated.json'), 'utf8'),
)
const manifest = JSON.parse(
  readFileSync(join(ROOT, 'public', 'assets', 'manifest.json'), 'utf8'),
)

const verifiedItems = new Set(manifest.items ?? [])
const verifiedLoadout = new Set(manifest.loadout ?? [])

const EQUIPMENT_GRADE_NUM = { 5: 'legend', 4: 'epic', 6: 'blood' }

function mapCode(table, code) {
  if (code === null || code === undefined) return null
  return table[String(code)] ?? null
}

function verifiedWeaponType(slug) {
  if (!slug) return null
  const full = slug.startsWith('weapons/weapon-group/') ? slug : `weapons/weapon-group/${slug}`
  return verifiedItems.has(full) ? full : null
}

function verifiedLoadout(slug) {
  if (!slug) return null
  return verifiedLoadout.has(slug) ? slug : null
}

function verifiedTactical(slug) {
  if (!slug) return null
  const full = slug.startsWith('tactical-skills/') ? slug : `tactical-skills/${slug}`
  return verifiedLoadout.has(full) ? full : null
}

function verifiedGear(slug) {
  if (!slug || slug.startsWith('weapons/weapon-group/')) return null
  return verifiedItems.has(slug) ? slug : null
}

function mapGearSlot(equipment, slotIndex) {
  const code = equipment?.[slotIndex]
  if (code === undefined) return undefined
  const slug = verifiedGear(mapCode(maps.itemCodeToSlug, code))
  return slug ?? undefined
}

function mapGearGradeSlot(equipment, equipmentGrade, slotIndex) {
  const code = equipment?.[slotIndex]
  if (code === undefined) return undefined
  const fromItem = maps.itemCodeToGrade?.[String(code)]
  if (fromItem) return fromItem
  const num = equipmentGrade?.[slotIndex]
  return EQUIPMENT_GRADE_NUM[num]
}

function mapSubTraitGroupSlug(game) {
  const code = game.traitSecondSub?.[0]
  if (code === undefined) return undefined
  const group = maps.traitCodeToGroup?.[String(code)]
  if (!group) return undefined
  return verifiedLoadout(maps.traitGroupToSlug?.[group]) ?? undefined
}

export function mapGameToEquipmentPreview(game) {
  const weaponTypeSlug =
    verifiedWeaponType(mapCode(maps.weaponTypeIdToSlug, game.bestWeapon)) ?? undefined
  const tacticalSkillSlug =
    verifiedTactical(mapCode(maps.tacticalSkillGroupToSlug, game.tacticalSkillGroup)) ??
    undefined
  const mainTraitSlug =
    verifiedLoadout(mapCode(maps.traitCodeToSlug, game.traitFirstCore)) ?? undefined
  const subTraitSlug = mapSubTraitGroupSlug(game)

  const gear = {
    weapon: mapGearSlot(game.equipment, 0),
    chest: mapGearSlot(game.equipment, 1),
    head: mapGearSlot(game.equipment, 2),
    arm: mapGearSlot(game.equipment, 3),
    leg: mapGearSlot(game.equipment, 4),
  }
  const gearGrade = {
    weapon: mapGearGradeSlot(game.equipment, game.equipmentGrade, 0),
    chest: mapGearGradeSlot(game.equipment, game.equipmentGrade, 1),
    head: mapGearGradeSlot(game.equipment, game.equipmentGrade, 2),
    arm: mapGearGradeSlot(game.equipment, game.equipmentGrade, 3),
    leg: mapGearGradeSlot(game.equipment, game.equipmentGrade, 4),
  }
  const hasGear = Object.values(gear).some(Boolean)
  const hasGrade = Object.values(gearGrade).some(Boolean)

  if (!weaponTypeSlug && !tacticalSkillSlug && !mainTraitSlug && !subTraitSlug && !hasGear) {
    return undefined
  }

  return {
    weaponTypeSlug,
    tacticalSkillSlug,
    mainTraitSlug,
    subTraitSlug,
    gear: hasGear ? gear : undefined,
    gearGrade: hasGrade ? gearGrade : undefined,
  }
}
