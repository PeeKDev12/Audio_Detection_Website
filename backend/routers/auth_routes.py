# D:\NECTEC\ASV\backend\routers\auth_routes.py

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
import bcrypt

from database.session import get_db
from database import models as db_models

from schemas import LoginRequest
from jwt_handler import create_token

router = APIRouter(prefix="/api", tags=["auth"])

# ====== CORS preflight (กัน 405 OPTIONS) ======
@router.options("/login")
def options_login():
    # 204 No Content สำหรับ preflight
    return Response(status_code=204)

# ====== Login ======
@router.post("/login")
def login_user(data: LoginRequest, db: Session = Depends(get_db)):
    # หา user ตามอีเมล
    user = db.query(db_models.User).filter(db_models.User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not found"
        )

    # ตรวจรหัสผ่าน (bcrypt)
    if not bcrypt.checkpw(data.password.encode("utf-8"), user.hashed_password.encode("utf-8")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )

    # สร้าง JWT
    token = create_token({"user_id": user.id, "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
    }

# (ทางเลือก) endpoint ง่ายๆไว้ทดสอบว่า router ทำงาน
@router.get("/auth/health")
def auth_health():
    return {"status": "ok"}
