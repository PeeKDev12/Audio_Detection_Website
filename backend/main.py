import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from db.session import init_db
from services.inference_service import inference_service
from api.router import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("asv_backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler for database initialization and model loading."""
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    
    # Initialize Database Tables
    init_db()

    # Preload Machine Learning Models
    try:
        inference_service.load_models()
    except Exception as e:
        logger.error(f"Error during model preloading: {e}")

    yield

    logger.info("Shutting down ASV Backend service...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Automatic Speaker Verification (ASV) & Audio Deepfake Detection REST API",
    lifespan=lifespan,
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router, prefix=settings.API_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
