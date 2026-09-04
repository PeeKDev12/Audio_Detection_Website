# helpers_auth.py
from typing import Optional
from fastapi import Header, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jwt_handler import verify_token
from database.session import get_db
from database import models as db_models


def optional_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> Optional[db_models.User]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    payload = verify_token(token)  # ถ้า invalid จะ raise 401 ให้เอง
    try:
        uid = int(payload.get("sub"))
    except (TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    return db.get(db_models.User, uid)
