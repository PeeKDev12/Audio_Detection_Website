# backend/database/init_db.py
from database.database import engine
from database.models import Base  # ✅ ดึง Base ที่ models ใช้อยู่

Base.metadata.create_all(bind=engine)

print("✅ Tables created successfully.")
