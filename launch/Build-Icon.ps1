# Build-Icon.ps1
# Generates launch/assets/cafe-panel.ico — a multi-resolution coffee cup icon.
# No external dependencies — uses .NET System.Drawing.

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Drawing

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$assetsDir = Join-Path $scriptDir "assets"
$icoPath   = Join-Path $assetsDir "cafe-panel.ico"

if (-not (Test-Path $assetsDir)) {
  New-Item -Path $assetsDir -ItemType Directory -Force | Out-Null
}

function New-CafeIconBitmap {
  param([int]$Size)

  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  $g.Clear([System.Drawing.Color]::Transparent)

  $s  = $Size / 100.0
  $cx = $Size / 2.0

  # --- Background circle (warm brown) ---
  $brown = [System.Drawing.Color]::FromArgb(255, 111, 78, 55)
  $bgBrush = New-Object System.Drawing.SolidBrush($brown)
  $m = [Math]::Max(1, [int](2 * $s))
  $g.FillEllipse($bgBrush, $m, $m, ($Size - 2*$m), ($Size - 2*$m))

  # --- Subtle inner highlight ---
  $highlight = [System.Drawing.Color]::FromArgb(50, 200, 149, 107)
  $hlBrush = New-Object System.Drawing.SolidBrush($highlight)
  $m2 = [Math]::Max(2, [int](9 * $s))
  $g.FillEllipse($hlBrush, $m2, $m2, ($Size - 2*$m2), ($Size - 2*$m2))

  # --- Cup body (trapezoid, cream white) ---
  $cream = [System.Drawing.Color]::FromArgb(255, 248, 240, 228)
  $cupBrush = New-Object System.Drawing.SolidBrush($cream)

  $cupTopY = 38 * $s
  $cupBotY = 74 * $s
  $topW    = 54 * $s
  $botW    = 34 * $s

  $cupPoints = @(
    [System.Drawing.PointF]::new(($cx - $topW/2), $cupTopY)
    [System.Drawing.PointF]::new(($cx + $topW/2), $cupTopY)
    [System.Drawing.PointF]::new(($cx + $botW/2), $cupBotY)
    [System.Drawing.PointF]::new(($cx - $botW/2), $cupBotY)
  )
  $g.FillPolygon($cupBrush, $cupPoints)

  # --- Handle (arc, right side) ---
  $handlePen = New-Object System.Drawing.Pen($cream, ([Math]::Max(1.5, 5.0 * $s)))
  $handlePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $handlePen.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
  $hx = $cx + ($topW/2) - (3 * $s)
  $hy = $cupTopY + (8 * $s)
  $hw = 16 * $s
  $hh = 20 * $s
  $g.DrawArc($handlePen, $hx, $hy, $hw, $hh, -80, 155)

  # --- Coffee surface inside rim ---
  $rimH = 11 * $s
  # Rim (full ellipse in cream)
  $g.FillEllipse($cupBrush, ($cx - $topW/2), ($cupTopY - $rimH/2), $topW, $rimH)

  # Coffee inside rim (dark brown)
  $coffeeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 63, 43, 31))
  $coffeeW = $topW - (6 * $s)
  $coffeeH = $rimH - (3 * $s)
  $g.FillEllipse($coffeeBrush, ($cx - $coffeeW/2), ($cupTopY - $coffeeH/2), $coffeeW, $coffeeH)

  # --- Steam (two curved lines) ---
  $steamPen = New-Object System.Drawing.Pen($cream, ([Math]::Max(1.2, 2.4 * $s)))
  $steamPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $steamPen.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round

  # Steam left
  $sx1 = $cx - (8 * $s)
  $g.DrawBezier(
    $steamPen,
    [System.Drawing.PointF]::new($sx1, (32 * $s)),
    [System.Drawing.PointF]::new(($sx1 - 4 * $s), (25 * $s)),
    [System.Drawing.PointF]::new(($sx1 + 4 * $s), (18 * $s)),
    [System.Drawing.PointF]::new($sx1, (11 * $s))
  )

  # Steam right
  $sx2 = $cx + (8 * $s)
  $g.DrawBezier(
    $steamPen,
    [System.Drawing.PointF]::new($sx2, (32 * $s)),
    [System.Drawing.PointF]::new(($sx2 + 4 * $s), (25 * $s)),
    [System.Drawing.PointF]::new(($sx2 - 4 * $s), (18 * $s)),
    [System.Drawing.PointF]::new($sx2, (11 * $s))
  )

  # Cleanup
  $bgBrush.Dispose(); $hlBrush.Dispose(); $cupBrush.Dispose()
  $coffeeBrush.Dispose(); $handlePen.Dispose(); $steamPen.Dispose()
  $g.Dispose()

  return $bmp
}

function Save-IcoFile {
  param(
    [System.Drawing.Bitmap[]]$Bitmaps,
    [string]$Path
  )

  $entries    = @()
  $imageBytes = @()
  $offset     = 6 + 16 * $Bitmaps.Count

  foreach ($b in $Bitmaps) {
    $ms = New-Object System.IO.MemoryStream
    $b.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray()
    $ms.Dispose()

    $w = if ($b.Width -ge 256)  { 0 } else { [byte]$b.Width }
    $h = if ($b.Height -ge 256) { 0 } else { [byte]$b.Height }

    $entries += [PSCustomObject]@{
      Width  = $w
      Height = $h
      Size   = $bytes.Length
      Offset = $offset
    }
    $imageBytes += , $bytes
    $offset += $bytes.Length
  }

  $out = New-Object System.IO.MemoryStream
  $bw  = New-Object System.IO.BinaryWriter($out)

  # ICONDIR
  $bw.Write([UInt16]0)
  $bw.Write([UInt16]1)
  $bw.Write([UInt16]$entries.Count)

  # ICONDIRENTRY × N
  foreach ($e in $entries) {
    $bw.Write([Byte]$e.Width)
    $bw.Write([Byte]$e.Height)
    $bw.Write([Byte]0)        # color count
    $bw.Write([Byte]0)        # reserved
    $bw.Write([UInt16]1)      # planes
    $bw.Write([UInt16]32)     # bit count
    $bw.Write([UInt32]$e.Size)
    $bw.Write([UInt32]$e.Offset)
  }

  # Image payloads
  foreach ($bytes in $imageBytes) {
    $bw.Write($bytes)
  }

  $bw.Flush()
  [System.IO.File]::WriteAllBytes($Path, $out.ToArray())
  $bw.Close()
  $out.Dispose()
}

# --- Generate ---
$sizes = @(16, 32, 48, 256)
$bitmaps = @()
foreach ($size in $sizes) {
  Write-Host "  Drawing ${size}x${size}..." -ForegroundColor DarkGray
  $bitmaps += New-CafeIconBitmap -Size $size
}

Save-IcoFile -Bitmaps $bitmaps -Path $icoPath

foreach ($b in $bitmaps) { $b.Dispose() }

$fileInfo = Get-Item $icoPath
Write-Host ""
Write-Host "  Icon created: $($fileInfo.FullName)" -ForegroundColor Green
Write-Host "  Size: $([Math]::Round($fileInfo.Length / 1024, 1)) KB" -ForegroundColor Green
Write-Host "  Resolutions: 16, 32, 48, 256" -ForegroundColor Green