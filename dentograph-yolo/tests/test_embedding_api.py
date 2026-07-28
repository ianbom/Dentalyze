import asyncio
import json

from fastapi.testclient import TestClient


def test_embedding_endpoint_returns_embeddings(monkeypatch):
    from app.main import app
    from app.services import embedding as embedding_module

    async def fake_embed_texts(texts, model=None):
        return {
            "model": model or "bge-m3:567m",
            "dimensions": 1024,
            "embeddings": [[0.1] * 1024 for _ in texts],
        }

    monkeypatch.setattr(embedding_module.embedding_service, "embed_texts", fake_embed_texts)

    response = TestClient(app).post("/embeddings", json={"texts": ["contoh knowledge"]})

    assert response.status_code == 200
    payload = response.json()
    assert payload["model"] == "bge-m3:567m"
    assert payload["dimensions"] == 1024
    assert len(payload["embeddings"]) == 1
    assert len(payload["embeddings"][0]) == 1024


def test_embedding_service_falls_back_to_ollama_http_when_langchain_ollama_missing(monkeypatch):
    from app.services import embedding as embedding_module

    real_import = __import__

    def fake_import(name, *args, **kwargs):
        if name == "langchain_ollama":
            raise ModuleNotFoundError("No module named 'langchain_ollama'")

        return real_import(name, *args, **kwargs)

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def read(self):
            return json.dumps({"embeddings": [[0.2] * 1024]}).encode()

    sent = {}

    def fake_urlopen(request, timeout):
        sent["url"] = request.full_url
        sent["body"] = json.loads(request.data.decode())
        sent["timeout"] = timeout

        return FakeResponse()

    monkeypatch.setattr("builtins.__import__", fake_import)
    monkeypatch.setattr(embedding_module.request, "urlopen", fake_urlopen)

    result = asyncio.run(embedding_module.embedding_service.embed_texts(["contoh knowledge"]))

    assert sent["url"].endswith("/api/embed")
    assert sent["body"]["input"] == ["contoh knowledge"]
    assert result["model"] == "bge-m3:567m"
    assert result["dimensions"] == 1024
    assert len(result["embeddings"][0]) == 1024
