"""The spine: turn a crisis into a time-blocked plan in ONE Gemini call.

Classification (cluster/severity/sub-type) and the step-by-step plan are produced
together via structured output, so a full crisis costs a single API call.
Urgency scoring and fit-checking are done in plain Python afterwards — no LLM.
"""
from __future__ import annotations

import hashlib

from ..core.clusters import CLUSTER_NAMES
from ..core.schemas import Plan, PlanRequest, PlanResponse
from ..core.urgency import compute_urgency, urgency_colour
from ..logging_config import get_logger
from ..runtime import gemini

log = get_logger("planner")

SYSTEM_INSTRUCTION = f"""You are Mavrick, a brutally honest productivity coach for people in a time crisis.
You never say "I understand your frustration." You say "Here is exactly what to do right now."

Given a crisis and the minutes left, you must:
1. Classify it into EXACTLY ONE cluster from: {", ".join(CLUSTER_NAMES)}.
2. Give a short sub_type (e.g. "client presentation", "bill triage").
3. Rate severity as one of: low, medium, high, critical.
4. Produce a concrete, time-blocked plan of steps that FITS inside the minutes left.

Hard rules for the plan:
- The steps' total minutes must not exceed 90% of the minutes left. Leave buffer.
- No single step may be longer than 25 minutes without a short break step after it.
- Exactly one step has is_right_now = true: the very first physical action the user
  can start in under 2 minutes (e.g. "Open your slides", "Find the electricity bill").
- Each step must be specific and doable, not vague advice.
- Put any risks or honest caveats in warnings (empty list if none).

Return ONLY the JSON object matching the schema. No prose outside it."""


def _cache_key(req: PlanRequest) -> str:
    norm = " ".join(req.text.lower().split())
    # bucket minutes so "89" and "90" reuse the same plan
    bucket = (req.minutes_left // 15) * 15
    age = req.age or 0
    raw = f"{norm}|{bucket}|{age}"
    return "plan:" + hashlib.sha256(raw.encode()).hexdigest()[:24]


def make_plan(req: PlanRequest) -> PlanResponse:
    contents = (
        f"CRISIS: {req.text}\n"
        f"MINUTES_LEFT: {req.minutes_left}\n"
        f"AGE: {req.age if req.age is not None else 'unknown'}"
    )

    plan, meta = gemini.generate(
        system_instruction=SYSTEM_INSTRUCTION,
        contents=contents,
        response_schema=Plan,
        cache_key=_cache_key(req),
    )

    planned = sum(s.minutes for s in plan.steps)
    score = compute_urgency(plan.cluster, plan.severity, req.minutes_left, planned)
    fits = planned <= req.minutes_left

    if not fits:
        log.warning(
            "Plan overruns: %d planned vs %d available", planned, req.minutes_left
        )

    return PlanResponse(
        plan=plan,
        urgency_score=score,
        urgency_colour=urgency_colour(score),
        total_planned_minutes=planned,
        minutes_left=req.minutes_left,
        fits=fits,
        cached=meta.cached,
        key_index=meta.key_index,
        latency_ms=meta.latency_ms,
    )
