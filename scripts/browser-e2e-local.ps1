$ErrorActionPreference = 'Stop'
$processes = @()

try {
  $apps = @(
    @{ Path = 'apps/web-parent-portal'; Port = 3003 },
    @{ Path = 'apps/web-teacher-portal'; Port = 3004 },
    @{ Path = 'apps/web-student-portal'; Port = 3005 },
    @{ Path = 'apps/web-school-admin'; Port = 3006 }
  )

  foreach ($app in $apps) {
    $processes += Start-Process -FilePath 'pnpm.cmd' -ArgumentList '--dir', $app.Path, 'dev' -PassThru -WindowStyle Hidden
  }

  foreach ($app in $apps) {
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
      try { Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$($app.Port)" | Out-Null; $ready = $true; break } catch { Start-Sleep -Seconds 2 }
    }
    if (-not $ready) { throw "Portal did not start on port $($app.Port)" }
  }

  $env:PLAYWRIGHT_SERVERS = 'external'
  & 'node_modules\.bin\playwright.cmd' test --config 'playwright.config.ts'
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
  $processes | Where-Object { $_ -and -not $_.HasExited } | Stop-Process -Force -ErrorAction SilentlyContinue
}
