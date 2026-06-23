"""Tiny thread-safe TTL cache.

This is the call-saver: an identical crisis returns a stored plan and spends
zero Gemini calls. The interface (get/set) matches what a Redis adapter would
expose, so we can swap this for Upstash later without touching callers.
"""
from __future__ import annotations

import threading
import time
from typing import Any


class TTLCache:
    def __init__(self, ttl_seconds: int) -> None:
        self._ttl = ttl_seconds
        self._data: dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Any | None:
        with self._lock:
            entry = self._data.get(key)
            if entry is None:
                return None
            expires_at, value = entry
            if time.time() > expires_at:
                self._data.pop(key, None)
                return None
            return value

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            self._data[key] = (time.time() + self._ttl, value)

    def __len__(self) -> int:
        with self._lock:
            return len(self._data)
