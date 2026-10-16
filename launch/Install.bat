@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title Cafe Panel - Install

set "PROJECT_DIR=%~dp0.."
set "LAUNCH_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo.
echo  ============================================================
echo    Cafe Panel - Installation
echo  ============================================================
echo.
echo  Project: %PROJECT_DIR%
echo.
echo  This will prepare everything needed to run the panel.
echo  Estimated time: 2-5 minutes depending on your internet.
echo.
pause

REM ============================================================
REM  [1/6] Check Node.js and npm
REM ============================================================
echo.
echo  [1/6] Checking Node.js...
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo  [X] Node.js is not installed.
  echo.
  echo      Cafe Panel needs Node.js 22 or 24 LTS.
  echo.
  echo      Opening the download page in your browser...
  echo      After installing, close this window and run Install.bat again.
  echo.
  timeout /t 3 /nobreak >nul
  start "" "https://nodejs.org/en/download"
  pause
  exit /b 1
)

for /f "tokens=* usebackq" %%v in (`node --version`) do set "NODE_VERSION=%%v"
for /f "tokens=* usebackq" %%v in (`npm --version`) do set "NPM_VERSION=%%v"

echo  [OK] Node.js: %NODE_VERSION%
echo  [OK] npm: %NPM_VERSION%
for /f "tokens=1 delims=." %%m in ("%NODE_VERSION:~1%") do set "NODE_MAJOR=%%m"
if "%NODE_MAJOR%"=="22" (
  echo  [OK] Supported Node.js major version.
) else if "%NODE_MAJOR%"=="24" (
  echo  [OK] Supported Node.js major version.
) else (
  echo.
  echo  [X] Unsupported Node.js version: %NODE_VERSION%
  echo      Install Node.js 22 or 24 LTS, then run Install.bat again.
  echo.
  start "" "https://nodejs.org/en/download"
  pause
  exit /b 1
)
echo.

REM ============================================================
REM  [2/6] npm install
REM ============================================================
echo  [2/6] Installing dependencies...
echo.

if exist "node_modules" (
  echo  [i] node_modules found. Running a quick update...
) else (
  echo  [i] First time setup. This may take a few minutes.
)
echo.

call npm install
if errorlevel 1 (
  echo.
  echo  [X] Failed to install dependencies.
  echo      Check the output above for details.
  echo.
  pause
  exit /b 1
)
echo.
echo  [OK] Dependencies installed.
echo.

REM ============================================================
REM  [3/6] Prisma migrate deploy
REM ============================================================
echo  [3/6] Applying database migrations...
echo.

call npx prisma migrate deploy
if errorlevel 1 (
  echo.
  echo  [X] Failed to apply migrations.
  echo.
  pause
  exit /b 1
)
echo.
echo  [OK] Database is up to date.
echo.

REM ============================================================
REM  [4/6] Prisma generate
REM ============================================================
echo  [4/6] Generating Prisma client...
echo.

call npx prisma generate
if errorlevel 1 (
  echo.
  echo  [X] Failed to generate Prisma client.
  echo.
  pause
  exit /b 1
)
echo.
echo  [OK] Prisma client generated.
echo.

REM ============================================================
REM  [5/6] Build
REM ============================================================
echo  [5/6] Building the application...
echo.

call npm run build
if errorlevel 1 (
  echo.
  echo  [X] Build failed.
  echo      Check the output above for details.
  echo.
  pause
  exit /b 1
)
echo.
echo  [OK] Build complete.
echo.

REM ============================================================
REM  [6/6] Icon and shortcuts
REM ============================================================
echo  [6/6] Creating desktop shortcuts...
echo.

powershell -ExecutionPolicy Bypass -NoProfile -File "%LAUNCH_DIR%Build-Icon.ps1"
if errorlevel 1 (
  echo.
  echo  [!] Warning: Could not create icon. Shortcuts will use default icon.
  echo.
)

powershell -ExecutionPolicy Bypass -NoProfile -File "%LAUNCH_DIR%Create-Shortcuts.ps1"
if errorlevel 1 (
  echo.
  echo  [!] Warning: Could not create shortcuts.
  echo      You can still run Start.bat manually.
  echo.
)

powershell -ExecutionPolicy Bypass -NoProfile -File "%LAUNCH_DIR%Create-StopShortcut.ps1"
if errorlevel 1 (
  echo.
  echo  [!] Warning: Could not create stop shortcut.
  echo.
)

REM ============================================================
REM  Done
REM ============================================================
echo.
echo  ============================================================
echo    Installation complete!
echo  ============================================================
echo.
echo   What to do next:
echo.
echo     1. Look on your Desktop for the "Cafe Panel" icon.
echo     2. Double-click it to start the panel.
echo     3. Your browser will open at:  http://localhost:3000
echo.
echo   On the first visit, you will be asked to set an admin
echo   password for the panel.
echo.
echo   To stop the panel:
echo     - Use the "Cafe Panel - Stop" shortcut (if created)
echo     - Or double-click: launch\Stop.bat
echo.
echo  ============================================================
echo.

pause
exit /b 0