"""
Background task để kiểm tra và gửi email nhắc nhở cho ghi chú
"""
import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy import select, and_

from .models import Note, User
from .core.email import send_reminder_email
from .core.config import settings
import logging

logger = logging.getLogger(__name__)


async def reminder_worker(session_factory: async_sessionmaker[AsyncSession]):
    """
    Background worker kiểm tra và gửi email nhắc nhở định kỳ
    
    Chạy mỗi 60 giây để kiểm tra các ghi chú có reminder_at đã đến thời gian
    """
    logger.info("🚀 Reminder worker đã khởi động")
    logger.info(f"📧 SMTP Host: {settings.smtp_host}")
    logger.info(f"📧 SMTP User: {settings.smtp_user}")
    logger.info(f"⏰ Kiểm tra reminder mỗi 60 giây")
    
    while True:
        try:
            await asyncio.sleep(60)  # Kiểm tra mỗi 60 giây
            
            async with session_factory() as session:
                # Tìm các ghi chú có reminder_at đã đến và chưa gửi email
                now = datetime.now(timezone.utc)
                
                # Tìm các note có reminder_at <= now và reminder_sent = False
                # Đảm bảo reminder_at có timezone và convert sang UTC nếu cần
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
                
                if notes_to_remind:
                    logger.info(f"📧 Tìm thấy {len(notes_to_remind)} ghi chú cần nhắc nhở")
                    for note, user in notes_to_remind:
                        logger.info(f"  - Note ID {note.id}: '{note.title[:30]}...' → {user.email} (reminder_at: {note.reminder_at})")
                
                for note, user in notes_to_remind:
                    try:
                        # Đảm bảo reminder_at có timezone UTC
                        reminder_time = note.reminder_at
                        if reminder_time.tzinfo is None:
                            # Nếu không có timezone, giả sử là UTC
                            reminder_time = reminder_time.replace(tzinfo=timezone.utc)
                            logger.warning(f"⚠️ Note ID {note.id} có reminder_at không có timezone, đã convert sang UTC")
                        elif reminder_time.tzinfo != timezone.utc:
                            # Convert sang UTC
                            reminder_time = reminder_time.astimezone(timezone.utc)
                            logger.info(f"🔄 Note ID {note.id} đã convert reminder_at sang UTC: {reminder_time}")
                        
                        # Gửi email nhắc nhở
                        logger.info(f"📤 Đang gửi email nhắc nhở cho note ID {note.id} đến {user.email}...")
                        success = await send_reminder_email(
                            email=user.email,
                            username=user.username,
                            note_title=note.title,
                            note_content=note.content,
                            reminder_time=reminder_time
                        )
                        
                        if success:
                            # Đánh dấu đã gửi email
                            note.reminder_sent = True
                            await session.commit()
                            logger.info(f"✅ Đã gửi email nhắc nhở cho note ID {note.id} đến {user.email}")
                        else:
                            logger.warning(f"⚠️ Không thể gửi email nhắc nhở cho note ID {note.id} - Kiểm tra cấu hình SMTP")
                    
                    except Exception as e:
                        logger.error(f"❌ Lỗi khi gửi email nhắc nhở cho note ID {note.id}: {str(e)}", exc_info=True)
                        # Tiếp tục với note tiếp theo, không dừng worker
                        continue
                
        except asyncio.CancelledError:
            logger.info("🛑 Reminder worker đã dừng")
            break
        except Exception as e:
            logger.error(f"❌ Lỗi trong reminder worker: {str(e)}", exc_info=True)
            # Tiếp tục chạy, không dừng worker
            await asyncio.sleep(60)
