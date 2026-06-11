import { normalizeAssetSlug } from '@/utils/assetUrls'

/** loadout(특성·큐브·전술 스킬) slug — manifest 기준 검증 목록 */
export const VERIFIED_LOADOUT_SLUGS: ReadonlySet<string> = new Set([
  'chaos/stopping-power',
  'chaos/red-sprite',
  'havoc/frenzy',
  'havoc/vampiric-bloodline',
  'cube-sanguine',
  'fortification/steadfast',
  'fortification/caution',
  'fortification/fortification1',
  'fortification/fortification2',
  'havoc/havoc1',
  'support/support1',
  'support/healing-factor',
  'tactical-skills/blink',
  'tactical-skills/healing-wind',
  'tactical-skills/quake',
])

export const VERIFIED_TRAIT_SLUGS: ReadonlySet<string> = new Set(
  [...VERIFIED_LOADOUT_SLUGS].filter((s) => !s.startsWith('tactical-skills/')),
)

export const VERIFIED_TACTICAL_SKILL_SLUGS: ReadonlySet<string> = new Set(
  [...VERIFIED_LOADOUT_SLUGS].filter((s) => s.startsWith('tactical-skills/')),
)

export function resolveVerifiedLoadoutSlug(slug: string | null | undefined): string | null {
  const normalized = normalizeAssetSlug(slug)
  if (!normalized || !VERIFIED_LOADOUT_SLUGS.has(normalized)) return null
  return normalized
}

export function resolveVerifiedTraitSlug(slug: string | null | undefined): string | null {
  const normalized = normalizeAssetSlug(slug)
  if (!normalized || !VERIFIED_TRAIT_SLUGS.has(normalized)) return null
  return normalized
}

export function resolveVerifiedTacticalSkillSlug(slug: string | null | undefined): string | null {
  const normalized = normalizeAssetSlug(slug)
  if (!normalized) return null
  const full = normalized.startsWith('tactical-skills/')
    ? normalized
    : `tactical-skills/${normalized}`
  if (!VERIFIED_TACTICAL_SKILL_SLUGS.has(full)) return null
  return full
}
