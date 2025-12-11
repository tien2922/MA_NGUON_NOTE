"""
Script test reminder worker trực tiếp
Chạy: python test_reminder_worker.py
"""
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, and_
from app.database import AsyncSessionLocal
from app.models import Note, User
from app.core.email import send_reminder_email

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_reminder_worker_once():
    """Chạy một lần kiểm tra reminder (giống như worker)"""
    logger.info("=" * 60)
    logger.info("🔍 TEST REMINDER WORKER")
    logger.info("=" * 60)
    
    async with AsyncSessionLocal() as session:
        # Tìm các ghi chú có reminder_at đã đến và chưa gửi email
        now = datetime.now(timezone.utc)
        logger.info(f"⏰ Thời gian hiện tại (UTC): {now}")
        
        # Tìm các note có reminder_at <= now và reminder_sent = False
        result = await session.execute(
            select(Note, User)
            .join(User, Note.user_id == User.id)
            .where(
                and_(
                    Note.reminder_at.is_not(None),
                    Note.reminder_at <= now,
                    Note.reminder_sent == False,
                    Note.deleted_at.is_(None)
                )
            )
        )
        
        notes_to_remind = result.all()
        
        logger.info(f"📊 Tìm thấy {len(notes_to_remind)} ghi chú cần nhắc nhở")
        
        if not notes_to_remind:
            logger.info("✅ Không có ghi chú nào cần gửi email")
            return
        
        for note, user in notes_to_remind:
            logger.info(f"\n📝 Xử lý Note ID {note.id}:")
            logger.info(f"   Tiêu đề: {note.title[:50]}")
            logger.info(f"   User: {user.username} ({user.email})")
            logger.info(f"   Reminder tại: {note.reminder_at}")
            
            try:
                # Đảm bảo reminder_at có timezone UTC
                reminder_time = note.reminder_at
                if reminder_time.tzinfo is None:
                    reminder_time = reminder_time.replace(tzinfo=timezone.utc)
                    logger.warning(f"   ⚠️ reminder_at không có timezone, đã convert sang UTC")
                elif reminder_time.tzinfo != timezone.utc:
                    reminder_time = reminder_time.astimezone(timezone.utc)
                    logger.info(f"   🔄 Đã convert reminder_at sang UTC: {reminder_time}")
                
                # Gửi email nhắc nhở
                logger.info(f"   📤 Đang gửi email đến {user.email}...")
                success = await send_reminder_email(
                    email=user.email,
                    username=user.username,
                    note_title=note.title,
                    note_content=note.content or "",
                    reminder_time=reminder_time
                )
                
                if success:
                    # Đánh dấu đã gửi email
                    note.reminder_sent = True
                    await session.commit()
                    logger.info(f"   ✅ Đã gửi email thành công và đánh dấu reminder_sent=True")
                else:
                    logger.error(f"   ❌ Không thể gửi email - Kiểm tra cấu hình SMTP")
            
            except Exception as e:
                logger.error(f"   ❌ Lỗi khi xử lý note ID {note.id}: {str(e)}", exc_info=True)


if __name__ == "__main__":
    asyncio.run(test_reminder_worker_once())

