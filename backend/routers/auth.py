from fastapi import APIRouter, Depends, HTTPException, status, Response, Header
from sqlalchemy.orm import Session
from typing import Optional        # ✅ เพิ่มบรรทัดนี้
import bcrypt

from database.session import get_db
from database import models as db_models

from schemas import LoginRequest
from jwt_handler import create_token, verify_token
from pydantic import BaseModel

router = APIRouter(tags=["auth"])

class UserOut(BaseModel):
    id: int
    email: str
    username: Optional[str] = None   # ✅ แก้ตรงนี้

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: UserOut

@router.options("/login")
def options_login():
    return Response(status_code=204)

@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login_user(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(db_models.User).filter(db_models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email not found")

    if not bcrypt.checkpw(data.password.encode("utf-8"), user.hashed_password.encode("utf-8")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")

    token = create_token(user.id)
    return {
        "access_token": token,
        "token_type": "Bearer",
        "user": {"id": user.id, "email": user.email, "username": user.username},
    }

@router.get("/me", response_model=UserOut)
def me(authorization: Optional[str] = Header(default=None), db: Session = Depends(get_db)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Bearer token")
    token = authorization.split(" ", 1)[1]
    payload = verify_token(token)
    user_id = int(payload.get("sub"))
    user = db.query(db_models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return {"id": user.id, "email": user.email, "username": user.username}
