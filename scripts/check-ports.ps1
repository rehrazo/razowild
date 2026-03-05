$targetPorts = @(3000, 3001, 5000)

Write-Host "Checking listening ports: $($targetPorts -join ', ')" -ForegroundColor Cyan
Write-Host ""

$listeners = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $targetPorts -contains $_.LocalPort } |
  Sort-Object LocalPort, OwningProcess -Unique

if (-not $listeners) {
  Write-Host "No listeners found on target ports." -ForegroundColor Yellow
  exit 0
}

$rows = foreach ($listener in $listeners) {
  $process = Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue

  [PSCustomObject]@{
    Port        = $listener.LocalPort
    Address     = $listener.LocalAddress
    PID         = $listener.OwningProcess
    ProcessName = if ($process) { $process.ProcessName } else { '<unknown>' }
    Path        = if ($process) { $process.Path } else { '' }
  }
}

$rows | Sort-Object Port, PID | Format-Table -AutoSize
