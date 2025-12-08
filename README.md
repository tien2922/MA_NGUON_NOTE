# Chí Tường Smart

Ứng dụng ghi chú thông minh (FastAPI + PostgreSQL + JWT, frontend Vite/React).

## Cấu trúc
- `backend/`: FastAPI, SQLAlchemy async, JWT, full-text search Postgres, share link.
- `frontend/`: Vite + React + React Router, trang landing/login/register/timhieuthem, assets trong `frontend/public/image/`.
- `image/`: ảnh nguồn dùng cho frontend (đã copy vào `frontend/public/image/`).

## Cài đặt PostgreSQL (Docker - data trên ổ E:)

**Cách 1: Dùng script PowerShell (khuyến nghị)**
```powershell
# Chạy script tự động
.\start-postgres.ps1
```

**Cách 2: Dùng Docker Compose trực tiếp**
```bash
# Tạo thư mục data trên ổ E:
mkdir E:\postgres_data

# Khởi động PostgreSQL container
docker-compose -f docker-postgres.yml up -d

# Kiểm tra logs
docker logs smartnotes_db

# Dừng PostgreSQL
docker-compose -f docker-postgres.yml down
```

**Thông tin kết nối:**
- Host: `localhost:5432`
- Database: `smartnotes`
- User: `smartnotes`
- Password: `smartnotes123`
- Connection string: `postgresql+asyncpg://smartnotes:smartnotes123@localhost:5432/smartnotes`

**Lưu ý:** Data sẽ được lưu tại `E:\postgres_data`

## Chạy backend (dev)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Copy env.example thành .env và chỉnh sửa
copy env.example .env

# Hoặc set trực tiếp:
set DATABASE_URL=postgresql+asyncpg://smartnotes:smartnotes123@localhost:5432/smartnotes
set JWT_SECRET_KEY=change-me

uvicorn app.main:app --reload
```

## Chạy frontend (dev)
```bash
cd frontend
npm install
npm run dev
# mở http://localhost:5173
```

## Ghi chú
- Không commit file `.env`, `node_modules/`, `dist/` (đã có `.gitignore`).
- Ảnh banner và đội ngũ: `frontend/public/image/`.
- Routes React: `/` (landing), `/dangnhap`, `/dangky`, `/timhieuthem`.

## Upload lên GitHub
```bash
cd E:\ma_nguon_cuoi_ki
git init
git status
git add .
git commit -m "chore: initial project scaffold"
git remote add origin https://github.com/<username>/<repo>.git
git branch -M main
git push -u origin main
```

Sau này mỗi lần chỉnh sửa: `git add ... && git commit -m "feat/fix: mô tả" && git push`.

