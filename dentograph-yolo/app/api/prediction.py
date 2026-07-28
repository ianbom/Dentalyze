from typing import Any

from fastapi import APIRouter

from app.schemas.prediction import PredictRequest

router = APIRouter()


@router.post("/predict")
def predict(payload: PredictRequest) -> dict[str, Any]:
    from app.services.image_detection import image_detection_service

    return image_detection_service.predict(payload)
