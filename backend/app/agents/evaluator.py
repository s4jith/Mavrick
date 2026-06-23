"""Rule-based plan evaluator — scores every plan before it reaches the user.

Checks feasibility, completeness, time realism, and structural quality.
Returns a 0–100 confidence score plus human-readable notes.

No LLM call required — pure Python, deterministic, and free.
"""
from __future__ import annotations

from ..core.schemas import Plan


def evaluate_plan(plan: Plan, minutes_left: int) -> tuple[int, list[str]]:
    """Score a plan from 0–100 and return evaluator notes.

    Returns:
        (score, notes) where notes explain any deductions.
    """
    score = 100
    notes: list[str] = []
    total_planned = sum(s.minutes for s in plan.steps)

    # --- Rule 1: Does the plan fit within available time? ---
    if total_planned > minutes_left:
        penalty = min(30, (total_planned - minutes_left) * 2)
        score -= penalty
        notes.append(
            f"Plan overruns by {total_planned - minutes_left} min "
            f"({total_planned} planned vs {minutes_left} available). -{penalty}pts"
        )

    # --- Rule 2: Buffer rule — plan should use ≤ 90% of time ---
    utilisation = total_planned / max(minutes_left, 1)
    if utilisation > 0.95:
        score -= 10
        notes.append(
            f"Plan uses {utilisation:.0%} of time — no buffer for surprises. -10pts"
        )
    elif utilisation > 0.90:
        score -= 5
        notes.append(
            f"Plan uses {utilisation:.0%} of time — tight buffer. -5pts"
        )

    # --- Rule 3: No step > 25 min without a break after it ---
    for i, step in enumerate(plan.steps):
        if step.minutes > 25:
            next_is_break = False
            if i + 1 < len(plan.steps):
                next_title = plan.steps[i + 1].title.lower()
                if any(w in next_title for w in ("break", "rest", "pause", "breathe")):
                    next_is_break = True
            if not next_is_break:
                score -= 5
                notes.append(
                    f"Step {step.order} is {step.minutes} min with no break after. -5pts"
                )

    # --- Rule 4: Must have exactly one "right now" step ---
    right_now_count = sum(1 for s in plan.steps if s.is_right_now)
    if right_now_count == 0:
        score -= 15
        notes.append("No 'do this right now' step found. -15pts")
    elif right_now_count > 1:
        score -= 5
        notes.append(
            f"Multiple 'right now' steps ({right_now_count}). Should be exactly 1. -5pts"
        )

    # --- Rule 5: Minimum step count ---
    if len(plan.steps) < 2:
        score -= 10
        notes.append("Plan has fewer than 2 steps — too vague. -10pts")

    # --- Rule 6: Steps should be specific (title length check) ---
    vague_steps = [s for s in plan.steps if len(s.title) < 8]
    if vague_steps:
        penalty = min(10, len(vague_steps) * 3)
        score -= penalty
        notes.append(
            f"{len(vague_steps)} step(s) have very short titles — may be vague. -{penalty}pts"
        )

    # --- Rule 7: First action should exist ---
    if not plan.first_action or len(plan.first_action.strip()) < 5:
        score -= 5
        notes.append("First action is missing or too short. -5pts")

    # --- Rule 8: Steps should have details ---
    no_detail = [s for s in plan.steps if not s.detail or len(s.detail.strip()) < 10]
    if no_detail:
        penalty = min(10, len(no_detail) * 2)
        score -= penalty
        notes.append(
            f"{len(no_detail)} step(s) lack meaningful detail. -{penalty}pts"
        )

    # Clamp score
    score = max(0, min(100, score))

    if not notes:
        notes.append("Plan passes all checks — looks solid.")

    return score, notes
