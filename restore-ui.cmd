@echo off
cd /d "%~dp0"
if not exist patches\restore-records-ui-v2.patch (
  echo 패치 파일 없음: patches\restore-records-ui-v2.patch
  exit /b 1
)
echo 1번 UI 패치 적용 중...
git apply --3way patches\restore-records-ui-v2.patch
if errorlevel 1 (
  echo.
  echo 패치 충돌. 시도: git apply --reject patches\restore-records-ui-v2.patch
  exit /b 1
)
echo.
echo 패치 적용 완료.
find /c /v "" src\components\player\MatchRow.tsx 2>nul
echo MatchRow.tsx 줄 수 ^(700+ 이면 1번 UI^)
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js가 PATH에 없습니다. dev 서버는 cmd에서 npm.cmd run dev 로 실행하세요.
  exit /b 0
)
echo dev 서버 시작...
call npm.cmd run dev
