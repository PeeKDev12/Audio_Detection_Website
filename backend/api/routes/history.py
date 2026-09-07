from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from db.models import Prediction
from schemas.prediction import PredictionHistoryItem, DeleteHistoryResponse

router = APIRouter(tags=["History"])


@router.get("/history", response_model=List[PredictionHistoryItem])
def get_prediction_history(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Prediction).order_by(Prediction.id.desc())
    if limit > 0:
        query = query.offset(offset).limit(limit)
    results = query.all()
    return [
        PredictionHistoryItem(
            id=r.id,
            filename=r.filename,
            label=r.label,
            confidence=f"{r.confidence * 100:.2f}%" if r.confidence <= 1.0 else f"{r.confidence:.2f}%",
            timestamp=r.timestamp.isoformat(),
        )
        for r in results
    ]


@router.delete("/history/{prediction_id}", response_model=DeleteHistoryResponse)
def delete_prediction(prediction_id: int, db: Session = Depends(get_db)):
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record with ID {prediction_id} not found",
        )
    db.delete(prediction)
    db.commit()
    return DeleteHistoryResponse(message=f"Prediction {prediction_id} deleted successfully")
