"""Persistent TTL cache backed by SQLite.

The interface (get/set) is identical to the old in-memory dict so callers are
unchanged. Plans survive backend restarts — critical for the 60-call/day budget.
SQLite lives at backend/data/cache.db (created automatically).

Swap path: replace this module with an Upstash Redis adapter when scaling.
"""
from __future__ import annotations

import json
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any

_DB_DIR = Path(__file__).resolve().parent.parent.parent / "data"
_DB_PATH = _DB_DIR / "cache.db"

_DDL = """
CREATE TABLE IF NOT EXISTS plan_cache (
    key      TEXT PRIMARY KEY,
    value    TEXT NOT NULL,
    expires  REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_expires ON plan_cache(expires);
"""


class TTLCache:
    def __init__(self, ttl_seconds: int, db_path: Path = _DB_PATH) -> None:
        self._ttl = ttl_seconds
        self._lock = threading.Lock()
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self._conn.executescript(_DDL)
        self._conn.commit()
        self._evict_expired()

    # ------------------------------------------------------------------
    def get(self, key: str) -> Any | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT value, expires FROM plan_cache WHERE key = ?", (key,)
            ).fetchone()
            if row is None:
                return None
            value_json, expires = row
            if time.time() > expires:
                self._conn.execute("DELETE FROM plan_cache WHERE key = ?", (key,))
                self._conn.commit()
                return None
            return json.loads(value_json)

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            expires = time.time() + self._ttl
            self._conn.execute(
                "INSERT OR REPLACE INTO plan_cache(key, value, expires) VALUES (?, ?, ?)",
                (key, json.dumps(value, default=_pydantic_serialiser), expires),
            )
            self._conn.commit()

    def __len__(self) -> int:
        with self._lock:
            return self._conn.execute(
                "SELECT COUNT(*) FROM plan_cache WHERE expires > ?", (time.time(),)
            ).fetchone()[0]

    # ------------------------------------------------------------------
    def _evict_expired(self) -> None:
        self._conn.execute("DELETE FROM plan_cache WHERE expires <= ?", (time.time(),))
        self._conn.commit()


def _pydantic_serialiser(obj: Any) -> Any:
    """Allow Pydantic models to be JSON-serialised by json.dumps."""
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    raise TypeError(f"Object of type {type(obj)} is not JSON serialisable")
