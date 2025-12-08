"""
Script để kiểm tra CORS settings
Chạy: python check_cors.py
"""
from app.core.config import settings

print("=== CORS Configuration ===")
print(f"CORS Origins: {settings.cors_origins}")
print(f"Type: {type(settings.cors_origins)}")
print("\n✅ Nếu thấy port 5173 trong list trên thì CORS đã đúng")
print("❌ Nếu không thấy, cần cập nhật file .env và restart backend")

