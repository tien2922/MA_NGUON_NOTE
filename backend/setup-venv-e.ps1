# Script để tạo virtual environment trên ổ E:
Write-Host "Tạo virtual environment trên ổ E:..." -ForegroundColor Green

# Xóa virtual environment cũ nếu có
if (Test-Path ".venv") {
    Write-Host "Xóa virtual environment cũ..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .venv
}

# Tạo virtual environment mới trên ổ E:
$venvPath = "E:\ma_nguon_cuoi_ki\backend\.venv"
Write-Host "Tạo virtual environment tại: $venvPath" -ForegroundColor Cyan
python -m venv $venvPath

# Kích hoạt virtual environment
Write-Host "`nKích hoạt virtual environment..." -ForegroundColor Green
& "$venvPath\Scripts\Activate.ps1"

# Đặt TEMP và TMP sang ổ E: để tránh lỗi "No space left on device"
Write-Host "`nĐặt thư mục TEMP sang ổ E:..." -ForegroundColor Green
$tempDir = "E:\temp_pip"
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force
}
$env:TEMP = $tempDir
$env:TMP = $tempDir

# Cài đặt packages với cache trên ổ E:
Write-Host "Cài đặt packages (cache và temp trên ổ E:)..." -ForegroundColor Green
$env:PIP_CACHE_DIR = "E:\pip_cache"
if (-not (Test-Path $env:PIP_CACHE_DIR)) {
    New-Item -ItemType Directory -Path $env:PIP_CACHE_DIR -Force
}
pip install --upgrade pip
pip install -r requirements.txt

Write-Host "`n✅ Hoàn tất! Virtual environment đã được tạo trên ổ E:" -ForegroundColor Green
Write-Host "Để kích hoạt lại, chạy: .\.venv\Scripts\Activate.ps1" -ForegroundColor Cyan

