#!/usr/bin/env bash
# 1번 UI — 패치 대신 GitHub 브랜치에서 src/ 전체를 그대로 덮어씁니다.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${UI_RESTORE_BRANCH:-cursor/cloud-agent-1781159192012-5f23r}"

cd "$ROOT"
echo "=== 1번 UI 강제 복구 (branch checkout) ==="
echo "브랜치: origin/$BRANCH"
echo ""

git fetch origin "$BRANCH"

echo "src/ 전체를 1번 UI 버전으로 교체합니다..."
git checkout "origin/$BRANCH" -- src/

echo ""
echo "--- 확인 ---"
if [[ -f src/components/player/MatchRow.tsx ]]; then
  LINES=$(wc -l < src/components/player/MatchRow.tsx | tr -d ' ')
  if (( LINES >= 700 )); then
    echo "OK MatchRow.tsx ${LINES}줄"
  else
    echo "FAIL MatchRow.tsx ${LINES}줄 (700 미만 — 아직 2번 UI)"
    exit 1
  fi
fi

if grep -q HeaderPlayerSearch src/components/shared/AppShell.tsx 2>/dev/null; then
  echo "OK AppShell → HeaderPlayerSearch (검색창)"
else
  echo "FAIL AppShell에 검색창 없음"
  exit 1
fi

if [[ -f src/lib/uiBuild.ts ]] && grep -q records-v2-20260611 src/lib/uiBuild.ts; then
  echo "OK uiBuild.ts → records-v2-20260611"
fi

echo ""
echo "완료. dev 서버를 끄고 다시 실행하세요:"
echo "  npm.cmd run dev   (cmd/PowerShell)"
echo "브라우저 Ctrl+Shift+R 로 새로고침"
