import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parents[2]


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default

    return value.strip().lower() in {"1", "true", "yes", "on"}


def _project_path(name: str, default: str) -> Path:
    value = os.getenv(name) or default
    path = Path(value)
    if path.is_absolute():
        return path

    return BASE_DIR / path


@dataclass(frozen=True)
class Settings:
    app_title: str = "Dentograph AI Service"
    service_name: str = "dentograph-ai"
    service_host: str = field(default_factory=lambda: os.getenv("AI_SERVICE_HOST", "127.0.0.1"))
    service_port: int = field(default_factory=lambda: int(os.getenv("AI_SERVICE_PORT", "8001")))
    preload_models: bool = field(default_factory=lambda: _env_bool("AI_PRELOAD_MODELS"))
    llm_context_max_chars: int = field(default_factory=lambda: int(os.getenv("AI_LLM_CONTEXT_MAX_CHARS", "12000")))
    llm_provider: str = field(default_factory=lambda: os.getenv("AI_LLM_PROVIDER", "ollama"))
    llm_model: str = field(default_factory=lambda: os.getenv("AI_LLM_MODEL", "").strip())
    gemini_api_key: str = field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    gemini_model: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
    deepseek_api_key: str = field(default_factory=lambda: os.getenv("DEEPSEEK_API_KEY", ""))
    deepseek_base_url: str = field(default_factory=lambda: os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"))
    yolo_model_path: Path = field(default_factory=lambda: _project_path("YOLO_MODEL_PATH", "best22.pt"))
    vit_model_path: Path = field(default_factory=lambda: _project_path("VIT_MODEL_PATH", "best_kelainangigi.pth"))
    confidence_yolo: float = field(default_factory=lambda: float(os.getenv("CONF_YOLO", "0.25")))
    nms_iou_threshold: float = field(default_factory=lambda: float(os.getenv("NMS_IOU_THRESHOLD", "0.3")))
    ollama_base_url: str = field(default_factory=lambda: os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11435"))
    ollama_chat_model: str = field(default_factory=lambda: os.getenv("OLLAMA_CHAT_MODEL", "llama3.1:8b-instruct-q8_0"))
    embedding_model: str = field(default_factory=lambda: os.getenv("EMBEDDING_MODEL", "bge-m3:567m"))
    embedding_dimensions: int = field(default_factory=lambda: int(os.getenv("EMBEDDING_DIMENSIONS", "1024")))
    db_host: str = field(default_factory=lambda: os.getenv("DB_HOST", "127.0.0.1"))
    db_port: int = field(default_factory=lambda: int(os.getenv("DB_PORT", "3306")))
    db_database: str = field(default_factory=lambda: os.getenv("DB_DATABASE", "dentalyze"))
    db_username: str = field(default_factory=lambda: os.getenv("DB_USERNAME", "root"))
    db_password: str = field(default_factory=lambda: os.getenv("DB_PASSWORD", ""))
    rag_top_k: int = field(default_factory=lambda: int(os.getenv("AI_RAG_TOP_K", "4")))


settings = Settings()
try:
    import torch

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
except Exception:
    device = "cpu"
