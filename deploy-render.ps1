# Quick deployment script for Render
# This helps you prepare and deploy to Render

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BookConnect - Render Deployment Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "⚠️  Git not initialized" -ForegroundColor Yellow
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - ready for deployment"
    Write-Host "✅ Git initialized" -ForegroundColor Green
    Write-Host ""
}

# Generate SESSION_SECRET
Write-Host "Generating SESSION_SECRET..." -ForegroundColor Yellow
$secret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Write-Host "✅ Generated SESSION_SECRET" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT CHECKLIST" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Push to GitHub:" -ForegroundColor Cyan
Write-Host "   git remote add origin <your-github-repo-url>" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "2. Set up MongoDB Atlas:" -ForegroundColor Cyan
Write-Host "   - Go to: https://www.mongodb.com/cloud/atlas/register" -ForegroundColor White
Write-Host "   - Create free cluster" -ForegroundColor White
Write-Host "   - Get connection string" -ForegroundColor White
Write-Host ""
Write-Host "3. Deploy on Render:" -ForegroundColor Cyan
Write-Host "   - Go to: https://render.com" -ForegroundColor White
Write-Host "   - New + → Web Service" -ForegroundColor White
Write-Host "   - Connect GitHub repo" -ForegroundColor White
Write-Host "   - Configure:" -ForegroundColor White
Write-Host "     * Build: npm install" -ForegroundColor Gray
Write-Host "     * Start: npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Set Environment Variables in Render:" -ForegroundColor Cyan
Write-Host "   NODE_ENV=production" -ForegroundColor White
Write-Host "   MONGODB_URI=<your-mongodb-atlas-connection-string>" -ForegroundColor White
Write-Host "   SESSION_SECRET=$secret" -ForegroundColor Yellow
Write-Host "   ADMIN_EMAIL=admin@bookconnect.com" -ForegroundColor White
Write-Host "   PORT=10000" -ForegroundColor White
Write-Host ""
Write-Host "5. Deploy and wait 5-10 minutes" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Your app will be live at:" -ForegroundColor Green
Write-Host "https://bookconnect.onrender.com" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""













