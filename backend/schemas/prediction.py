from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PredictionItem(BaseModel):
    filename: str
    model: str
    label: str
    confidence: float
    confidence_pct: float
    error: Optional[str] = None


class PredictionHistoryItem(BaseModel):
    id: int
    filename: str
    label: str
    confidence: str
    timestamp: str

    class Config:
        from_attributes = True


class DeleteHistoryResponse(BaseModel):
    message: str
