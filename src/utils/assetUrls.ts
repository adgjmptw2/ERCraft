import { resolveItemSlugFromCode } from '@/assets/itemAssetMap'

function parsePositiveInt(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' && value.trim() === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null
  return n
}

const SLUG_PATTERN = /^[a-z0-9]+(?:[/-][a-z0-9][a-z0-9-]*)*$/i

const TIER_LABEL_TO_SLUG: Record<string, string> = {
  iron: 'iron',
  아이언: 'iron',
  bronze: 'bronze',
  브론즈: 'bronze',
  silver: 'silver',
  실버: 'silver',
  gold: 'gold',
  골드: 'gold',
  platinum: 'platinum',
  플래티넘: 'platinum',
  diamond: 'diamond',
  다이아몬드: 'diamond',
  다이아: 'diamond',
  meteorite: 'meteorite',
  메테오라이트: 'meteorite',
  메테오: 'meteorite',
  mithril: 'mithril',
  미스릴: 'mithril',
  titan: 'titan',
  immortal: 'immortal',
  unranked: 'unrank',
  unrank: 'unrank',
}

export function getAssetBaseUrl(): string {
  const raw = import.meta.env.VITE_ASSET_BASE_URL?.trim() ?? ''
  return raw.replace(/\/$/, '')
}

/** Fankit slug 검증 — 경로 조작·절대 URL 차단 */
export function normalizeAssetSlug(slug: string | null | undefined): string | null {
  if (slug === null || slug === undefined) return null
  if (typeof slug !== 'string') return null
  const trimmed = slug.trim()
  if (!trimmed || trimmed === 'NaN' || trimmed === 'undefined') return null
  if (trimmed.includes('..')) return null
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null
  if (trimmed.startsWith('/') || trimmed.startsWith('\\')) return null
  if (!SLUG_PATTERN.test(trimmed)) return null
  return trimmed
}

function assetPath(category: string, segment: string): string {
  const base = getAssetBaseUrl()
  const path = `/assets/${category}/${segment}.webp`
  return base ? `${base}${path}` : path
}

function slugAssetUrl(category: 'items' | 'loadout', slug: string | null | undefined): string | null {
  const normalized = normalizeAssetSlug(slug)
  if (!normalized) return null
  return assetPath(category, normalized)
}

export function tierSlugFromLabel(tierLabel: string | null | undefined): string | null {
  if (tierLabel == null) return null
  const trimmed = tierLabel.trim()
  if (!trimmed) return null

  const head = trimmed.split(/\s+/)[0]?.toLowerCase() ?? ''
  if (!head) return null

  return TIER_LABEL_TO_SLUG[head] ?? null
}

export function characterPortraitUrlCandidates(
  characterNum: number | string | null | undefined,
): string[] {
  const num = parsePositiveInt(characterNum)
  if (num === null) return []
  const base = String(num)
  return [
    assetPath('characters', base),
    assetPath('characters', `${base}/mini-1`),
    assetPath('characters', `${base}/half-1`),
  ]
}

export function characterPortraitUrl(
  characterNum: number | string | null | undefined,
): string | null {
  return characterPortraitUrlCandidates(characterNum)[0] ?? null
}

export function itemIconUrlFromSlug(slug: string | null | undefined): string | null {
  return slugAssetUrl('items', slug)
}

export function loadoutIconUrlFromSlug(slug: string | null | undefined): string | null {
  return slugAssetUrl('loadout', slug)
}

export function traitIconUrlFromSlug(slug: string | null | undefined): string | null {
  return loadoutIconUrlFromSlug(slug)
}

export function weaponIconUrlFromSlug(slug: string | null | undefined): string | null {
  const normalized = normalizeAssetSlug(slug)
  if (!normalized) return null
  const path = normalized.startsWith('weapons/') ? normalized : `weapons/${normalized}`
  return itemIconUrlFromSlug(path)
}

/** itemCode → 검증된 slug 매핑이 있을 때만 URL 반환 */
export function itemIconUrlByCode(itemCode: number | string | null | undefined): string | null {
  const slug = resolveItemSlugFromCode(itemCode)
  if (!slug) return null
  return itemIconUrlFromSlug(slug)
}

/** @deprecated itemIconUrlByCode 사용 — 코드를 파일명으로 쓰지 않음 */
export function itemIconUrl(itemCode: number | string | null | undefined): string | null {
  return itemIconUrlByCode(itemCode)
}

export function weaponIconUrl(weaponCode: number | string | null | undefined): string | null {
  const code = parsePositiveInt(weaponCode)
  if (code === null) return null
  return null
}

export function characterSkinPortraitUrl(skinCode: number | string | null | undefined): string | null {
  const code = parsePositiveInt(skinCode)
  if (code === null) return null
  return assetPath('skins', String(code))
}

export function tierBadgeUrl(tierLabel: string | null | undefined): string | null {
  const slug = tierSlugFromLabel(tierLabel)
  if (!slug) return null
  return assetPath('tiers', slug)
}
