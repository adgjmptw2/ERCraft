import { describe, expect, it } from 'vitest'

import { mapGameToEquipmentPreview } from '@/utils/equipmentPreviewMapper'

describe('mapGameToEquipmentPreview', () => {
  it('절단마술사 dak.gg-61394990 실데이터 필드', () => {
    const preview = mapGameToEquipmentPreview({
      bestWeapon: 6,
      tacticalSkillGroup: 30,
      traitFirstCore: 7000401,
      traitFirstSub: [7010501, 7011401],
      traitSecondSub: [7111101, 7110201],
      equipment: [113408, 202508, 201504, 205508, 204419],
      equipmentGrade: [5, 5, 5, 5, 4],
    })

    expect(preview?.weaponTypeSlug).toBe('weapons/weapon-group/shuriken')
    expect(preview?.tacticalSkillSlug).toBe('tactical-skills/blink')
    expect(preview?.mainTraitSlug).toBe('havoc/vampiric-bloodline')
    expect(preview?.subTraitSlug).toBe('fortification/fortification1')
    expect(preview?.gear?.weapon).toBe('weapons/shuriken/frost-venom-dart')
    expect(preview?.gear?.chest).toBe('armor/chest/elegant-gown')
    expect(preview?.gear?.head).toBe('armor/head/sultan-s-turban')
    expect(preview?.gear?.arm).toBe('armor/arm-accessory/emerald-tablet')
    expect(preview?.gear?.leg).toBe('armor/leg/delta-red')
    expect(preview?.gearGrade?.weapon).toBe('legend')
    expect(preview?.gearGrade?.leg).toBe('epic')
  })

  it('매핑 없는 코드는 빈 슬롯', () => {
    const preview = mapGameToEquipmentPreview({
      bestWeapon: 999,
      equipment: [1],
    })
    expect(preview).toBeUndefined()
  })
})
