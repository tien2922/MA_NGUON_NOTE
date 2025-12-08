# Script cài đặt asyncpg với Python 3.13
Write-Host "Cài đặt asyncpg tương thích với Python 3.13..." -ForegroundColor Green

# Đảm bảo đang trong virtual environment
if (-not $env:VIRTUAL_ENV) {
    Write-Host "Kích hoạt virtual environment..." -ForegroundColor Yellow
    & ".\venv\Scripts\Activate.ps1"
}

# Đặt TEMP và TMP sang ổ E:
$tempDir = "E:\temp_pip"
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}
$env:TEMP = $tempDir
$env:TMP = $tempDir

# Đặt PIP cache sang ổ E:
$env:PIP_CACHE_DIR = "E:\pip_cache"
if (-not (Test-Path $env:PIP_CACHE_DIR)) {
    New-Item -ItemType Directory -Path $env:PIP_CACHE_DIR -Force | Out-Null
}

# Thử cài đặt asyncpg từ source mới nhất hoặc pre-built wheel
Write-Host "`nCài đặt asyncpg (thử phiên bản mới nhất)..." -ForegroundColor Green

# Option 1: Thử cài phiên bản mới nhất (có thể đã fix Python 3.13)
pip install --upgrade pip
pip install --no-cache-dir asyncpg --upgrade

# Nếu vẫn lỗi, thử cài từ pre-built wheel
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nThử cài từ pre-built wheel..." -ForegroundColor Yellow
    pip install --only-binary :all: asyncpg
}

# Sau đó cài các packages còn lại
Write-Host "`nCài đặt các packages còn lại..." -ForegroundColor Green
pip install -r requirements.txt

Write-Host "`n✅ Hoàn tất!" -ForegroundColor Green

