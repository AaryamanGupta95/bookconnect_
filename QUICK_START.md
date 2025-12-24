# Quick Start Guide

## Starting the Server

### If port 3000 is already in use:

**Option 1: Stop existing process (Windows PowerShell)**
```powershell
# Find the process using port 3000
netstat -ano | findstr :3000

# Stop the process (replace PID with the actual process ID)
Stop-Process -Id [PID] -Force

# Then start server
node server.js
```

**Option 2: Use a different port**
```powershell
# Set PORT environment variable
$env:PORT=3001
node server.js
```

**Option 3: Kill all Node processes (use with caution)**
```powershell
Get-Process -Name node | Stop-Process -Force
node server.js
```

## Server Status

Once started, you should see:
```
✅ MongoDB connected
✅ Redis connected
🚀 Book Connect running at https://localhost:3000
```

## Access Your Application

- **Main Site:** https://localhost:3000
- **Chat:** https://localhost:3000/chat
- **Books:** https://localhost:3000/books
- **Admin:** https://localhost:3000/admin

## Admin Login

- **Email:** `host@bookconnect.com`
- **Password:** `host123`

Or use the database admin account:
- **Email:** `admin@bookconnect.com`
- **Password:** `admin123`
- (Add `ADMIN_EMAIL=admin@bookconnect.com` to `.env` for admin access)

## Troubleshooting

### Port Already in Use
```powershell
# Find and kill process on port 3000
$port = 3000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
}
```

### MongoDB Not Connected
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- Default: `mongodb://localhost:27017/book_connect`

### Redis Not Connected
- Make sure Redis is running
- Check `REDIS_URL` in `.env` file
- Default: `redis://localhost:6379`
- Server will still work without Redis (uses MongoDB sessions as fallback)













