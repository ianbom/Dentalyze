from pathlib import Path

from fastapi import FastAPI


def test_app_package_exposes_fastapi_app_without_flask_imports():
    source = Path("app/main.py").read_text(encoding="utf-8").lower()

    assert "from flask" not in source
    assert "import flask" not in source

    from app.main import app

    assert isinstance(app, FastAPI)


def test_app_uses_clean_service_structure():
    expected_paths = [
        "app/api/health.py",
        "app/api/prediction.py",
        "app/api/chat.py",
        "app/api/embedding.py",
        "app/core/config.py",
        "app/models/dental.py",
        "app/schemas/prediction.py",
        "app/schemas/chat.py",
        "app/schemas/embedding.py",
        "app/services/image_detection.py",
        "app/services/llm_chat.py",
        "app/services/embedding.py",
        "app/services/model_registry.py",
        ".env.example",
    ]

    for path in expected_paths:
        assert Path(path).exists(), f"Missing {path}"

    assert not Path("ai_service").exists()
