# Comprehensive script to fix HTTPS for Edge browser
# This ensures the certificate is properly installed for Edge

$cerPath = "$PSScriptRoot\..\certs\localhost.cer"
$certsDir = "$PSScriptRoot\..\certs"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Edge HTTPS Certificate Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if certificate file exists
if (-not (Test-Path $cerPath)) {
    Write-Host "ERROR: CER file not found!" -ForegroundColor Red
    Write-Host "   Location: $cerPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Generating certificate first..." -ForegroundColor Yellow
    node "$PSScriptRoot\generate-ssl-certs.js"
    if (-not (Test-Path $cerPath)) {
        Write-Host "   Failed to generate certificate. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Step 1: Removing any existing localhost certificates..." -ForegroundColor Yellow

# Remove existing certificates from CurrentUser Root
try {
    $existingCerts = Get-ChildItem Cert:\CurrentUser\Root | Where-Object {
        $_.Subject -like "*CN=localhost*" -or 
        $_.FriendlyName -like "*BookConnect*" -or
        $_.Subject -like "*localhost*"
    }
    
    if ($existingCerts) {
        foreach ($cert in $existingCerts) {
            try {
                $store = New-Object System.Security.Cryptography.X509Certificates.X509Store([System.Security.Cryptography.X509Certificates.StoreName]::Root, [System.Security.Cryptography.X509Certificates.StoreLocation]::CurrentUser)
                $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
                $store.Remove($cert)
                $store.Close()
                Write-Host "   Removed existing certificate: $($cert.Subject)" -ForegroundColor Gray
            } catch {
                Write-Host "   Could not remove: $($cert.Subject)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "   No existing certificates found" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Note: Could not check/remove existing certificates" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Installing certificate to CurrentUser Trusted Root..." -ForegroundColor Yellow

# Install to CurrentUser Root
try {
    Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\CurrentUser\Root -ErrorAction Stop | Out-Null
    Write-Host "   SUCCESS: Certificate installed to CurrentUser Root" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Could not install to CurrentUser Root: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Trying LocalMachine Root (requires Administrator)..." -ForegroundColor Yellow
    try {
        Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\LocalMachine\Root -ErrorAction Stop | Out-Null
        Write-Host "   SUCCESS: Certificate installed to LocalMachine Root" -ForegroundColor Green
    } catch {
        Write-Host "   ERROR: Could not install to LocalMachine Root: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "   Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Step 3: Verifying certificate installation..." -ForegroundColor Yellow

# Verify installation
$installed = Get-ChildItem Cert:\CurrentUser\Root | Where-Object {
    $_.Subject -like "*CN=localhost*" -or $_.Subject -like "*localhost*"
}

if ($installed) {
    Write-Host "   Certificate found in store:" -ForegroundColor Green
    Write-Host "   Subject: $($installed[0].Subject)" -ForegroundColor Gray
    Write-Host "   Valid until: $($installed[0].NotAfter)" -ForegroundColor Gray
} else {
    Write-Host "   WARNING: Certificate not found in CurrentUser Root" -ForegroundColor Yellow
    Write-Host "   Trying LocalMachine Root..." -ForegroundColor Yellow
    $installed = Get-ChildItem Cert:\LocalMachine\Root -ErrorAction SilentlyContinue | Where-Object {
        $_.Subject -like "*CN=localhost*" -or $_.Subject -like "*localhost*"
    }
    if ($installed) {
        Write-Host "   Certificate found in LocalMachine Root" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 4: Clearing Edge certificate cache..." -ForegroundColor Yellow

# Clear Edge cache locations
$edgeCachePaths = @(
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Code Cache",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\GPUCache"
)

foreach ($cachePath in $edgeCachePaths) {
    if (Test-Path $cachePath) {
        try {
            Remove-Item "$cachePath\*" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "   Cleared: $cachePath" -ForegroundColor Gray
        } catch {
            # Ignore errors - cache might be in use
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Certificate Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "CRITICAL STEPS FOR EDGE:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. CLOSE ALL Edge windows completely" -ForegroundColor Yellow
Write-Host "   - Close all tabs" -ForegroundColor White
Write-Host "   - Check Task Manager - no msedge.exe processes" -ForegroundColor White
Write-Host ""
Write-Host "2. Verify server is running with HTTPS:" -ForegroundColor Yellow
Write-Host "   - Check console: should say 'https://localhost:3000'" -ForegroundColor White
Write-Host "   - If it says 'http://', restart server" -ForegroundColor White
Write-Host ""
Write-Host "3. Open Edge and visit:" -ForegroundColor Yellow
Write-Host "   https://localhost:3000" -ForegroundColor White
Write-Host "   (Make sure to use https:// not http://)" -ForegroundColor White
Write-Host ""
Write-Host "4. If still not secure, try:" -ForegroundColor Yellow
Write-Host "   - Edge Settings > Privacy > Clear browsing data" -ForegroundColor White
Write-Host "   - Select 'Cached images and files'" -ForegroundColor White
Write-Host "   - Clear and restart Edge" -ForegroundColor White
Write-Host ""
Write-Host "5. Alternative: Manually install certificate" -ForegroundColor Yellow
Write-Host "   - Double-click: $cerPath" -ForegroundColor White
Write-Host "   - Install to 'Trusted Root Certification Authorities'" -ForegroundColor White
Write-Host ""













