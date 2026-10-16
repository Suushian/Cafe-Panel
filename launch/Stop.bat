@echo off
chcp 65001 >nul
setlocal
title Cafe Panel - Stop Server

echo.
echo  ============================================================
echo    Cafe Panel - Stop Server
echo  ============================================================
echo.

powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0ServerProcess.ps1" -Action stop
set "RESULT=%ERRORLEVEL%"

if "%RESULT%"=="0" (
  echo.
  echo  [OK] Cafe Panel server stopped.
) else if "%RESULT%"=="1" (
  echo.
  echo  [i] Cafe Panel is not running.
) else if "%RESULT%"=="2" (
  echo.
  echo  [!] Port 3000 belongs to an unrecognized process.
  echo      Nothing was stopped. This protects other applications.
) else (
  echo.
  echo  [X] Could not stop Cafe Panel safely. Check permissions and logs.
)

echo.
timeout /t 3 /nobreak >nul
exit /b 0
