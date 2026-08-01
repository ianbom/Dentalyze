import asyncio

from app.services import llm_chat
from app.services.external_knowledge import ExternalKnowledgeService


def test_external_query_removes_patient_identifiers():
    query = ExternalKnowledgeService().build_query(
        "Bagaimana kondisi pasien Ian Ale pada RAD-2026-001 dengan NIK 1234567890123456?",
        {"intent": "patient_name"},
    )

    assert "Ian" not in query
    assert "Ale" not in query
    assert "RAD-2026-001" not in query
    assert "1234567890123456" not in query


def test_external_retrieval_uses_only_alodokter_articles(monkeypatch):
    service = ExternalKnowledgeService()
    search_html = '''
        <a href="https://www.alodokter.com/impaksi-gigi">Impaksi Gigi</a>
        <a href="https://example.com/not-allowed">Ignored</a>
    '''
    article_html = '''
        <html><head><title>Impaksi Gigi - Alodokter</title></head>
        <body><p>Impaksi gigi adalah kondisi ketika gigi tidak tumbuh normal.</p></body></html>
    '''

    def fake_fetch(url):
        return search_html if "/search?" in url else article_html

    monkeypatch.setattr(service, "_fetch_text", fake_fetch)
    results = asyncio.run(service.retrieve("Apa itu impaksi?", {"intent": "knowledge"}))

    assert results == [
        {
            "source": "alodokter",
            "title": "Impaksi Gigi",
            "url": "https://www.alodokter.com/impaksi-gigi",
            "content": "Impaksi gigi adalah kondisi ketika gigi tidak tumbuh normal.",
        }
    ]


def test_answer_appends_external_urls_at_the_bottom():
    answer = llm_chat.llm_chat_service._append_external_sources(
        {"answer": "Impaksi perlu diperiksa dokter.", "provider": "test"},
        {
            "external_sources": [
                {
                    "title": "Impaksi Gigi",
                    "url": "https://www.alodokter.com/impaksi-gigi",
                }
            ]
        },
    )

    assert answer["answer"].endswith("- Impaksi Gigi: https://www.alodokter.com/impaksi-gigi")



def test_external_retrieval_parses_alodokter_card_posts(monkeypatch):
    service = ExternalKnowledgeService()
    search_html = '<card-post-index url-path="/impaksi-gigi" title="Impaksi Gigi"></card-post-index>'
    article_html = '<title>Impaksi Gigi - Alodokter</title><p>Konten impaksi.</p>'

    monkeypatch.setattr(service, "_fetch_text", lambda url: search_html if "/search?" in url else article_html)
    results = asyncio.run(service.retrieve("impaksi", {"intent": "knowledge"}))

    assert results[0]["url"] == "https://www.alodokter.com/impaksi-gigi"


def test_external_retrieval_falls_back_to_empty_results_on_network_error(monkeypatch):
    service = ExternalKnowledgeService()
    monkeypatch.setattr(service, "_fetch_text", lambda _url: (_ for _ in ()).throw(TimeoutError("timeout")))

    assert asyncio.run(service.retrieve("impaksi", {"intent": "knowledge"})) == []


def test_external_query_removes_names_and_ids_from_context():
    query = ExternalKnowledgeService().build_query(
        "Apakah kondisi Ian Ale pada pemeriksaan terakhir membaik?",
        {
            "intent": "patient_name",
            "viewer": {"name": "Dokter Budi"},
            "patients": [{"name": "Ian Ale", "nik": "1234567890123456"}],
            "radiographs": [{"id": "RAD-PRIVATE-1"}],
        },
    )

    assert "Ian Ale" not in query
    assert "1234567890123456" not in query
    assert "RAD-PRIVATE-1" not in query
