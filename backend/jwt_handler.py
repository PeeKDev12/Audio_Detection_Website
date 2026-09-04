# jwt_handler.py
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import HTTPException, status

# ---- ตั้งค่า Secret และ Algorithm ----
SECRET_KEY = "61c736f7065637265746b6579313233"  # 🔒 เปลี่ยนเป็นของคุณเอง
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 วัน

# ---- สร้าง JWT ----
def create_token(user_id: int):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

# ---- ตรวจสอบ JWT ----
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # คืน dict เช่น {"sub": "1", "exp": 1234567890}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
