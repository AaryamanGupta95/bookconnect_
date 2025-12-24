# Quick script to trust the certificate and make site show "Secure"
# Works for Chrome, Edge, and other browsers
# Run this in PowerShell (as Administrator for best results)

$cerPath = "$PSScriptRoot\..\certs\localhost.cer"

Write-Host "Trusting localhost certificate for Chrome and Edge..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $cerPath)) {
    Write-Host "ERROR: CER file not found!" -ForegroundColor Red
    Write-Host "   Location: $cerPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Please generate a certificate first." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found CER file: $cerPath" -ForegroundColor Gray
Write-Host ""

$success = $false

# Try CurrentUser Root (no admin needed, works for Chrome and Edge)
Write-Host "Adding to CurrentUser Trusted Root..." -ForegroundColor Yellow
try {
    Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\CurrentUser\Root -ErrorAction Stop | Out-Null
    Write-Host "SUCCESS! Certificate trusted in CurrentUser Root" -ForegroundColor Green
    Write-Host "   This works for Chrome, Edge, and other browsers." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Restart your server" -ForegroundColor White
    Write-Host "   2. Close ALL browser windows completely (Chrome AND Edge)" -ForegroundColor White
    Write-Host "   3. Open browser and visit: https://localhost:3000" -ForegroundColor White
    Write-Host "   4. You should see Secure (padlock icon)" -ForegroundColor White
    $success = $true
    exit 0
} catch {
    Write-Host "WARNING: Could not add to CurrentUser Root: $_" -ForegroundColor Yellow
    Write-Host ""
}

# Try LocalMachine Root (requires admin, works system-wide)
if (-not $success) {
    Write-Host "Trying LocalMachine Root (requires Administrator)..." -ForegroundColor Yellow
    try {
        Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\LocalMachine\Root -ErrorAction Stop | Out-Null
        Write-Host "SUCCESS! Certificate trusted in LocalMachine Root" -ForegroundColor Green
        Write-Host "   This works for all browsers system-wide." -ForegroundColor Gray
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Restart your server" -ForegroundColor White
        Write-Host "   2. Close ALL browser windows completely (Chrome AND Edge)" -ForegroundColor White
        Write-Host "   3. Open browser and visit: https://localhost:3000" -ForegroundColor White
        Write-Host "   4. You should see Secure (padlock icon)" -ForegroundColor White
        $success = $true
        exit 0
    } catch {
        Write-Host "ERROR: Could not add to LocalMachine Root: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "To manually trust for Edge:" -ForegroundColor Yellow
        Write-Host "   1. Double-click: $cerPath" -ForegroundColor White
        Write-Host "   2. Install to Trusted Root Certification Authorities" -ForegroundColor White
        Write-Host "   3. Close ALL Edge windows and reopen" -ForegroundColor White
        Write-Host ""
        Write-Host "Please run PowerShell as Administrator and try again," -ForegroundColor Yellow
        Write-Host "or manually install the certificate by double-clicking:" -ForegroundColor Yellow
        Write-Host "   $cerPath" -ForegroundColor White
        exit 1
    }
}
