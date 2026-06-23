"""Pure-Python urgency scoring — no LLM call needed.

urgency = f(deadline proximity, consequence severity, effort tightness)
Kept deterministic so the same crisis always scores the same, and so we never
spend a precious Gemini call on arithmetic.
"""
from __future__ import annotations

from .clusters import (
    CLUSTERS,
    DEFAULT_CLUSTER_WEIGHT,
    DEFAULT_SEVERITY_WEIGHT,
    SEVERITY_WEIGHT,
)


def _proximity_factor(minutes_left: int) -> float:
    """How close the deadline is, mapped to 0..1 (closer = higher)."""
    if minutes_left <= 30:
        return 1.00
    if minutes_left <= 60:
        return 0.90
    if minutes_left <= 180:
        return 0.75
    if minutes_left <= 1440:  # within a day
        return 0.55
    if minutes_left <= 4320:  # within three days
        return 0.40
    return 0.30


def compute_urgency(
    cluster: str,
    severity: str,
    minutes_left: int,
    planned_minutes: int,
) -> int:
    """Return an urgency score from 0 to 100."""
    proximity = _proximity_factor(minutes_left)
    consequence = CLUSTERS.get(cluster, DEFAULT_CLUSTER_WEIGHT)
    sev = SEVERITY_WEIGHT.get(severity.lower(), DEFAULT_SEVERITY_WEIGHT)
    tightness = min(planned_minutes / max(minutes_left, 1), 1.0)

    raw = (0.40 * proximity) + (0.30 * consequence) + (0.20 * sev) + (0.10 * tightness)
    return round(raw * 100)


def urgency_colour(score: int) -> str:
    if score >= 75:
        return "red"
    if score >= 50:
        return "amber"
    return "green"
