# Force Edge to recognize the certificate
# This script does everything needed for Edge

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Force Edge HTTPS Recognition" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all Edge processes
Write-Host "Step 1: Closing all Edge processes..." -ForegroundColor Yellow
$edgeProcesses = Get-Process -Name "msedge" -ErrorAction SilentlyContinue
if ($edgeProcesses) {
    foreach ($proc in $edgeProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Write-Host "   Killed Edge process: $($proc.Id)" -ForegroundColor Gray
        } catch {
            # Ignore errors
        }
    }
    Start-Sleep -Seconds 3
    Write-Host "   All Edge processes closed" -ForegroundColor Green
} else {
    Write-Host "   No Edge processes running" -ForegroundColor Gray
}

Write-Host ""

# Step 2: Verify certificate
Write-Host "Step 2: Verifying certificate..." -ForegroundColor Yellow
$cert = Get-ChildItem Cert:\CurrentUser\Root | Where-Object {$_.Subject -like "*CN=localhost*"} | Select-Object -First 1
if ($cert) {
    Write-Host "   Certificate found: $($cert.Subject)" -ForegroundColor Green
    Write-Host "   Valid until: $($cert.NotAfter)" -ForegroundColor Gray
} else {
    Write-Host "   ERROR: Certificate not found!" -ForegroundColor Red
    Write-Host "   Run: powershell -ExecutionPolicy Bypass -File cli\fix-edge-https.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 3: Clear all Edge caches
Write-Host "Step 3: Clearing Edge caches..." -ForegroundColor Yellow
$edgePaths = @(
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Code Cache",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\GPUCache",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\ShaderCache",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Service Worker"
)

$cleared = 0
foreach ($path in $edgePaths) {
    if (Test-Path $path) {
        try {
            Remove-Item "$path\*" -Recurse -Force -ErrorAction SilentlyContinue
            $cleared++
        } catch {
            # Cache might be locked, that's okay
        }
    }
}
Write-Host "   Cleared $cleared cache locations" -ForegroundColor Green

Write-Host ""

# Step 4: Check server
Write-Host "Step 4: Checking server status..." -ForegroundColor Yellow
$serverRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($serverRunning) {
    Write-Host "   Server is running on port 3000" -ForegroundColor Green
    Write-Host "   Make sure it says 'https://localhost:3000' in console" -ForegroundColor Yellow
} else {
    Write-Host "   WARNING: Server not detected on port 3000" -ForegroundColor Yellow
    Write-Host "   Start server with: node server.js" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Ready! Now:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Wait 5 more seconds" -ForegroundColor Cyan
Write-Host "2. Open Edge (new window)" -ForegroundColor Cyan
Write-Host "3. Type in address bar: https://localhost:3000" -ForegroundColor Cyan
Write-Host "4. Press Enter" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see a warning:" -ForegroundColor Yellow
Write-Host "  - Click 'Advanced' or 'Details'" -ForegroundColor White
Write-Host "  - Click 'Proceed to localhost' or 'Continue'" -ForegroundColor White
Write-Host "  - Next time it should be secure!" -ForegroundColor White
Write-Host ""













