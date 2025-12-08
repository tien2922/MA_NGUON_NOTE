"""
Test CORS settings
"""
import asyncio
from app.core.config import settings

print("=== CORS Configuration Check ===")
print(f"CORS Origins: {settings.cors_origins}")
print(f"Number of origins: {len(settings.cors_origins)}")
for origin in settings.cors_origins:
    print(f"  - {origin}")

if "http://localhost:5173" in settings.cors_origins:
    print("\n✅ Port 5173 đã được thêm vào CORS")
else:
    print("\n❌ Port 5173 CHƯA có trong CORS")
    print("Cần cập nhật file .env và restart backend")

