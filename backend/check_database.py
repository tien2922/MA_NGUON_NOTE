"""
Kiểm tra xem database có field username chưa
Chạy: python check_database.py
"""
import asyncio
from sqlalchemy import text
from app.database import engine

async def check_table_structure():
    async with engine.connect() as conn:
        # Kiểm tra cấu trúc bảng users
        result = await conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        """))
        
        columns = result.fetchall()
        
        if not columns:
            print("❌ Bảng 'users' chưa tồn tại!")
            print("Chạy: python fix_database.py để tạo lại bảng")
            return
        
        print("=== Cấu trúc bảng users ===")
        column_names = []
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")
            column_names.append(col[0])
        
        if 'username' in column_names:
            print("\n✅ Field 'username' đã có trong database")
        else:
            print("\n❌ Field 'username' CHƯA có trong database!")
            print("Chạy: python fix_database.py để thêm field username")

if __name__ == "__main__":
    asyncio.run(check_table_structure())

