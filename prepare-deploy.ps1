# Prepare BookConnect for deployment
# This script helps you get ready to deploy

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Preparing BookConnect for Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check git status
Write-Host "Checking Git status..." -ForegroundColor Yellow
if (Test-Path .git) {
    $status = git status --porcelain
    if ($status) {
        Write-Host "   Uncommitted changes found" -ForegroundColor Yellow
        Write-Host "   Staging all changes..." -ForegroundColor Yellow
        git add .
        Write-Host "   Committing changes..." -ForegroundColor Yellow
        git commit -m "Prepare for deployment - production ready"
        Write-Host "   Changes committed!" -ForegroundColor Green
    } else {
        Write-Host "   All changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "   Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - BookConnect ready for deployment"
    Write-Host "   Git initialized and committed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Generating SESSION_SECRET for production..." -ForegroundColor Yellow
$secret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Write-Host "   Generated: $secret" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Ready for Deployment!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Push to GitHub:" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/bookconnect.git" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "2. Follow DEPLOY_NOW.md for step-by-step deployment" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Or use Render (easiest):" -ForegroundColor Yellow
Write-Host "   - Go to: https://render.com" -ForegroundColor White
Write-Host "   - Connect GitHub repo" -ForegroundColor White
Write-Host "   - Set environment variables" -ForegroundColor White
Write-Host "   - Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "SESSION_SECRET for deployment:" -ForegroundColor Cyan
Write-Host "   $secret" -ForegroundColor Yellow
Write-Host ""
Write-Host "See DEPLOY_NOW.md for complete instructions!" -ForegroundColor Gray
Write-Host ""













