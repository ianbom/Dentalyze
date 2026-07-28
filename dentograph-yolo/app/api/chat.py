from fastapi import APIRouter

from app.schemas.chat import ChatRequest
from app.services.llm_chat import llm_chat_service

router = APIRouter()


@router.post("/chat")
async def chat(payload: ChatRequest) -> dict[str, str]:
    return await llm_chat_service.chat(payload)

