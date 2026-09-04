import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.database import database
from backend.database.models import Base  # <-- ต้อง import Base ที่มี models

try:
    with database.SessionLocal() as session:
        print("✅ Connected to SQL Server with Windows Authentication")
        
    # สร้างตารางทั้งหมดในฐานข้อมูลตาม models
    Base.metadata.create_all(bind=database.engine)
    print("✅ Tables created successfully.")

except Exception as e:
    print("❌ Failed to connect or create tables:", e)
