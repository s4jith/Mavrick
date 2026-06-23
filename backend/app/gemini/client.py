"""Gemini client wrapper: cache → key rotation → structured call → retry.

One public method, `generate`, that:
  1. returns a cached result when available (0 keys spent),
  2. otherwise borrows a key from the KeyManager,
  3. calls Gemini with a JSON schema for structured output,
  4. on a 429 rotates to the next key and retries,
  5. caches and returns the parsed result.
"""
from __future__ import annotations

import json
import time
from dataclasses import dataclass
from typing import Type, TypeVar

from google import genai
from google.genai import errors, types
from pydantic import BaseModel

from ..config import Settings
from ..logging_config import get_logger
from ..store.cache import TTLCache
from .key_manager import KeyManager, NoKeyAvailable

log = get_logger("gemini")

T = TypeVar("T", bound=BaseModel)


@dataclass
class CallMeta:
    cached: bool
    key_index: int | None
    latency_ms: int


def _status_code(err: Exception) -> int | None:
    code = getattr(err, "code", None)
    if isinstance(code, int):
        return code
    return getattr(err, "status_code", None)


def _is_rate_limit(err: Exception) -> bool:
    if _status_code(err) == 429:
        return True
    text = str(err).upper()
    return "RESOURCE_EXHAUSTED" in text or ("RATE" in text and "LIMIT" in text)


def _is_transient(err: Exception) -> bool:
    """Server-side hiccups (model overloaded / unavailable) — worth a retry."""
    code = _status_code(err)
    if code in (500, 502, 503, 504):
        return True
    text = str(err).upper()
    return "UNAVAILABLE" in text or "OVERLOADED" in text or "INTERNAL" in text


class GeminiClient:
    def __init__(self, settings: Settings, key_manager: KeyManager, cache: TTLCache) -> None:
        self._settings = settings
        self._keys = key_manager
        self._cache = cache
        self._clients: dict[str, genai.Client] = {}

    def _client_for(self, key: str) -> genai.Client:
        client = self._clients.get(key)
        if client is None:
            client = genai.Client(api_key=key)
            self._clients[key] = client
        return client

    def generate(
        self,
        *,
        system_instruction: str,
        contents: str,
        response_schema: Type[T],
        cache_key: str | None = None,
        temperature: float = 0.4,
    ) -> tuple[T, CallMeta]:
        if cache_key:
            hit = self._cache.get(cache_key)
            if hit is not None:
                log.info("cache hit (%s) - 0 keys spent", cache_key[:12])
                # Cache stores plain dicts (JSON round-trip); rehydrate to schema.
                if isinstance(hit, dict):
                    hit = response_schema.model_validate(hit)
                return hit, CallMeta(cached=True, key_index=None, latency_ms=0)

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=response_schema,
            temperature=temperature,
        )

        # Allow a few extra attempts for transient server errors on top of the
        # per-key rotation budget.
        max_attempts = len(self._settings.gemini_keys) + 2
        transient_retries = 0
        max_transient = 3
        last_err: Exception | None = None

        for attempt in range(1, max_attempts + 1):
            st = self._keys.acquire()  # raises NoKeyAvailable if all spent
            client = self._client_for(st.key)
            t0 = time.perf_counter()
            try:
                resp = client.models.generate_content(
                    model=self._settings.model,
                    contents=contents,
                    config=config,
                )
                latency = round((time.perf_counter() - t0) * 1000)
                self._keys.report_success(st)
                result = self._parse(resp, response_schema)
                if cache_key:
                    self._cache.set(cache_key, result)
                log.info("plan generated via %s in %dms", st.masked(), latency)
                return result, CallMeta(cached=False, key_index=st.index, latency_ms=latency)
            except errors.APIError as err:  # type: ignore[attr-defined]
                last_err = err
                if _is_rate_limit(err):
                    self._keys.report_rate_limited(st)
                    log.warning("rate limit on %s; rotating key", st.masked())
                    continue
                if _is_transient(err):
                    transient_retries += 1
                    if transient_retries > max_transient:
                        log.error("Gemini overloaded after %d retries", max_transient)
                        raise
                    backoff = 1.5 * transient_retries
                    log.warning(
                        "transient %s on %s; backoff %.1fs then rotate",
                        _status_code(err),
                        st.masked(),
                        backoff,
                    )
                    time.sleep(backoff)
                    continue
                log.error("Gemini API error on %s: %s", st.masked(), err)
                raise

        raise NoKeyAvailable(
            f"Exhausted {max_attempts} attempts across keys."
        ) from last_err

    @staticmethod
    def _parse(resp, response_schema: Type[T]) -> T:
        parsed = getattr(resp, "parsed", None)
        if isinstance(parsed, response_schema):
            return parsed
        # Fallback: parse raw text into the schema.
        return response_schema.model_validate(json.loads(resp.text))
