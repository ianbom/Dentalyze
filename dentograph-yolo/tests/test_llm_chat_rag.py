import asyncio
from types import SimpleNamespace

from app.schemas.chat import ChatRequest
from app.services import llm_chat


def test_llm_chat_adds_rag_knowledge_to_context(monkeypatch):
    async def fake_retrieve(_question):
        return [
            {
                "title": "Penjelasan Impaksi",
                "condition_name": "Impaksi",
                "content": "Impaksi adalah kondisi gigi tidak tumbuh normal.",
                "relevance_score": 0.91,
            }
        ]

    request = ChatRequest(role="pasien", question="Apa itu impaksi?", context={"radiographs": []})

    monkeypatch.setattr(llm_chat.knowledge_retrieval_service, "retrieve", fake_retrieve)
    context = asyncio.run(llm_chat.llm_chat_service._context_with_rag(request))

    assert len(context["knowledge"]) == 1
    assert context["knowledge"][0]["source"] == "ai_knowledge_bases"
    assert context["knowledge"][0]["content"] == "Impaksi adalah kondisi gigi tidak tumbuh normal."


def test_chat_routes_to_unified_langchain_for_deepseek(monkeypatch):
    async def fake_context(payload):
        return payload.context

    async def fake_langchain(payload, context, provider, model_name):
        return {"answer": f"{provider}:{model_name}:{payload.question}", "provider": f"{provider}:{model_name}"}

    monkeypatch.setattr(llm_chat.llm_chat_service, "_context_with_rag", fake_context)
    monkeypatch.setattr(llm_chat.llm_chat_service, "_chat_with_langchain", fake_langchain)
    monkeypatch.setattr(
        llm_chat,
        "settings",
        SimpleNamespace(llm_provider="deepseek", llm_model="deepseek-chat", gemini_model="", ollama_chat_model=""),
    )

    result = asyncio.run(llm_chat.llm_chat_service.chat(ChatRequest(role="pasien", question="halo", context={})))

    assert result == {"answer": "deepseek:deepseek-chat:halo", "provider": "deepseek:deepseek-chat"}


def test_chat_routes_to_unified_langchain_for_gemini(monkeypatch):
    async def fake_context(payload):
        return payload.context

    async def fake_langchain(payload, context, provider, model_name):
        return {"answer": f"{provider}:{model_name}:{payload.question}", "provider": f"{provider}:{model_name}"}

    monkeypatch.setattr(llm_chat.llm_chat_service, "_context_with_rag", fake_context)
    monkeypatch.setattr(llm_chat.llm_chat_service, "_chat_with_langchain", fake_langchain)
    monkeypatch.setattr(
        llm_chat,
        "settings",
        SimpleNamespace(llm_provider="gemini", llm_model="gemini-2.5-flash", gemini_model="", ollama_chat_model=""),
    )

    result = asyncio.run(llm_chat.llm_chat_service.chat(ChatRequest(role="pasien", question="halo", context={})))

    assert result == {"answer": "gemini:gemini-2.5-flash:halo", "provider": "gemini:gemini-2.5-flash"}


def test_chat_routes_to_unified_langchain_for_ollama(monkeypatch):
    async def fake_context(payload):
        return payload.context

    async def fake_langchain(payload, context, provider, model_name):
        return {"answer": f"{provider}:{model_name}:{payload.question}", "provider": f"{provider}:{model_name}"}

    monkeypatch.setattr(llm_chat.llm_chat_service, "_context_with_rag", fake_context)
    monkeypatch.setattr(llm_chat.llm_chat_service, "_chat_with_langchain", fake_langchain)
    monkeypatch.setattr(
        llm_chat,
        "settings",
        SimpleNamespace(llm_provider="ollama", llm_model="llama3.1", gemini_model="", ollama_chat_model=""),
    )

    result = asyncio.run(llm_chat.llm_chat_service.chat(ChatRequest(role="pasien", question="halo", context={})))

    assert result == {"answer": "ollama:llama3.1:halo", "provider": "ollama:llama3.1"}


def test_chat_returns_error_for_unknown_provider(monkeypatch):
    async def fake_context(payload):
        return payload.context

    monkeypatch.setattr(llm_chat.llm_chat_service, "_context_with_rag", fake_context)
    monkeypatch.setattr(
        llm_chat,
        "settings",
        SimpleNamespace(llm_provider="unknown", llm_model="model-x", gemini_model="", ollama_chat_model=""),
    )

    result = asyncio.run(llm_chat.llm_chat_service.chat(ChatRequest(role="pasien", question="halo", context={})))

    assert result["provider"] == "fastapi-error"
    assert "AI_LLM_PROVIDER" in result["answer"]


def test_chat_returns_error_when_model_missing(monkeypatch):
    async def fake_context(payload):
        return payload.context

    monkeypatch.setattr(llm_chat.llm_chat_service, "_context_with_rag", fake_context)
    monkeypatch.setattr(
        llm_chat,
        "settings",
        SimpleNamespace(llm_provider="deepseek", llm_model="", gemini_model="", ollama_chat_model=""),
    )

    result = asyncio.run(llm_chat.llm_chat_service.chat(ChatRequest(role="pasien", question="halo", context={})))

    assert result["provider"] == "fastapi-error"
    assert "AI_LLM_MODEL" in result["answer"]


def test_active_model_prefers_generic_env_model(monkeypatch):
    monkeypatch.setattr(
        llm_chat,
        "settings",
        SimpleNamespace(llm_model="shared-model", gemini_model="gemini-fallback", ollama_chat_model="ollama-fallback"),
    )

    assert llm_chat.llm_chat_service._active_model("gemini") == "shared-model"
    assert llm_chat.llm_chat_service._active_model("ollama") == "shared-model"


def test_active_model_uses_provider_fallbacks(monkeypatch):
    monkeypatch.setattr(
        llm_chat,
        "settings",
        SimpleNamespace(llm_model="", gemini_model="gemini-fallback", ollama_chat_model="ollama-fallback"),
    )

    assert llm_chat.llm_chat_service._active_model("gemini") == "gemini-fallback"
    assert llm_chat.llm_chat_service._active_model("ollama") == "ollama-fallback"
    assert llm_chat.llm_chat_service._active_model("deepseek") == ""
