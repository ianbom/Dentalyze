import asyncio
import json
from urllib import request

from app.core.config import settings


class EmbeddingService:
    async def embed_texts(self, texts: list[str], model: str | None = None) -> dict[str, object]:
        model_name = model or settings.embedding_model

        try:
            from langchain_ollama import OllamaEmbeddings

            embedder = OllamaEmbeddings(
                model=model_name,
                base_url=settings.ollama_base_url,
            )
            embeddings = await embedder.aembed_documents(texts)
        except ModuleNotFoundError as exc:
            if exc.name not in (None, "langchain_ollama") and "langchain_ollama" not in str(exc):
                raise RuntimeError(f"Ollama embedding gagal: {exc}") from exc

            embeddings = await self._embed_via_ollama_http(texts, model_name)
        except Exception as exc:
            raise RuntimeError(f"Ollama embedding gagal: {exc}") from exc

        dimensions = len(embeddings[0]) if embeddings else 0

        if dimensions != settings.embedding_dimensions:
            raise RuntimeError(
                f"Dimensi embedding {dimensions}, expected {settings.embedding_dimensions}."
            )

        return {
            "model": model_name,
            "dimensions": dimensions,
            "embeddings": embeddings,
        }

    async def _embed_via_ollama_http(self, texts: list[str], model_name: str) -> list[list[float]]:
        return await asyncio.to_thread(self._embed_via_ollama_http_sync, texts, model_name)

    def _embed_via_ollama_http_sync(self, texts: list[str], model_name: str) -> list[list[float]]:
        url = f"{settings.ollama_base_url.rstrip('/')}/api/embed"
        body = json.dumps({"model": model_name, "input": texts}).encode()
        http_request = request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with request.urlopen(http_request, timeout=60) as response:
                payload = json.loads(response.read().decode())
        except Exception as exc:
            raise RuntimeError(f"Ollama HTTP embedding gagal: {exc}") from exc

        embeddings = payload.get("embeddings")

        if isinstance(embeddings, list):
            return embeddings

        embedding = payload.get("embedding")

        if isinstance(embedding, list):
            return [embedding]

        raise RuntimeError("Ollama HTTP embedding response missing embeddings.")


embedding_service = EmbeddingService()
