"""Round-robin Gemini key manager.

Each key has a small daily request budget and a per-minute rate limit. This
class spreads load across all keys, skips any that are exhausted for the day or
cooling down after a 429, and resets daily counters automatically.

Thread-safe: a single lock guards all state. Counters live in memory for now;
the same interface can be backed by Redis later so they survive restarts.
"""
from __future__ import annotations

import datetime
import threading
import time
from dataclasses import dataclass, field

from ..logging_config import get_logger

log = get_logger("keys")


class NoKeyAvailable(Exception):
    """Raised when every key is exhausted or cooling down."""


@dataclass
class KeyState:
    index: int  # 1-based, for human-friendly logs
    key: str
    count: int = 0
    reset_date: datetime.date = field(default_factory=datetime.date.today)
    cooling_until: float = 0.0
    last_used: float = 0.0

    def masked(self) -> str:
        return f"key#{self.index}(...{self.key[-4:]})"


class KeyManager:
    def __init__(self, keys: list[str], daily_limit: int, cooldown_seconds: int) -> None:
        if not keys:
            raise ValueError("No Gemini API keys configured. Check backend/.env.")
        self._states = [KeyState(index=i + 1, key=k) for i, k in enumerate(keys)]
        self._daily_limit = daily_limit
        self._cooldown = cooldown_seconds
        self._ptr = 0
        self._lock = threading.Lock()
        log.info(
            "Key manager ready: %d keys, %d/day each -> %d calls/day budget",
            len(self._states),
            daily_limit,
            len(self._states) * daily_limit,
        )

    # -- internal -----------------------------------------------------------
    def _roll_day(self, st: KeyState, today: datetime.date) -> None:
        if st.reset_date != today:
            st.count = 0
            st.reset_date = today
            st.cooling_until = 0.0

    # -- public -------------------------------------------------------------
    def acquire(self) -> KeyState:
        """Return the next usable key (round-robin). Raises NoKeyAvailable."""
        with self._lock:
            now = time.time()
            today = datetime.date.today()
            n = len(self._states)
            for offset in range(n):
                idx = (self._ptr + offset) % n
                st = self._states[idx]
                self._roll_day(st, today)
                if st.count >= self._daily_limit:
                    continue
                if now < st.cooling_until:
                    continue
                st.last_used = now
                self._ptr = (idx + 1) % n
                log.debug("Acquired %s (%d/%d used today)", st.masked(), st.count, self._daily_limit)
                return st
            raise NoKeyAvailable(
                "All keys are exhausted or cooling down. Daily budget reached."
            )

    def report_success(self, st: KeyState) -> None:
        with self._lock:
            st.count += 1
            log.info("%s ok - %d/%d used today", st.masked(), st.count, self._daily_limit)

    def report_rate_limited(self, st: KeyState, retry_after: float | None = None) -> None:
        with self._lock:
            wait = retry_after if retry_after else self._cooldown
            st.cooling_until = time.time() + wait
            log.warning("%s rate-limited (429) — cooling %.0fs", st.masked(), wait)

    def report_exhausted(self, st: KeyState) -> None:
        with self._lock:
            st.count = self._daily_limit
            log.warning("%s daily quota exhausted", st.masked())

    def status(self) -> list[dict]:
        with self._lock:
            now = time.time()
            today = datetime.date.today()
            out = []
            for st in self._states:
                self._roll_day(st, today)
                out.append(
                    {
                        "key": st.masked(),
                        "used_today": st.count,
                        "limit": self._daily_limit,
                        "cooling": max(0, round(st.cooling_until - now)),
                    }
                )
            return out

    def remaining_today(self) -> int:
        with self._lock:
            today = datetime.date.today()
            total = 0
            for st in self._states:
                self._roll_day(st, today)
                total += max(0, self._daily_limit - st.count)
            return total
