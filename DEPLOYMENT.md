# BookConnect Deployment Guide

This guide will help you deploy BookConnect to various cloud platforms.

## 📋 Prerequisites

1. **MongoDB Database** (Required)
   - Local MongoDB or
   - MongoDB Atlas (free tier available): https://www.mongodb.com/cloud/atlas

2. **Redis Database** (Optional but Recommended)
   - Local Redis or
   - Redis Cloud (free tier): https://redis.com/try-free/
   - Upstash Redis (free tier): https://upstash.com/

3. **Git Repository** (Recommended)
   - GitHub, GitLab, or Bitbucket account

## 🚀 Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

**Steps:**

1. **Sign up at Render**: https://render.com
   - Free tier includes: 750 hours/month, 512MB RAM

2. **Create MongoDB Database**:
   - Use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas/register
   - Create cluster → Get connection string
   - Or use Render's MongoDB addon if available

3. **Create Redis Database** (Optional):
   - Use Redis Cloud: https://redis.com/try-free/
   - Get connection URL

4. **Deploy on Render**:
   ```
   a. Go to Render Dashboard
   b. Click "New +" → "Web Service"
   c. Connect your GitHub repository
   d. Configure:
      - Name: bookconnect
      - Environment: Node
      - Build Command: npm install
      - Start Command: npm start
      - Plan: Free
   ```

5. **Set Environment Variables** in Render Dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/book_connect
   REDIS_URL=redis://default:password@host:port (optional)
   SESSION_SECRET=<generate-random-string>
   PORT=10000
   ADMIN_EMAIL=admin@bookconnect.com
   ```

6. **Generate SESSION_SECRET**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

7. **Deploy!** Render will automatically deploy your app.

**Your app will be live at**: `https://bookconnect.onrender.com` (or your custom domain)

---

### Option 2: Railway (Easy Deployment)

**Steps:**

1. **Sign up at Railway**: https://railway.app
   - Free tier: $5 credit/month

2. **Deploy**:
   ```
   a. Go to Railway Dashboard
   b. Click "New Project"
   c. Select "Deploy from GitHub repo"
   d. Select your BookConnect repository
   ```

3. **Add MongoDB**:
   ```
   a. Click "+ New" → "Database" → "MongoDB"
   b. Railway will create MongoDB instance
   c. Copy connection string
   ```

4. **Add Redis** (Optional):
   ```
   a. Click "+ New" → "Database" → "Redis"
   b. Copy connection URL
   ```

5. **Set Environment Variables**:
   ```
   MONGODB_URI=<from Railway MongoDB>
   REDIS_URL=<from Railway Redis> (optional)
   SESSION_SECRET=<generate-random-string>
   ADMIN_EMAIL=admin@bookconnect.com
   ```

6. **Deploy!** Railway auto-deploys on git push.

**Your app will be live at**: `https://bookconnect-production.up.railway.app`

---

### Option 3: Vercel (For Frontend + API)

**Note**: Vercel is better for frontend, but can work with serverless functions.

**Steps:**

1. **Sign up at Vercel**: https://vercel.com

2. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

3. **Deploy**:
   ```bash
   cd BookConnect
   vercel
   ```

4. **Set Environment Variables** in Vercel Dashboard

---

### Option 4: Heroku (Classic Platform)

**Steps:**

1. **Sign up at Heroku**: https://heroku.com
   - Free tier discontinued, but paid plans available

2. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

3. **Login and Deploy**:
   ```bash
   heroku login
   heroku create bookconnect-app
   heroku addons:create mongolab:sandbox
   heroku addons:create heroku-redis:hobby-dev
   git push heroku main
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set SESSION_SECRET=<your-secret>
   heroku config:set ADMIN_EMAIL=admin@bookconnect.com
   ```

---

## 🔧 Environment Variables Setup

### Required Variables:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/book_connect
SESSION_SECRET=<generate-random-32-byte-hex-string>
NODE_ENV=production
PORT=<set-by-platform>
```

### Optional Variables:
```env
REDIS_URL=redis://default:password@host:port
ADMIN_EMAIL=admin@bookconnect.com
HOST_EMAIL=host@bookconnect.com
HOST_PASSWORD=host123
```

### Generate SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 Pre-Deployment Checklist

- [ ] Update `.env.example` with production values
- [ ] Remove or secure local SSL certificates (not needed in production)
- [ ] Set strong `SESSION_SECRET`
- [ ] Set up MongoDB Atlas or cloud MongoDB
- [ ] Set up Redis (optional but recommended)
- [ ] Test locally with production environment variables
- [ ] Commit all changes to Git
- [ ] Push to GitHub/GitLab

---

## 🗄️ Database Setup

### MongoDB Atlas (Free Tier)

1. **Sign up**: https://www.mongodb.com/cloud/atlas/register
2. **Create Cluster**: Choose free M0 tier
3. **Create Database User**: 
   - Database Access → Add New User
   - Username/Password
4. **Whitelist IP**: 
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` for all IPs (or your platform's IP)
5. **Get Connection String**:
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `book_connect`

### Redis Cloud (Free Tier)

1. **Sign up**: https://redis.com/try-free/
2. **Create Database**: Free 30MB tier
3. **Get Connection URL**: Copy from dashboard
4. **Format**: `redis://default:password@host:port`

---

## 🚀 Quick Deploy Commands

### Render:
```bash
# Push to GitHub first
git add .
git commit -m "Prepare for deployment"
git push origin main

# Then deploy via Render dashboard
```

### Railway:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway init
railway up
```

---

## 🔍 Post-Deployment

1. **Verify Deployment**:
   - Check logs in platform dashboard
   - Visit your app URL
   - Test login/registration
   - Test chat functionality

2. **Create Admin User**:
   - Register a new account
   - Set `ADMIN_EMAIL` in environment variables to that email
   - Or use hardcoded: `host@bookconnect.com` / `host123`

3. **Monitor**:
   - Check application logs
   - Monitor database connections
   - Check Redis connections (if used)

---

## 🐛 Troubleshooting

### App won't start:
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check logs for errors

### Database connection fails:
- Verify MongoDB Atlas IP whitelist includes platform IPs
- Check connection string format
- Verify database user credentials

### Redis connection fails:
- App will work without Redis (uses MongoDB sessions)
- Check Redis URL format
- Verify Redis is accessible from platform

### Static files not loading:
- Verify `public` folder is included in deployment
- Check file paths use relative URLs

---

## 📚 Additional Resources

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Redis Cloud Docs**: https://redis.com/redis-enterprise-cloud/

---

## ✅ Deployment Complete!

Once deployed, your BookConnect app will be live and accessible worldwide!

**Remember to:**
- Keep your `SESSION_SECRET` secure
- Regularly backup your MongoDB database
- Monitor your app's performance
- Update dependencies regularly













