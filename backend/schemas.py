from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class MeResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
