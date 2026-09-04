# routers/history_routes.py
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.session import get_db
from helpers_auth import optional_current_user
from database import models as db_models


router = APIRouter(tags=["history"])

class HistoryOut(BaseModel):
    id: int
    filename: str
    label: str
    prob: float
    created_at: str

def map_history(h: db_models.History) -> HistoryOut:
    return HistoryOut(
        id=h.id, filename=h.filename, label=h.label, prob=h.prob, created_at=h.created_at.isoformat()
    )

@router.get("/history", response_model=List[HistoryOut])
def get_history(current_user: Optional[db_models.User] = Depends(optional_current_user),
                db: Session = Depends(get_db)):
    if current_user:
        rows = (db.query(db_models.History)
                  .filter(db_models.History.user_id == current_user.id)
                  .order_by(db_models.History.created_at.desc())
                  .limit(100).all())
    else:
        # “ของรวม” เช่น top 100 ล่าสุดของทุกคน หรือเฉพาะที่ public_flag = True
        rows = (db.query(db_models.History)
                  .filter(db_models.History.public_flag == True)  # ถ้ามีคอลัมน์นี้
                  .order_by(db_models.History.created_at.desc())
                  .limit(100).all())
    return [map_history(r) for r in rows]
