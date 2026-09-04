from fastapi import UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from database.models import Prediction
from database.database import get_db
from datetime import datetime

@app.post("/predict")
async def predict_audio(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Feature extract, predict, etc.
    
    # Example result
    label = "Real"
    confidence = 94.5
    
    prediction = Prediction(
        filename=file.filename,
        label=label,
        confidence=confidence,
        timestamp=datetime.utcnow()
    )
    db.add(prediction)
    db.commit()
    
    return {
        "filename": file.filename,
        "label": label,
        "confidence": confidence
    }
