from fastapi import APIRouter

from app.core.trace import trace
from app.schemas.chat import ChatRequest
from app.services.llm_chat import llm_chat_service

router = APIRouter()


@router.post("/chat")
async def chat(payload: ChatRequest) -> dict[str, str]:
    trace("REQUEST", role=payload.role, question=payload.question, context=payload.context)
    result = await llm_chat_service.chat(payload)
    trace("RESPONSE", role=payload.role, result=result)

    return result
