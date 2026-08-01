import math
from pathlib import Path

from app.services.knowledge_retrieval import KnowledgeRetrievalService


def test_cosine_ranking_returns_identical_vector_first():
    rows = [
        {"id": 1, "title": "Identik", "embedding_text": "[1,0,0]"},
        {"id": 2, "title": "Orthogonal", "embedding_text": "[0,1,0]"},
        {"id": 3, "title": "Berlawanan", "embedding_text": "[-1,0,0]"},
    ]

    ranked = KnowledgeRetrievalService._rank_candidates([1.0, 0.0, 0.0], rows, top_k=3)

    assert [item["id"] for item in ranked] == [1, 2, 3]
    assert ranked[0]["relevance_score"] == 1.0
    assert ranked[1]["relevance_score"] == 0.0
    assert ranked[2]["relevance_score"] == -1.0


def test_cosine_ranking_limits_top_k_and_ignores_invalid_vectors():
    rows = [
        {"id": 1, "title": "Valid", "embedding_text": "[1,0,0]"},
        {"id": 2, "title": "Zero", "embedding_text": "[0,0,0]"},
        {"id": 3, "title": "Wrong dimension", "embedding_text": "[1,0]"},
        {"id": 4, "title": "NaN", "embedding_text": "[NaN,0,0]"},
        {"id": 5, "title": "Second", "embedding_text": "[0.5,0.5,0]"},
    ]

    ranked = KnowledgeRetrievalService._rank_candidates([1.0, 0.0, 0.0], rows, top_k=1)

    assert len(ranked) == 1
    assert ranked[0]["id"] == 1
    assert math.isclose(ranked[0]["relevance_score"], 1.0)


def test_rag_sql_no_longer_uses_null_safe_equality_as_cosine():
    source = Path("app/services/knowledge_retrieval.py").read_text(encoding="utf-8")

    assert "VECTOR_TO_STRING(embedding)" in source
    assert "embedding <=>" not in source
