// MOCK — 장비/특성 아이콘 데모용 (검증된 Fankit slug만)
// dak.gg 샘플은 gen-dakgg-sample.mjs 가 API 필드로 equipmentPreview 생성
// 제거: npm run samples:remove-equipment-preview

import type { MatchEquipmentPreview } from '@/types/match'

/** 절단마술사 최신전 — dak.gg API 필드 (samples:gen-dakgg 후 sample*.ts 로 이전 가능) */
const JEOLDAN_LATEST: MatchEquipmentPreview = {
  weaponTypeSlug: 'weapons/weapon-group/shuriken',
  tacticalSkillSlug: 'tactical-skills/blink',
  mainTraitSlug: 'havoc/vampiric-bloodline',
  subTraitSlug: 'fortification/fortification1',
  gear: {
    weapon: 'weapons/shuriken/frost-venom-dart',
    chest: 'armor/chest/elegant-gown',
    head: 'armor/head/sultan-s-turban',
    arm: 'armor/arm-accessory/emerald-tablet',
    leg: 'armor/leg/delta-red',
  },
  gearGrade: {
    weapon: 'legend',
    chest: 'legend',
    head: 'legend',
    arm: 'legend',
    leg: 'epic',
  },
}

export const MATCH_EQUIPMENT_PREVIEW_OVERRIDES: Record<string, MatchEquipmentPreview> = {
  'dakgg-61394990': JEOLDAN_LATEST,
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
