# Script to trust the localhost certificate
# Run this as Administrator for best results

$cerPath = "$PSScriptRoot\..\certs\localhost.cer"

if (-not (Test-Path $cerPath)) {
    Write-Host "ERROR: CER file not found at: $cerPath"
    Write-Host "Please generate a certificate first by submitting a review."
    exit 1
}

Write-Host "Found CER file: $cerPath"
Write-Host ""

# Try CurrentUser Root first (no admin needed)
Write-Host "Attempting to add certificate to CurrentUser Trusted Root..."
try {
    Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\CurrentUser\Root -ErrorAction Stop | Out-Null
    Write-Host "✅ SUCCESS: Certificate added to CurrentUser Trusted Root!"
    Write-Host "   Your browser should now show 'Secure' after restarting."
    exit 0
} catch {
    Write-Host "⚠️  Could not add to CurrentUser Root: $_"
}

# Try LocalMachine Root (requires admin)
Write-Host ""
Write-Host "Attempting to add certificate to LocalMachine Trusted Root (requires admin)..."
try {
    Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\LocalMachine\Root -ErrorAction Stop | Out-Null
    Write-Host "✅ SUCCESS: Certificate added to LocalMachine Trusted Root!"
    Write-Host "   Your browser should now show 'Secure' after restarting."
    exit 0
} catch {
    Write-Host "❌ ERROR: Could not add to LocalMachine Root: $_"
    Write-Host ""
    Write-Host "To manually trust the certificate:"
    Write-Host "1. Double-click: $cerPath"
    Write-Host "2. Click 'Install Certificate...'"
    Write-Host "3. Choose 'Local Machine'"
    Write-Host "4. Select 'Place all certificates in the following store'"
    Write-Host "5. Click 'Browse' and select 'Trusted Root Certification Authorities'"
    Write-Host "6. Click 'OK', 'Next', 'Finish', then 'Yes'"
    exit 1
}

