import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .database import Base, engine
from .routers import auth, folders, notes, search, share, tags


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def health():
    return {"status": "ok", "app": settings.app_name}


app.include_router(auth.router)
app.include_router(folders.router)
app.include_router(tags.router)
app.include_router(notes.router)
app.include_router(search.router)
app.include_router(share.router)

