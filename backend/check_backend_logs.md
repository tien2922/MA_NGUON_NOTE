# Hướng dẫn kiểm tra Reminder Worker

## Cách kiểm tra Reminder Worker có chạy không:

1. **Restart backend**:
   ```powershell
   # Dừng backend (Ctrl+C)
   # Chạy lại
   .\run-backend.ps1
   ```

2. **Kiểm tra logs khi backend khởi động**:
   Bạn sẽ thấy các dòng log sau nếu reminder worker đã chạy:
   ```
   🚀 Reminder worker đã khởi động
   📧 SMTP Host: smtp.gmail.com
   📧 SMTP User: hnak039@gmail.com
   ⏰ Kiểm tra reminder mỗi 60 giây
   ```

3. **Khi có reminder đến giờ**, bạn sẽ thấy:
   ```
   📧 Tìm thấy 1 ghi chú cần nhắc nhở
   📤 Đang gửi email nhắc nhở cho note ID X đến email@example.com...
   ✅ Đã gửi email nhắc nhở cho note ID X đến email@example.com
   ```

## Nếu không thấy logs:

1. Kiểm tra `.env` có đúng không:
   - `REMINDER_ENABLED=true`
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_USER=hnak039@gmail.com`
   - `SMTP_PASSWORD=...`

2. Restart backend sau khi sửa `.env`

3. Kiểm tra terminal backend có hiển thị logs không

