# Script chạy frontend server
# Sử dụng: .\run-frontend.ps1

Write-Host "🚀 Đang khởi động frontend server..." -ForegroundColor Green

# Tìm thư mục frontend gốc
$currentDir = Get-Location
$frontendRoot = $null

# Kiểm tra thư mục hiện tại
if (Test-Path "$currentDir\package.json") {
    $frontendRoot = $currentDir
}
# Kiểm tra thư mục cha
elseif (Test-Path "$currentDir\..\frontend\package.json") {
    $frontendRoot = (Resolve-Path "$currentDir\..\frontend").Path
    Set-Location $frontendRoot
    Write-Host "📁 Đã chuyển về thư mục: $frontendRoot" -ForegroundColor Cyan
}
# Kiểm tra thư mục cha của cha
elseif (Test-Path "$currentDir\..\..\frontend\package.json") {
    $frontendRoot = (Resolve-Path "$currentDir\..\..\frontend").Path
    Set-Location $frontendRoot
    Write-Host "📁 Đã chuyển về thư mục: $frontendRoot" -ForegroundColor Cyan
}

if (-not $frontendRoot) {
    Write-Host "❌ Không tìm thấy thư mục frontend!" -ForegroundColor Red
    Write-Host "Vui lòng chạy script từ thư mục frontend:" -ForegroundColor Yellow
    Write-Host "  cd frontend" -ForegroundColor Cyan
    exit 1
}

# Kiểm tra node_modules
if (-not (Test-Path "$frontendRoot\node_modules")) {
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

