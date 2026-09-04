from fastapi import APIRouter
from api.routes import predictions, history, auth, system

api_router = APIRouter()

api_router.include_router(predictions.router)
api_router.include_router(history.router)
api_router.include_router(auth.router)
api_router.include_router(system.router)
