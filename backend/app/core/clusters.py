"""The 8 crisis clusters and the weights used for urgency scoring.

Consequence weight = how bad it is to get this wrong (0..1). Health and Legal
rank highest because the downside is irreversible; Social ranks lowest.
"""
from __future__ import annotations

# cluster name -> consequence weight
CLUSTERS: dict[str, float] = {
    "Financial": 0.85,
    "Academic": 0.60,
    "Health": 1.00,
    "Work": 0.70,
    "Legal": 0.95,
    "Social": 0.40,
    "Family": 0.80,
    "Digital": 0.60,
}

CLUSTER_NAMES: list[str] = list(CLUSTERS)

# severity label -> weight
SEVERITY_WEIGHT: dict[str, float] = {
    "low": 0.40,
    "medium": 0.65,
    "high": 0.85,
    "critical": 1.00,
}

DEFAULT_CLUSTER_WEIGHT = 0.60
DEFAULT_SEVERITY_WEIGHT = 0.65
