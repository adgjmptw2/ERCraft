/**
 * equipmentPreview 데모 오버라이드 일괄 제거
 * 사용: npm run samples:remove-equipment-preview
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const OVERRIDE_FILE = 'src/mocks/equipmentPreviewOverrides.ts'

function stripMarkedBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker)
  if (start === -1) return source
  const end = source.indexOf(endMarker, start)
  if (end === -1) throw new Error(`종료 마커 없음: ${endMarker}`)
  return source.slice(0, start) + source.slice(end + endMarker.length)
}

const overridePath = join(ROOT, OVERRIDE_FILE)
if (existsSync(overridePath)) {
  rmSync(overridePath)
  console.log(`삭제: ${OVERRIDE_FILE}`)
}

const loaderPath = join(ROOT, 'src/mocks/loader.ts')
let loaderText = readFileSync(loaderPath, 'utf8')
loaderText = stripMarkedBlock(
  loaderText,
  '// TEST SAMPLE — START equipment-preview import',
  '// END TEST SAMPLE equipment-preview import',
)
loaderText = stripMarkedBlock(
  loaderText,
  '// TEST SAMPLE — START equipment-preview apply',
  '// END TEST SAMPLE equipment-preview',
)
writeFileSync(loaderPath, loaderText, 'utf8')
console.log('패치: src/mocks/loader.ts')

console.log('\n완료 — npm run typecheck && npm run test:run 으로 확인하세요.')
