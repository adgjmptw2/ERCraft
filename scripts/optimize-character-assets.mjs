/**
 * raw-assets/characters/{characterNum}.png|jpg → public/assets/characters/{characterNum}.webp (128×128)
 * 사용: npm run assets:characters
 */
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const RAW_DIR = join(ROOT, 'raw-assets', 'characters')
const OUT_DIR = join(ROOT, 'public', 'assets', 'characters')
const SIZE = 128

const NUMERIC_FILE = /^(\d+)\.(png|jpe?g|webp)$/i

async function main() {
  if (!existsSync(RAW_DIR)) {
    console.log(`원본 폴더 없음: ${RAW_DIR}`)
    console.log('raw-assets/characters/{characterNum}.png 형태로 원본을 넣은 뒤 다시 실행하세요.')
    process.exit(0)
  }

  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.error('sharp가 필요합니다: npm install -D sharp')
    process.exit(1)
  }

  mkdirSync(OUT_DIR, { recursive: true })

  const files = readdirSync(RAW_DIR)
  const inputs = files.filter((f) => NUMERIC_FILE.test(f))

  if (inputs.length === 0) {
    console.log(`처리할 파일 없음 (${RAW_DIR} — 파일명은 숫자.characterNum 확장자만)`)
    process.exit(0)
  }

  let ok = 0
  for (const file of inputs) {
    const match = file.match(NUMERIC_FILE)
    if (!match) continue
    const num = match[1]
    const src = join(RAW_DIR, file)
    const dest = join(OUT_DIR, `${num}.webp`)
    await sharp(src).resize(SIZE, SIZE, { fit: 'cover' }).webp({ quality: 82 }).toFile(dest)
    ok += 1
    console.log(`${file} → public/assets/characters/${num}.webp`)
  }

  console.log(`완료: ${ok}개`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
