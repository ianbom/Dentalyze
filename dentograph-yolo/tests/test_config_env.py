from pathlib import Path

from app.core.config import BASE_DIR, Settings


def _env_keys(path: Path) -> list[str]:
    return [
        line.split("=", 1)[0]
        for line in path.read_text(encoding="utf-8").splitlines()
        if line and not line.startswith("#") and "=" in line
    ]


def test_env_example_keys_match_current_env_file():
    assert _env_keys(Path(".env.example")) == _env_keys(Path(".env"))


def test_env_files_include_all_runtime_settings():
    expected_keys = [
        "AI_SERVICE_HOST",
        "AI_SERVICE_PORT",
        "AI_PRELOAD_MODELS",
        "AI_LLM_CONTEXT_MAX_CHARS",
        "AI_LLM_PROVIDER",
        "AI_LLM_MODEL",
        "GEMINI_API_KEY",
        "GEMINI_MODEL",
        "DEEPSEEK_API_KEY",
        "DEEPSEEK_BASE_URL",
        "OLLAMA_BASE_URL",
        "OLLAMA_CHAT_MODEL",
        "EMBEDDING_MODEL",
        "EMBEDDING_DIMENSIONS",
        "DB_HOST",
        "DB_PORT",
        "DB_DATABASE",
        "DB_USERNAME",
        "DB_PASSWORD",
        "AI_RAG_TOP_K",
        "YOLO_MODEL_PATH",
        "VIT_MODEL_PATH",
        "CONF_YOLO",
        "NMS_IOU_THRESHOLD",
    ]

    assert _env_keys(Path(".env")) == expected_keys
    assert _env_keys(Path(".env.example")) == expected_keys


def test_settings_match_current_fastapi_env(monkeypatch):
    monkeypatch.setenv("AI_SERVICE_HOST", "0.0.0.0")
    monkeypatch.setenv("AI_SERVICE_PORT", "9000")
    monkeypatch.setenv("AI_PRELOAD_MODELS", "true")
    monkeypatch.setenv("AI_LLM_PROVIDER", "deepseek")
    monkeypatch.setenv("AI_LLM_MODEL", "deepseek-chat")
    monkeypatch.setenv("GEMINI_API_KEY", "gemini-secret")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-test")
    monkeypatch.setenv("DEEPSEEK_API_KEY", "deepseek-secret")
    monkeypatch.setenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
    monkeypatch.setenv("OLLAMA_BASE_URL", "http://localhost:11434")
    monkeypatch.setenv("OLLAMA_CHAT_MODEL", "llama-test")
    monkeypatch.setenv("EMBEDDING_MODEL", "embedding-test")
    monkeypatch.setenv("EMBEDDING_DIMENSIONS", "768")
    monkeypatch.setenv("DB_HOST", "db.local")
    monkeypatch.setenv("DB_PORT", "3307")
    monkeypatch.setenv("DB_DATABASE", "dentograph_test")
    monkeypatch.setenv("DB_USERNAME", "tester")
    monkeypatch.setenv("DB_PASSWORD", "secret")
    monkeypatch.setenv("AI_RAG_TOP_K", "8")
    monkeypatch.setenv("YOLO_MODEL_PATH", "best22.pt")
    monkeypatch.setenv("VIT_MODEL_PATH", "best_kelainangigi.pth")

    settings = Settings()

    assert settings.service_host == "0.0.0.0"
    assert settings.service_port == 9000
    assert settings.preload_models is True
    assert settings.llm_provider == "deepseek"
    assert settings.llm_model == "deepseek-chat"
    assert settings.gemini_api_key == "gemini-secret"
    assert settings.gemini_model == "gemini-test"
    assert settings.deepseek_api_key == "deepseek-secret"
    assert settings.deepseek_base_url == "https://api.deepseek.com"
    assert settings.ollama_base_url == "http://localhost:11434"
    assert settings.ollama_chat_model == "llama-test"
    assert settings.embedding_model == "embedding-test"
    assert settings.embedding_dimensions == 768
    assert settings.db_host == "db.local"
    assert settings.db_port == 3307
    assert settings.db_database == "dentograph_test"
    assert settings.db_username == "tester"
    assert settings.db_password == "secret"
    assert settings.rag_top_k == 8
    assert settings.yolo_model_path == BASE_DIR / "best22.pt"
    assert settings.vit_model_path == BASE_DIR / "best_kelainangigi.pth"
