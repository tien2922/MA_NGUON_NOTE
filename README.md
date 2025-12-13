# Chí Tường Smart

Ứng dụng ghi chú thông minh (FastAPI + PostgreSQL + JWT, frontend Vite/React).

## 🚀 Setup Tự Động (Khuyến nghị)

Sau khi **clone/pull code về**, chỉ cần chạy **1 lệnh duy nhất**:

```powershell
.\setup.ps1
```

Script này sẽ tự động:
- ✅ Kiểm tra Docker, Python, Node.js
- ✅ Khởi động PostgreSQL container
- ✅ Setup backend (virtual env + dependencies)
- ✅ Setup frontend (npm install)
- ✅ Tạo file `.env` từ `env.example`
- ✅ **Khởi tạo và đồng bộ database** (tạo bảng + thêm cột)

**Sau đó chạy:**
- Backend: `cd backend && .\.venv\Scripts\activate && uvicorn app.main:app --reload`
- Frontend: `cd frontend && npm run dev`
- Mở: `http://localhost:5173`

---

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

**Nếu đã chạy `setup.ps1`, bỏ qua các bước setup:**

```bash
cd backend
.\.venv\Scripts\activate  # Windows
# File .env đã được tạo tự động

# Khởi tạo database (nếu chưa chạy setup.ps1)
python fix_database.py

uvicorn app.main:app --reload
```

**Nếu chưa chạy setup.ps1:**
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy env.example .env
python fix_database.py
uvicorn app.main:app --reload
```

## Chạy frontend (dev)
```bash
cd frontend
npm install
npm run dev
# mở http://localhost:5173
```

## 🗄️ Database Schema và Build

### Cấu trúc Database

Database được định nghĩa trong `backend/app/models.py` với các bảng:
- `users`: Thông tin người dùng (username, email, password)
- `folders`: Thư mục để tổ chức ghi chú (hỗ trợ nested folders)
- `notes`: Ghi chú với full-text search (title, content, reminder, color, image)
- `tags`: Thẻ để phân loại ghi chú
- `notes_tags`: Bảng liên kết giữa notes và tags (many-to-many)
- `share_links`: Link chia sẻ công khai cho ghi chú

### Build Database

**Lần đầu tiên setup:**
```powershell
cd backend
.\.venv\Scripts\activate
python fix_database.py
```

**Khi pull code mới có thay đổi schema:**
```powershell
cd backend
.\.venv\Scripts\activate
python fix_database.py
```

Script `fix_database.py` sẽ tự động:
- ✅ Tạo các bảng mới nếu chưa có
- ✅ Thêm các cột mới vào bảng hiện có
- ✅ Tạo indexes cho full-text search (TSVECTOR với GIN index)
- ✅ Đồng bộ schema với code (không mất dữ liệu)

### Lưu ý về Database

- **Schema (cấu trúc bảng)**: Được định nghĩa trong code → Mọi người sẽ có cấu trúc giống nhau
- **Data (dữ liệu)**: Lưu trong PostgreSQL trên máy mỗi người → Mỗi người có dữ liệu riêng
- **Database location**: 
  - Docker: `E:\postgres_data` (theo cấu hình)
  - Không có file database trong project folder
- **Connection**: Qua `DATABASE_URL` trong `backend/.env`

## 📧 Cấu Hình Email (SMTP)

Để gửi email thông báo khi đăng ký và nhắc nhở ghi chú, cấu hình SMTP trong `backend/.env`:

### Cách 1: Email Server Riêng (Khuyến nghị - Không cần App Password)

Nếu bạn có email server riêng (từ hosting như cPanel, DirectAdmin, v.v.), bạn có thể dùng mật khẩu thường:

**Với port 587 (STARTTLS):**
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-normal-password
SMTP_FROM=Chí Tường Smart <noreply@yourdomain.com>
SMTP_USE_TLS=true
SMTP_USE_SSL=false
REMINDER_ENABLED=true
```

**Với port 465 (SSL trực tiếp):**
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-normal-password
SMTP_FROM=Chí Tường Smart <noreply@yourdomain.com>
SMTP_USE_TLS=false
SMTP_USE_SSL=true
REMINDER_ENABLED=true
```

**Lưu ý:** 
- Thay `mail.yourdomain.com` bằng SMTP server của bạn
- Thay `noreply@yourdomain.com` bằng email của bạn
- Dùng mật khẩu thường (không cần App Password)

### Cách 2: Gmail (Cần App Password)

1. **Lấy App Password:**
   - Vào https://myaccount.google.com/security
   - Bật **2-Step Verification** (nếu chưa bật)
   - Vào **App passwords** → Chọn **Mail** → Tạo password mới
   - Copy password (16 ký tự)

2. **Thêm vào `backend/.env`:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-16-ky-tu
SMTP_FROM=Chí Tường Smart <your-email@gmail.com>
SMTP_USE_TLS=true
SMTP_USE_SSL=false
REMINDER_ENABLED=true
```

**Lưu ý:** 
- Thay `your-email@gmail.com` bằng email Gmail của bạn
- Thay `your-app-password-16-ky-tu` bằng App Password đã tạo
- **Phải dùng App Password**, không dùng mật khẩu thường

### Cách 3: Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM=Chí Tường Smart <your-email@outlook.com>
SMTP_USE_TLS=true
SMTP_USE_SSL=false
REMINDER_ENABLED=true
```

### Test Email:

1. **Test email đăng ký:** Đăng ký tài khoản mới → Kiểm tra email inbox
2. **Test email nhắc nhở:** 
   - Tạo ghi chú với reminder (trong form tạo/sửa note)
   - Đặt thời gian reminder trong quá khứ để test ngay
   - Đợi ~1 phút → Kiểm tra email inbox

**Nếu không cấu hình SMTP:** Ứng dụng vẫn hoạt động bình thường, chỉ không gửi email.

## Ghi chú
- Không commit file `.env`, `node_modules/`, `dist/` (đã có `.gitignore`).
- Ảnh banner và đội ngũ: `frontend/public/image/`.
- Routes React: `/` (landing), `/dangnhap`, `/dangky`, `/timhieuthem`.
- **Database tự động đồng bộ**: Mỗi lần pull code mới, chạy `fix_database.py` để cập nhật schema.

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

