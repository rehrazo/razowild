param(
  [int[]]$Ports = @(3000, 3001, 5000)
)

Write-Host "Stopping listeners on ports: $($Ports -join ', ')" -ForegroundColor Cyan
Write-Host ""

$listeners = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $Ports -contains $_.LocalPort }

if (-not $listeners) {
  Write-Host "No listeners found on target ports." -ForegroundColor Yellow
  exit 0
}

$killed = @()
$failed = @()

$processIds = $listeners | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($processId in $processIds) {
  $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
  $processName = if ($process) { $process.ProcessName } else { '<unknown>' }

  try {
    Stop-Process -Id $processId -Force -ErrorAction Stop
    $killed += [PSCustomObject]@{
      PID         = $processId
      ProcessName = $processName
      Status      = 'Stopped'
    }
  }
  catch {
    $failed += [PSCustomObject]@{
      PID         = $processId
      ProcessName = $processName
      Status      = $_.Exception.Message
    }
  }
}

if ($killed.Count -gt 0) {
  Write-Host "Stopped process(es):" -ForegroundColor Green
  $killed | Format-Table -AutoSize
  Write-Host ""
}

if ($failed.Count -gt 0) {
  Write-Host "Failed to stop process(es):" -ForegroundColor Red
  $failed | Format-Table -AutoSize
  exit 1
}

Write-Host "Done." -ForegroundColor Green
