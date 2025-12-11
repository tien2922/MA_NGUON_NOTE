# Script chạy backend server từ thư mục gốc
# Sử dụng: .\run-backend.ps1

Write-Host "🚀 Đang khởi động backend server..." -ForegroundColor Green

# Tìm thư mục backend
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "backend"

if (-not (Test-Path "$backendDir\app\main.py")) {
    Write-Host "❌ Không tìm thấy thư mục backend!" -ForegroundColor Red
    exit 1
}

# Chuyển vào thư mục backend
Set-Location $backendDir

# Kiểm tra virtual environment
if (-not (Test-Path ".venv\Scripts\Activate.ps1")) {
    Write-Host "❌ Virtual environment chưa được tạo!" -ForegroundColor Red
    Write-Host "Chạy: cd backend && python -m venv .venv" -ForegroundColor Yellow
    exit 1
}

# Kích hoạt virtual environment
Write-Host "📦 Đang kích hoạt virtual environment..." -ForegroundColor Cyan
& ".\.venv\Scripts\Activate.ps1"

# Kiểm tra uvicorn đã cài chưa
$uvicornInstalled = python -c "import uvicorn" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ uvicorn chưa được cài đặt!" -ForegroundColor Red
    Write-Host "Đang cài đặt uvicorn..." -ForegroundColor Yellow
    pip install uvicorn[standard]
}

# Kiểm tra file .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  File .env chưa tồn tại!" -ForegroundColor Yellow
    Write-Host "Đang tạo từ env.example..." -ForegroundColor Cyan
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Đã tạo file .env. Vui lòng chỉnh sửa nếu cần." -ForegroundColor Green
    }
}

# Chạy uvicorn với format đúng: app.main:app
Write-Host "✅ Đang chạy server tại http://localhost:8000" -ForegroundColor Green
Write-Host "Nhấn Ctrl+C để dừng server" -ForegroundColor Yellow
Write-Host ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

