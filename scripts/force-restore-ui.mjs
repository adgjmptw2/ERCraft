#!/usr/bin/env node
/**
 * Git 없이 GitHub main에서 1번 UI(전적 v2) 파일을 직접 받아 덮어씁니다.
 * 사용: node scripts/force-restore-ui.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = 'adgjmptw2/ERCraft'
const BRANCH = 'main'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const FILES = [
  'src/components/shared/AppShell.tsx',
  'src/components/shared/HeaderPlayerSearch.tsx',
  'src/components/shared/index.ts',
  'src/components/player/MatchRow.tsx',
  'src/components/player/MatchEquipmentStrip.tsx',
  'src/components/player/RecentMatchList.tsx',
  'src/components/player/index.ts',
  'src/components/profile/ProfileHero.tsx',
  'src/components/profile/ProfileRecordsTab.tsx',
  'src/components/profile/ProfileRecordsSidebar.tsx',
  'src/components/profile/ProfileAnalysisHeroCard.tsx',
  'src/components/profile/ProfileCompactSummary.tsx',
  'src/components/profile/CharacterStats.tsx',
  'src/components/profile/SeasonHistoryGrid.tsx',
  'src/components/profile/RpTrendCard.tsx',
  'src/components/profile/SeasonSummaryBadges.tsx',
  'src/components/profile/index.ts',
  'src/pages/ProfilePage.tsx',
  'src/utils/dto.ts',
  'src/utils/matchDemoStats.ts',
  'src/lib/uiBuild.ts',
]

async function fetchFile(path) {
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.text()
}

async function main() {
  console.log(`Restoring UI v2 from ${REPO}/${BRANCH} ...\n`)
  for (const rel of FILES) {
    const content = await fetchFile(rel)
    const abs = join(ROOT, rel)
    await mkdir(dirname(abs), { recursive: true })
    await writeFile(abs, content, 'utf8')
    console.log(`  OK ${rel}`)
  }
  console.log('\nDone. Run: npm install && npm run dev')
  console.log('Check: MatchRow.tsx should be ~800 lines, header has search (no 홈).')
}

main().catch((err) => {
  console.error('Restore failed:', err.message)
  process.exit(1)
})
