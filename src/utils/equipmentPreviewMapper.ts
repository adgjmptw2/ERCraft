import generated from '@/assets/erCodeMaps.generated.json'
import {
  resolveVerifiedGearItemSlug,
  resolveVerifiedWeaponTypeSlug,
} from '@/assets/itemAssetMap'
import {
  resolveVerifiedTacticalSkillSlug,
  resolveVerifiedTraitSlug,
} from '@/assets/loadoutAssetMap'
import type {
  MatchEquipmentGearGrades,
  MatchEquipmentGearPreview,
  MatchEquipmentPreview,
} from '@/types/match'
import {
  equipmentGradeFromDakggNumber,
  type EquipmentItemGrade,
} from '@/utils/equipmentItemGrade'

/** dak.gg 매치 / BSER 게임 결과 공통 필드 */
export interface EquipmentSourceGame {
  bestWeapon?: number
  tacticalSkillGroup?: number
  traitFirstCore?: number
  traitFirstSub?: number[]
  traitSecondSub?: number[]
  equipment?: number[]
  equipmentGrade?: number[]
}

interface ErCodeMaps {
  itemCodeToSlug: Record<string, string>
  itemCodeToGrade: Record<string, EquipmentItemGrade>
  traitCodeToSlug: Record<string, string>
  traitCodeToGroup: Record<string, string>
  traitGroupToSlug: Record<string, string>
  weaponTypeIdToSlug: Record<string, string>
  tacticalSkillGroupToSlug: Record<string, string>
}

const maps = generated as ErCodeMaps

function mapCode(
  table: Record<string, string>,
  code: number | null | undefined,
): string | null {
  if (code === null || code === undefined) return null
  return table[String(code)] ?? null
}

function mapGearSlot(
  equipment: number[] | undefined,
  slotIndex: number,
): string | undefined {
  const code = equipment?.[slotIndex]
  if (code === undefined) return undefined
  const slug = mapCode(maps.itemCodeToSlug, code)
  return resolveVerifiedGearItemSlug(slug) ?? undefined
}

function mapGearGradeSlot(
  equipment: number[] | undefined,
  equipmentGrade: number[] | undefined,
  slotIndex: number,
): EquipmentItemGrade | undefined {
  const code = equipment?.[slotIndex]
  if (code === undefined) return undefined
  const fromItem = maps.itemCodeToGrade?.[String(code)]
  if (fromItem) return fromItem
  return equipmentGradeFromDakggNumber(equipmentGrade?.[slotIndex])
}

/** 슬롯4 — 페어 트리 그룹 아이콘 (보조 특성: 저항 등) */
function mapSubTraitGroupSlug(game: EquipmentSourceGame): string | undefined {
  const code = game.traitSecondSub?.[0]
  if (code === undefined) return undefined
  const group = maps.traitCodeToGroup?.[String(code)]
  if (!group) return undefined
  const slug = maps.traitGroupToSlug?.[group]
  return resolveVerifiedTraitSlug(slug) ?? undefined
}

/**
 * dak.gg/BSER 원본 코드 → MatchEquipmentPreview (manifest 검증 slug만)
 * - 슬롯3: traitFirstCore
 * - 슬롯4: traitSecondSub 트리 그룹 (개별 보조 특성 아님)
 * - 장비: equipment[0..4] = 무기·상의·머리·팔·다리
 */
export function mapGameToEquipmentPreview(
  game: EquipmentSourceGame,
): MatchEquipmentPreview | undefined {
  const weaponTypeSlug =
    resolveVerifiedWeaponTypeSlug(mapCode(maps.weaponTypeIdToSlug, game.bestWeapon)) ??
    undefined
  const tacticalSkillSlug =
    resolveVerifiedTacticalSkillSlug(
      mapCode(maps.tacticalSkillGroupToSlug, game.tacticalSkillGroup),
    ) ?? undefined
  const mainTraitSlug =
    resolveVerifiedTraitSlug(mapCode(maps.traitCodeToSlug, game.traitFirstCore)) ?? undefined
  const subTraitSlug = mapSubTraitGroupSlug(game)

  const gear: MatchEquipmentGearPreview = {
    weapon: mapGearSlot(game.equipment, 0),
    chest: mapGearSlot(game.equipment, 1),
    head: mapGearSlot(game.equipment, 2),
    arm: mapGearSlot(game.equipment, 3),
    leg: mapGearSlot(game.equipment, 4),
  }

  const gearGrade: MatchEquipmentGearGrades = {
    weapon: mapGearGradeSlot(game.equipment, game.equipmentGrade, 0),
    chest: mapGearGradeSlot(game.equipment, game.equipmentGrade, 1),
    head: mapGearGradeSlot(game.equipment, game.equipmentGrade, 2),
    arm: mapGearGradeSlot(game.equipment, game.equipmentGrade, 3),
    leg: mapGearGradeSlot(game.equipment, game.equipmentGrade, 4),
  }

  const hasGear = Object.values(gear).some(Boolean)
  const hasGrade = Object.values(gearGrade).some(Boolean)
  if (
    !weaponTypeSlug &&
    !tacticalSkillSlug &&
    !mainTraitSlug &&
    !subTraitSlug &&
    !hasGear
  ) {
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
