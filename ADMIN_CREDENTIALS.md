# Admin Credentials Guide

## ✅ Admin User Created!

An admin user has been created in your MongoDB database.

## 🔐 Login Credentials

### Option 1: New Admin Account (Recommended)
- **Email:** `admin@bookconnect.com`
- **Password:** `admin123`
- **Username:** `admin`

**⚠️ IMPORTANT:** To grant admin privileges to this account, add this line to your `.env` file:
```
ADMIN_EMAIL=admin@bookconnect.com
```

### Option 2: Hardcoded Credentials (Always Works)
- **Email:** `host@bookconnect.com`
- **Password:** `host123`

These credentials are hardcoded in `authController.js` and will always work without any database entry.

## 📝 How Admin Access Works

Admin privileges are granted if:
1. Email matches `HOST_EMAIL` from `.env` (default: `host@bookconnect.com`), OR
2. Email matches `ADMIN_EMAIL` from `.env` (if set), OR
3. Using the hardcoded credentials (always works)

## 🚀 Access Admin Interface

1. Go to: `https://localhost:3000/login`
2. Enter one of the credentials above
3. You'll be redirected to `/admin` dashboard

## 🔧 Create Additional Admin Users

To create more admin users, run:
```powershell
node cli/create-admin.js [email] [password] [username]
```

Example:
```powershell
node cli/create-admin.js superadmin@bookconnect.com securepass123 superadmin
```

Then add to `.env`:
```
ADMIN_EMAIL=superadmin@bookconnect.com
```

## 📋 Current Admin Users

Run this to see all users:
```powershell
node cli/verify-mongodb.js
```













