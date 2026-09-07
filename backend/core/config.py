import os
import shutil
from pathlib import Path
from typing import List, Union

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    try:
        from pydantic import BaseSettings
        SettingsConfigDict = None
    except ImportError:
        class BaseSettings:
            def __init__(self, **kwargs):
                for k, v in kwargs.items():
                    setattr(self, k, v)
        SettingsConfigDict = None


class Settings(BaseSettings):
    PROJECT_NAME: str = "Audio Deepfake Detection API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = ""

    # Base Directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    ML_WEIGHTS_DIR: Path = BASE_DIR / "ml_weights"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'asv_project.db'}")

    # CORS
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:4200",
    ]

    # FFmpeg executable
    FFMPEG_PATH: str = os.getenv("FFMPEG_PATH", shutil.which("ffmpeg") or "ffmpeg")

    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "61c736f7065637265746b6579313233_asv_secure_token")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Model Weights Paths
    MODEL_PA_PATH: Path = ML_WEIGHTS_DIR / "PA.h5"
    MODEL_LA_PATH: Path = ML_WEIGHTS_DIR / "LA.h5"
    MODEL_LFCC_MMS_PATH: Path = ML_WEIGHTS_DIR / "LFCC_genuine_MMS.h5"
    MODEL_MFCC_MMS_PATH: Path = ML_WEIGHTS_DIR / "MFCC_genuine_MMS.h5"
    MODEL_LFCC_VAJA_PATH: Path = ML_WEIGHTS_DIR / "LFCC_genuine_VAJA.h5"
    MODEL_LFCC_PATH: Path = ML_WEIGHTS_DIR / "LFCC_Split_3000.h5"
    MODEL_MFCC_VAJA_PATH: Path = ML_WEIGHTS_DIR / "MFCC_genuine_VAJA.h5"

    if SettingsConfigDict is not None:
        model_config = SettingsConfigDict(
            env_file=str(Path(__file__).resolve().parent.parent / ".env"),
            env_file_encoding="utf-8",
            extra="ignore",
        )
    else:
        class Config:
            env_file = str(Path(__file__).resolve().parent.parent / ".env")
            env_file_encoding = "utf-8"
            extra = "ignore"

    def get_allowed_origins(self) -> List[str]:
        if isinstance(self.ALLOWED_ORIGINS, str):
            origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        else:
            origins = list(self.ALLOWED_ORIGINS)
        
        extra = os.getenv("ASV_ALLOWED_ORIGINS", "")
        if extra.strip():
            origins.extend([o.strip() for o in extra.split(",") if o.strip()])
        return list(set(origins))


settings = Settings()
