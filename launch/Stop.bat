@echo off
chcp 65001 >nul
setlocal
title Cafe Panel - Stop

echo.
echo  ============================================================
echo    Cafe Panel - Stop Server
echo  ============================================================
echo.

echo  [i] Looking for Cafe Panel server on port 3000...
echo.

set "FOUND=0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R /C:":3000 .*LISTENING"') do (
  set "FOUND=1"
  echo  [i] Found process with PID %%a
  taskkill /F /PID %%a >nul 2>&1
  if errorlevel 1 (
    echo  [X] Failed to stop PID %%a
  ) else (
    echo  [OK] Stopped PID %%a
  )
)

if "%FOUND%"=="0" (
  echo  [i] No Cafe Panel server is running.
)

echo.
echo  Done.
echo.
timeout /t 3 /nobreak >nul
exit /b 0