"""
Script kiểm tra và xóa các image_url không tồn tại trong database
Chạy: python fix_missing_images.py
"""
import asyncio
import os
from sqlalchemy import select, update
from app.database import AsyncSessionLocal
from app.models import Note

# Tìm đường dẫn uploads
_current_file = os.path.abspath(__file__)
_backend_dir = os.path.dirname(_current_file)
_project_root = os.path.dirname(_backend_dir)

uploads_dir = os.path.join(_backend_dir, "uploads")
if not os.path.exists(uploads_dir):
    uploads_dir = os.path.join(_project_root, "backend", "uploads")

async def fix_missing_images():
    """Xóa các image_url không tồn tại"""
    print(f"📁 Kiểm tra uploads directory: {uploads_dir}")
    
    async with AsyncSessionLocal() as session:
        # Lấy tất cả notes có image_url
        result = await session.execute(
            select(Note).where(Note.image_url.is_not(None))
        )
        notes = result.scalars().all()
        
        print(f"\n📊 Tìm thấy {len(notes)} ghi chú có image_url")
        
        missing_count = 0
        fixed_count = 0
        
        for note in notes:
            if not note.image_url:
                continue
                
            # Lấy tên file từ URL (ví dụ: /uploads/abc.png -> abc.png)
            filename = note.image_url.replace("/uploads/", "").strip()
            if not filename:
                continue
                
            file_path = os.path.join(uploads_dir, filename)
            
            if not os.path.exists(file_path):
                print(f"  ❌ File không tồn tại: {filename} (Note ID: {note.id})")
                # Xóa image_url trong database
                note.image_url = None
                missing_count += 1
            else:
                print(f"  ✅ File tồn tại: {filename}")
        
        if missing_count > 0:
            await session.commit()
            print(f"\n✅ Đã xóa {missing_count} image_url không tồn tại")
        else:
            print(f"\n✅ Tất cả các file ảnh đều tồn tại!")

if __name__ == "__main__":
    asyncio.run(fix_missing_images())

