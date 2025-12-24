# BookConnect Server Restart Script
# This script stops any existing server on port 3000 and starts a new one

Write-Host "🔄 Restarting BookConnect Server..." -ForegroundColor Cyan
Write-Host ""

# Find and stop process on port 3000
$port = 3000
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $processIds) {
        try {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "⏹️  Stopping process $pid ($($process.ProcessName))..." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # Process might already be stopped
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Stopped existing server`n" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No existing server found on port $port`n" -ForegroundColor Gray
}

# Start the server
Write-Host "🚀 Starting BookConnect server...`n" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Gray
Write-Host "----------------------------------------`n" -ForegroundColor DarkGray

node server.js













