import logging
from typing import List
from fastapi import APIRouter, File, UploadFile, Depends
from sqlalchemy.orm import Session

from db.session import get_db
from services.inference_service import InferenceService
from api.deps import get_inference_svc

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Predictions"])


@router.post("/predict_aasist")
async def predict_aasist(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    service: InferenceService = Depends(get_inference_svc),
):
    logger.info(f"/predict_aasist called with {len(files)} file(s)")
    return await service.predict_batch(files, "AASIST", db)


@router.post("/predict_pa")
async def predict_pa(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    service: InferenceService = Depends(get_inference_svc),
):
    logger.info(f"/predict_pa called with {len(files)} file(s)")
    return await service.predict_batch(files, "PA", db)


@router.post("/predict_la")
async def predict_la(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    service: InferenceService = Depends(get_inference_svc),
):
    logger.info(f"/predict_la called with {len(files)} file(s)")
    return await service.predict_batch(files, "LA", db)


@router.post("/predict_lfcc_mms")
async def predict_lfcc_mms(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    service: InferenceService = Depends(get_inference_svc),
):
    logger.info(f"/predict_lfcc_mms called with {len(files)} file(s)")
    return await service.predict_batch(files, "LFCC_MMS", db)


@router.post("/predict_mfcc_mms")
async def predict_mfcc_mms(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    service: InferenceService = Depends(get_inference_svc),
):
    logger.info(f"/predict_mfcc_mms called with {len(files)} file(s)")
    return await service.predict_batch(files, "MFCC_MMS", db)


@router.post("/predict_lfcc_vaja")
async def predict_lfcc_vaja(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    service: InferenceService = Depends(get_inference_svc),
):
    logger.info(f"/predict_lfcc_vaja called with {len(files)} file(s)")
    return await service.predict_batch(files, "LFCC_VAJA", db)


@router.post("/predict_mfcc_vaja")
async def predict_mfcc_vaja(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    service: InferenceService = Depends(get_inference_svc),
):
    logger.info(f"/predict_mfcc_vaja called with {len(files)} file(s)")
    return await service.predict_batch(files, "MFCC_VAJA", db)


@router.post("/predict_lfcc")
@router.post("/predict_lfcc_1")
async def predict_lfcc(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    service: InferenceService = Depends(get_inference_svc),
):
    logger.info(f"/predict_lfcc(_1) called with {len(files)} file(s)")
    return await service.predict_batch(files, "LFCC", db)

