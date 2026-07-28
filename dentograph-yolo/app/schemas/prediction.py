from typing import Any

from pydantic import BaseModel


class PredictRequest(BaseModel):
    image_path: str
    result_dir: str
    crop_dir: str
    radiograph_id: str | None = None
    result_prefix: str = "radiographs/results"
    crop_prefix: str | None = None


class PredictResponse(BaseModel):
    results: list[dict[str, Any]]
    result_image: str

