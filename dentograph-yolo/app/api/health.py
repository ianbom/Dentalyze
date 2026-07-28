from typing import Any

from fastapi import APIRouter

from app.core.config import device, settings

router = APIRouter()


@router.get("/")
def index() -> dict[str, Any]:
    return {
        "status": "ok",
    }

@router.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": settings.service_name,
        "framework": "fastapi",
        "device": str(device),
    }

