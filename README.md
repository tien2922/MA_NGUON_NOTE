# Chí Tường Smart

Ứng dụng ghi chú thông minh (FastAPI + PostgreSQL + JWT, frontend Vite/React).

## Cấu trúc
- `backend/`: FastAPI, SQLAlchemy async, JWT, full-text search Postgres, share link.
- `frontend/`: Vite + React + React Router, trang landing/login/register/timhieuthem, assets trong `frontend/public/image/`.
- `image/`: ảnh nguồn dùng cho frontend (đã copy vào `frontend/public/image/`).

## Chạy backend (dev)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
set DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/smartnotes
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

