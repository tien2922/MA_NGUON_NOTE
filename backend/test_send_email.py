"""
Script test gửi email trực tiếp
Chạy: python test_send_email.py
"""
import asyncio
from app.core.email import send_reminder_email
from datetime import datetime, timezone

async def test_email():
    """Test gửi email nhắc nhở"""
    import sys
    
    # Lấy email từ command line hoặc dùng mặc định
    test_email = sys.argv[1] if len(sys.argv) > 1 else "hnak036@gmail.com"
    
    print(f"📧 Đang test gửi email đến {test_email}...")
    
    success = await send_reminder_email(
        email=test_email,
        username="Test User",
        note_title="Test Reminder - Kiểm tra chức năng nhắc nhở",
        note_content="Đây là email test để kiểm tra reminder hoạt động. Nếu bạn nhận được email này, chức năng reminder đang hoạt động tốt!",
        reminder_time=datetime.now(timezone.utc)
    )
    
    if success:
        print(f"✅ Gửi email thành công!")
        print(f"   Kiểm tra inbox và spam folder của {test_email}")
    else:
        print("❌ Gửi email thất bại!")
        print("   Kiểm tra cấu hình SMTP trong .env")

if __name__ == "__main__":
    asyncio.run(test_email())

