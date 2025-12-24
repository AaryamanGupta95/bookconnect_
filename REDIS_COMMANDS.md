# Redis Commands and Setup Guide

## Redis Connection Info
- **URL:** `redis://localhost:6379` (default)
- **Port:** `6379`
- **Host:** `localhost`

## Check if Redis is Running

### Windows (PowerShell):
```powershell
# Check if Redis is running
Get-Service -Name "*redis*" -ErrorAction SilentlyContinue

# Or check if port 6379 is listening
netstat -ano | findstr :6379
```

### Using Redis CLI (if installed):
```bash
redis-cli ping
# Should return: PONG
```

## Start Redis Server

### Windows (if installed as service):
```powershell
# Start Redis service
Start-Service Redis

# Or if using Redis for Windows:
redis-server
```

### Using Docker:
```bash
docker run -d -p 6379:6379 redis:latest
```

## Test Redis Connection (Node.js)

Your project includes utility scripts to test Redis:

```powershell
# Check Redis sessions
node cli/check-redis-sessions.js

# Test Redis connection and show sessions
node cli/test-redis-sessions.js

# Inspect a specific session
node cli/inspect-redis-session.js [session-id]
```

## Common Redis CLI Commands

If you have Redis CLI installed:

```bash
# Connect to Redis
redis-cli

# Check if Redis is running
PING

# List all keys
KEYS *

# List session keys
KEYS sess:*

# Get a specific key
GET sess:your-session-id

# Delete all keys (use with caution!)
FLUSHALL

# Get info about Redis
INFO

# Exit Redis CLI
EXIT
```

## Verify Redis is Working

Run this command to test Redis connection:
```powershell
cd C:\Users\HP\OneDrive\Desktop\BookConnect_Final\BookConnect
node cli/test-redis-sessions.js
```

## Troubleshooting

### Redis not running:
1. Install Redis for Windows: https://github.com/microsoftarchive/redis/releases
2. Or use Docker: `docker run -d -p 6379:6379 redis`
3. Or use Redis Cloud (free tier): https://redis.com/try-free/

### Connection refused:
- Make sure Redis server is running
- Check if port 6379 is not blocked by firewall
- Verify REDIS_URL in .env file matches your Redis instance

### Redis connection works but no sessions:
- Sessions are created when you log in
- Try logging in to the application first
- Check if session store is properly configured in server.js













