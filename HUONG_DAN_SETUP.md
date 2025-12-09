# Hướng Dẫn Setup Dự Án Chí Tường Smart

Hướng dẫn này giúp bạn setup và chạy dự án web ghi chú thông minh từ GitHub.

## 📋 Yêu Cầu Hệ Thống

- **Windows 10/11**
- **Python 3.11+** (khuyến nghị Python 3.11 hoặc 3.12)
- **Node.js 18+** và npm
- **Docker Desktop** (để chạy PostgreSQL) HOẶC **PostgreSQL** cài đặt trực tiếp
- **Git** (để clone/pull từ GitHub)

---

## 🔽 Bước 1: Clone/Pull Dự Án Từ GitHub

### Nếu chưa có folder dự án:

```powershell
# Clone repository từ GitHub
git clone https://github.com/tien2922/MA_NGUON_NOTE.git
cd MA_NGUON_NOTE
```

### Nếu đã có folder dự án (để lấy commit mới nhất):

```powershell
# Vào folder dự án
cd E:\ma_nguon_cuoi_ki  # hoặc đường dẫn folder của bạn

# Lấy các commit mới nhất từ GitHub
git pull origin main
```

**Lưu ý:** Nếu có conflict (xung đột), bạn sẽ cần giải quyết trước khi tiếp tục.

---

## 🗄️ Bước 2: Setup PostgreSQL Database

### Cách 1: Dùng Docker (Khuyến nghị - Dễ nhất)

**Yêu cầu:** Đã cài Docker Desktop và đang chạy.

```powershell
# Chạy script tự động (tạo thư mục data và khởi động PostgreSQL)
.\start-postgres.ps1
```

**Hoặc chạy thủ công:**
```powershell
# Tạo thư mục data trên ổ E: (hoặc ổ khác nếu cần)
mkdir E:\postgres_data

# Khởi động PostgreSQL container
docker-compose -f docker-postgres.yml up -d

# Kiểm tra container đang chạy
docker ps

# Xem logs nếu cần
docker logs smartnotes_db
```

**Thông tin kết nối:**
- Host: `localhost:5432`
- Database: `smartnotes`
- User: `smartnotes`
- Password: `smartnotes123`

### Cách 2: Cài PostgreSQL Trực Tiếp

1. Tải PostgreSQL từ: https://www.postgresql.org/download/windows/
2. Cài đặt và nhớ password bạn đặt
3. Tạo database và user:
   ```sql
   CREATE DATABASE smartnotes;
   CREATE USER smartnotes WITH PASSWORD 'smartnotes123';
   GRANT ALL PRIVILEGES ON DATABASE smartnotes TO smartnotes;
   ```
4. Cập nhật `DATABASE_URL` trong file `backend/.env` (xem bước 3)

**Dừng PostgreSQL (Docker):**
```powershell
docker-compose -f docker-postgres.yml down
```

---

## 🐍 Bước 3: Setup Backend (Python/FastAPI)

### 3.1. Tạo Virtual Environment

```powershell
cd backend

# Tạo virtual environment
python -m venv .venv

# Kích hoạt virtual environment
.venv\Scripts\activate
```

**Lưu ý:** Nếu gặp lỗi "No space left on device" (ổ C: đầy), dùng script:
```powershell
.\setup-venv-e.ps1
```

### 3.2. Cài Đặt Dependencies

```powershell
# Cài đặt các package Python
pip install -r requirements.txt
```

**Nếu gặp lỗi về không gian đĩa:**
```powershell
.\install-packages-e.ps1
```

### 3.3. Tạo File .env

```powershell
# Copy file mẫu
copy env.example .env
```

**Mở file `backend/.env` và chỉnh sửa:**

```env
DATABASE_URL=postgresql+asyncpg://smartnotes:smartnotes123@localhost:5432/smartnotes
JWT_SECRET_KEY=tien2005
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:5173","http://localhost:5174","http://localhost:3000"]
```

**Lưu ý:** 
- Nếu dùng PostgreSQL cài trực tiếp, sửa `DATABASE_URL` theo thông tin của bạn
- `JWT_SECRET_KEY` có thể đặt bất kỳ chuỗi nào bạn muốn

### 3.4. Khởi Tạo Database

```powershell
# Tạo các bảng trong database
python fix_database.py
```

### 3.5. Chạy Backend Server

```powershell
# Đảm bảo virtual environment đã được kích hoạt
.venv\Scripts\activate

# Chạy server
uvicorn app.main:app --reload
```

**Backend sẽ chạy tại:** `http://localhost:8000`

**Kiểm tra:** Mở browser và vào `http://localhost:8000` - sẽ thấy `{"status":"ok","app":"Smart Notes"}`

---

## ⚛️ Bước 4: Setup Frontend (React/Vite)

### 4.1. Cài Đặt Dependencies

Mở terminal mới (giữ backend đang chạy):

```powershell
cd frontend

# Cài đặt các package Node.js
npm install
```

### 4.2. Chạy Frontend Server

```powershell
npm run dev
```

**Frontend sẽ chạy tại:** `http://localhost:5173`

