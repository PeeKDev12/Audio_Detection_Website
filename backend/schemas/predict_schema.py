from pydantic import BaseModel
from datetime import datetime

class PredictionResponse(BaseModel):
    label: str
    confidence: str

class PredictionHistorySchema(BaseModel):
    id: int
    filename: str
    timestamp: datetime
    label: str
    confidence: str

    class Config:
        orm_mode = True
