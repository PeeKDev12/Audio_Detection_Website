from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from db.session import get_db
from db.models import User
from schemas.auth import LoginRequest, LoginResponse, UserOut
from utils.security import verify_password, create_token
from api.deps import get_current_user

router = APIRouter(tags=["Auth"])


@router.options("/login")
@router.options("/api/login")
def options_login():
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/login", response_model=LoginResponse)
@router.post("/api/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_token(user.id)
    user_out = UserOut(id=user.id, email=user.email, username=user.username)
    return LoginResponse(
        access_token=token,
        token_type="Bearer",
        user=user_out,
        user_id=user.id,
        username=user.username,
        email=user.email,
    )


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserOut(id=current_user.id, email=current_user.email, username=current_user.username)


@router.get("/api/auth/health")
def auth_health():
    return {"status": "ok"}
