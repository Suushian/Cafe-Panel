@echo off
chcp 65001 >nul
setlocal
title Cafe Panel - Server

set "PROJECT_DIR=%~dp0.."
cd /d "%PROJECT_DIR%"

echo.
echo  ============================================================
echo    Cafe Panel
echo  ============================================================
echo.

REM --- Check Node.js ---
where node >nul 2>&1
if errorlevel 1 (
  echo  [X] Node.js is not installed.
  echo.
  echo      Please install Node.js LTS from: https://nodejs.org
  echo.
  pause
  exit /b 1
)

REM --- Check dependencies ---
if not exist "node_modules" (
  echo  [X] Dependencies are not installed.
  echo      Please run "Install.bat" first.
  echo.
  pause
  exit /b 1
)

if not exist ".next" (
  echo  [X] Production build was not found.
  echo      Please run "Install.bat" first.
  echo.
  pause
  exit /b 1
)

REM --- Verify whether Cafe Panel owns port 3000 ---
powershell -ExecutionPolicy Bypass -NoProfile -File "%LAUNCH_DIR%ServerProcess.ps1" -Action status >nul
set "SERVER_STATUS=%ERRORLEVEL%"
if "%SERVER_STATUS%"=="0" goto already_running
if "%SERVER_STATUS%"=="2" goto port_occupied
if not "%SERVER_STATUS%"=="1" (
  echo  [X] Could not check the server status safely.
  pause
  exit /b 1
)

REM --- Start server in new window ---
:start_server
echo  [i] Starting server (this may take a few seconds)...
echo.

start "Cafe Panel Server" cmd /k "cd /d ""%PROJECT_DIR%"" && npm run start"
goto wait_for_server

:already_running
echo  [i] Cafe Panel is already running.
echo      Opening browser...
start "" "http://localhost:3000"
timeout /t 2 /nobreak >nul
exit /b 0

:port_occupied
echo  [X] Port 3000 is used by another process, not verified as Cafe Panel.
echo      Close that application or change its port, then try again.
pause
exit /b 1

:wait_for_server

REM --- Wait for server to be ready ---
set /a tries=0
:waitloop
set /a tries+=1
if %tries% gtr 30 goto timeout

timeout /t 1 /nobreak >nul
netstat -ano | findstr /R /C:":3000 .*LISTENING" >nul
if errorlevel 1 goto waitloop

REM --- Open browser ---
echo  [OK] Server is ready.
echo  [i] Opening browser...
start "" "http://localhost:3000"

echo.
echo  ============================================================
echo    Cafe Panel is running at:  http://localhost:3000
echo    To stop: close the "Cafe Panel Server" window.
echo  ============================================================
echo.
echo  This window will close in 3 seconds...
timeout /t 3 /nobreak >nul
exit /b 0

:timeout
echo.
echo  [X] Server did not start within 30 seconds.
echo      Check the "Cafe Panel Server" window for errors.
echo.
pause
exit /b 1