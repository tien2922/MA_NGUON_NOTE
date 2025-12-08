# Script cài đặt packages với tất cả thư mục temp trên ổ E:
Write-Host "Cài đặt packages với temp directory trên ổ E:..." -ForegroundColor Green

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
Write-Host "TEMP directory: $env:TEMP" -ForegroundColor Cyan

# Đặt PIP cache sang ổ E:
$env:PIP_CACHE_DIR = "E:\pip_cache"
if (-not (Test-Path $env:PIP_CACHE_DIR)) {
    New-Item -ItemType Directory -Path $env:PIP_CACHE_DIR -Force | Out-Null
}
Write-Host "PIP cache directory: $env:PIP_CACHE_DIR" -ForegroundColor Cyan

# Cài đặt packages
Write-Host "`nBắt đầu cài đặt packages..." -ForegroundColor Green
pip install --upgrade pip
pip install -r requirements.txt

Write-Host "`n✅ Hoàn tất!" -ForegroundColor Green

