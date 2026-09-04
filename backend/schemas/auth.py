from typing import Optional
from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    username: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: Optional[UserOut] = None
    user_id: Optional[int] = None
    username: Optional[str] = None
    email: Optional[str] = None

