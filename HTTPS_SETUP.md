# HTTPS Setup Guide

## ✅ Certificates Generated and Trusted!

Your SSL certificates have been generated and trusted. The server should now be running with HTTPS enabled.

## 🔒 Access Your Secure Site

1. **Close ALL browser windows completely** (important!)
2. **Open a new browser window**
3. **Visit:** `https://localhost:3000`
4. **You should see:** "Secure" with a padlock icon ✅

## 📝 Certificate Files

Certificates are stored in the `certs/` folder:
- `localhostkey.pem` - Private key
- `localhostcert.pem` - Certificate
- `localhost.cer` - Certificate for trusting

## 🔧 If You Still See "Not Secure"

### Option 1: Run Trust Script Again
```powershell
powershell -ExecutionPolicy Bypass -File cli\fix-secure.ps1
```

### Option 2: Manually Trust Certificate
1. Navigate to: `BookConnect\certs\localhost.cer`
2. Double-click the file
3. Click "Install Certificate..."
4. Choose "Current User" or "Local Machine"
5. Select "Place all certificates in the following store"
6. Click "Browse" → Select "Trusted Root Certification Authorities"
7. Click "OK" → "Next" → "Finish" → "Yes"
8. Restart browser completely

### Option 3: Regenerate Certificates
```powershell
node cli/generate-ssl-certs.js
powershell -ExecutionPolicy Bypass -File cli\fix-secure.ps1
```

## 🚀 Server Restart

After trusting the certificate, restart your server:
```powershell
# Stop existing server
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Start server
node server.js
```

You should see:
```
🚀 Book Connect running at https://localhost:3000
   (Self-signed certificate - browser may show security warning)
```

## ⚠️ Important Notes

- **Self-signed certificates** are for development only
- Browser may show a warning initially - this is normal for self-signed certs
- After trusting the certificate, the warning should disappear
- **Always use `https://` not `http://`** after setup

## 🔍 Verify HTTPS is Working

Check server output - it should say:
- `🚀 Book Connect running at https://localhost:3000` (not http://)

If it says `http://`, the certificates weren't found. Check:
1. Files exist in `certs/` folder
2. File names are exactly: `localhostkey.pem` and `localhostcert.pem`
3. Server has read permissions to the certs folder













