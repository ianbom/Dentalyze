from typing import Any

from pydantic import BaseModel


class ChatRequest(BaseModel):
    role: str
    question: str
    context: dict[str, Any]


class ChatResponse(BaseModel):
    answer: str
    provider: str

