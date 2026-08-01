import json
from datetime import datetime, timezone
from typing import Any


def _sanitize(value: Any, key: str | None = None) -> Any:
    if key and any(marker in key.lower() for marker in ("password", "token", "secret", "api_key", "apikey", "authorization", "cookie", "credential")):
        return "[REDACTED]"

    if isinstance(value, dict):
        return {str(child_key): _sanitize(child_value, str(child_key)) for child_key, child_value in value.items()}
    if isinstance(value, (list, tuple)):
        return [_sanitize(item) for item in value]

    return value


def trace(stage: str, **data: Any) -> None:
    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **_sanitize(data),
    }
    line = f"[AI_TRACE][FastAPI][{stage}] "
    try:
        print(line + json.dumps(payload, ensure_ascii=False, default=str), flush=True)
    except UnicodeEncodeError:
        print(line + json.dumps(payload, ensure_ascii=True, default=str), flush=True)
