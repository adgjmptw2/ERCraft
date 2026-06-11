/**
 * Eternal Return Fankit → ERCraft public/assets
 * 사용: npm run assets:import-fankit
 *
 * 환경변수:
 *   FANKIT_ROOT  기본값 D:\er\Eternal Return Fankit
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CHARACTER_NUM_TO_NAME,
  resolveCharacterNum,
  skinCode,
} from './bser-character-ids.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const FANKIT_ROOT = process.env.FANKIT_ROOT ?? 'D:\\er\\Eternal Return Fankit'
const OUT = join(ROOT, 'public', 'assets')

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp'])
const SKIP_DIRS = new Set(['.git', 'node_modules'])

const TIER_SLUG = {
  unrank: 'unrank',
  iron: 'iron',
  bronze: 'bronze',
  silver: 'silver',
  gold: 'gold',
  platinum: 'platinum',
  diamond: 'diamond',
  meteorite: 'meteorite',
  mithril: 'mithril',
  titan: 'titan',
  immortal: 'immortal',
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true })
}

function walkFiles(dir) {
  const out = []
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkFiles(full))
    else if (IMAGE_EXT.has(extname(entry.name).toLowerCase())) out.push(full)
  }
  return out
}

function parsePortrait(fileName) {
  const base = basename(fileName, extname(fileName))
  const skinMini = base.match(/_(?:Mini|Skin_\d+_Mini)_(\d+)$/i) ?? base.match(/_Mini_(\d+)$/i)
  const skinHalf = base.match(/_Half_(\d+)$/i)
  const skinFull = base.match(/_Full_(\d+)$/i)
  const skinSkinMini = base.match(/_Skin_(\d+)_Mini$/i)

  if (skinSkinMini) return { kind: 'mini', skin: Number(skinSkinMini[1]) }
  if (skinMini) return { kind: 'mini', skin: Number(skinMini[1]) }
  if (skinHalf) return { kind: 'half', skin: Number(skinHalf[1]) }
  if (skinFull) return { kind: 'full', skin: Number(skinFull[1]) }
  return null
}

function parseSkillKey(fileName) {
  const base = basename(fileName, extname(fileName))
  const tail = base.includes('_') ? base.split('_').pop() : base
  const key = tail
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const map = {
    passive: 'passive',
    p: 'passive',
    q: 'q',
    w: 'w',
    e: 'e',
    r: 'r',
    'q1': 'q',
    'q2': 'q2',
    'leaping-strike': 'e',
    'bloodfest': 'passive',
    'chainsaw-murderer': 'r',
    'adrenaline-burst': 'w',
  }
  return map[key] ?? key
}

async function loadSharp() {
  try {
    return (await import('sharp')).default
  } catch {
    console.error('sharp 필요: npm install -D sharp')
    process.exit(1)
  }
}

async function writeWebp(sharp, src, dest, size) {
  ensureDir(dirname(dest))
  let img = sharp(src)
  if (size) img = img.resize(size, size, { fit: 'cover' })
  await img.webp({ quality: 82 }).toFile(dest)
}

async function writeWebpMax(sharp, src, dest, maxDim) {
  ensureDir(dirname(dest))
  await sharp(src)
    .resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(dest)
}

async function importCharacters(sharp, manifest) {
  const charRoot = join(FANKIT_ROOT, 'CharactER')
  if (!existsSync(charRoot)) {
    console.warn('CharactER 폴더 없음 — 스킵')
    return
  }

  const characters = []
  const skins = []

  for (const folder of readdirSync(charRoot, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue
    const characterNum = resolveCharacterNum(folder.name)
    if (characterNum === null) {
      console.warn(`캐릭터 매핑 스킵: ${folder.name}`)
      continue
    }

    const charDir = join(charRoot, folder.name)
    const outCharDir = join(OUT, 'characters', String(characterNum))
    ensureDir(outCharDir)

    const skillOut = join(outCharDir, 'skills')
    let hasDefaultMini = false

    for (const file of walkFiles(charDir)) {
      const rel = relative(charDir, file)
      const parts = rel.split(/[/\\]/)

      if (parts.some((p) => /skill icon/i.test(p))) {
        const key = parseSkillKey(basename(file))
        await writeWebp(sharp, file, join(skillOut, `${key}.webp`), 64)
        continue
      }

      const portrait = parsePortrait(file)
      if (!portrait) continue

      const { kind, skin } = portrait
      const outName = `${kind}-${skin}.webp`
      const outPath = join(outCharDir, outName)

      if (kind === 'mini') {
        await writeWebp(sharp, file, outPath, 128)
        const sc = skinCode(characterNum, skin)
        await writeWebp(sharp, file, join(OUT, 'skins', `${sc}.webp`), 128)
        skins.push(sc)
        if (skin === 0) {
          await writeWebp(sharp, file, join(OUT, 'characters', `${characterNum}.webp`), 128)
          hasDefaultMini = true
        }
      } else if (kind === 'half') {
        await writeWebpMax(sharp, file, outPath, 512)
      } else {
        await writeWebpMax(sharp, file, outPath, 1024)
      }
    }

    if (!hasDefaultMini) {
      const fallback = join(outCharDir, 'mini-0.webp')
      if (existsSync(fallback)) {
        await writeWebp(sharp, fallback, join(OUT, 'characters', `${characterNum}.webp`), 128)
      }
    }

    characters.push(characterNum)
    console.log(`캐릭터 ${characterNum} (${CHARACTER_NUM_TO_NAME[characterNum] ?? '?'})`)
  }

  manifest.characters = [...new Set(characters)].sort((a, b) => a - b)
  manifest.skins = [...new Set(skins)].sort((a, b) => a - b)
}

async function importTiers(sharp, manifest) {
  const tierRoot = join(FANKIT_ROOT, 'Rank Tier')
  if (!existsSync(tierRoot)) return

  const tiers = []
  for (const file of walkFiles(tierRoot)) {
    const name = basename(file, extname(file)).replace(/^\d+\.\s*/, '')
    const slug = TIER_SLUG[slugify(name)] ?? slugify(name)
    await writeWebp(sharp, file, join(OUT, 'tiers', `${slug}.webp`), 128)
    tiers.push(slug)
  }
  manifest.tiers = tiers.sort()
}

