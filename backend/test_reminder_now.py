"""
Script test reminder ngay lập tức - Tạo reminder trong quá khứ để test
Chạy: python test_reminder_now.py
"""
import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, update
from app.database import AsyncSessionLocal
from app.models import Note, User

async def test_reminder_now():
    """Tạo reminder trong quá khứ để test ngay"""
    async with AsyncSessionLocal() as session:
        # Lấy note đầu tiên có reminder nhưng chưa gửi
        result = await session.execute(
            select(Note, User)
            .join(User, Note.user_id == User.id)
            .where(
                Note.reminder_at.is_not(None),
                Note.reminder_sent == False,
                Note.deleted_at.is_(None)
            )
            .limit(1)
        )
        
        note_data = result.first()
        
        if not note_data:
            print("❌ Không tìm thấy note nào có reminder để test")
            return
        
        note, user = note_data
        
        print(f"📝 Tìm thấy note ID {note.id}: '{note.title[:30]}...'")
        print(f"   User: {user.username} ({user.email})")
        print(f"   Reminder hiện tại: {note.reminder_at}")
        
        # Đặt reminder về 1 phút trước để test ngay
        test_time = datetime.now(timezone.utc) - timedelta(minutes=1)
        note.reminder_at = test_time
        note.reminder_sent = False  # Reset để test lại
        
        await session.commit()
        
        print(f"\n✅ Đã đặt reminder về: {test_time}")
        print(f"   (1 phút trước - sẽ được gửi trong vòng 60 giây)")
        print(f"\n📧 Email sẽ được gửi đến: {user.email}")
        print(f"   Kiểm tra inbox và spam folder sau ~1-2 phút")


if __name__ == "__main__":
    asyncio.run(test_reminder_now())

