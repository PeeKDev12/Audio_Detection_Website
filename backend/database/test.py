# -*- coding: utf-8 -*-
"""
Script: create_user_tables.py
สร้างฐานข้อมูล users และ forgot_password พร้อมเชื่อมต่อฐานข้อมูล SQLAlchemy
"""

import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, ForeignKey, func
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

# ==============================================
# 🔧 CONFIG DATABASE CONNECTION
# ==============================================
# ✅ (1) ถ้าอยากใช้ SQLite (ง่ายสุด)
DATABASE_URL = (
    "mssql+pyodbc://@LAPTOP-GU4E5FJ0\\SQLEXPRESS/asv_project"
    "?driver=ODBC+Driver+17+for+SQL+Server"
    "&trusted_connection=yes"
)
# ✅ (2) ถ้าอยากใช้ SQL Server (Windows Authentication)
# DATABASE_URL = (
#     "mssql+pyodbc://@YOUR-SERVER-NAME/YOUR-DBNAME?"
#     "driver=ODBC+Driver+18+for+SQL+Server&trusted_connection=yes&TrustServerCertificate=yes"
# )

# ✅ (3) ถ้าอยากใช้ MySQL
# DATABASE_URL = "mysql+pymysql://username:password@localhost/dbname"

# ==============================================
# ⚙️ SETUP SQLALCHEMY
# ==============================================
Base = declarative_base()
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)

# ==============================================
# 🧱 TABLE DEFINITIONS
# ==============================================

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    forgot_tokens = relationship("ForgotPassword", back_populates="user")


class ForgotPassword(Base):
    __tablename__ = "forgot_password"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="forgot_tokens")

# ==============================================
# 🚀 CREATE DATABASE + TABLES
# ==============================================
def main():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully!")

        # test connect
        with SessionLocal() as session:
            session.execute("SELECT 1")
            print("✅ Database connection successful!")
    except Exception as e:
        print("❌ Error creating tables:", e)

if __name__ == "__main__":
    main()
