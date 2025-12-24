# Edge Browser HTTPS Setup

## ✅ Certificate Already Trusted

The certificate has been added to Windows certificate store, which Edge uses automatically.

## 🔒 For Edge to Show "Secure"

Edge uses the Windows certificate store, so if the certificate is in `CurrentUser\Root` or `LocalMachine\Root`, it should work.

### Steps:

1. **Close ALL Edge windows completely**
   - Make sure no Edge processes are running
   - Check Task Manager if needed

2. **Restart your server** (if not already running with HTTPS)
   ```powershell
   node server.js
   ```
   Should show: `🚀 Book Connect running at https://localhost:3000`

3. **Open Edge and visit:** `https://localhost:3000`

4. **You should see:** "Secure" with a padlock icon ✅

## 🔧 If Edge Still Shows "Not Secure"

### Option 1: Re-run Trust Script
```powershell
powershell -ExecutionPolicy Bypass -File cli\fix-secure.ps1
```
Then close ALL Edge windows and reopen.

### Option 2: Manually Trust Certificate

1. Navigate to: `BookConnect\certs\localhost.cer`
2. **Double-click** the `.cer` file
3. Click **"Install Certificate..."**
4. Choose **"Current User"** (recommended) or **"Local Machine"**
5. Select **"Place all certificates in the following store"**
6. Click **"Browse"**
7. Select **"Trusted Root Certification Authorities"**
8. Click **"OK"** → **"Next"** → **"Finish"** → **"Yes"**
9. **Close ALL Edge windows completely**
10. **Reopen Edge** and visit `https://localhost:3000`

### Option 3: Clear Edge Certificate Cache

If Edge still doesn't recognize the certificate:

1. Open Edge
2. Go to: `edge://settings/privacy`
3. Scroll to **"Security"**
4. Click **"Clear browsing data"**
5. Select **"Cached images and files"**
6. Click **"Clear now"**
7. Close and reopen Edge

### Option 4: Check Certificate Store

Verify certificate is installed:

```powershell
# Check CurrentUser store
Get-ChildItem Cert:\CurrentUser\Root | Where-Object {$_.Subject -like "*localhost*"}

# Check LocalMachine store (requires admin)
Get-ChildItem Cert:\LocalMachine\Root | Where-Object {$_.Subject -like "*localhost*"}
```

## 📝 Important Notes

- **Edge uses Windows certificate store** - same as Internet Explorer
- Certificate must be in **Trusted Root Certification Authorities**
- **CurrentUser** store works for your user account
- **LocalMachine** store works system-wide (requires admin)
- **Always use `https://` not `http://`** after setup
- **Close ALL browser windows** after trusting certificate

## ✅ Verification

After setup, Edge should:
- Show "Secure" in the address bar
- Display a padlock icon
- No security warnings
- Green HTTPS indicator

If you see any warnings, the certificate isn't properly trusted. Follow the manual steps above.













