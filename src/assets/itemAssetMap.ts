import generated from '@/assets/erCodeMaps.generated.json'
import { normalizeAssetSlug } from '@/utils/assetUrls'

/** npm run code-maps:sync — dak.gg items + er-gamedata l10n (manifest 교차 검증) */
export const ITEM_CODE_TO_SLUG: Readonly<Record<number, string>> = Object.fromEntries(
  Object.entries(generated.itemCodeToSlug).map(([code, slug]) => [Number(code), slug]),
)

/** manifest import 기준 존재 확인된 slug (UI 노출 허용 목록) */
export const VERIFIED_ITEM_SLUGS: ReadonlySet<string> = new Set([
  'apple',
  'material/battery',
  'material/electronic-parts',
  'material/cloth',
  'armor/chest/battle-suit',
  'armor/chest/elegant-gown',
  'armor/head/tactical-goggles',
  'armor/head/sultan-s-turban',
  'armor/arm-accessory/bracelet',
  'armor/arm-accessory/emerald-tablet',
  'armor/leg/tactical-shoes',
  'armor/leg/delta-red',
  'weapons/arcana/glass-bead',
  'weapons/shuriken/fuhma-shuriken',
  'weapons/shuriken/frost-venom-dart',
  'weapons/weapon-group/arcana',
  'weapons/weapon-group/shuriken',
  'weapons/weapon-group/throwing',
])

export function resolveItemSlugFromCode(
  itemCode: number | string | null | undefined,
): string | null {
  if (itemCode === null || itemCode === undefined) return null
  const code = typeof itemCode === 'number' ? itemCode : Number(itemCode)
  if (!Number.isFinite(code) || !Number.isInteger(code) || code <= 0) return null

  const slug = ITEM_CODE_TO_SLUG[code]
  if (!slug) return null
  return normalizeAssetSlug(slug)
}

export function resolveVerifiedItemSlug(slug: string | null | undefined): string | null {
  const normalized = normalizeAssetSlug(slug)
  if (!normalized || !VERIFIED_ITEM_SLUGS.has(normalized)) return null
  return normalized
}

/** 슬롯1 — 무기 종류 아이콘 (weapon-group) */
export function resolveVerifiedWeaponTypeSlug(slug: string | null | undefined): string | null {
  const normalized = normalizeAssetSlug(slug)
  if (!normalized) return null
  const full = normalized.startsWith('weapons/weapon-group/')
    ? normalized
    : `weapons/weapon-group/${normalized}`
  if (!VERIFIED_ITEM_SLUGS.has(full)) return null
  return full
}

export function resolveVerifiedGearItemSlug(slug: string | null | undefined): string | null {
  const normalized = normalizeAssetSlug(slug)
  if (!normalized) return null
  if (!VERIFIED_ITEM_SLUGS.has(normalized)) return null
  if (normalized.startsWith('weapons/weapon-group/')) return null
  return normalized
}
