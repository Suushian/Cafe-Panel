param(
  [string]$OutputDirectory = (Join-Path $env:USERPROFILE "Desktop")
)

$ErrorActionPreference = "Stop"
$appData = Join-Path $env:APPDATA "cafe-panel"
if (-not (Test-Path $appData)) {
  throw "Cafe Panel user data directory was not found: $appData"
}

$logDirectory = Join-Path $appData "logs"
if (-not (Test-Path $logDirectory)) {
  throw "Cafe Panel log directory was not found: $logDirectory"
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$staging = Join-Path $env:TEMP "CafePanel-Diagnostics-$stamp"
New-Item -ItemType Directory -Force -Path $staging | Out-Null

try {
  $manifest = [ordered]@{
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    app = "Cafe Panel"
    platform = [System.Runtime.InteropServices.RuntimeInformation]::OSDescription
    note = "Review files before sharing. Local logs may contain operational metadata."
    includedFiles = @()
  }

  foreach ($name in @("app.jsonl", "errors.jsonl", "audit.jsonl")) {
    $source = Join-Path $logDirectory $name
    if (Test-Path $source) {
      $destination = Join-Path $staging $name
      Copy-Item -LiteralPath $source -Destination $destination
      $manifest.includedFiles += $name
    }
  }

  $manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $staging "manifest.json") -Encoding UTF8
  $zipPath = Join-Path $OutputDirectory "CafePanel-Diagnostics-$stamp.zip"
  Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zipPath -Force
  Write-Output "Diagnostic bundle created: $zipPath"
  Write-Warning "Inspect the ZIP and remove sensitive information before sharing it."
}
finally {
  Remove-Item -LiteralPath $staging -Recurse -Force -ErrorAction SilentlyContinue
}