---

## 🚀 Bước 5: Sử Dụng Ứng Dụng

1. **Mở browser:** `http://localhost:5173`
2. **Đăng ký tài khoản mới** hoặc **Đăng nhập** nếu đã có
3. **Sử dụng các tính năng:**
   - Tạo ghi chú mới
   - Sửa ghi chú
   - Xóa ghi chú
   - Tìm kiếm ghi chú
   - Cài đặt tài khoản

---

## 🔄 Cách Lấy Commit Mới Từ GitHub

Khi có người khác push code mới lên GitHub, bạn cần pull về:

```powershell
# Vào folder dự án
cd E:\ma_nguon_cuoi_ki

# Xem các thay đổi trên GitHub (không tải về)
git fetch origin

# Xem danh sách commit mới
git log origin/main --oneline -10

# Tải các thay đổi về máy
git pull origin main
```

**Nếu có conflict (xung đột):**
- Git sẽ báo file nào bị conflict
- Mở file đó và tìm các dòng có `<<<<<<<`, `=======`, `>>>>>>>`
- Sửa xung đột, sau đó:
  ```powershell
  git add .
  git commit -m "resolve conflict"
  ```

**Sau khi pull:**
- Nếu có thay đổi ở `backend/requirements.txt`: 
  ```powershell
  cd backend
  .venv\Scripts\activate
  pip install -r requirements.txt
  ```
- Nếu có thay đổi ở `frontend/package.json`:
  ```powershell
  cd frontend
  npm install
  ```
- Restart backend và frontend để áp dụng thay đổi

---

## 🛠️ Troubleshooting (Xử Lý Lỗi)

### Lỗi: "Failed to fetch" hoặc CORS error

**Nguyên nhân:** Backend chưa chạy hoặc CORS config sai

**Giải pháp:**
1. Kiểm tra backend đang chạy: `http://localhost:8000`
2. Kiểm tra `backend/.env` có đúng `CORS_ORIGINS` chưa
3. Restart backend sau khi sửa `.env`

### Lỗi: "No space left on device" khi cài package

**Giải pháp:** Dùng script để chuyển temp sang ổ E:
```powershell
cd backend
.\setup-venv-e.ps1
.\install-packages-e.ps1
```

### Lỗi: "asyncpg" build failed

**Nguyên nhân:** Python version không tương thích

**Giải pháp:** Dùng Python 3.11 hoặc 3.12 (không dùng 3.13)

### Lỗi: Database connection failed

**Giải pháp:**
1. Kiểm tra PostgreSQL đang chạy:
   - Docker: `docker ps` (xem container `smartnotes_db`)
   - Trực tiếp: Kiểm tra service PostgreSQL trong Services
2. Kiểm tra `DATABASE_URL` trong `backend/.env` đúng chưa
3. Test kết nối:
   ```powershell
   cd backend
   python -c "from app.database import engine; import asyncio; asyncio.run(engine.connect())"
   ```

### Lỗi: "Module not found" khi chạy backend

**Giải pháp:**
1. Đảm bảo virtual environment đã được kích hoạt: `.venv\Scripts\activate`
2. Cài lại dependencies: `pip install -r requirements.txt`

### Lỗi: Frontend không tự động chuyển trang sau đăng nhập

**Giải pháp:** Đã được fix trong commit mới nhất. Pull code mới và restart frontend.

---

## 📝 Cấu Trúc Dự Án

```
ma_nguon_cuoi_ki/
├── backend/              # Backend FastAPI
│   ├── app/             # Code chính
│   ├── .env             # Cấu hình (KHÔNG commit lên GitHub)
│   ├── requirements.txt # Python dependencies
│   └── ...
├── frontend/            # Frontend React
│   ├── src/            # Code React
│   ├── package.json    # Node.js dependencies
│   └── ...
├── docker-postgres.yml  # Cấu hình PostgreSQL Docker
├── start-postgres.ps1   # Script khởi động PostgreSQL
└── README.md           # Tài liệu chính
```

---

## ✅ Checklist Setup

- [ ] Đã clone/pull dự án từ GitHub
- [ ] Đã cài đặt và chạy PostgreSQL (Docker hoặc trực tiếp)
- [ ] Đã tạo virtual environment cho backend
- [ ] Đã cài đặt Python dependencies (`pip install -r requirements.txt`)
- [ ] Đã tạo file `.env` và cấu hình đúng
- [ ] Đã chạy `python fix_database.py` để tạo bảng
- [ ] Backend đang chạy tại `http://localhost:8000`
- [ ] Đã cài đặt Node.js dependencies (`npm install`)
- [ ] Frontend đang chạy tại `http://localhost:5173`
- [ ] Có thể đăng ký/đăng nhập và sử dụng ứng dụng

---

## 📞 Liên Hệ

Nếu gặp vấn đề, kiểm tra:
1. Tất cả các bước trên đã làm đúng chưa
2. Xem phần Troubleshooting
3. Kiểm tra logs của backend và frontend trong terminal
4. Kiểm tra console của browser (F12) để xem lỗi

**Chúc bạn setup thành công! 🎉**

