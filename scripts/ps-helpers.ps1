function Write-NoBom {
  param([string]$Path, [string]$Content)
  $full = Join-Path (Get-Location) $Path
  $dir = Split-Path -Parent $full
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  [System.IO.File]::WriteAllText($full, $Content, (New-Object System.Text.UTF8Encoding $false))
  Write-Host "OK: $Path" -ForegroundColor Green
}

function Add-NoBom {
  param([string]$Path, [string]$Content)
  $full = Join-Path (Get-Location) $Path
  $existing = [System.IO.File]::ReadAllText($full)
  [System.IO.File]::WriteAllText($full, $existing + $Content, (New-Object System.Text.UTF8Encoding $false))
  Write-Host "APPENDED: $Path" -ForegroundColor Yellow
}