async function importBrand() {
  const brandDir = join(OUT, 'brand')
  ensureDir(brandDir)
  for (const name of ['logo_black.png', 'logo__white.png']) {
    const src = join(FANKIT_ROOT, name)
    if (existsSync(src)) copyFileSync(src, join(brandDir, name.replace('__', '-')))
  }
}

async function importBySlugTree(sharp, fankitSub, assetSub, manifestKey, manifest, iconSize = 64) {
  const srcRoot = join(FANKIT_ROOT, fankitSub)
  if (!existsSync(srcRoot)) return

  const keys = []
  for (const file of walkFiles(srcRoot)) {
    const rel = relative(srcRoot, file)
    const slugPath = rel
      .split(/[/\\]/)
      .map((part) => slugify(part.replace(/^\d+\.\s*/, '').replace(extname(part), '')))
      .filter(Boolean)
      .join('/')
    if (!slugPath) continue

    const dest = join(OUT, assetSub, `${slugPath}.webp`)
    await writeWebp(sharp, file, dest, iconSize)
    keys.push(slugPath)
  }
  manifest[manifestKey] = [...new Set(keys)].sort()
}

async function main() {
  if (!existsSync(FANKIT_ROOT)) {
    console.error(`Fankit 경로 없음: ${FANKIT_ROOT}`)
    process.exit(1)
  }

  const sharp = await loadSharp()
  const manifest = {
    version: 1,
    source: 'Eternal Return Fankit',
    characterNumKey: 'BSER Open API characterNum',
    skinCodeFormula: '1000000 + characterNum * 1000 + skinIndex',
  }

  if (existsSync(OUT)) {
    for (const sub of ['characters', 'skins', 'tiers', 'items', 'loadout', 'brand']) {
      const p = join(OUT, sub)
      if (existsSync(p)) rmSync(p, { recursive: true, force: true })
    }
  }
  ensureDir(OUT)

  console.log(`Fankit: ${FANKIT_ROOT}`)
  console.log(`출력: ${OUT}\n`)

  await importBrand()
  await importCharacters(sharp, manifest)
  await importTiers(sharp, manifest)
  await importBySlugTree(sharp, 'Item', 'items', 'items', manifest, 64)
  await importBySlugTree(sharp, 'Loadout', 'loadout', 'loadout', manifest, 64)

  writeFileSync(join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  const count = walkFiles(OUT).length
  const bytes = walkFiles(OUT).reduce((s, f) => s + statSync(f).size, 0)
  console.log(`\n완료: ${count} files, ${(bytes / 1024 / 1024).toFixed(1)} MB`)
  console.log(`manifest: public/assets/manifest.json`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
