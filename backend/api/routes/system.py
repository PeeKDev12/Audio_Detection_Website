from datetime import datetime
from fastapi import APIRouter, Depends
from services.inference_service import InferenceService
from api.deps import get_inference_svc

router = APIRouter(tags=["System"])


@router.get("/health")
def health_check():
    return {"ok": True, "time": datetime.utcnow().isoformat()}


@router.get("/models")
def get_models_info(service: InferenceService = Depends(get_inference_svc)):
    return service.get_models_status()
