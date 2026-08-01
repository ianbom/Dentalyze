import asyncio
import time
from typing import Any

import numpy as np

from app.core.config import settings
from app.core.trace import trace
from app.services.embedding import embedding_service


class KnowledgeRetrievalService:
    async def retrieve(self, question: str) -> list[dict[str, Any]]:
        if not question.strip():
            trace("RAG][SKIPPED", reason="empty question")
            return []

        started_at = time.perf_counter()
        trace("RAG][START", question=question, embedding_model=settings.embedding_model)

        try:
            embedding_started_at = time.perf_counter()
            query_embedding = await embedding_service.embed_texts([question])
            embedding = query_embedding["embeddings"][0]
            trace(
                "RAG][EMBEDDING",
                duration_ms=round((time.perf_counter() - embedding_started_at) * 1000, 2),
                embedding_model=query_embedding.get("model", settings.embedding_model),
                dimensions=len(embedding),
            )

            query_started_at = time.perf_counter()
            results = await asyncio.to_thread(self._retrieve_sync, embedding)
            trace(
                "RAG][RESULT",
                duration_ms=round((time.perf_counter() - query_started_at) * 1000, 2),
                total_duration_ms=round((time.perf_counter() - started_at) * 1000, 2),
                result_count=len(results),
                similarities=self._compact_results(results),
            )

            return results
        except Exception as exc:
            trace(
                "RAG][ERROR",
                duration_ms=round((time.perf_counter() - started_at) * 1000, 2),
                exception_type=type(exc).__name__,
                exception=str(exc),
            )
            raise

    @staticmethod
    def _compact_results(results: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return [
            {
                "rank": index,
                "id": item.get("id"),
                "title": item.get("title"),
                "cosine_similarity": round(float(item.get("relevance_score") or 0.0), 4),
            }
            for index, item in enumerate(results, start=1)
        ]

    @staticmethod
    def _rank_candidates(
        query_embedding: list[float],
        rows: list[dict[str, Any]],
        *,
        top_k: int,
    ) -> list[dict[str, Any]]:
        query = np.asarray(query_embedding, dtype=np.float32)
        if query.ndim != 1 or query.size == 0 or not np.isfinite(query).all():
            raise ValueError("Embedding query tidak valid.")

        query_norm = float(np.linalg.norm(query))
        if query_norm == 0.0:
            raise ValueError("Embedding query tidak boleh memiliki norm nol.")

        ranked: list[dict[str, Any]] = []
        for row in rows:
            vector_text = row.get("embedding_text")
            if not isinstance(vector_text, str):
                continue

            document = np.fromstring(vector_text.strip().strip("[]"), sep=",", dtype=np.float32)
            if document.size != query.size or not np.isfinite(document).all():
                continue

            document_norm = float(np.linalg.norm(document))
            if document_norm == 0.0:
                continue

            similarity = float(np.dot(query, document) / (query_norm * document_norm))
            ranked.append(
                {
                    **row,
                    "relevance_score": max(-1.0, min(1.0, similarity)),
                }
            )

        ranked.sort(key=lambda item: (-float(item["relevance_score"]), int(item["id"])))
        return ranked[:top_k]

    def _retrieve_sync(self, embedding: list[float]) -> list[dict[str, Any]]:
        if len(embedding) != settings.embedding_dimensions:
            raise RuntimeError(
                f"Dimensi embedding query {len(embedding)} tidak sesuai expected {settings.embedding_dimensions}."
            )

        try:
            import pymysql
        except ModuleNotFoundError as exc:
            raise RuntimeError("pymysql belum terinstall. Jalankan pip install -r requirements.txt.") from exc

        connection = pymysql.connect(
            host=settings.db_host,
            port=settings.db_port,
            user=settings.db_username,
            password=settings.db_password,
            database=settings.db_database,
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
        )

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        id,
                        title,
                        category,
                        condition_name,
                        embedding_model,
                        VECTOR_TO_STRING(embedding) AS embedding_text
                    FROM ai_knowledge_bases
                    WHERE status = 'active'
                      AND embedding IS NOT NULL
                    """
                )
                candidates = cursor.fetchall()
                ranked = self._rank_candidates(embedding, candidates, top_k=settings.rag_top_k)
                if not ranked:
                    return []

                ids = [item["id"] for item in ranked]
                placeholders = ", ".join(["%s"] * len(ids))
                cursor.execute(
                    f"SELECT id, content FROM ai_knowledge_bases WHERE id IN ({placeholders})",
                    ids,
                )
                content_by_id = {row["id"]: row["content"] for row in cursor.fetchall()}
        finally:
            connection.close()

        return [
            {
                "id": row["id"],
                "title": row["title"],
                "category": row["category"],
                "condition_name": row["condition_name"],
                "content": content_by_id[row["id"]],
                "embedding_model": row["embedding_model"],
                "relevance_score": row["relevance_score"],
            }
            for row in ranked
            if row["id"] in content_by_id
        ]


knowledge_retrieval_service = KnowledgeRetrievalService()
