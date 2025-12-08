"""
Script để xóa và tạo lại bảng users với field username mới
Chạy: python reset_database.py
"""
import asyncio
from app.database import engine, Base
from app.models import User

async def reset_users_table():
    async with engine.begin() as conn:
        # Xóa bảng users (sẽ xóa hết dữ liệu)
        await conn.run_sync(Base.metadata.drop_all, tables=[User.__table__])
        print("✅ Đã xóa bảng users cũ")
        
        # Tạo lại bảng users với field username
        await conn.run_sync(Base.metadata.create_all, tables=[User.__table__])
        print("✅ Đã tạo lại bảng users với field username")
    
    print("\n✅ Hoàn tất! Bạn có thể đăng ký với username mới.")

if __name__ == "__main__":
    asyncio.run(reset_users_table())

