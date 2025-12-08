"""
Script để khởi tạo tất cả các bảng trong database
Chạy script này để đảm bảo tất cả các bảng được tạo đúng
"""
import asyncio
from app.database import engine, Base
from app.models import User, Folder, Note, Tag, NoteTag, ShareLink


async def init_database():
    """Tạo tất cả các bảng trong database"""
    print("🔄 Đang kết nối database...")
    
    async with engine.begin() as conn:
        print("📋 Đang tạo các bảng...")
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Đã tạo tất cả các bảng:")
        print("   - users")
        print("   - folders")
        print("   - notes")
        print("   - tags")
        print("   - notes_tags")
        print("   - share_links")
        print("\n✅ Hoàn tất! Database đã sẵn sàng.")


if __name__ == "__main__":
    asyncio.run(init_database())

