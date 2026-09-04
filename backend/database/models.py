# database/models.py
from sqlalchemy import Column, Integer, String, DateTime, Float
import datetime
from database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    label = Column(String)  # ✅ สำคัญ
    confidence = Column(Float)  # ✅ สำคัญ
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
