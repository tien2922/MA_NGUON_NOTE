# Hướng dẫn Deploy Website

## Quy trình làm việc với GitHub

### 1. Commit và Push code lên GitHub

Mỗi khi bạn chỉnh sửa code, thực hiện các bước sau:

```powershell
# Kiểm tra các file đã thay đổi
git status

# Thêm các file muốn commit
git add .

# Hoặc thêm từng file cụ thể
git add backend/app/main.py
git add frontend/src/App.jsx

# Commit với message mô tả
git commit -m "feat: thêm tính năng đăng nhập"
# hoặc
git commit -m "fix: sửa lỗi hiển thị"
# hoặc
git commit -m "docs: cập nhật README"

# Push lên GitHub
git push origin main
```

**Lưu ý:**
- Mỗi commit sẽ được lưu lại trên GitHub với lịch sử thay đổi
- Bạn bè có thể xem code và commit history trên GitHub
- Sau khi push, website sẽ tự động deploy (nếu đã setup)

### 2. Các loại commit message (conventional commits)

- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật tài liệu
- `style:` - Format code, không ảnh hưởng logic
- `refactor:` - Refactor code
- `test:` - Thêm test
- `chore:` - Cập nhật build, config, etc.

## Deploy Frontend lên Vercel

### Bước 1: Kết nối GitHub với Vercel

1. Truy cập: https://vercel.com
2. Đăng nhập bằng GitHub
3. Click **"Add New Project"**
4. Chọn repository: `tien2922/MA_NGUON_NOTE`
5. Cấu hình:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Bước 2: Environment Variables (nếu cần)

Thêm các biến môi trường trong Vercel dashboard:
- `VITE_API_URL` = URL của backend trên Render (sẽ có sau khi deploy backend)

### Bước 3: Auto Deploy

- Mỗi khi push code lên GitHub branch `main`, Vercel sẽ tự động deploy
- Có thể xem deployment logs trên Vercel dashboard

## Deploy Backend lên Render

### Bước 1: Tạo PostgreSQL Database trên Render

1. Truy cập: https://render.com
2. Đăng nhập bằng GitHub
3. Click **"New +"** → **"PostgreSQL"**
4. Cấu hình:
   - **Name:** `smartnotes-db`
   - **Database:** `smartnotes`
   - **User:** `smartnotes`
   - **Region:** Chọn gần nhất (Singapore hoặc US)
   - **PostgreSQL Version:** 16
5. Lưu lại **Internal Database URL** và **External Database URL**

### Bước 2: Deploy Backend Service

1. Click **"New +"** → **"Web Service"**
2. Kết nối repository: `tien2922/MA_NGUON_NOTE`
3. Cấu hình:
   - **Name:** `smartnotes-api`
   - **Region:** Cùng region với database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Bước 3: Environment Variables

Thêm các biến môi trường trong Render dashboard:

```
DATABASE_URL=<Internal Database URL từ PostgreSQL service>
JWT_SECRET_KEY=<tạo một secret key ngẫu nhiên>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["https://your-frontend-url.vercel.app"]
```

**Lưu ý:**
- Dùng **Internal Database URL** (không phải External) để kết nối nhanh hơn
- `CORS_ORIGINS` phải là URL frontend trên Vercel
- Sau khi deploy frontend, cập nhật lại `CORS_ORIGINS` với URL thực tế

### Bước 4: Auto Deploy

- Mỗi khi push code lên GitHub branch `main`, Render sẽ tự động deploy
- Có thể xem logs trên Render dashboard

## Cập nhật Frontend để kết nối với Backend

Sau khi deploy backend, cập nhật file frontend để sử dụng API URL từ Render:

1. Tạo file `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

2. Hoặc cập nhật code để dùng environment variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

## Kiểm tra Deployment

### Frontend (Vercel)
- URL sẽ có dạng: `https://ma-nguon-note.vercel.app`
- Kiểm tra: Mở URL và test các chức năng

### Backend (Render)
- URL sẽ có dạng: `https://smartnotes-api.onrender.com`
- API Docs: `https://smartnotes-api.onrender.com/docs`
- Kiểm tra: Mở `/docs` để xem Swagger UI

## Troubleshooting

### Backend không kết nối được database
- Kiểm tra `DATABASE_URL` đúng chưa
- Đảm bảo dùng Internal Database URL
- Kiểm tra logs trên Render dashboard

### Frontend không kết nối được backend
- Kiểm tra `CORS_ORIGINS` có đúng URL frontend không
- Kiểm tra `VITE_API_URL` trong frontend
- Kiểm tra network tab trong browser console

### Build failed
- Kiểm tra logs trên Vercel/Render
- Đảm bảo các dependencies đã được cài đặt
- Kiểm tra file cấu hình (package.json, requirements.txt)

