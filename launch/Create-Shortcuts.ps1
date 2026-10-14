# Create-Shortcuts.ps1
# Creates two desktop shortcuts for Cafe Panel:
#   - "Cafe Panel"          -> Start-Silent.vbs (silent, everyday)
#   - "Cafe Panel (Debug)"  -> Start.bat (with window, troubleshooting)
# Also creates Start Menu shortcuts (optional).

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

# --- Paths ---
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir

$iconPath     = Join-Path $scriptDir "assets\cafe-panel.ico"
$silentScript = Join-Path $scriptDir "Start-Silent.vbs"
$debugScript  = Join-Path $scriptDir "Start.bat"

# --- Verify prerequisites ---
if (-not (Test-Path $iconPath)) {
  Write-Host "  [X] Icon not found: $iconPath" -ForegroundColor Red
  Write-Host "      Run Build-Icon.ps1 first." -ForegroundColor Yellow
  exit 1
}
if (-not (Test-Path $silentScript)) {
  Write-Host "  [X] Start-Silent.vbs not found: $silentScript" -ForegroundColor Red
  exit 1
}
if (-not (Test-Path $debugScript)) {
  Write-Host "  [X] Start.bat not found: $debugScript" -ForegroundColor Red
  exit 1
}

# --- Locate folders ---
$desktopPath   = [Environment]::GetFolderPath("Desktop")
$startMenuPath = [Environment]::GetFolderPath("Programs")
$startMenuSub  = Join-Path $startMenuPath "Cafe Panel"

Write-Host ""
Write-Host "  Desktop:      $desktopPath" -ForegroundColor DarkGray
Write-Host "  Start Menu:   $startMenuSub" -ForegroundColor DarkGray
Write-Host ""

# --- WScript.Shell for creating .lnk files ---
$WshShell = New-Object -ComObject WScript.Shell

function New-Shortcut {
  param(
    [string]$Path,
    [string]$Target,
    [string]$WorkingDirectory,
    [string]$Description,
    [string]$IconLocation
  )

  $lnk = $WshShell.CreateShortcut($Path)
  $lnk.TargetPath       = $Target
  $lnk.WorkingDirectory = $WorkingDirectory
  $lnk.Description      = $Description
  $lnk.IconLocation     = $IconLocation
  $lnk.WindowStyle      = 1
  $lnk.Save()
}

# --- Desktop shortcuts ---
$desktopSilent = Join-Path $desktopPath "Cafe Panel.lnk"
$desktopDebug  = Join-Path $desktopPath "Cafe Panel (Debug).lnk"

New-Shortcut `
  -Path             $desktopSilent `
  -Target           "wscript.exe" `
  -WorkingDirectory $scriptDir `
  -Description      "Cafe Panel - launch silently" `
  -IconLocation     $iconPath

# override arguments for the silent shortcut: pass the .vbs path to wscript
$lnk = $WshShell.CreateShortcut($desktopSilent)
$lnk.Arguments = "`"$silentScript`""
$lnk.Save()

New-Shortcut `
  -Path             $desktopDebug `
  -Target           $debugScript `
  -WorkingDirectory $projectDir `
  -Description      "Cafe Panel - launch with console (debug)" `
  -IconLocation     $iconPath

Write-Host "  [OK] Desktop shortcuts created:" -ForegroundColor Green
Write-Host "       - $desktopSilent" -ForegroundColor Green
Write-Host "       - $desktopDebug"  -ForegroundColor Green

# --- Start Menu shortcuts ---
if (-not (Test-Path $startMenuSub)) {
  New-Item -Path $startMenuSub -ItemType Directory -Force | Out-Null
}

$startMenuSilent = Join-Path $startMenuSub "Cafe Panel.lnk"
$startMenuDebug  = Join-Path $startMenuSub "Cafe Panel (Debug).lnk"

New-Shortcut `
  -Path             $startMenuSilent `
  -Target           "wscript.exe" `
  -WorkingDirectory $scriptDir `
  -Description      "Cafe Panel - launch silently" `
  -IconLocation     $iconPath

$lnk = $WshShell.CreateShortcut($startMenuSilent)
$lnk.Arguments = "`"$silentScript`""
$lnk.Save()

New-Shortcut `
  -Path             $startMenuDebug `
  -Target           $debugScript `
  -WorkingDirectory $projectDir `
  -Description      "Cafe Panel - launch with console (debug)" `
  -IconLocation     $iconPath

Write-Host "  [OK] Start Menu shortcuts created:" -ForegroundColor Green
Write-Host "       - $startMenuSilent" -ForegroundColor Green
Write-Host "       - $startMenuDebug"  -ForegroundColor Green

# --- Release COM ---
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($WshShell) | Out-Null

Write-Host ""
Write-Host "  Done. Double-click 'Cafe Panel' on the Desktop to launch." -ForegroundColor Cyan
Write-Host ""