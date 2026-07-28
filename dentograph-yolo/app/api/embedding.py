from fastapi import APIRouter

from app.schemas.embedding import EmbeddingRequest, EmbeddingResponse
from app.services.embedding import embedding_service

router = APIRouter()


@router.post("/embeddings", response_model=EmbeddingResponse)
async def embeddings(payload: EmbeddingRequest) -> dict[str, object]:
    return await embedding_service.embed_texts(payload.texts, payload.model)
