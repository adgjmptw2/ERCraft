#!/usr/bin/env node
/**
 * GitHub pull 없이, 로컬에 있는 옛 UI(2번) → 1번 UI 패치를 적용합니다.
 * 패치는 이 저장소에 포함되어 있으며 GitHub에서 받아오지 않습니다.
 *
 * 사용 (PowerShell, ERCraft-main 폴더에서):
 *   node scripts/apply-records-ui-patch.mjs
 */
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PATCH = join(ROOT, 'patches/restore-records-ui-v2.patch')

function run(cmd) {
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' })
}

function check(label, ok) {
  console.log(`${ok ? 'OK' : '??'} ${label}`)
}

function main() {
  if (!existsSync(PATCH)) {
    console.error('패치 파일 없음:', PATCH)
    process.exit(1)
  }

  console.log('1번 UI 패치 적용 중...\n')

  try {
    run(`git apply --3way "${PATCH}"`)
    console.log('\n패치 적용 완료.\n')
  } catch {
    console.error('\n패치 충돌. 아래 시도:')
    console.error('  git apply --reject patches/restore-records-ui-v2.patch')
    process.exit(1)
  }

  const matchRow = join(ROOT, 'src/components/player/MatchRow.tsx')
  if (existsSync(matchRow)) {
    const lines = execSync(`wc -l < "${matchRow}"`, { encoding: 'utf8' }).trim()
    check(`MatchRow.tsx ${lines}줄 (700+ 이면 1번 UI)`, Number(lines) >= 700)
  }

  check('HeaderPlayerSearch.tsx', existsSync(join(ROOT, 'src/components/shared/HeaderPlayerSearch.tsx')))
  check('MatchEquipmentStrip.tsx', existsSync(join(ROOT, 'src/components/player/MatchEquipmentStrip.tsx')))

  console.log('\n다음: npm install && npm run dev')
  console.log('화면 우하단 records-v2-20260611 보이면 1번 UI')
}

main()
