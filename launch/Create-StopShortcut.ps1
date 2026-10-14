# Create-StopShortcut.ps1
# Adds "Cafe Panel - Stop" shortcut to Desktop and Start Menu.

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir

$iconPath  = Join-Path $scriptDir "assets\cafe-panel.ico"
$stopScript = Join-Path $scriptDir "Stop.bat"

if (-not (Test-Path $stopScript)) {
  Write-Host "  [X] Stop.bat not found: $stopScript" -ForegroundColor Red
  exit 1
}

$desktopPath   = [Environment]::GetFolderPath("Desktop")
$startMenuPath = [Environment]::GetFolderPath("Programs")
$startMenuSub  = Join-Path $startMenuPath "Cafe Panel"

if (-not (Test-Path $startMenuSub)) {
  New-Item -Path $startMenuSub -ItemType Directory -Force | Out-Null
}

$WshShell = New-Object -ComObject WScript.Shell

function New-StopShortcut {
  param([string]$Path)
  $lnk = $WshShell.CreateShortcut($Path)
  $lnk.TargetPath       = $stopScript
  $lnk.WorkingDirectory = $projectDir
  $lnk.Description      = "Cafe Panel - stop the server"
  $lnk.IconLocation     = $iconPath
  $lnk.WindowStyle      = 1
  $lnk.Save()
}

$desktopStop   = Join-Path $desktopPath   "Cafe Panel - Stop.lnk"
$startMenuStop = Join-Path $startMenuSub  "Cafe Panel - Stop.lnk"

New-StopShortcut -Path $desktopStop
New-StopShortcut -Path $startMenuStop

[System.Runtime.InteropServices.Marshal]::ReleaseComObject($WshShell) | Out-Null

Write-Host "  [OK] Stop shortcut created:" -ForegroundColor Green
Write-Host "       - $desktopStop" -ForegroundColor Green