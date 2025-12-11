"""
Script kiểm tra cấu hình và trạng thái reminder
Chạy: python check_reminder.py
"""
import asyncio
from datetime import datetime, timezone
from sqlalchemy import select, and_, text
from app.database import engine, AsyncSessionLocal
from app.models import Note, User
from app.core.config import settings


async def check_reminder_config():
    """Kiểm tra cấu hình reminder"""
    print("=" * 60)
    print("🔍 KIỂM TRA CẤU HÌNH REMINDER")
    print("=" * 60)
    
    # Kiểm tra cấu hình
    print("\n📋 Cấu hình:")
    print(f"  REMINDER_ENABLED: {settings.reminder_enabled}")
    print(f"  SMTP_HOST: {settings.smtp_host}")
    print(f"  SMTP_PORT: {settings.smtp_port}")
    print(f"  SMTP_USER: {settings.smtp_user}")
    print(f"  SMTP_PASSWORD: {'***' if settings.smtp_password else None}")
    print(f"  SMTP_FROM: {settings.smtp_from}")
    
    if not settings.reminder_enabled:
        print("\n❌ REMINDER_ENABLED = False")
        print("   → Reminder worker sẽ KHÔNG chạy!")
        print("   → Sửa trong file .env: REMINDER_ENABLED=true")
    
    if not settings.smtp_host:
        print("\n❌ SMTP_HOST chưa được cấu hình")
        print("   → Reminder worker sẽ KHÔNG chạy!")
        print("   → Cần cấu hình SMTP trong file .env")
    
    if settings.reminder_enabled and settings.smtp_host:
        print("\n✅ Cấu hình OK - Reminder worker sẽ chạy")
    
    # Kiểm tra database
    print("\n" + "=" * 60)
    print("📊 KIỂM TRA DATABASE")
    print("=" * 60)
    
    async with AsyncSessionLocal() as session:
        # Tìm các note có reminder
        result = await session.execute(
            select(Note, User)
            .join(User, Note.user_id == User.id)
            .where(Note.reminder_at.is_not(None))
            .order_by(Note.reminder_at)
        )
        
        notes_with_reminder = result.all()
        
        if not notes_with_reminder:
            print("\n⚠️  Không tìm thấy ghi chú nào có reminder!")
            return
        
        print(f"\n📝 Tìm thấy {len(notes_with_reminder)} ghi chú có reminder:\n")
        
        now = datetime.now(timezone.utc)
        
        for note, user in notes_with_reminder:
            print(f"  Note ID: {note.id}")
            print(f"  Tiêu đề: {note.title[:50]}...")
            print(f"  User: {user.username} ({user.email})")
            print(f"  Reminder tại: {note.reminder_at}")
            print(f"  Thời gian hiện tại (UTC): {now}")
            
            # So sánh timezone
            if note.reminder_at.tzinfo is None:
                print(f"  ⚠️  CẢNH BÁO: reminder_at KHÔNG có timezone!")
            else:
                print(f"  Timezone của reminder: {note.reminder_at.tzinfo}")
            
            # Kiểm tra đã đến giờ chưa
            if note.reminder_at <= now:
                if note.reminder_sent:
                    print(f"  ✅ Đã gửi email nhắc nhở")
                else:
                    print(f"  ⏰ ĐÃ ĐẾN GIỜ nhưng CHƯA gửi email!")
                    print(f"     → Có thể reminder worker chưa chạy hoặc có lỗi")
            else:
                time_diff = note.reminder_at - now
                minutes = int(time_diff.total_seconds() / 60)
                print(f"  ⏳ Còn {minutes} phút nữa mới đến giờ")
            
            print(f"  reminder_sent: {note.reminder_sent}")
            print("-" * 60)
        
        # Tìm các note đã đến giờ nhưng chưa gửi
        result_pending = await session.execute(
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
        
        pending_notes = result_pending.all()
        
        if pending_notes:
            print(f"\n⚠️  CÓ {len(pending_notes)} GHI CHÚ ĐÃ ĐẾN GIỜ NHƯNG CHƯA GỬI EMAIL:")
            for note, user in pending_notes:
                print(f"  - Note ID {note.id}: {note.title[:30]}... → {user.email}")
                print(f"    Reminder tại: {note.reminder_at}")
                print(f"    Thời gian hiện tại: {now}")
                print(f"    Chênh lệch: {(now - note.reminder_at).total_seconds() / 60:.1f} phút")
        else:
            print("\n✅ Không có ghi chú nào đang chờ gửi email")


if __name__ == "__main__":
    asyncio.run(check_reminder_config())

