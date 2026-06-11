# 이 대화 작업 복구 스크립트 — 커밋 f43363e
$ErrorActionPreference = "Stop"
$RestoreCommit = "f43363e"

Write-Host "Fetching origin..."
git fetch origin

Write-Host "Resetting to $RestoreCommit ..."
git checkout main 2>$null
if ($LASTEXITCODE -ne 0) { git checkout -b main origin/main }
git reset --hard $RestoreCommit

Write-Host ""
Write-Host "=== Verification ==="
git log -1 --oneline
$search = Select-String -Path "src/components/shared/AppShell.tsx" -Pattern "HeaderPlayerSearch" -Quiet
$refresh = Select-String -Path "src/components/profile/ProfileHero.tsx" -Pattern "전적 갱신" -Quiet
Write-Host "HeaderPlayerSearch: $search"
Write-Host "전적 갱신 button: $refresh"

if (-not $search -or -not $refresh) {
  Write-Host "ERROR: Restore verification failed." -ForegroundColor Red
  exit 1
}

Write-Host "OK: Conversation work restored. Run: npm install && npm run dev" -ForegroundColor Green
