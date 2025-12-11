"""
Service gửi email thông báo
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

from .config import settings

logger = logging.getLogger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Gửi email thông báo
    
    Args:
        to_email: Email người nhận
        subject: Tiêu đề email
        html_content: Nội dung HTML
        text_content: Nội dung text (optional)
    
    Returns:
        True nếu gửi thành công, False nếu có lỗi
    """
    # Nếu không có cấu hình SMTP, chỉ log và return False
    if not all([settings.smtp_host, settings.smtp_port, settings.smtp_user, settings.smtp_password]):
        logger.warning("SMTP không được cấu hình, bỏ qua gửi email")
        return False
    
    try:
        # Tạo message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.smtp_from or settings.smtp_user
        msg["To"] = to_email
        
        # Thêm nội dung text và HTML
        if text_content:
            part1 = MIMEText(text_content, "plain", "utf-8")
            msg.attach(part1)
        
        part2 = MIMEText(html_content, "html", "utf-8")
        msg.attach(part2)
        
        # Gửi email với cấu hình linh hoạt
        if settings.smtp_use_ssl:
            # Dùng SSL trực tiếp (như port 465)
            server = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port)
        else:
            # Dùng SMTP thường
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        
        try:
            # Bật TLS nếu cần (STARTTLS)
            if settings.smtp_use_tls and not settings.smtp_use_ssl:
                server.starttls()
            
            # Đăng nhập
            server.login(settings.smtp_user, settings.smtp_password)
            
            # Gửi email
            server.send_message(msg)
        finally:
            server.quit()
        
        logger.info(f"Đã gửi email thành công đến {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Lỗi khi gửi email đến {to_email}: {str(e)}")
        return False


async def send_welcome_email(email: str, username: str) -> bool:
    """
    Gửi email chào mừng khi đăng ký thành công
    
    Args:
        email: Email người dùng
        username: Tên người dùng
    
    Returns:
        True nếu gửi thành công
    """
    subject = "Chào mừng đến với Chí Tường Smart!"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #4CAF50;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }}
            .content {{
                background-color: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 5px 5px;
            }}
            .button {{
                display: inline-block;
                padding: 12px 30px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Chào mừng đến với Chí Tường Smart!</h1>
            </div>
            <div class="content">
                <p>Xin chào <strong>{username}</strong>,</p>
                
                <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Chí Tường Smart</strong> - Ứng dụng ghi chú thông minh!</p>
                
                <p>Tài khoản của bạn đã được tạo thành công với email: <strong>{email}</strong></p>
                
                <p>Bây giờ bạn có thể:</p>
                <ul>
                    <li>✅ Tạo và quản lý ghi chú của mình</li>
                    <li>✅ Tổ chức ghi chú theo thư mục</li>
                    <li>✅ Gắn thẻ và tìm kiếm nhanh chóng</li>
                    <li>✅ Chia sẻ ghi chú với người khác</li>
                </ul>
                
                <p style="text-align: center;">
                    <a href="http://localhost:5173/dangnhap" class="button">Đăng nhập ngay</a>
                </p>
                
                <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
                
                <p>Chúc bạn sử dụng ứng dụng vui vẻ!</p>
                
                <p>Trân trọng,<br>
                <strong>Đội ngũ Chí Tường Smart</strong></p>
            </div>
            <div class="footer">
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                <p>&copy; 2025 Chí Tường Smart. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
Chào mừng đến với Chí Tường Smart!

Xin chào {username},

Cảm ơn bạn đã đăng ký tài khoản tại Chí Tường Smart - Ứng dụng ghi chú thông minh!

Tài khoản của bạn đã được tạo thành công với email: {email}

Bây giờ bạn có thể:
- Tạo và quản lý ghi chú của mình
- Tổ chức ghi chú theo thư mục
- Gắn thẻ và tìm kiếm nhanh chóng
- Chia sẻ ghi chú với người khác

Đăng nhập tại: http://localhost:5173/dangnhap

Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.

Chúc bạn sử dụng ứng dụng vui vẻ!

Trân trọng,
Đội ngũ Chí Tường Smart
    """
    
    return await send_email(email, subject, html_content, text_content)


async def send_reminder_email(email: str, username: str, note_title: str, note_content: str, reminder_time) -> bool:
    """
    Gửi email nhắc nhở cho ghi chú
    
    Args:
        email: Email người dùng
        username: Tên người dùng
        note_title: Tiêu đề ghi chú
        note_content: Nội dung ghi chú
        reminder_time: Thời gian nhắc nhở (datetime)
    
    Returns:
        True nếu gửi thành công
    """
    
    # Format thời gian nhắc nhở
    reminder_str = reminder_time.strftime("%d/%m/%Y %H:%M")
    
    subject = f"⏰ Nhắc nhở: {note_title}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #FF9800;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }}
            .content {{
                background-color: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 5px 5px;
            }}
            .note-box {{
                background-color: white;
                border-left: 4px solid #FF9800;
                padding: 15px;
                margin: 20px 0;
            }}
            .note-title {{
                font-size: 18px;
                font-weight: bold;
                color: #333;
                margin-bottom: 10px;
            }}
            .note-content {{
                color: #666;
                white-space: pre-wrap;
            }}
            .reminder-time {{
                background-color: #FFF3E0;
                padding: 10px;
                border-radius: 5px;
                margin: 15px 0;
                text-align: center;
                font-weight: bold;
                color: #E65100;
            }}
            .button {{
                display: inline-block;
                padding: 12px 30px;
                background-color: #FF9800;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ Nhắc nhở ghi chú</h1>
            </div>
            <div class="content">
                <p>Xin chào <strong>{username}</strong>,</p>
                
                <p>Bạn có một nhắc nhở từ ghi chú của mình:</p>
                
                <div class="reminder-time">
                    ⏰ Thời gian nhắc nhở: {reminder_str}
                </div>
                
                <div class="note-box">
                    <div class="note-title">{note_title}</div>
                    <div class="note-content">{note_content[:200]}{'...' if len(note_content) > 200 else ''}</div>
                </div>
                
                <p style="text-align: center;">
                    <a href="http://localhost:5173/dashboard" class="button">Xem ghi chú</a>
                </p>
                
                <p>Chúc bạn một ngày tốt lành!</p>
                
                <p>Trân trọng,<br>
                <strong>Đội ngũ Chí Tường Smart</strong></p>
            </div>
            <div class="footer">
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                <p>&copy; 2025 Chí Tường Smart. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
Nhắc nhở ghi chú

Xin chào {username},

Bạn có một nhắc nhở từ ghi chú của mình:

⏰ Thời gian nhắc nhở: {reminder_str}

Tiêu đề: {note_title}

Nội dung:
{note_content[:200]}{'...' if len(note_content) > 200 else ''}

Xem ghi chú tại: http://localhost:5173/dashboard

Chúc bạn một ngày tốt lành!

Trân trọng,
Đội ngũ Chí Tường Smart
    """
    
    return await send_email(email, subject, html_content, text_content)

