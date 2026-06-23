"""Degraded-mode fallback: when all Gemini keys are exhausted, return a generic
triage plan instead of a bare 503.  The user still gets actionable steps; we
just can't personalise them.
"""
from __future__ import annotations

from ..core.schemas import Plan, PlanResponse, Step


def _generic_steps(minutes_left: int) -> list[Step]:
    slot = min(25, max(5, minutes_left // 4))
    steps = [
        Step(
            order=1,
            title="Write down every open task right now",
            detail="Put everything on paper or a notes app. Getting it out of your head stops the spiral.",
            minutes=min(5, slot),
            is_right_now=True,
        ),
        Step(
            order=2,
            title="Pick the single highest-consequence item",
            detail="Ask: which one has the worst outcome if I skip it? Do that one first.",
            minutes=slot,
            is_right_now=False,
        ),
        Step(
            order=3,
            title="Set a timer and start — imperfect beats nothing",
            detail="Start the most important item for one focused block. Ignore everything else.",
            minutes=min(minutes_left - slot - 5, slot * 2),
            is_right_now=False,
        ),
    ]
    return [s for s in steps if s.minutes > 0]


def make_fallback_plan(text: str, minutes_left: int) -> PlanResponse:
    steps = _generic_steps(minutes_left)
    plan = Plan(
        cluster="General",
        sub_type="triage",
        severity="high",
        summary=(
            "AI planning is temporarily unavailable (daily API limit reached). "
            "Here is a general triage plan to get you moving right now."
        ),
        steps=steps,
        first_action="Write every open task on paper — start there.",
        warnings=[
            "This is a generic plan. For a personalised step-by-step plan, try again after midnight when the API resets.",
        ],
    )
    planned = sum(s.minutes for s in steps)
    return PlanResponse(
        plan=plan,
        urgency_score=70,
        urgency_colour="orange",
        total_planned_minutes=planned,
        minutes_left=minutes_left,
        fits=planned <= minutes_left,
        cached=False,
        key_index=None,
        latency_ms=0,
    )
