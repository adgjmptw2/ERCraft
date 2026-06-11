@echo off
cd /d "%~dp0"
echo Applying 1번 UI patch...
node scripts\apply-records-ui-patch.mjs
if errorlevel 1 exit /b 1
echo.
echo Patch applied. Starting dev server...
call npm.cmd run dev
