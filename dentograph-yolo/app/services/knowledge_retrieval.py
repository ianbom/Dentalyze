import asyncio
import json
from typing import Any

from app.core.config import settings
from app.services.embedding import embedding_service


class KnowledgeRetrievalService:
    async def retrieve(self, question: str) -> list[dict[str, Any]]:
        if not question.strip():
            return []

        query_embedding = await embedding_service.embed_texts([question])
        embedding = query_embedding["embeddings"][0]
        results = await asyncio.to_thread(self._retrieve_sync, embedding)

        print(f"[knowledge_retrieval] question={question}")
        if not results:
            print("[knowledge_retrieval] no results")
        else:
            for index, item in enumerate(results, start=1):
                print(f"[knowledge_retrieval] #{index} full_result=")
                print(json.dumps(item, ensure_ascii=False, indent=2))

        return results

    def _retrieve_sync(self, embedding: list[float]) -> list[dict[str, Any]]:
        try:
            import pymysql
        except ModuleNotFoundError as exc:
            raise RuntimeError("pymysql belum terinstall. Jalankan pip install -r requirements.txt.") from exc

        vector = json.dumps([float(value) for value in embedding], separators=(",", ":"))
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
                        content,
                        embedding_model,
                        (embedding <=> STRING_TO_VECTOR(%s)) AS distance
                    FROM ai_knowledge_bases
                    WHERE status = 'active'
                      AND embedding IS NOT NULL
                    ORDER BY distance ASC
                    LIMIT %s
                    """,
                    (vector, settings.rag_top_k),
                )
                rows = cursor.fetchall()
        finally:
            connection.close()

        return [
            {
                "id": row["id"],
                "title": row["title"],
                "category": row["category"],
                "condition_name": row["condition_name"],
                "content": row["content"],
                "embedding_model": row["embedding_model"],
                "relevance_score": max(0.0, 1.0 - float(row["distance"] or 0.0)),
            }
            for row in rows
        ]


knowledge_retrieval_service = KnowledgeRetrievalService()
