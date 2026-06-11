#!/usr/bin/env bash
# Node.js 없이 Git Bash / Linux / macOS에서 1번 UI 패치 적용
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PATCH="$ROOT/patches/restore-records-ui-v2.patch"

if [[ ! -f "$PATCH" ]]; then
  echo "패치 파일 없음: $PATCH"
  exit 1
fi

echo "1번 UI 패치 적용 중..."
cd "$ROOT"
git apply --3way "$PATCH"
echo ""
echo "패치 적용 완료."

if [[ -f src/components/player/MatchRow.tsx ]]; then
  LINES=$(wc -l < src/components/player/MatchRow.tsx | tr -d ' ')
  if (( LINES >= 700 )); then
    echo "OK MatchRow.tsx ${LINES}줄 (1번 UI)"
  else
    echo "?? MatchRow.tsx ${LINES}줄 (700 미만 — 2번 UI일 수 있음)"
  fi
fi

[[ -f src/components/shared/HeaderPlayerSearch.tsx ]] && echo "OK HeaderPlayerSearch.tsx"
[[ -f src/components/player/MatchEquipmentStrip.tsx ]] && echo "OK MatchEquipmentStrip.tsx"

echo ""
echo "다음: npm run dev (Node.js PATH 필요)"
echo "Git Bash에서 node 없으면 cmd/PowerShell에서 npm.cmd run dev"
