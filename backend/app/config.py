"""Application configuration, loaded once from backend/.env."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

# backend/.env  (one level up from app/)
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_PATH)


def _load_gemini_keys() -> list[str]:
    """Collect keys from GEMINI_API_KEY_1..N, falling back to a comma list."""
    keys: list[str] = []
    i = 1
    while True:
        raw = os.getenv(f"GEMINI_API_KEY_{i}")
        if not raw:
            break
        cleaned = raw.strip().strip('"').strip("'")
        if cleaned:
            keys.append(cleaned)
        i += 1

    if not keys:
        csv = os.getenv("GEMINI_API_KEYS", "")
        keys = [k.strip() for k in csv.split(",") if k.strip()]

    return keys


def _clean(value: str | None) -> str:
    return (value or "").strip().strip('"').strip("'")


@dataclass(frozen=True)
class Settings:
    gemini_keys: list[str] = field(default_factory=_load_gemini_keys)
    model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    daily_limit_per_key: int = int(os.getenv("GEMINI_DAILY_LIMIT", "20"))
    cooldown_seconds: int = int(os.getenv("GEMINI_COOLDOWN", "60"))
    cache_ttl_seconds: int = int(os.getenv("CACHE_TTL", "86400"))
    log_level: str = os.getenv("LOG_LEVEL", "INFO").upper()

    # Google Cloud Text-to-Speech: a Google API key with the TTS API enabled.
    # Falls back to the 5th Gemini key (standard AIza… key) if not set.
    google_tts_api_key: str = _clean(os.getenv("GOOGLE_TTS_API_KEY"))

    # Firebase Admin (token verification + Firestore).
    firebase_project_id: str = _clean(os.getenv("FIREBASE_PROJECT_ID"))
    firebase_service_account: str = _clean(os.getenv("FIREBASE_SERVICE_ACCOUNT")) or "service-account.json"

    @property
    def daily_budget(self) -> int:
        return self.daily_limit_per_key * len(self.gemini_keys)


settings = Settings()
