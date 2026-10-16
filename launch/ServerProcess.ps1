param(
  [ValidateSet("status", "stop")]
  [string]$Action = "status"
)

$ErrorActionPreference = "Stop"
$projectDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..")).TrimEnd([char[]]@("\", "/"))
$listenerIds = @(
  Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
)

if ($listenerIds.Count -eq 0) {
  Write-Output "No process is listening on port 3000."
  exit 1
}

$verifiedRoots = @()
$unrecognizedListeners = @()

foreach ($listenerId in $listenerIds) {
  $currentId = [int]$listenerId
  $rootId = $null

  # Follow the listener's parent chain and only manage a process tree whose
  # launch command explicitly references this checkout and "npm run start".
  for ($depth = 0; $depth -lt 12 -and $currentId -gt 0; $depth++) {
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $currentId" -ErrorAction SilentlyContinue
    if (-not $processInfo) { break }

    $commandLine = [string]$processInfo.CommandLine
    $containsProject = $commandLine.IndexOf($projectDir, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
    $startsCafePanel = $commandLine -match '(?i)npm(?:\.cmd)?\s+run\s+start'
    if ($containsProject -and $startsCafePanel) {
      $rootId = [int]$processInfo.ProcessId
      break
    }

    $parentId = [int]$processInfo.ParentProcessId
    if ($parentId -eq $currentId) { break }
    $currentId = $parentId
  }

  if ($null -ne $rootId) {
    $verifiedRoots += $rootId
  } else {
    $unrecognizedListeners += [int]$listenerId
  }
}

$verifiedRoots = @($verifiedRoots | Select-Object -Unique)
if ($Action -eq "status") {
  if ($verifiedRoots.Count -gt 0) {
    Write-Output "Cafe Panel is listening on port 3000."
    exit 0
  }
  Write-Output "Port 3000 is occupied by a process that could not be verified as Cafe Panel. No process was changed."
  exit 2
}

if ($verifiedRoots.Count -eq 0) {
  if ($unrecognizedListeners.Count -gt 0) {
    Write-Output "Port 3000 belongs to an unrecognized process. Refusing to stop it."
    exit 2
  }
  Write-Output "Cafe Panel is not running."
  exit 1
}

foreach ($rootId in $verifiedRoots) {
  & taskkill.exe /T /F /PID $rootId
  if ($LASTEXITCODE -ne 0) {
    Write-Output "Failed to stop verified Cafe Panel process tree rooted at PID $rootId."
    exit 3
  }
}

Write-Output "Stopped the verified Cafe Panel process tree."
exit 0
