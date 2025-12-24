# Verify Edge certificate installation and provide troubleshooting steps

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Edge Certificate Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check CurrentUser Root
Write-Host "Checking CurrentUser Trusted Root..." -ForegroundColor Yellow
$currentUserCerts = Get-ChildItem Cert:\CurrentUser\Root | Where-Object {
    $_.Subject -like "*CN=localhost*" -or $_.Subject -like "*localhost*"
}

if ($currentUserCerts) {
    Write-Host "   Found certificate(s) in CurrentUser Root:" -ForegroundColor Green
    foreach ($cert in $currentUserCerts) {
        Write-Host "   - Subject: $($cert.Subject)" -ForegroundColor White
        Write-Host "     Valid until: $($cert.NotAfter)" -ForegroundColor Gray
        Write-Host "     Thumbprint: $($cert.Thumbprint)" -ForegroundColor Gray
    }
} else {
    Write-Host "   No certificate found in CurrentUser Root" -ForegroundColor Red
}

Write-Host ""

# Check LocalMachine Root (requires admin)
Write-Host "Checking LocalMachine Trusted Root..." -ForegroundColor Yellow
try {
    $localMachineCerts = Get-ChildItem Cert:\LocalMachine\Root -ErrorAction Stop | Where-Object {
        $_.Subject -like "*CN=localhost*" -or $_.Subject -like "*localhost*"
    }
    
    if ($localMachineCerts) {
        Write-Host "   Found certificate(s) in LocalMachine Root:" -ForegroundColor Green
        foreach ($cert in $localMachineCerts) {
            Write-Host "   - Subject: $($cert.Subject)" -ForegroundColor White
            Write-Host "     Valid until: $($cert.NotAfter)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   No certificate found in LocalMachine Root" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Cannot check LocalMachine Root (requires admin): $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Edge-Specific Troubleshooting" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($currentUserCerts -or $localMachineCerts) {
    Write-Host "Certificate is installed. If Edge still shows 'Not Secure':" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. CLOSE ALL Edge windows (check Task Manager for msedge.exe)" -ForegroundColor White
    Write-Host "2. Clear Edge cache:" -ForegroundColor White
    Write-Host "   - Open Edge" -ForegroundColor Gray
    Write-Host "   - Press Ctrl+Shift+Delete" -ForegroundColor Gray
    Write-Host "   - Select 'Cached images and files'" -ForegroundColor Gray
    Write-Host "   - Click 'Clear now'" -ForegroundColor Gray
    Write-Host "3. Restart Edge completely" -ForegroundColor White
    Write-Host "4. Visit: https://localhost:3000 (use https:// not http://)" -ForegroundColor White
    Write-Host "5. If warning appears, click 'Advanced' then 'Proceed to localhost'" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternative: Use Edge's certificate import:" -ForegroundColor Yellow
    Write-Host "1. Edge Settings > Privacy, search, and services" -ForegroundColor White
    Write-Host "2. Scroll to 'Security'" -ForegroundColor White
    Write-Host "3. Click 'Manage certificates'" -ForegroundColor White
    Write-Host "4. Import the certificate manually" -ForegroundColor White
} else {
    Write-Host "Certificate NOT found in certificate store!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Run this to install:" -ForegroundColor Yellow
    Write-Host "   powershell -ExecutionPolicy Bypass -File cli\fix-edge-https.ps1" -ForegroundColor White
}

Write-Host ""













