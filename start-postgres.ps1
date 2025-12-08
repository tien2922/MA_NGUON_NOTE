# Script to start PostgreSQL in Docker with data on E: drive
Write-Host "Starting PostgreSQL container..." -ForegroundColor Green

# Create data directory on E: if it doesn't exist
$dataDir = "E:\postgres_data"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force
    Write-Host "Created data directory: $dataDir" -ForegroundColor Yellow
}

# Start PostgreSQL container
docker-compose -f docker-postgres.yml up -d

Write-Host "`nPostgreSQL is starting..." -ForegroundColor Green
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow

# Wait for PostgreSQL to be ready
$maxAttempts = 30
$attempt = 0
while ($attempt -lt $maxAttempts) {
    $health = docker inspect --format='{{.State.Health.Status}}' smartnotes_db 2>$null
    if ($health -eq "healthy") {
        Write-Host "`nPostgreSQL is ready!" -ForegroundColor Green
        Write-Host "Connection string:" -ForegroundColor Cyan
        Write-Host "postgresql+asyncpg://smartnotes:smartnotes123@localhost:5432/smartnotes" -ForegroundColor White
        Write-Host "`nTo stop PostgreSQL, run: docker-compose -f docker-postgres.yml down" -ForegroundColor Yellow
        break
    }
    Start-Sleep -Seconds 2
    $attempt++
    Write-Host "." -NoNewline
}

if ($attempt -eq $maxAttempts) {
    Write-Host "`nPostgreSQL is taking longer than expected. Check logs with:" -ForegroundColor Yellow
    Write-Host "docker logs smartnotes_db" -ForegroundColor White
}


