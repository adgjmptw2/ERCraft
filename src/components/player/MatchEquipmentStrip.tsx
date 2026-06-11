import { GameAssetIcon, ItemIcon, TacticalSkillIcon, TraitIcon, WeaponTypeIcon } from '@/components/shared'
import type { MatchEquipmentPreview } from '@/types/match'

interface MatchEquipmentStripProps {
  preview?: MatchEquipmentPreview
}

/** 슬롯 1~4 — 좌: 무기종류·스킬(사각) / 우: 메인·보조 특성(원형) */
export function MatchLoadoutSlotGrid({ preview }: MatchEquipmentStripProps) {
  return (
    <div className="grid grid-cols-2 gap-0.5" aria-label="무기·스킬·특성">
      <WeaponTypeIcon
        slug={preview?.weaponTypeSlug}
        size="md"
        shape="square"
        decorative={false}
        label="무기 종류"
      />
      <TraitIcon slug={preview?.mainTraitSlug} size="md" decorative={false} label="메인 특성" />
      <TacticalSkillIcon
        slug={preview?.tacticalSkillSlug}
        size="md"
        shape="square"
        decorative={false}
        label="전술 스킬"
      />
      <TraitIcon slug={preview?.subTraitSlug} size="md" decorative={false} label="보조 특성" />
    </div>
  )
}

/** 슬롯 5~9 — 무기 · 상의 · 모자 · 팔 · 신발 */
export function MatchGearSlotGrid({ preview }: MatchEquipmentStripProps) {
  const gear = preview?.gear

  const grades = preview?.gearGrade

  const slots = [
    { key: 'weapon', slug: gear?.weapon, grade: grades?.weapon, label: '무기' },
    { key: 'chest', slug: gear?.chest, grade: grades?.chest, label: '상의' },
    { key: 'head', slug: gear?.head, grade: grades?.head, label: '모자' },
    { key: 'arm', slug: gear?.arm, grade: grades?.arm, label: '팔' },
    { key: 'leg', slug: gear?.leg, grade: grades?.leg, label: '신발' },
  ] as const

  return (
    <div className="space-y-0.5" aria-label="장비">
      <div className="flex gap-0.5">
        {slots.slice(0, 3).map((slot) =>
          slot.slug ? (
            <ItemIcon
              key={slot.key}
              slug={slot.slug}
              grade={slot.grade}
              size="gear"
              className="object-contain px-0.5 py-px"
              decorative={false}
              label={slot.label}
            />
          ) : (
            <GameAssetIcon key={slot.key} size="gear" decorative label={slot.label} />
          ),
        )}
      </div>
      <div className="flex gap-0.5">
        {slots.slice(3).map((slot) =>
          slot.slug ? (
            <ItemIcon
              key={slot.key}
              slug={slot.slug}
              grade={slot.grade}
              size="gear"
              className="object-contain px-0.5 py-px"
              decorative={false}
              label={slot.label}
            />
          ) : (
            <GameAssetIcon key={slot.key} size="gear" decorative label={slot.label} />
          ),
        )}
      </div>
    </div>
  )
}
