import asyncio
import os
import contextlib
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .core.config import settings
from .database import Base, engine, AsyncSessionLocal
from .routers import auth, folders, notes, search, share, tags
from .reminder import reminder_worker

# Cấu hình logging để hiển thị logs của reminder worker
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Hiển thị logs ra console
    ]
)
logger = logging.getLogger(__name__)


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
# Tìm đường dẫn uploads: có thể ở backend/uploads hoặc ../backend/uploads
_current_dir = os.path.dirname(os.path.abspath(__file__))  # Thư mục app/
_backend_dir = os.path.dirname(_current_dir)  # Thư mục backend/
_project_root = os.path.dirname(_backend_dir)  # Thư mục gốc

# Thử tìm uploads ở backend/uploads trước
uploads_dir = os.path.join(_backend_dir, "uploads")
if not os.path.exists(uploads_dir):
    # Nếu không có, thử ở thư mục gốc/backend/uploads
    uploads_dir = os.path.join(_project_root, "backend", "uploads")

os.makedirs(uploads_dir, exist_ok=True)
logger.info(f"📁 Uploads directory: {uploads_dir}")
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Kiểm tra và khởi động reminder worker
    if settings.reminder_enabled and settings.smtp_host:
        logger.info("✅ Reminder enabled và SMTP đã cấu hình - Khởi động reminder worker")
        app.state.reminder_task = asyncio.create_task(reminder_worker(AsyncSessionLocal))
    else:
        if not settings.reminder_enabled:
            logger.warning("⚠️  REMINDER_ENABLED=false - Reminder worker KHÔNG chạy")
        if not settings.smtp_host:
            logger.warning("⚠️  SMTP_HOST chưa cấu hình - Reminder worker KHÔNG chạy")


@app.get("/")
async def health():
    return {"status": "ok", "app": settings.app_name}


app.include_router(auth.router)
app.include_router(folders.router)
app.include_router(tags.router)
app.include_router(notes.router)
app.include_router(search.router)
app.include_router(share.router)


@app.on_event("shutdown")
async def on_shutdown():
    task = getattr(app.state, "reminder_task", None)
    if task:
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task

