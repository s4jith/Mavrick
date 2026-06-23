"""Shared singletons, wired once at import time."""
from __future__ import annotations

from .config import settings
from .gemini.client import GeminiClient
from .gemini.key_manager import KeyManager
from .logging_config import setup_logging
from .store.cache import TTLCache

setup_logging(settings.log_level)

cache = TTLCache(settings.cache_ttl_seconds)
key_manager = KeyManager(
    keys=settings.gemini_keys,
    daily_limit=settings.daily_limit_per_key,
    cooldown_seconds=settings.cooldown_seconds,
)
gemini = GeminiClient(settings=settings, key_manager=key_manager, cache=cache)
