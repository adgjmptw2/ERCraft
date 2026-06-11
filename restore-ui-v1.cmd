@echo off
cd /d "%~dp0"
set BRANCH=cursor/cloud-agent-1781159192012-5f23r

echo === 1번 UI 강제 복구 (브랜치 checkout) ===
echo 브랜치: origin/%BRANCH%
echo.

git fetch origin %BRANCH%
if errorlevel 1 (
  echo git fetch 실패
  exit /b 1
)

echo src/ 전체를 1번 UI 버전으로 교체합니다...
git checkout origin/%BRANCH% -- src/
if errorlevel 1 (
  echo git checkout 실패
  exit /b 1
)

echo.
echo --- 확인 ---
find /c /v "" src\components\player\MatchRow.tsx
findstr /C:"HeaderPlayerSearch" src\components\shared\AppShell.tsx >nul && echo OK AppShell - 검색창 || echo FAIL AppShell - 홈버튼 UI일 수 있음
findstr /C:"records-v2-20260611" src\lib\uiBuild.ts >nul && echo OK uiBuild ID || echo ?? uiBuild ID 없음

echo.
echo 완료. dev 서버를 끄고(Ctrl+C) 다시 실행:
echo   npm.cmd run dev
echo 브라우저 Ctrl+Shift+R 새로고침
