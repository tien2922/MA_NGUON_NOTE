"""
Script để fix và khởi tạo database với tất cả các bảng
"""
import asyncio
from sqlalchemy import text
from app.database import engine, Base
from app.models import User, Folder, Note, Tag, NoteTag, ShareLink


async def fix_database():
    """Fix và tạo tất cả các bảng trong database"""
    print("🔄 Đang kết nối database...")
    
    async with engine.begin() as conn:
        print("📋 Đang tạo tất cả các bảng...")
        
        # Tạo tất cả các bảng
        await conn.run_sync(Base.metadata.create_all)

        # Đảm bảo thêm các cột mới nếu chưa có
        print("🔧 Đang kiểm tra và thêm cột mới cho bảng notes (color, image_url, deleted_at)...")
        await conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'notes' AND column_name = 'color'
                ) THEN
                    ALTER TABLE notes ADD COLUMN color VARCHAR(20);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'notes' AND column_name = 'image_url'
                ) THEN
                    ALTER TABLE notes ADD COLUMN image_url VARCHAR(500);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'notes' AND column_name = 'deleted_at'
                ) THEN
                    ALTER TABLE notes ADD COLUMN deleted_at TIMESTAMPTZ;
                END IF;
            END;
            $$;
        """))
        
        # Fix updated_at trigger nếu cần
        print("🔧 Đang kiểm tra trigger updated_at...")
        try:
            # Tạo trigger function nếu chưa có
            await conn.execute(text("""
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ language 'plpgsql';
            """))
            
            # Tạo trigger cho bảng notes nếu chưa có
            await conn.execute(text("""
                DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
                CREATE TRIGGER update_notes_updated_at
                    BEFORE UPDATE ON notes
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            """))
            print("✅ Đã tạo trigger updated_at cho bảng notes")
        except Exception as e:
            print(f"⚠️  Trigger có thể đã tồn tại: {e}")
        
        print("\n✅ Đã tạo tất cả các bảng:")
        print("   ✅ users")
        print("   ✅ folders")
        print("   ✅ notes")
        print("   ✅ tags")
        print("   ✅ notes_tags")
        print("   ✅ share_links")
        print("\n✅ Hoàn tất! Database đã sẵn sàng.")


if __name__ == "__main__":
    asyncio.run(fix_database())

