from typing import Optional, Any
from pydantic import BaseModel


class HealthResponse(BaseModel):
    ok: bool
    time: str


class ModelInfo(BaseModel):
    name: str
    loaded: bool
    input_shape: Optional[Any] = None
