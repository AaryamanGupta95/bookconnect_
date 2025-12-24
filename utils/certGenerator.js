const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Generate self-signed SSL certificate for HTTPS using PowerShell
 * Creates ONE certificate for the entire site (not per user)
 * Uses CurrentUser store (no admin privileges needed)
 */
function generateCertificate() {
  const certsDir = path.join(__dirname, '..', 'certs');
  const keyPath = path.join(certsDir, 'localhostkey.pem');
  const certPath = path.join(certsDir, 'localhostcert.pem');

  // Create certs directory if it doesn't exist
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
  }

  // Check if PEM files already exist - if so, don't regenerate
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('✅ SSL certificates already exist - using existing certificates');
    return { keyPath, certPath };
  }

  try {
    console.log('🔐 Generating self-signed SSL certificate using PowerShell...');
    console.log('   Creating ONE certificate for the entire site');
    
    // PowerShell script to create, trust, and export certificate
    const cerPath = path.join(certsDir, 'localhost.cer');
    const psScript = [
      '# Step 1: Create self-signed certificate in CurrentUser\\My',
      '$cert = New-SelfSignedCertificate -CertStoreLocation Cert:\\CurrentUser\\My -DnsName "localhost" -KeyAlgorithm RSA -KeyLength 4096 -NotAfter (Get-Date).AddYears(1) -FriendlyName "BookConnect HTTPS Certificate" -KeyExportPolicy Exportable',
      'if ($cert -eq $null) {',
      '  throw "Failed to create certificate"',
      '}',
      '$thumbprint = $cert.Thumbprint',
      'Write-Host "Certificate created with thumbprint: $thumbprint"',
      '',
      '# Step 2: Export public certificate to CER file (for trusting)',
      '$cerPath = "' + cerPath.replace(/\\/g, '\\\\') + '"',
      'try {',
      '  Export-Certificate -Cert Cert:\\CurrentUser\\My\\$thumbprint -FilePath $cerPath -ErrorAction Stop',
      '  if (Test-Path $cerPath) {',
      '    Write-Host "SUCCESS: CER certificate exported to: $cerPath"',
      '  } else {',
      '    throw "CER file was not created"',
      '  }',
      '} catch {',
      '  Write-Host "ERROR exporting CER: $_"',
      '  throw "Failed to export CER file: $_"',
      '}',
      '',
      '# Step 3: Add certificate to Trusted Root (try CurrentUser first - no admin needed)',
      '$trusted = $false',
      'if (-not (Test-Path $cerPath)) {',
      '  throw "CER file does not exist: $cerPath"',
      '}',
      '',
      '# Try CurrentUser Root first (no admin needed, works for this user)',
      'try {',
      '  Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\\CurrentUser\\Root -ErrorAction Stop | Out-Null',
      '  Write-Host "SUCCESS: Certificate added to CurrentUser Trusted Root - Browser will show Secure!"',
      '  $trusted = $true',
      '} catch {',
      '  Write-Host "WARNING: Could not add to CurrentUser Root: $_"',
      '  # Try LocalMachine Root as fallback (requires admin)',
      '  try {',
      '    Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\\LocalMachine\\Root -ErrorAction Stop | Out-Null',
      '    Write-Host "SUCCESS: Certificate added to LocalMachine Trusted Root - Browser will show Secure!"',
      '    $trusted = $true',
      '  } catch {',
      '    Write-Host "WARNING: Could not add to LocalMachine Root (requires admin): $_"',
      '    Write-Host "CER file location: $cerPath"',
      '    Write-Host "You can manually trust it by double-clicking the CER file"',
      '  }',
      '}',
      '',
      '# Step 4: Export certificate (public key) to PEM format',
      '$certPath = "' + certPath.replace(/\\/g, '\\\\') + '"',
      '$certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)',
      '$certBase64 = [System.Convert]::ToBase64String($certBytes)',
      '$certPem = "-----BEGIN CERTIFICATE-----" + [Environment]::NewLine',
      'for ($i = 0; $i -lt $certBase64.Length; $i += 64) {',
      '  $lineLength = [Math]::Min(64, $certBase64.Length - $i)',
      '  $certPem += $certBase64.Substring($i, $lineLength) + [Environment]::NewLine',
      '}',
      '$certPem += "-----END CERTIFICATE-----"',
      '[System.IO.File]::WriteAllText($certPath, $certPem, [System.Text.Encoding]::ASCII)',
      'Write-Host "Certificate PEM file created"',
      '',
      '# Step 5: Export private key to PEM format',
      '$rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($cert)',
      'if ($rsa -eq $null) {',
      '  throw "Could not get RSA private key from certificate"',
      '}',
      '',
      '# Try ExportPkcs8PrivateKey first (most compatible)',
      '$keyBytes = $null',
      'try {',
      '  $keyBytes = $rsa.ExportPkcs8PrivateKey()',
      '} catch {',
      '  try {',
      '    $keyBytes = $rsa.ExportRSAPrivateKey()',
      '  } catch {',
      '    try {',
      '      $cngKey = $rsa.Key',
      '      $keyBytes = $cngKey.Export([System.Security.Cryptography.CngKeyBlobFormat]::Pkcs8PrivateBlob)',
      '    } catch {',
      '      throw "Could not export private key using any available method: $_"',
      '    }',
      '  }',
      '}',
      '',
      '# Format as PEM',
      '$keyPath = "' + keyPath.replace(/\\/g, '\\\\') + '"',
      '$keyBase64 = [System.Convert]::ToBase64String($keyBytes)',
      '$keyPem = "-----BEGIN PRIVATE KEY-----" + [Environment]::NewLine',
      'for ($i = 0; $i -lt $keyBase64.Length; $i += 64) {',
      '  $lineLength = [Math]::Min(64, $keyBase64.Length - $i)',
      '  $keyPem += $keyBase64.Substring($i, $lineLength) + [Environment]::NewLine',
      '}',
      '$keyPem += "-----END PRIVATE KEY-----"',
      '[System.IO.File]::WriteAllText($keyPath, $keyPem, [System.Text.Encoding]::ASCII)',
      'Write-Host "Private key PEM file created"',
      '',
      '# Step 6: Clean up - Remove certificate from CurrentUser\\My store (optional)',
      'try {',
      '  $store = New-Object System.Security.Cryptography.X509Certificates.X509Store([System.Security.Cryptography.X509Certificates.StoreName]::My, [System.Security.Cryptography.X509Certificates.StoreLocation]::CurrentUser)',
      '  $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)',
      '  $store.Remove($cert)',
      '  $store.Close()',
      '  Write-Host "Certificate removed from store (kept in PEM files)"',
      '} catch {',
      '  Write-Host "Note: Could not remove certificate from store (this is okay)"',
      '}',
      '',
      'Write-Host "Success - Certificate generation complete!"',
      'Write-Host "Certificate files:"',
      'Write-Host "  Cert: $certPath"',
      'Write-Host "  Key: $keyPath"',
      'Write-Host "  CER: $cerPath (use this to trust manually if needed)"'
    ].join('\n');
    
    // Write PowerShell script to temp file and execute it
    const psScriptPath = path.join(certsDir, 'generate-cert.ps1');
    fs.writeFileSync(psScriptPath, psScript, 'utf8');
    
    try {
      // Execute PowerShell script (no admin needed for CurrentUser store)
      console.log('   Running PowerShell script...');
      execSync(`powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`, { 
        stdio: 'inherit',
        cwd: __dirname,
        shell: true
      });
      
      // Clean up script file
      if (fs.existsSync(psScriptPath)) {
        fs.unlinkSync(psScriptPath);
      }
      
      // Verify PEM files were created
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        console.log('✅ SSL certificate generated successfully!');
        console.log(`   Certificate: ${certPath}`);
        console.log(`   Private Key: ${keyPath}`);
        
      // Verify CER file was created and try to trust it
      const cerPath = path.join(certsDir, 'localhost.cer');
      if (fs.existsSync(cerPath)) {
        console.log(`   ✅ CER file created: ${cerPath}`);
        
        // Try to automatically trust the certificate using PowerShell
        console.log('');
        console.log('🔒 Attempting to automatically trust certificate...');
        let trusted = false;
        
        // Try CurrentUser Root first (no admin needed)
        try {
          const trustScript = `$ErrorActionPreference='Stop'; Import-Certificate -FilePath "${cerPath.replace(/\\/g, '\\\\')}" -CertStoreLocation Cert:\\CurrentUser\\Root | Out-Null; Write-Host "SUCCESS"`;
          const result = execSync(`powershell -ExecutionPolicy Bypass -Command "${trustScript}"`, {
            stdio: 'pipe',
            shell: true,
            encoding: 'utf8'
          });
          if (result.includes('SUCCESS')) {
            console.log('✅ SUCCESS: Certificate automatically added to CurrentUser Trusted Root!');
            console.log('   Your browser will show "Secure" after restart!');
            trusted = true;
          }
        } catch (trustError) {
          // Try LocalMachine Root as fallback (requires admin)
          try {
            const trustScript2 = `$ErrorActionPreference='Stop'; Import-Certificate -FilePath "${cerPath.replace(/\\/g, '\\\\')}" -CertStoreLocation Cert:\\LocalMachine\\Root | Out-Null; Write-Host "SUCCESS"`;
            const result2 = execSync(`powershell -ExecutionPolicy Bypass -Command "${trustScript2}"`, {
              stdio: 'pipe',
              shell: true,
              encoding: 'utf8'
            });
            if (result2.includes('SUCCESS')) {
              console.log('✅ SUCCESS: Certificate automatically added to LocalMachine Trusted Root!');
              console.log('   Your browser will show "Secure" after restart!');
              trusted = true;
            }
          } catch (trustError2) {
            // Both failed
          }
        }
        
        if (!trusted) {
          console.log('⚠️  Could not automatically trust certificate');
          console.log('');
          console.log('📝 To remove "Not Secure" warning, run this script:');
          console.log(`      powershell -ExecutionPolicy Bypass -File "${path.join(__dirname, '..', 'cli', 'fix-secure.ps1')}"`);
          console.log('');
          console.log('   Or manually: Double-click the CER file and install to Trusted Root');
          console.log(`      File: ${cerPath}`);
        }
        
        console.log('');
        console.log('✅ Certificate generation complete!');
        console.log('📝 Next steps:');
        console.log('   1. Restart your server');
        console.log('   2. Restart your browser (close ALL windows completely)');
        console.log('   3. Visit https://localhost:3000');
        console.log('   4. You should see "Secure" (padlock icon) ✅');
      } else {
        console.log('⚠️  WARNING: CER file was not created!');
        console.log('   The certificate was generated but cannot be automatically trusted.');
        console.log('   PEM files are available for HTTPS, but browser will show "Not Secure"');
      }
        
        return { keyPath, certPath };
      } else {
        throw new Error('Certificate PEM files were not created');
      }
    } catch (execError) {
      // Clean up script file on error
      if (fs.existsSync(psScriptPath)) {
        fs.unlinkSync(psScriptPath);
      }
      throw execError;
    }
  } catch (error) {
    console.error('❌ Error generating certificate with PowerShell:', error.message);
    console.error('   Make sure you are running on Windows with PowerShell available.');
    throw error;
  }
}

module.exports = { generateCertificate };
