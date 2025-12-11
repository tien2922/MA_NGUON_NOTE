# Script chạy frontend server từ thư mục gốc
# Sử dụng: .\run-frontend.ps1

Write-Host "🚀 Đang khởi động frontend server..." -ForegroundColor Green

# Tìm thư mục frontend
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $scriptDir "frontend"

if (-not (Test-Path "$frontendDir\package.json")) {
    Write-Host "❌ Không tìm thấy thư mục frontend!" -ForegroundColor Red
    exit 1
}

# Chuyển vào thư mục frontend
Set-Location $frontendDir

# Kiểm tra node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules chưa được cài đặt!" -ForegroundColor Yellow
    Write-Host "Đang cài đặt dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Lỗi khi cài đặt dependencies!" -ForegroundColor Red
        exit 1
    }
}

# Chạy dev server
Write-Host "✅ Đang chạy frontend tại http://localhost:5173" -ForegroundColor Green
Write-Host "Nhấn Ctrl+C để dừng server" -ForegroundColor Yellow
Write-Host ""

npm run dev

